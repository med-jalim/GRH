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

class ReservationStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels, HasDynamicTemplate;

    /**
     * Status labels for the email body.
     */
    public static array $statusLabels = [
        'en_attente'          => 'En attente',
        'en_validation'       => 'Vérification requise',
        'valide'              => 'Validée par l\'administration',
        'en_attente_paiement' => 'En attente de paiement',
        'partiellement_paye'  => 'Partiellement payée',
        'confirme'            => 'Confirmée',
        'annule'              => 'Annulée',
    ];

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly Reservation $reservation,
        public readonly string $previousStatut,
        public readonly ?string $cancellationReason = null,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $label = self::$statusLabels[$this->reservation->statut] ?? $this->reservation->statut;

        return new Envelope(
            subject: "Votre réservation {$this->reservation->code_reference} — Statut : {$label}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $statusLabel = self::$statusLabels[$this->reservation->statut] ?? $this->reservation->statut;
        
        $data = array_merge($this->getCommonVariables($this->reservation), [
            'STATUT_LABEL'  => $statusLabel,
        ]);

        $dynamicHtml = $this->resolveDynamicTemplate('reservation_status_updated', $data);

        return new Content(
            view: $dynamicHtml ? 'emails.dynamic' : 'emails.reservation_status_updated',
            with: array_merge($data, [
                'reservation'        => $this->reservation,
                'previousStatut'     => $this->previousStatut,
                'newStatut'          => $this->reservation->statut,
                'statusLabel'        => $statusLabel,
                'prevLabel'          => self::$statusLabels[$this->previousStatut] ?? $this->previousStatut,
                'cancellationReason' => $this->cancellationReason,
                'dynamicHtml'        => $dynamicHtml,
            ]),
        );
    }
}
