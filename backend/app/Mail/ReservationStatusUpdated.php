<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ReservationStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Status labels for the email body.
     */
    public static array $statusLabels = [
        'en_attente'          => 'En attente',
        'en_validation'       => 'Vérification requise',
        'valide'              => 'Confirmée par le client',
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
        return new Content(
            view: 'emails.reservation_status_updated',
            with: [
                'reservation'        => $this->reservation,
                'previousStatut'     => $this->previousStatut,
                'newStatut'          => $this->reservation->statut,
                'statusLabel'        => self::$statusLabels[$this->reservation->statut] ?? $this->reservation->statut,
                'prevLabel'          => self::$statusLabels[$this->previousStatut] ?? $this->previousStatut,
                'cancellationReason' => $this->cancellationReason,
            ],
        );
    }
}
