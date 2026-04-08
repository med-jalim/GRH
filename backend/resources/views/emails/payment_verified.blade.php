<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: #10b981; color: #ffffff; padding: 40px 20px; text-align: center; }
        .content { padding: 40px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
        .amount { font-size: 24px; font-weight: 800; color: #059669; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Paiement Validé ✓</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $reservation->nom_contact }}</strong>,</p>
            <p>Nous avons le plaisir de vous informer que votre preuve de paiement pour la réservation <strong>#{{ $reservation->code_reference }}</strong> a été vérifiée et validée avec succès.</p>
            
            <div class="amount-box">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Montant Crédité</p>
                <div class="amount">{{ number_format($payment->amount, 2) }} MAD</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase;">Résumé du séjour</p>
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                    <div>
                        <p style="margin: 0; color: #64748b;">Hôtel :</p>
                        <p style="margin: 4px 0 0 0; font-weight: 700;">{{ $reservation->hotel->name }}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; color: #64748b;">Période :</p>
                        <p style="margin: 4px 0 0 0; font-weight: 700;">
                            {{ \Carbon\Carbon::parse($reservation->date_arrivee)->translatedFormat('d M') }} 
                            → 
                            {{ \Carbon\Carbon::parse($reservation->date_depart)->translatedFormat('d M Y') }}
                        </p>
                    </div>
                </div>
            </div>

            <p>Votre solde a été mis à jour. Vous pouvez consulter l'état actuel de votre dossier en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
                <a href="{{ $verifyUrl }}" class="button">Voir mon dossier</a>
            </div>

            <p style="margin-top: 30px;">À très bientôt,<br>L'équipe du Groupe Résidences Hôtelières</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Groupe Résidences Hôtelières. Tous droits réservés.
        </div>
    </div>
</body>
</html>
