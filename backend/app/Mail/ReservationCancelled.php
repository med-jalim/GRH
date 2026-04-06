<?php

namespace App\Mail;

use App\Traits\HasDynamicTemplate;
use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ReservationCancelled extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels, HasDynamicTemplate;

    public function __construct(
        public readonly Reservation $reservation,
        public readonly ?string $cancellationReason = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Annulation de votre réservation {$this->reservation->code_reference}",
        );
    }

    public function content(): Content
    {
        $data = [
            'NOM_CLIENT'          => $this->reservation->nom_contact,
            'CODE_REF'            => $this->reservation->code_reference,
            'NOM_HOTEL'           => $this->reservation->hotel->name ?? 'votre hôtel',
            'RAISON_ANNULATION'   => $this->cancellationReason ?? 'Non spécifiée',
            'DATES_SEJOUR'        => $this->reservation->date_arrivee->format('d/m/Y') . ' au ' . $this->reservation->date_depart->format('d/m/Y'),
            'PORTAL_URL'          => url('reservation/' . $this->reservation->token),
            'TABLEAU_DEVIS'       => $this->generateQuoteTable($this->reservation),
        ];

        $dynamicHtml = $this->resolveDynamicTemplate('reservation_cancelled', $data);

        return new Content(
            view: $dynamicHtml ? 'emails.dynamic' : 'emails.reservation_status_updated',
            with: array_merge($data, [
                'reservation'        => $this->reservation,
                'newStatut'          => 'annule',
                'statusLabel'        => 'Annulée',
                'cancellationReason' => $this->cancellationReason,
                'dynamicHtml'        => $dynamicHtml,
            ]),
        );
    }
}
