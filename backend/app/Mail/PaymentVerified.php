<?php

namespace App\Mail;

use App\Models\Reservation;
use App\Models\Payment;
use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class PaymentVerified extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Reservation $reservation,
        public readonly Payment $payment,
        public readonly string $verifyUrl,
    ) {}

    public function envelope(): Envelope
    {
        $template = EmailTemplate::findBySlug('payment_verified');
        $subject = $template
            ? $template->renderSubject(['reservation' => $this->reservation])
            : 'Paiement Validé - Réservation #' . $this->reservation->code_reference;

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        $template = EmailTemplate::findBySlug('payment_verified');

        if ($template) {
            try {
                $rendered = $template->renderPublished($this->buildData());
                return new Content(htmlString: $rendered);
            } catch (\Throwable $e) {
                \Log::error('payment_verified email template render failed', ['error' => $e->getMessage()]);
            }
        }

        return new Content(view: 'emails.payment_verified');
    }

    private function buildData(): array
    {
        return [
            'reservation' => $this->reservation->load(['hotel', 'groups.items.type']),
            'payment'     => $this->payment,
            'verifyUrl'   => $this->verifyUrl,
        ];
    }

    public function attachments(): array
    {
        return [];
    }
}
