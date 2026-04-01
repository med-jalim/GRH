<?php

namespace App\Http\Controllers;

use App\Models\PaymentVerification;
use App\Models\Reservation;
use Illuminate\Http\Request;
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

        $reservation = Reservation::findOrFail($reservationId);

        $path = $request->file('document')->store('payments', 'public');

        PaymentVerification::create([
            'id_reservation' => $reservation->id,
            'document_path'  => $path,
            'amount'         => $request->amount,
        ]);

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
