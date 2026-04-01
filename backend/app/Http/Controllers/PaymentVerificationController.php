<?php

namespace App\Http\Controllers;

use App\Models\PaymentVerification;
use App\Models\Reservation;
use Illuminate\Http\Request;
use App\Mail\ReservationStatusUpdated;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

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
 
        $currentPaid = $reservation->payments->sum('amount');
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
        ]);

        // Refresh and check total paid
        $reservation->refresh();
        $reservation->load('payments', 'hotel');
        $totalPaid = $reservation->payments->sum('amount');

        // Automatic confirmation if paid in full
        if ($totalPaid >= $reservation->prix_total && $reservation->statut !== 'confirme') {
            $previousStatut      = $reservation->statut;
            $reservation->statut = 'confirme';
            $reservation->save();

            // Send confirmation email
            Mail::to($reservation->email)->send(new ReservationStatusUpdated(
                $reservation,
                $previousStatut,
                'Le montant total a été atteint via vos justificatifs versés. Votre réservation est officiellement confirmée.'
            ));
        }

        return redirect()->back()->with('success', 'Justificatif de paiement ajouté avec succès.');
    }

    /**
     * Remove the specified payment verification from storage.
     */
    public function destroy($id)
    {
        $payment = PaymentVerification::findOrFail($id);

        // Delete the file from storage
        Storage::disk('public')->delete($payment->document_path);

        $payment->delete();

        return redirect()->back()->with('success', 'Justificatif supprimé.');
    }
}
