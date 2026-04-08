<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $templates = \Illuminate\Support\Facades\DB::table('email_templates')->get();

        foreach ($templates as $template) {
            $newContent = $this->getNewPremiumContent($template->slug, $template->published_content);
            $newDraft   = $template->draft_content ? $this->getNewPremiumContent($template->slug, $template->draft_content) : null;
            
            \Illuminate\Support\Facades\DB::table('email_templates')
                ->where('id', $template->id)
                ->update([
                    'published_content' => $newContent,
                    'draft_content'     => $newDraft,
                ]);
        }
    }

    private function getNewPremiumContent(string $slug, ?string $oldHtml): string
    {
        $title = $this->getNiceTitle($slug);
        
        $innerBody = "";
        if ($oldHtml && preg_match('/<div class="content">(.*?)<div style="text-align: center; margin-top: 30px;">/is', $oldHtml, $matches)) {
            $innerBody = $matches[1];
        } else if ($oldHtml && preg_match('/<div class="content">(.*?)<p style="margin-top: 40px;/is', $oldHtml, $matches)) {
            $innerBody = $matches[1];
        } else {
             $innerBody = "<p>Bonjour <strong>[[nom_contact]]</strong>,</p><p>Votre dossier #[[code_reference]] a été mis à jour.</p>";
        }

        $actionButton = $this->getActionButton($slug);

        return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f1f5f9; }
        .wrapper { background-color: #f1f5f9; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .header { background-color: #0f172a; padding: 48px 40px; text-align: center; }
        .badge { display: inline-block; background: #6366f1; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; font-family: sans-serif; }
        .content { padding: 48px 40px; }
        .footer { padding: 32px 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }
        .button { display: inline-block; padding: 16px 32px; background: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 14px; transition: all 0.2s; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2); }
        p { margin-bottom: 20px; font-size: 15px; color: #334155; }
        strong { color: #0f172a; }
        h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; }
        .accent-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; margin: 32px 0; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="badge">Résidences Hôtelières</div>
                <h1>{$title}</h1>
            </div>
            <div class="content">
                {$innerBody}

                <div style="text-align: center; margin-top: 40px;">
                    {$actionButton}
                </div>

                <p style="margin-top: 48px; border-top: 1px solid #f1f5f9; padding-top: 32px; font-size: 14px; color: #64748b;">
                    À très bientôt,<br>
                    <strong style="color: #0f172a;">L'équipe du Groupe Résidences Hôtelières</strong>
                </p>
            </div>
            <div class="footer">
                &copy; 2026 Groupe Résidences Hôtelières. Tous droits réservés.<br>
                <div style="margin-top: 8px;">Ceci est un e-mail automatique, merci de ne pas y répondre directement.</div>
            </div>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function getNiceTitle(string $slug): string
    {
        $map = [
            'status_en_attente'          => 'Demande Reçue',
            'status_en_verification'     => 'Vérification en Cours',
            'status_valide'              => 'Réservation Validée',
            'status_en_attente_paiement' => 'Attente de Paiement',
            'status_paye_partiellement'  => 'Paiement Partiel Reçu',
            'status_confirme'            => 'Séjour Confirmé',
            'status_annule'              => 'Réservation Annulée',
            'payment_verified'           => 'Paiement Approuvé',
            'payment_rejected'           => 'Paiement Refusé',
        ];

        return $map[$slug] ?? 'Mise à Jour de Dossier';
    }

    private function getActionButton(string $slug): string
    {
        if (str_contains($slug, 'paiement')) {
            return '<a href="[[lien_paiement]]" class="button">Procéder au Paiement</a>';
        }
        return '<a href="[[lien_dossier]]" class="button">Mon Dossier en Ligne</a>';
    }

    public function down(): void
    {
        // One-way migration
    }
};
