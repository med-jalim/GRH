<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: #ef4444; color: #ffffff; padding: 40px 20px; text-align: center; }
        .content { padding: 40px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #334155; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Action Requise : Paiement Refusé</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $reservation->nom_contact }}</strong>,</p>
            <p>Nous avons examiné la preuve de paiement soumise pour votre réservation <strong>#{{ $reservation->code_reference }}</strong>, et malheureusement, nous n'avons pas pu la valider.</p>
            
            <div class="reason-box">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color: #b91c1c;">Motif du refus</p>
                <p style="margin: 10px 0 0 0; color: #991b1b;">{{ $notes_admin ?? 'La preuve fournie est illisible ou ne correspond pas au montant déclaré.' }}</p>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                    <div>
                        <p style="margin: 0; color: #64748b;">Hôtel :</p>
                        <p style="margin: 4px 0 0 0; font-weight: 700; color: #1e293b;">{{ $reservation->hotel?->name }}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; color: #64748b;">Période :</p>
                        <p style="margin: 4px 0 0 0; font-weight: 700; color: #1e293b;">
                            {{ \Carbon\Carbon::parse($reservation->date_arrivee)->translatedFormat('d M') }} 
                            → 
                            {{ \Carbon\Carbon::parse($reservation->date_depart)->translatedFormat('d M Y') }}
                        </p>
                    </div>
                </div>
            </div>

            <p>Nous vous invitons à soumettre une nouvelle preuve de paiement valide via votre espace client afin de confirmer votre réservation dans les plus brefs délais.</p>
            
            <div style="text-align: center;">
                <a href="{{ $verifyUrl }}" class="button">Soumettre une nouvelle preuve</a>
            </div>

            <p style="margin-top: 30px;">À très bientôt,<br>L'équipe du Groupe Résidences Hôtelières</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Groupe Résidences Hôtelières. Tous droits réservés.
        </div>
    </div>
</body>
</html>
