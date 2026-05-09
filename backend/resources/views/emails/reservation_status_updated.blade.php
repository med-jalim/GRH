@extends('emails.layouts.master')

@section('title', 'Mise à jour de votre réservation')

@section('content')
@php
    $colors = [
        'en_attente' => [
            'bg'          => '#fffbeb',
            'border'      => '#fde68a',
            'text'        => '#92400e',
            'badge_bg'    => '#fef3c7',
            'badge_text'  => '#b45309',
            'icon'        => '⏳',
        ],
        'confirme' => [
            'bg'          => '#f0fdf4',
            'border'      => '#86efac',
            'text'        => '#14532d',
            'badge_bg'    => '#dcfce7',
            'badge_text'  => '#15803d',
            'icon'        => '✅',
        ],
        'annule' => [
            'bg'          => '#fff1f2',
            'border'      => '#fda4af',
            'text'        => '#881337',
            'badge_bg'    => '#ffe4e6',
            'badge_text'  => '#be123c',
            'icon'        => '❌',
        ],
        'en_attente_paiement' => [
            'bg'          => '#eef2ff',
            'border'      => '#c7d2fe',
            'text'        => '#3730a3',
            'badge_bg'    => '#e0e7ff',
            'badge_text'  => '#4338ca',
            'icon'        => '💳',
        ],
        'en_validation' => [
            'bg'          => '#fefce8',
            'border'      => '#fef08a',
            'text'        => '#854d0e',
            'badge_bg'    => '#fef9c3',
            'badge_text'  => '#a16207',
            'icon'        => '📝',
        ],
        'valide' => [
            'bg'          => '#f0fdf4',
            'border'      => '#86efac',
            'text'        => '#14532d',
            'badge_bg'    => '#dcfce7',
            'badge_text'  => '#15803d',
            'icon'        => '🤝',
        ],
        'partiellement_paye' => [
            'bg'          => '#f0f9ff',
            'border'      => '#bae6fd',
            'text'        => '#075985',
            'badge_bg'    => '#e0f2fe',
            'badge_text'  => '#0369a1',
            'icon'        => '💰',
        ],
    ];
    $c = $colors[(string)($newStatut ?? 'en_attente')] ?? $colors['en_attente'];
@endphp

{{-- Status banner --}}
<div style="background-color: {{ $c['bg'] }}; border: 1px solid {{ $c['border'] }}; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
    <div style="font-size: 32px; margin-bottom: 12px;">{{ $c['icon'] }}</div>
    <div style="display: inline-block; background: {{ $c['badge_bg'] }}; color: {{ $c['badge_text'] }}; font-size: 14px; font-weight: 700; padding: 6px 16px; border-radius: 99px; margin-bottom: 12px;">
        {{ $statusLabel }}
    </div>
    
    <div style="color: {{ $c['text'] }}; font-size: 14px; line-height: 1.5;">
        @if($newStatut === 'confirme')
            Votre réservation a été <strong>confirmée</strong>. Nous vous attendons avec impatience !
            
            @if(!empty($cancellationReason))
                <div style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.5); border-radius: 8px; text-align: left;">
                    <p style="margin: 0; font-size: 13px;">{{ $cancellationReason }}</p>
                </div>
            @endif
        @elseif($newStatut === 'annule')
            Votre réservation a été <strong>annulée</strong>.
            @if(!empty($cancellationReason))
                <div style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.5); border-radius: 8px; text-align: left;">
                    <p style="font-weight: 700; margin-bottom: 4px; font-size: 13px;">Raison de l'annulation :</p>
                    <p style="margin: 0; font-size: 13px;">{{ $cancellationReason }}</p>
                </div>
            @else
                N'hésitez pas à nous contacter pour plus d'information.
            @endif
        @elseif($newStatut === 'en_attente_paiement')
            Votre réservation est maintenant <strong>en attente de paiement</strong>.
            
            <p style="margin-top: 12px;">
                Pour finaliser votre réservation et garantir vos dates, nous vous invitons à effectuer le règlement.
            </p>

            @if($reservation->payment_link)
                <div style="margin-top: 24px;">
                    <a href="{{ $reservation->payment_link }}" class="btn" style="background-color: #4338ca;">💳 Payer en ligne (Payzone)</a>
                </div>
            @endif

            @if($reservation->hotel && !empty($reservation->hotel->rib))
                <div style="margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.6); border-radius: 8px; text-align: left;">
                    <p style="font-weight: 700; margin-bottom: 8px; font-size: 13px;">Coordonnées Bancaires (RIB) :</p>
                    <p style="font-family: monospace; font-weight: 700; font-size: 15px; margin: 0; letter-spacing: 1px;">
                        {{ $reservation->hotel->rib }}
                    </p>
                </div>
            @endif

            <div style="margin-top: 24px;">
                <p style="font-size: 13px; margin-bottom: 12px;">Si vous avez effectué un virement, veuillez joindre votre reçu :</p>
                <a href="{{ url('reservation/' . $reservation->token) }}" class="btn" style="background-color: #ffffff; color: #4338ca !important; border: 1px solid #4338ca;">📄 Joindre mon reçu</a>
            </div>
        @else
            Votre réservation est <strong>en cours de traitement</strong>. Nous vous tiendrons informé(e) de toute évolution.
        @endif
    </div>
</div>

{{-- Greeting --}}
<p class="greeting">Bonjour {{ $reservation->nom_contact }},</p>
<p class="intro">
    Le statut de votre réservation a été mis à jour de <strong>{{ $prevLabel }}</strong> vers <strong>{{ $statusLabel }}</strong>.
    Voici le récapitulatif de votre séjour :
</p>

{{-- Details --}}
<p class="details-title">Détails de la réservation</p>
<table class="details-table">
    <tr>
        <td class="label">Référence</td>
        <td class="value"><span class="ref-badge">{{ $reservation->code_reference }}</span></td>
    </tr>
    @if($reservation->hotel)
    <tr>
        <td class="label">Hôtel</td>
        <td class="value">{{ $reservation->hotel->name }}, {{ $reservation->hotel->ville }}</td>
    </tr>
    @endif
</table>

<p class="details-title">Récapitulatif de votre séjour</p>
<div style="background: #f9fafb; border-radius: 8px; padding: 16px; font-size: 14px; margin-bottom: 32px;">
    {!! str_replace('<table', '<table style="width: 100%; border-collapse: collapse;"', $TABLEAU_DEVIS) !!}
</div>

@if($reservation->remise_pourcentage && $reservation->prix_avant_remise)
    <table class="details-table" style="background: transparent; border-top: 1px dashed #e5e7eb; padding-top: 16px;">
        <tr>
            <td class="label">Valeur Initiale</td>
            <td class="value" style="text-decoration: line-through; color: #9ca3af;">{{ number_format($reservation->prix_avant_remise, 0, ',', ' ') }} MAD</td>
        </tr>
        <tr>
            <td class="label" style="color: #059669;">Remise ({{ $reservation->remise_pourcentage }}%)</td>
            <td class="value" style="color: #059669; font-weight: 800;">- {{ number_format($reservation->prix_avant_remise - ($reservation->prix_total - ($reservation->taxe_sejour_total ?? 0)), 0, ',', ' ') }} MAD</td>
        </tr>
    </table>
@endif

<div class="divider"></div>

<p class="notice-text">
    Pour toute question, répondez à cet e-mail ou contactez notre équipe.
    Nous sommes disponibles du lundi au vendredi, de 9h à 18h.
</p>
@endsection
