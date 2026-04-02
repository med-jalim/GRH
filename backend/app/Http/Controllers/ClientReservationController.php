<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ItemReservation;

class ClientReservationController extends Controller
{
    /**
     * Confirm the reservation via token.
     */
    public function confirm($token)
    {
        $reservation = Reservation::where('token', $token)->firstOrFail();

        if (!$reservation) {

            return Inertia::render('PublicReservationAction', [
                'success' => false,
                'message' =>  "Réservation non trouvée",
                // 'message' => 'Cette action n\'est plus possible ou la réservation a déjà été traitée.',
            ]);
        }

        $reservation->update(['statut' => 'valide']);

        return Inertia::render('PublicReservationAction', [
            'success' => true,
            'message' => 'Votre réservation a été confirmée avec succès. Nous reviendrons vers vous pour la suite.',
            'reservation' => $reservation
        ]);
    }

    /**
     * Cancel the reservation via token.
     */
    public function cancel($token)
    {
        $reservation = Reservation::where('token', $token)->firstOrFail();

        $reservation->update(['statut' => 'annule']);

        return Inertia::render('PublicReservationAction', [
            'success' => true,
            'message' => 'Votre réservation a été annulée conformément à votre demande.',
        ]);
    }

    /**
     * Show the reservation portal via token.
     */
    public function show($token)
    {
        $reservation = Reservation::with(['hotel', 'details.type', 'payments'])->where('token', $token)->firstOrFail();

        // We fetch all hotels only to show the selected one as locked, 
        // or we just fetch the selected hotel to keep it simple.
        $hotels = Hotel::with(['chambres.type', 'tarifs.type'])->get();

        return Inertia::render('PublicReservationPortal', [
            'reservation' => $reservation,
            'hotels' => $hotels,
        ]);
    }

    /**
     * Update the reservation details and reset status to en_attente.
     */
    public function update(Request $request, $token)
    {
        $reservation = Reservation::where('token', $token)->firstOrFail();

        $validated = $request->validate([
            'nom_contact'         => 'required|string|max:255',
            'email'               => 'required|email|max:255',
            'telephone'           => 'required|string|max:30',
            'date_arrivee'        => 'required|date',
            'date_depart'         => 'required|date|after:date_arrivee',
            'nb_personnes'        => 'required|integer|min:1',
            'remarques_speciales' => 'nullable|string',
            'prix_total'          => 'required|numeric|min:0',
            'details'             => 'required|array',
            'details.*.id_type'   => 'required|integer|exists:types,id',
            'details.*.quantite'  => 'required|integer|min:1',
            'details.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        $details = $validated['details'];
        unset($validated['details']);

        // Reset status to en_attente and save
        $reservation->statut = 'en_attente';
        $reservation->fill($validated);
        $reservation->save();

        // Update line items
        $reservation->details()->delete();
        foreach ($details as $detail) {
            $detail['id_reservation'] = $reservation->id;
            ItemReservation::create($detail);
        }

        return Inertia::render('PublicReservationAction', [
            'success' => true,
            'message' => 'Vos modifications ont été enregistrées. Notre équipe va les examiner.',
            'reservation' => $reservation,
        ]);
    }

    /**
     * Add a payment proof via token.
     */
    public function addPayment(Request $request, $token)
    {
        $reservation = Reservation::where('token', $token)->firstOrFail();

        $request->validate([
            'document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'amount'   => 'required|numeric|min:0',
        ]);

        $path = $request->file('document')->store('payments', 'public');

        \App\Models\PaymentVerification::create([
            'id_reservation' => $reservation->id,
            'document_path'  => $path,
            'amount'         => $request->amount,
            'statut'         => 'en_attente',
        ]);

        return redirect()->back()->with('success', 'Votre preuve de paiement a été soumise avec succès et est en attente de vérification par notre équipe.');
    }
}
