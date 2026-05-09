@extends('emails.layouts.master')

@section('title', 'Virement refusé — ' . $CODE_REF)

@section('content')
{{-- Status banner --}}
<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
    <div style="font-size: 32px; margin-bottom: 12px;">❌</div>
    <div style="display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 14px; font-weight: 700; padding: 6px 16px; border-radius: 99px; margin-bottom: 12px;">
        Virement Refusé
    </div>
    
    <div style="color: #991b1b; font-size: 14px; line-height: 1.5;">
        Votre justificatif de paiement de <strong>{{ $MONTANT }}</strong>
        pour la réservation <strong>{{ $CODE_REF }}</strong> a été refusé.
        
        @if(!empty($RAISON) && $RAISON !== 'Aucune raison spécifiée.')
        <div style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.5); border-radius: 8px; text-align: left;">
            <p style="font-weight: 700; margin-bottom: 4px; font-size: 13px;">Raison du refus :</p>
            <p style="margin: 0; font-size: 13px;">{{ $RAISON }}</p>
        </div>
        @endif
    </div>
</div>

<p class="greeting">Bonjour {{ $NOM_CLIENT }},</p>
<p class="intro">
    Nous avons examiné votre justificatif de virement et malheureusement, nous ne pouvons pas le valider
    en l'état. Veuillez prendre connaissance de la raison ci-dessus et soumettre un nouveau justificatif
    depuis votre espace client.
</p>

<p class="details-title">Détails de la réservation</p>
<table class="details-table">
    <tr>
        <td class="label">Référence</td>
        <td class="value"><span class="ref-badge">{{ $CODE_REF }}</span></td>
    </tr>
    <tr>
        <td class="label">Hôtel</td>
        <td class="value">{{ $NOM_HOTEL }}</td>
    </tr>
    <tr>
        <td class="label">Montant refusé</td>
        <td class="value" style="color: #ef4444;">{{ $MONTANT }}</td>
    </tr>
</table>

<div class="divider"></div>

<div class="text-center" style="margin-bottom: 32px;">
    <p style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">
        Vous pouvez soumettre un nouveau justificatif de paiement depuis votre espace client :
    </p>
    <a href="{{ $PORTAL_URL }}" class="btn btn-danger">📄 Accéder à mon espace client</a>
</div>

<div class="divider"></div>

<p class="notice-text">
    Pour toute question, n'hésitez pas à contacter notre équipe.
    Nous sommes disponibles du lundi au vendredi, de 9h à 18h.
</p>
@endsection
