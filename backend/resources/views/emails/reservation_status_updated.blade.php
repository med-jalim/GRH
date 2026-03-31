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
    ];
    $c = $colors[(string)($newStatut ?? 'en_attente')] ?? $colors['en_attente'];
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mise à jour de votre réservation</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            padding: 40px 16px;
        }

        .container { max-width: 600px; margin: 0 auto; }

        /* Header */
        .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 20px 20px 0 0;
            padding: 36px 40px;
            text-align: center;
        }
        .header .logo-text {
            font-size: 22px; font-weight: 800;
            color: #ffffff; letter-spacing: -0.5px;
        }
        .header .logo-text span { color: #f59e0b; }
        .header p { color: #94a3b8; font-size: 13px; margin-top: 6px; }

        /* Card */
        .card {
            background: #ffffff;
            border-radius: 0 0 20px 20px;
            padding: 32px 40px 40px;
        }

        /* Status card */
        .status-card {
            border-radius: 16px;
            padding: 24px 32px;
            margin-bottom: 28px;
            text-align: center;
        }
        .status-icon  { font-size: 40px; margin-bottom: 10px; }
        .status-label {
            display: inline-block;
            font-size: 15px; font-weight: 700;
            padding: 6px 18px; border-radius: 999px;
            margin-bottom: 8px;
        }
        .status-message { font-size: 13px; }

        /* Greeting / intro */
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .intro     { font-size: 14px; color: #475569; line-height: 1.65; margin-bottom: 28px; }

        /* Details table */
        .details-title {
            font-size: 12px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.08em;
            color: #94a3b8; margin-bottom: 12px;
        }
        .details-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 28px; }
        .details-table tr  { border-bottom: 1px solid #f1f5f9; }
        .details-table tr:last-child { border-bottom: none; }
        .details-table td  { padding: 10px 0; vertical-align: top; }
        .details-table .label { color: #64748b; font-weight: 500; width: 45%; }
        .details-table .value { color: #1e293b; font-weight: 600; }

        .ref-badge {
            display: inline-block;
            background: #fff7ed; color: #c2410c;
            font-family: 'Courier New', monospace;
            font-size: 12px; font-weight: 700;
            padding: 3px 10px; border-radius: 6px;
            border: 1px solid #fed7aa;
        }
        .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }

        /* Footer */
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; line-height: 1.6; }
        .footer a { color: #f59e0b; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">

    {{-- Header --}}
    <div class="header">
        <div class="logo-text">GRH <span>Hôtels</span></div>
        <p>Système de gestion des réservations</p>
    </div>

    {{-- Main card --}}
    <div class="card">

        {{-- Status banner --}}
        <div class="status-card" style="background-color: {{ $c['bg'] }}; border: 1.5px solid {{ $c['border'] }};">
            <div class="status-icon">{{ $c['icon'] }}</div>
            <div class="status-label" style="background: {{ $c['badge_bg'] }}; color: {{ $c['badge_text'] }};">
                {{ $statusLabel }}
            </div>
            <div class="status-message" style="color: {{ $c['text'] }};">
                @if($newStatut === 'confirme')
                    Votre réservation a été <strong>confirmée</strong>. Nous vous attendons avec impatience !
                @elseif($newStatut === 'annule')
                    Votre réservation a été <strong>annulée</strong>. N'hésitez pas à nous contacter pour plus d'information.
                @else
                    Votre réservation est <strong>en cours de traitement</strong>. Nous vous tiendrons informé(e) de toute évolution.
                @endif
            </div>
        </div>

        {{-- Greeting --}}
        <p class="greeting">Bonjour {{ $reservation->nom_contact }},</p>
        <p class="intro">
            Le statut de votre réservation a été mis à jour de
            <strong>{{ $prevLabel }}</strong> vers <strong>{{ $statusLabel }}</strong>.
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
            <tr>
                <td class="label">Arrivée</td>
                <td class="value">
                    {{ \Carbon\Carbon::parse($reservation->date_arrivee)->translatedFormat('d F Y') }}
                </td>
            </tr>
            <tr>
                <td class="label">Départ</td>
                <td class="value">
                    {{ \Carbon\Carbon::parse($reservation->date_depart)->translatedFormat('d F Y') }}
                </td>
            </tr>
            <tr>
                <td class="label">Nombre de personnes</td>
                <td class="value">{{ $reservation->nb_personnes }}</td>
            </tr>
            <tr>
                <td class="label">Prix total</td>
                <td class="value" style="color:#d97706; font-size:15px;">
                    {{ number_format($reservation->prix_total, 0, ',', ' ') }} MAD
                </td>
            </tr>
        </table>

        <div class="divider"></div>

        <p style="font-size:13px; color:#64748b; line-height:1.65;">
            Pour toute question, répondez à cet e-mail ou contactez notre équipe.
            Nous sommes disponibles du lundi au vendredi, de 9h à 18h.
        </p>
    </div>

    {{-- Footer --}}
    <div class="footer">
        <p>© {{ date('Y') }} GRH Hôtels. Tous droits réservés.</p>
        <p style="margin-top:4px;">Cet e-mail a été envoyé automatiquement — merci de ne pas y répondre directement.</p>
    </div>

</div>
</body>
</html>
