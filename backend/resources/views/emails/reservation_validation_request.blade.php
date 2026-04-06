@php
    $colors = [
        'en_validation' => [
            'bg'          => '#fefce8',
            'border'      => '#fef08a',
            'text'        => '#854d0e',
            'badge_bg'    => '#fef9c3',
            'badge_text'  => '#a16207',
            'icon'        => '📝',
        ],
    ];
    $c = $colors['en_validation'];
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirmation de votre réservation</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 20px 20px 0 0; padding: 36px 40px; text-align: center; }
        .header .logo-text { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .header .logo-text span { color: #f59e0b; }
        .header p { color: #94a3b8; font-size: 13px; margin-top: 6px; }
        .card { background: #ffffff; border-radius: 0 0 20px 20px; padding: 32px 40px 40px; }
        .status-card { border-radius: 16px; padding: 24px 32px; margin-bottom: 28px; text-align: center; }
        .status-icon { font-size: 40px; margin-bottom: 10px; }
        .status-label { display: inline-block; font-size: 15px; font-weight: 700; padding: 6px 18px; border-radius: 999px; margin-bottom: 8px; }
        .status-message { font-size: 13px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .intro { font-size: 14px; color: #475569; line-height: 1.65; margin-bottom: 28px; }
        .details-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 12px; }
        .details-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 28px; }
        .details-table tr { border-bottom: 1px solid #f1f5f9; }
        .details-table tr:last-child { border-bottom: none; }
        .details-table td { padding: 10px 0; vertical-align: top; }
        .details-table .label { color: #64748b; font-weight: 500; width: 45%; }
        .details-table .value { color: #1e293b; font-weight: 600; }
        .ref-badge { display: inline-block; background: #fff7ed; color: #c2410c; font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px; border: 1px solid #fed7aa; }
        .actions { display: flex; flex-direction: column; gap: 12px; margin: 32px 0; }
        .btn { display: block; padding: 14px 24px; border-radius: 12px; text-align: center; text-decoration: none; font-size: 15px; font-weight: 700; transition: all 0.2s; }
        .btn-confirm { background: #059669; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2); }
        .btn-edit { background: #f59e0b; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2); }
        .btn-cancel { background: #ef4444; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); }
        .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; line-height: 1.6; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div class="logo-text">GRH <span>Hôtels</span></div>
        <p>Système de gestion des réservations</p>
    </div>
    <div class="card">
        <div class="status-card" style="background-color: {{ $c['bg'] }}; border: 1.5px solid {{ $c['border'] }};">
            <div class="status-icon">{{ $c['icon'] }}</div>
            <div class="status-label" style="background: {{ $c['badge_bg'] }}; color: {{ $c['badge_text'] }};">
                Vérification Requise
            </div>
            <div class="status-message" style="color: {{ $c['text'] }};">
                Veuillez vérifier les détails de votre réservation et confirmer votre séjour.
            </div>
        </div>

        <p class="greeting">Bonjour {{ $reservation->nom_contact }},</p>
        <p class="intro">
            Nous avons bien reçu votre demande de réservation. Avant de finaliser votre dossier, nous vous prions de bien vouloir confirmer les détails ci-dessous :
        </p>

        <p class="details-title">Détails de la réservation</p>
        <table class="details-table">
            <tr><td class="label">Référence</td><td class="value"><span class="ref-badge">{{ $reservation->code_reference }}</span></td></tr>
            @if($reservation->hotel)
            <tr><td class="label">Hôtel</td><td class="value">{{ $reservation->hotel->name }}, {{ $reservation->hotel->ville }}</td></tr>
            @endif
        <p class="details-title">Récapitulatif du séjour</p>
        {!! $TABLEAU_DEVIS !!}

        <div class="divider"></div>

        <p style="font-weight: 700; color: #0f172a; margin-bottom: 16px; text-align: center;">Cliquez ci-dessous pour accéder à votre espace de réservation :</p>
        
        <div class="actions">
            <a href="{{ $portalUrl }}" class="btn btn-edit">🔍 Accéder à ma réservation</a>
        </div>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} GRH Hôtels. Tous droits réservés.</p>
    </div>
</div>
</body>
</html>
