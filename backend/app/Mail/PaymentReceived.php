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

class PaymentReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels, HasDynamicTemplate;

    public function __construct(
        public readonly Reservation $reservation,
        public readonly float $amountPaidNow
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Paiement reçu — Réservation {$this->reservation->code_reference}",
        );
    }

    public function content(): Content
    {
        $total = $this->reservation->prix_total;
        $paidSoFar = $this->reservation->paid_amount;
        $balance = $total - $paidSoFar;

        $data = [
            'NOM_CLIENT'      => $this->reservation->nom_contact,
            'CODE_REF'        => $this->reservation->code_reference,
            'NOM_HOTEL'       => $this->reservation->hotel->name ?? 'votre hôtel',
            'MONTANT_PAYE'    => number_format($this->amountPaidNow, 2, ',', ' ') . ' MAD',
            'TOTAL_PAYE'      => number_format($paidSoFar, 2, ',', ' ') . ' MAD',
            'SOLDE_RESTANT'   => number_format($balance, 2, ',', ' ') . ' MAD',
            'PRIX_TOTAL'      => number_format($total, 2, ',', ' ') . ' MAD',
            'PORTAL_URL'      => url('reservation/' . $this->reservation->token),
        ];

        $dynamicHtml = $this->resolveDynamicTemplate('payment_received', $data);

        return new Content(
            view: $dynamicHtml ? 'emails.dynamic' : 'emails.reservation_status_updated',
            with: array_merge($data, [
                'reservation' => $this->reservation,
                'newStatut'   => $this->reservation->statut,
                'statusLabel' => 'Paiement Reçu',
                'dynamicHtml' => $dynamicHtml,
            ]),
        );
    }
}
