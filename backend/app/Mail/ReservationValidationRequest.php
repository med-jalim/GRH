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

class ReservationValidationRequest extends Mailable implements ShouldQueue
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

        $data = $this->getCommonVariables($this->reservation);

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
