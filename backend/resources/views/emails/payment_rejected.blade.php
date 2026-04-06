<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Virement refusé — {{ $CODE_REF }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            padding: 40px 16px;
        }
        .container { max-width: 600px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 20px 20px 0 0;
            padding: 36px 40px;
            text-align: center;
        }
        .header .logo-text { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .header .logo-text span { color: #f59e0b; }
        .header p { color: #94a3b8; font-size: 13px; margin-top: 6px; }
        .card { background: #ffffff; border-radius: 0 0 20px 20px; padding: 32px 40px 40px; }
        .status-card {
            background-color: #fff1f2;
            border: 1.5px solid #fda4af;
            border-radius: 16px;
            padding: 24px 32px;
            margin-bottom: 28px;
            text-align: center;
        }
        .status-icon { font-size: 40px; margin-bottom: 10px; }
        .status-label {
            display: inline-block;
            background: #ffe4e6;
            color: #be123c;
            font-size: 15px; font-weight: 700;
            padding: 6px 18px; border-radius: 999px;
            margin-bottom: 12px;
        }
        .reason-box {
            margin-top: 16px;
            padding: 14px 18px;
            background: rgba(190, 18, 60, 0.06);
            border-left: 3px solid #be123c;
            border-radius: 8px;
            text-align: left;
        }
        .reason-box p.label { font-weight: 700; color: #be123c; font-size: 13px; margin-bottom: 4px; }
        .reason-box p.body  { color: #881337; font-size: 13px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .intro     { font-size: 14px; color: #475569; line-height: 1.65; margin-bottom: 28px; }
        .details-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 12px; }
        .details-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 28px; }
        .details-table tr { border-bottom: 1px solid #f1f5f9; }
        .details-table tr:last-child { border-bottom: none; }
        .details-table td { padding: 10px 0; vertical-align: top; }
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
        .cta-btn {
            display: inline-block;
            padding: 14px 32px;
            background: #be123c;
            color: #ffffff;
            text-decoration: none;
            font-size: 15px; font-weight: 700;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(190, 18, 60, 0.25);
        }
        .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; line-height: 1.6; }
        .footer a { color: #f59e0b; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">

    <div class="header">
        <div class="logo-text">GRH <span>Hôtels</span></div>
        <p>Système de gestion des réservations</p>
    </div>

    <div class="card">

        <div class="status-card">
            <div class="status-icon">❌</div>
            <div class="status-label">Virement Refusé</div>
            <p style="font-size: 13px; color: #881337;">
                Votre justificatif de paiement de <strong>{{ $MONTANT }}</strong>
                pour la réservation <strong>{{ $CODE_REF }}</strong> a été refusé.
            </p>
            @if(!empty($RAISON) && $RAISON !== 'Aucune raison spécifiée.')
            <div class="reason-box">
                <p class="label">Raison du refus :</p>
                <p class="body">{{ $RAISON }}</p>
            </div>
            @endif
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
                <td class="value" style="color:#be123c;">{{ $MONTANT }}</td>
            </tr>
        </table>

        <div class="divider"></div>

        <div style="text-align: center; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #475569; margin-bottom: 16px; line-height: 1.6;">
                Vous pouvez soumettre un nouveau justificatif de paiement depuis votre espace client :
            </p>
            <a href="{{ $PORTAL_URL }}" class="cta-btn">📄 Accéder à mon espace client</a>
        </div>

        <div class="divider"></div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.65;">
            Pour toute question, n'hésitez pas à contacter notre équipe.
            Nous sommes disponibles du lundi au vendredi, de 9h à 18h.
        </p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} GRH Hôtels. Tous droits réservés.</p>
        <p style="margin-top:4px;">Cet e-mail a été envoyé automatiquement — merci de ne pas y répondre directement.</p>
    </div>

</div>
</body>
</html>
