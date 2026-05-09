@extends('emails.layouts.master')

@section('title', 'Confirmation de votre réservation')

@section('content')
{{-- Status banner --}}
<div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
    <div style="font-size: 32px; margin-bottom: 12px;">📝</div>
    <div style="display: inline-block; background: #fef3c7; color: #b45309; font-size: 14px; font-weight: 700; padding: 6px 16px; border-radius: 99px; margin-bottom: 12px;">
        Vérification Requise
    </div>
    
    <div style="color: #92400e; font-size: 14px; line-height: 1.5;">
        Veuillez vérifier les détails de votre réservation et confirmer votre séjour.
    </div>
</div>

<p class="greeting">Bonjour {{ $reservation->nom_contact }},</p>
<p class="intro">
    Nous avons bien reçu votre demande de réservation. Avant de finaliser votre dossier, nous vous prions de bien vouloir confirmer les détails ci-dessous :
</p>

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

<p class="details-title">Récapitulatif du séjour</p>
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

<div class="text-center" style="margin-bottom: 32px;">
    <p style="font-size: 14px; color: #111827; font-weight: 600; margin-bottom: 16px;">
        Cliquez ci-dessous pour accéder à votre espace de réservation :
    </p>
    <a href="{{ $portalUrl }}" class="btn btn-warning">🔍 Accéder à ma réservation</a>
</div>

@endsection
