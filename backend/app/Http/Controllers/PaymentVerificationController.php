<?php

namespace App\Http\Controllers;

use App\Models\PaymentVerification;
use App\Models\Reservation;
use Illuminate\Http\Request;
use App\Mail\ReservationStatusUpdated;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PaymentVerificationController extends Controller
{
    /**
     * Store a newly created payment verification in storage.
     */
    public function store(Request $request, $reservationId)
    {
        $request->validate([
            'document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'amount'   => 'required|numeric|min:0',
        ]);

        $reservation = Reservation::with('payments')->findOrFail($reservationId);
 
        // 1. Prevent adding payments to confirmed reservations
        if ($reservation->statut === 'confirme') {
            return redirect()->back()->with('error', 'Impossible d\'ajouter un paiement à une réservation déjà confirmée.');
        }
 
        $currentPaid = $reservation->payments->where('statut', 'valide')->sum('amount');
        $remaining   = $reservation->prix_total - $currentPaid;
 
        // 2. Prevent adding an amount greater than the remaining balance
        if ($request->amount > $remaining) {
            return redirect()->back()->with('error', 'Le montant saisi (' . $request->amount . ' MAD) dépasse le reste à payer (' . $remaining . ' MAD).');
        }
 
        $path = $request->file('document')->store('payments', 'public');
 
        PaymentVerification::create([
            'id_reservation' => $reservation->id,
            'document_path'  => $path,
            'amount'         => $request->amount,
            'statut'         => 'valide',
        ]);

        // Refresh and check total paid
        $reservation->refresh();
        $reservation->load('payments', 'hotel');
        $totalPaid = $reservation->payments->where('statut', 'valide')->sum('amount');

        // Handle status update and notifications based on total paid
        $reservation->paid_amount = $totalPaid;
        $reservation->save();

        if ($totalPaid >= $reservation->prix_total) {
            if ($reservation->statut !== 'confirme') {
                $reservation->update(['statut' => 'confirme']);

                // Send professional confirmation email
                Mail::to($reservation->email)->send(new \App\Mail\ReservationConfirmed($reservation));
            }
        } elseif ($totalPaid > 0) {
            // Partial payment logic
            if ($reservation->statut !== 'partiellement_paye' && $reservation->statut !== 'confirme') {
                $reservation->update(['statut' => 'partiellement_paye']);
            }
            
            // Send specific payment received email (including balance)
            Mail::to($reservation->email)->send(new \App\Mail\PaymentReceived($reservation, $request->amount));
        }

        return redirect()->back()->with('success', 'Justificatif de paiement ajouté avec succès.');
    }

    /**
     * Remove the specified payment verification from storage.
     */
    public function destroy($id)
    {
        $payment = PaymentVerification::findOrFail($id);
        $reservationId = $payment->id_reservation;

        // Delete the file from storage
        Storage::disk('public')->delete($payment->document_path);

        $payment->delete();

        // Refresh and check total paid
        $reservation = Reservation::with('payments')->findOrFail($reservationId);
        $totalPaid = $reservation->payments->where('statut', 'valide')->sum('amount');
        $previousStatut = $reservation->statut;

        $newStatut = $previousStatut;

        if ($totalPaid >= $reservation->prix_total) {
            $newStatut = 'confirme';
        } elseif ($totalPaid > 0) {
            $newStatut = 'partiellement_paye';
        } else {
            // No payments left
            // Only downgrade to 'en_attente_paiement' if it was already in a payment-related status
            if (in_array($previousStatut, ['confirme', 'partiellement_paye', 'valide'])) {
                $newStatut = 'en_attente_paiement';
            }
        }

        if ($newStatut !== $previousStatut || $totalPaid != $reservation->paid_amount) {
            $reservation->update([
                'statut' => $newStatut,
                'paid_amount' => $totalPaid
            ]);
            
            // Optionally notify client that status was downgraded
            try {
                Mail::to($reservation->email)->send(new \App\Mail\ReservationStatusUpdated(
                    $reservation,
                    $previousStatut,
                    'Note : Un justificatif de paiement a été supprimé par l\'administrateur, le statut de votre réservation a été mis à jour.'
                ));
            } catch (\Throwable $e) {
                \Log::error("Failed to send status update email on payment deletion: " . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', 'Justificatif supprimé et statut mis à jour.');
    }

    /**
     * Update the status of the specified payment verification.
     */
    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:en_attente,valide,refuse',
            'reason' => 'nullable|string|max:1000',
        ]);

        $payment = PaymentVerification::findOrFail($id);
        $payment->statut = $request->statut;
        $payment->save();

        // Recalculate reservation state
        $reservation = Reservation::with('payments', 'hotel')->findOrFail($payment->id_reservation);
        $totalPaid = $reservation->payments->where('statut', 'valide')->sum('amount');
        $previousStatut = $reservation->statut;

        $newStatut = $previousStatut;
        if ($totalPaid >= $reservation->prix_total) {
            $newStatut = 'confirme';
        } elseif ($totalPaid > 0) {
            $newStatut = 'partiellement_paye';
        } else {
            // Only downgrade to 'en_attente_paiement' if needed
            if (in_array($previousStatut, ['confirme', 'partiellement_paye', 'valide'])) {
                $newStatut = 'en_attente_paiement';
            }
        }

        if ($newStatut !== $previousStatut || $totalPaid != $reservation->paid_amount) {
            $reservation->update([
                'statut' => $newStatut,
                'paid_amount' => $totalPaid
            ]);
        }

        // Send email based on action
        try {
            if ($request->statut === 'refuse') {
                Mail::to($reservation->email)->send(new \App\Mail\PaymentRejected(
                    $reservation,
                    $payment->amount,
                    $request->reason
                ));
            } elseif ($request->statut === 'valide') {
                if ($newStatut === 'confirme') {
                    Mail::to($reservation->email)->send(new \App\Mail\ReservationConfirmed($reservation));
                } else {
                    Mail::to($reservation->email)->send(new \App\Mail\PaymentReceived($reservation, $payment->amount));
                }
            }
        } catch (\Throwable $e) {
            \Log::error("Failed to send email on payment status update: " . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Statut du paiement mis à jour avec succès.');
    }
}
