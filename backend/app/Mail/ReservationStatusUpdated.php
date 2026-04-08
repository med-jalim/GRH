<?php

namespace App\Mail;

use App\Models\Reservation;
use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class ReservationStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public static array $statusLabels = [
        'en_attente'          => 'En attente',
        'en_verification'     => 'En cours de vérification (Devis)',
        'valide'              => 'Validée',
        'en_attente_paiement' => 'En attente de paiement',
        'paye_partiellement'  => 'Payée partiellement',
        'confirme'            => 'Confirmée',
        'annule'              => 'Annulée',
    ];

    public function __construct(
        public readonly Reservation $reservation,
        public readonly string $previousStatut,
    ) {}

    public function envelope(): Envelope
    {
        $statut   = $this->reservation->statut;
        $slug     = 'status_' . $statut;
        $template = EmailTemplate::findBySlug($slug);
        $data     = $this->buildData();

        $subject = $template
            ? $template->renderSubject($data)
            : "Votre réservation {$this->reservation->code_reference} — Statut : " . (self::$statusLabels[$statut] ?? $statut);

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        $slug     = 'status_' . $this->reservation->statut;
        $template = EmailTemplate::findBySlug($slug);
        $data     = $this->buildData();

        if ($template && $template->published_content) {
            try {
                $rendered = $template->renderPublished($data);
                return new Content(htmlString: $rendered);
            } catch (\Throwable $e) {
                Log::error('Email template render failed', ['slug' => $slug, 'error' => $e->getMessage()]);
            }
        }

        // Fallback static Blade view
        return new Content(
            view: 'emails.reservation_status_updated',
            with: $data,
        );
    }

    private function buildData(): array
    {
        return [
            'reservation'    => $this->reservation->load(['hotel', 'groups.items.type']),
            'previousStatut' => $this->previousStatut,
            'newStatut'      => $this->reservation->statut,
            'statusLabel'    => self::$statusLabels[$this->reservation->statut] ?? $this->reservation->statut,
            'prevLabel'      => self::$statusLabels[$this->previousStatut] ?? $this->previousStatut,
            'lien_paiement'  => $this->reservation->lien_paiement ?? '',
            'verify_url'     => URL::signedRoute('booking.verify', [
                'reference' => $this->reservation->code_reference,
            ]),
        ];
    }
}
