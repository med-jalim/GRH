<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationValidationRequest extends Mailable
{
    use Queueable, SerializesModels;

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
        // $baseUrl = config('app.url');
        $baseUrl = "http://127.0.0.1:8000";
        return new Content(
            view: 'emails.reservation_validation_request',
            with: [
                'reservation' => $this->reservation,
                'confirmUrl' => "{$baseUrl}/reservation/{$this->reservation->token}/confirm",
                'cancelUrl'  => "{$baseUrl}/reservation/{$this->reservation->token}/cancel",
                'editUrl'    => "{$baseUrl}/reservation/{$this->reservation->token}/edit",
            ],
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
