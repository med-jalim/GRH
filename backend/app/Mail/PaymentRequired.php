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
        $data = $this->getCommonVariables($this->reservation);

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
