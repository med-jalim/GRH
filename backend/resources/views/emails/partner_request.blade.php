@extends('emails.layouts.master')

@section('title', 'Nouvelle demande de partenariat')

@section('content')
<div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
    <div style="font-size: 32px; margin-bottom: 12px;">🏢</div>
    <div style="display: inline-block; background: #dcfce7; color: #15803d; font-size: 14px; font-weight: 700; padding: 6px 16px; border-radius: 99px; margin-bottom: 12px;">
        Nouvelle Demande B2B
    </div>
    
    <div style="color: #14532d; font-size: 14px; line-height: 1.5;">
        Vous avez reçu une nouvelle demande d'accès ou de devis depuis la page d'accueil du portail professionnel.
    </div>
</div>

<p class="details-title">Informations du demandeur</p>
<table class="details-table">
    <tr>
        <td class="label">Type de demandeur</td>
        <td class="value"><span class="ref-badge">{{ ucfirst($data['type']) }}</span></td>
    </tr>
    <tr>
        <td class="label">Nom de l'Entité</td>
        <td class="value">{{ $data['company_name'] }}</td>
    </tr>
    <tr>
        <td class="label">Email de contact</td>
        <td class="value"><a href="mailto:{{ $data['email'] }}" style="color: #54b172; text-decoration: none;">{{ $data['email'] }}</a></td>
    </tr>
    <tr>
        <td class="label">Téléphone</td>
        <td class="value">{{ $data['phone'] }}</td>
    </tr>
</table>

@if(!empty($data['message']))
<p class="details-title" style="margin-top: 24px;">Message de l'agence</p>
<div style="background: #f9fafb; padding: 16px; border-left: 4px solid #54b172; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">{{ nl2br(e($data['message'])) }}</p>
</div>
@endif

<div class="divider"></div>

<p class="notice-text">
    Veuillez contacter cette personne pour valider sa demande et lui générer un lien de réservation si nécessaire.
</p>
@endsection
