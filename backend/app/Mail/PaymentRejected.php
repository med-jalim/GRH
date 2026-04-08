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

class PaymentRejected extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Reservation $reservation,
        public readonly Payment $payment,
        public readonly string $verifyUrl,
    ) {}

    public function envelope(): Envelope
    {
        $template = EmailTemplate::findBySlug('payment_rejected');
        $subject = $template
            ? $template->renderSubject(['reservation->code_reference' => $this->reservation->code_reference])
            : 'Action Requise : Preuve de Paiement Refusée - Réservation #' . $this->reservation->code_reference;

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        $template = EmailTemplate::findBySlug('payment_rejected');

        if ($template) {
            try {
                $rendered = $template->renderPublished($this->buildData());
                return new Content(htmlString: $rendered);
            } catch (\Throwable $e) {
                \Log::error('payment_rejected email template render failed', ['error' => $e->getMessage()]);
            }
        }

        return new Content(view: 'emails.payment_rejected');
    }

    private function buildData(): array
    {
        return [
            'reservation' => $this->reservation->load(['hotel', 'groups.items.type']),
            'payment'     => $this->payment,
            'verifyUrl'   => $this->verifyUrl,
            'notes_admin' => $this->payment->notes_admin,
        ];
    }

    public function attachments(): array
    {
        return [];
    }
}
