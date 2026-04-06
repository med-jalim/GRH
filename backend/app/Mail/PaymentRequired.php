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

class PaymentRequired extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels, HasDynamicTemplate;

    public function __construct(
        public readonly Reservation $reservation
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Paiement requis pour votre réservation {$this->reservation->code_reference}",
        );
    }

    public function content(): Content
    {
        $data = [
            'NOM_CLIENT'    => $this->reservation->nom_contact,
            'CODE_REF'      => $this->reservation->code_reference,
            'NOM_HOTEL'     => $this->reservation->hotel->name ?? 'votre hôtel',
            'PRIX_TOTAL'    => number_format($this->reservation->prix_total, 2, ',', ' ') . ' MAD',
            'PORTAL_URL'    => url('reservation/' . $this->reservation->token),
            'PAYMENT_LINK'  => $this->reservation->payment_link ?? url('reservation/' . $this->reservation->token),
            'TABLEAU_DEVIS' => $this->generateQuoteTable($this->reservation),
        ];

        $dynamicHtml = $this->resolveDynamicTemplate('payment_required', $data);

        return new Content(
            view: $dynamicHtml ? 'emails.dynamic' : 'emails.reservation_status_updated',
            with: array_merge($data, [
                'reservation' => $this->reservation,
                'newStatut'   => 'en_attente_paiement',
                'statusLabel' => 'En attente de paiement',
                'dynamicHtml' => $dynamicHtml,
            ]),
        );
    }
}
