<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ItemReservation;
use App\Services\ReservationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class ClientReservationController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }
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

        // Notify admins about the confirmation
        try {
            $admins = \App\Models\User::all();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminNotification(
                'Réservation Confirmée',
                'Le client ' . $reservation->nom_contact . ' a confirmé sa réservation (' . $reservation->code_reference . ').',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send admin notification for reservation confirmation: ' . $e->getMessage());
        }

        return redirect()->route('reservation.show', $token)->with('success', 'Votre réservation a été confirmée avec succès. Nous reviendrons vers vous pour la suite.');
    }

    /**
     * Cancel the reservation via token.
     */
    public function cancel($token)
    {
        $reservation = Reservation::where('token', $token)->firstOrFail();

        $reservation->update(['statut' => 'annule']);

        // Notify admins about the cancellation
        try {
            $admins = \App\Models\User::all();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminNotification(
                'Réservation Annulée par le client',
                'Le client ' . $reservation->nom_contact . ' a annulé sa réservation (' . $reservation->code_reference . ').',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send admin notification for reservation cancellation: ' . $e->getMessage());
        }

        return redirect()->route('reservation.show', $token)->with('success', 'Votre réservation a été annulée conformément à votre demande.');
    }

    /**
     * Show the reservation portal via token.
     */
    public function show($token)
    {
        $reservation = Reservation::with(['hotel', 'groups.items.type', 'payments'])->where('token', $token)->firstOrFail();

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
            'remarques_speciales' => 'nullable|string',

            // Multi-group structure
            'groups'                  => 'required|array|min:1',
            'groups.*.date_arrivee'   => 'required|date',
            'groups.*.date_depart'    => 'required|date|after:groups.*.date_arrivee',
            'groups.*.nb_personnes'   => 'required|integer|min:1',
            'groups.*.rooms'          => 'required|array|min:1',
            'groups.*.rooms.*.id_type'       => 'required|integer|exists:types,id',
            'groups.*.rooms.*.quantite'      => 'required|integer|min:1',
            'groups.*.rooms.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        // Availability check
        $failures = $this->reservationService->checkAvailability($reservation->id_hotel, $validated['groups'], $reservation->id);
        if (!empty($failures)) {
            return redirect()->back()->withErrors(['availability' => $failures]);
        }

        $groupsData = $validated['groups'];
        unset($validated['groups']);

        $prixTotal = 0;
        $totalPersonnes = 0;
        foreach ($groupsData as $g) {
            $nights = $this->reservationService->calculateNights($g['date_arrivee'], $g['date_depart']);
            $totalPersonnes += $g['nb_personnes'];
            foreach ($g['rooms'] as $r) {
                $prixTotal += ($r['quantite'] * $r['prix_unitaire'] * $nights);
            }
        }
        $validated['prix_total'] = $prixTotal;
        $validated['nb_personnes'] = $totalPersonnes;

        // Reset status to en_attente and save
        $reservation->statut = 'en_attente';
        $reservation->fill($validated);
        $reservation->save();

        // Update groups and items (rebuild)
        foreach ($reservation->groups as $group) {
            $group->items()->delete();
            $group->delete();
        }

        foreach ($groupsData as $groupData) {
            $group = \App\Models\ReservationGroup::create([
                'id_reservation' => $reservation->id,
                'date_arrivee'   => $groupData['date_arrivee'],
                'date_depart'    => $groupData['date_depart'],
                'nb_personnes'   => $groupData['nb_personnes'],
            ]);

            foreach ($groupData['rooms'] as $roomData) {
                ItemReservation::create([
                    'id_group'      => $group->id,
                    'id_type'       => $roomData['id_type'],
                    'quantite'      => $roomData['quantite'],
                    'prix_unitaire' => $roomData['prix_unitaire'],
                ]);
            }
        }

        // Notify admins about the modification
        try {
            $admins = \App\Models\User::all();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminNotification(
                'Réservation Modifiée',
                'Le client ' . $reservation->nom_contact . ' a modifié les détails de sa réservation (' . $reservation->code_reference . ').',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send admin notification for reservation modification: ' . $e->getMessage());
        }

        return redirect()->route('reservation.show', $token)->with('success', 'Vos modifications ont été enregistrées. Notre équipe va les examiner.');
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

        $payment = \App\Models\PaymentVerification::create([
            'id_reservation' => $reservation->id,
            'document_path'  => $path,
            'amount'         => $request->amount,
            'statut'         => 'en_attente',
        ]);

        // Notify admins about the new payment
        try {
            $admins = \App\Models\User::all();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminNotification(
                'Nouveau Paiement',
                'Un nouveau paiement (' . number_format($request->amount, 2) . ' DH) a été soumis pour la réservation ' . $reservation->code_reference . '.',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send admin notification for new payment: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Votre preuve de paiement a été soumise avec succès et est en attente de vérification par notre équipe.');
    }
}
