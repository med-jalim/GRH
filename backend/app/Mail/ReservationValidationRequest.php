<?php

namespace App\Mail;

use App\Traits\HasDynamicTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationValidationRequest extends Mailable
{
    use Queueable, SerializesModels, HasDynamicTemplate;

    public function __construct(
        public readonly \App\Models\Reservation $reservation
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Confirmation requise — Votre réservation {$this->reservation->code_reference}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $baseUrl = "http://127.0.0.1:8000";
        $portalUrl = "{$baseUrl}/reservation/{$this->reservation->token}";

        // Prepare data for dynamic template
        $data = [
            'NOM_CLIENT'    => $this->reservation->nom_contact,
            'CODE_REF'      => $this->reservation->code_reference,
            'NOM_HOTEL'     => $this->reservation->hotel->name ?? 'votre hôtel',
            'NB_PERSONNES'  => $this->reservation->nb_personnes,
            'DATES_SEJOUR'  => $this->reservation->date_arrivee->format('d/m/Y') . ' au ' . $this->reservation->date_depart->format('d/m/Y'),
            'TABLEAU_DEVIS' => $this->generateQuoteTable($this->reservation),
            'PORTAL_URL'    => url('reservation/' . $this->reservation->token),
        ];

        $dynamicHtml = $this->resolveDynamicTemplate('reservation_validation', $data);

        return new Content(
            view: $dynamicHtml ? 'emails.dynamic' : 'emails.reservation_validation_request',
            with: array_merge($data, [
                'reservation' => $this->reservation,
                'portalUrl'   => $portalUrl,
                'dynamicHtml' => $dynamicHtml,
            ]),
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
