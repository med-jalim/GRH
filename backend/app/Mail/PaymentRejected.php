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

class PaymentRejected extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels, HasDynamicTemplate;

    public function __construct(
        public readonly Reservation $reservation,
        public readonly float $amount,
        public readonly ?string $reason = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Virement refusé — Réservation {$this->reservation->code_reference}",
        );
    }

    public function content(): Content
    {
        $data = array_merge($this->getCommonVariables($this->reservation), [
            'MONTANT'      => number_format($this->amount, 2, ',', ' ') . ' MAD',
            'RAISON'       => $this->reason ?? 'Aucune raison spécifiée.',
        ]);

        $dynamicHtml = $this->resolveDynamicTemplate('payment_rejected', $data);

        return new Content(
            view: $dynamicHtml ? 'emails.dynamic' : 'emails.payment_rejected',
            with: array_merge($data, [
                'reservation' => $this->reservation,
                'dynamicHtml' => $dynamicHtml,
            ]),
        );
    }
}
