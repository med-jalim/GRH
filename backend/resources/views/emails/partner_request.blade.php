<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        h2 {
            color: #54b172;
            border-bottom: 2px solid #54b172;
            padding-bottom: 10px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Nouvelle demande de partenariat (Portail GRH)</h2>
        <p>Vous avez reçu une nouvelle demande d'accès ou de devis depuis la page d'accueil du portail professionnel.</p>
        
        <div class="info-item">
            <span class="label">Type de demandeur :</span> {{ ucfirst($data['type']) }}
        </div>
        <div class="info-item">
            <span class="label">Nom de l'Agence/Groupe :</span> {{ $data['company_name'] }}
        </div>
        <div class="info-item">
            <span class="label">Email :</span> {{ $data['email'] }}
        </div>
        <div class="info-item">
            <span class="label">Téléphone :</span> {{ $data['phone'] }}
        </div>
        
        @if(!empty($data['message']))
        <div class="info-item">
            <span class="label">Message supplémentaire :</span><br>
            <p style="background: #fff; padding: 10px; border: 1px solid #eee; border-radius: 4px;">{{ nl2br(e($data['message'])) }}</p>
        </div>
        @endif
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #888;">
            Veuillez contacter cette personne pour valider sa demande et lui générer un lien de réservation si nécessaire.
        </p>
    </div>
</body>
</html>
