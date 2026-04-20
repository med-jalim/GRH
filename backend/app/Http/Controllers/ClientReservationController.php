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
use App\Models\User;
use App\Notifications\AdminNotification;
use App\Models\ReservationGroup;
use App\Models\PaymentVerification;
use App\Models\DiscountRule;

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
            $admins = User::all();
            Notification::send($admins, new AdminNotification(
                'Réservation Confirmée',
                'Le client ' . $reservation->nom_contact . ' a confirmé sa réservation (' . $reservation->code_reference . ').',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification for reservation confirmation: ' . $e->getMessage());
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
            $admins = User::all();
            Notification::send($admins, new AdminNotification(
                'Réservation Annulée par le client',
                'Le client ' . $reservation->nom_contact . ' a annulé sa réservation (' . $reservation->code_reference . ').',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification for reservation cancellation: ' . $e->getMessage());
        }

        return redirect()->route('reservation.show', $token)->with('success', 'Votre réservation a été annulée conformément à votre demande.');
    }

    /**
     * Show the reservation portal via token.
     */
    public function show($token)
    {
        $reservation = Reservation::with(['hotel', 'groups.items.type', 'groups.items.subType', 'payments'])->where('token', $token)->firstOrFail();

        // We fetch all hotels only to show the selected one as locked, 
        // or we just fetch the selected hotel to keep it simple.
        $hotels = Hotel::withBookingData()->get();
        $discountRules = DiscountRule::orderBy('min_nights', 'desc')->get();

        return Inertia::render('PublicReservationPortal', [
            'reservation' => $reservation,
            'hotels' => $hotels,
            'discountRules' => $discountRules,
            'settings' => \App\Models\AppSetting::all(),
        ]);
    }

    /**
     * Update the reservation details and reset status to en_attente.
     */
    public function update(Request $request, $token)
    {
        $reservation = Reservation::where('token', $token)->firstOrFail();

        $validated = $request->validate([
            'type_reservant'      => 'sometimes|required|in:agence,groupe',
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
            'groups.*.rooms.*.id_sub_type'   => 'required|integer|exists:sub_types,id',
            'groups.*.rooms.*.quantite'      => 'required|integer|min:1',
            'groups.*.rooms.*.prix_unitaire' => 'required|numeric|min:0',
            'groups.*.rooms.*.nb_adultes'    => 'required|integer|min:0',
            'groups.*.rooms.*.nb_enfants'    => 'required|integer|min:0',
        ]);

        $occupancyFailures = $this->reservationService->validateOccupancyCount($validated['groups']);
        if (!empty($occupancyFailures)) {
            return redirect()->back()->withErrors(['availability' => $occupancyFailures]);
        }

        // Availability check
        $failures = $this->reservationService->checkAvailability($reservation->id_hotel, $validated['groups'], $reservation->id);
        if (!empty($failures)) {
            return redirect()->back()->withErrors(['availability' => $failures]);
        }

        // Minimum rooms validation
        $minRoomsSetting = \App\Models\AppSetting::where('key', 'min_rooms_per_reservation')->first();
        $minRooms = $minRoomsSetting ? (int)$minRoomsSetting->value : 11;
        
        $totalRooms = collect($validated['groups'])->flatMap(function ($group) {
            return $group['rooms'];
        })->sum('quantite');

        if ($totalRooms < $minRooms) {
            $errorMessage = "Une réservation doit comporter au moins $minRooms chambres.";
            return redirect()->back()->withErrors(['rooms' => $errorMessage])->withInput();
        }

        $groupsData = $validated['groups'];
        unset($validated['groups']);

        // Calculate Totals and Discounts via Service
        $totals = $this->reservationService->calculateTotals(
            $reservation->id_hotel,
            $groupsData,
            $reservation->type_reservant
        );

        $totalPersonnes = collect($groupsData)->sum('nb_personnes');
        $validated['nb_personnes']      = $totalPersonnes;
        $validated['taxe_sejour_total'] = $totals['taxe_sejour_total'];
        $validated['prix_avant_remise'] = $totals['chambre_sous_total'];
        $validated['prix_total']         = $totals['prix_total'];
        
        $totalRemiseMontant = $totals['remise_montant'];
        $validated['remise_pourcentage'] = $totals['chambre_sous_total'] > 0 
            ? ($totalRemiseMontant / $totals['chambre_sous_total']) * 100 
            : 0;

        // Reset status to en_attente and save
        $reservation->statut = 'en_attente';
        $reservation->fill($validated);
        $reservation->save();

        // Update groups and items (rebuild)
        foreach ($reservation->groups as $group) {
            $group->items()->delete();
            $group->delete();
        }

        foreach ($groupsData as $index => $groupData) {
            $groupOccupants = collect($groupData['rooms'])->sum(function ($room) {
                return ((int) ($room['nb_adultes'] ?? 0)) + ((int) ($room['nb_enfants'] ?? 0));
            });

            $group = ReservationGroup::create([
                'id_reservation'    => $reservation->id,
                'date_arrivee'      => $groupData['date_arrivee'],
                'date_depart'       => $groupData['date_depart'],
                'nb_personnes'      => $groupOccupants,
                'remise_pourcentage'=> $totals['groups'][$index]['remise_pourcentage'],
                'remise_montant'    => $totals['groups'][$index]['remise_montant'],
            ]);

            foreach ($groupData['rooms'] as $roomData) {
                ItemReservation::create([
                    'id_group'      => $group->id,
                    'id_type'       => $roomData['id_type'],
                    'id_sub_type'   => $roomData['id_sub_type'],
                    'quantite'      => $roomData['quantite'],
                    'prix_unitaire' => $roomData['prix_unitaire'],
                    'nb_adultes'    => $roomData['nb_adultes'],
                    'nb_enfants'    => $roomData['nb_enfants'],
                ]);
            }
        }

        // Notify admins about the modification
        try {
            $admins = User::all();
            Notification::send($admins, new AdminNotification(
                'Réservation Modifiée',
                'Le client ' . $reservation->nom_contact . ' a modifié les détails de sa réservation (' . $reservation->code_reference . ').',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification for reservation modification: ' . $e->getMessage());
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

        $payment = PaymentVerification::create([
            'id_reservation' => $reservation->id,
            'document_path'  => $path,
            'amount'         => $request->amount,
            'statut'         => 'en_attente',
        ]);

        // Notify admins about the new payment
        try {
            $admins = User::all();
            Notification::send($admins, new AdminNotification(
                'Nouveau Paiement',
                'Un nouveau paiement (' . number_format($request->amount, 2) . ' DH) a été soumis pour la réservation ' . $reservation->code_reference . '.',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification for new payment: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Votre preuve de paiement a été soumise avec succès et est en attente de vérification par notre équipe.');
    }

    
}
