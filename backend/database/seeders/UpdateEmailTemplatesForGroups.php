<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class UpdateEmailTemplatesForGroups extends Seeder
{
    public function run(): void
    {
        $templates = [
            'status_en_attente' => [
                'name' => '⏳ En attente',
                'subject' => 'Nous avons reçu votre demande de réservation #[[code_reference]]',
                'color' => '#64748b',
                'icon' => '⏳',
                'message' => "Nous avons bien reçu votre demande de réservation. Notre équipe va l'examiner dans les plus brefs délais.",
            ],
            'status_en_verification' => [
                'name' => '🔍 En cours de vérification',
                'subject' => 'Votre réservation #[[code_reference]] est en cours de vérification',
                'color' => '#0ea5e9',
                'icon' => '🔍',
                'message' => "Votre réservation est actuellement en cours de vérification par notre équipe administrative.",
            ],
            'status_valide' => [
                'name' => '✅ Validée',
                'subject' => 'Bonne nouvelle ! Votre réservation #[[code_reference]] a été validée',
                'color' => '#10b981',
                'icon' => '✅',
                'message' => "Nous avons le plaisir de vous informer que votre réservation a été validée avec succès.",
            ],
            'status_en_attente_paiement' => [
                'name' => '💳 En attente de paiement',
                'subject' => 'Action requise : Paiement pour votre réservation #[[code_reference]]',
                'color' => '#f59e0b',
                'icon' => '💳',
                'message' => "Pour confirmer définitivement votre séjour, merci de procéder au règlement via le lien ci-dessous.",
            ],
            'status_paye_partiellement' => [
                'name' => '🌗 Payée partiellement',
                'subject' => 'Paiement partiel reçu pour la réservation #[[code_reference]]',
                'color' => '#8b5cf6',
                'icon' => '🌗',
                'message' => "Nous avons bien reçu votre paiement partiel. Le solde restant est à régler prochainement.",
            ],
            'status_confirme' => [
                'name' => '✨ Confirmée',
                'subject' => 'Séjour Confirmé ! Nous vous attendons avec impatience #[[code_reference]]',
                'color' => '#059669',
                'icon' => '✨',
                'message' => "Votre séjour est désormais entièrement confirmé. Nous sommes impatients de vous accueillir !",
            ],
            'status_annule' => [
                'name' => '❌ Annulée',
                'subject' => 'Annulation de votre réservation #[[code_reference]]',
                'color' => '#ef4444',
                'icon' => '❌',
                'message' => "Nous vous confirmons l'annulation de votre réservation conformément à votre demande ou suite à un défaut de paiement.",
            ],
        ];

        foreach ($templates as $slug => $data) {
            $html = $this->getBaseLayout($data['color'], $data['icon'], $data['message'], true);
            EmailTemplate::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $data['name'],
                    'published_subject' => $data['subject'],
                    'published_content' => $html,
                    'draft_subject' => null,
                    'draft_content' => null,
                ]
            );
        }

        // Special layouts for Payment Verify/Reject
        $this->seedPaymentTemplates();
    }

    private function seedPaymentTemplates()
    {
        // Payment Verified
        EmailTemplate::updateOrCreate(
            ['slug' => 'payment_verified'],
            [
                'name' => '✅ Paiement validé',
                'published_subject' => 'Paiement Validé - Réservation #[[code_reference]]',
                'published_content' => $this->getBaseLayout('#10b981', '✓', "Votre preuve de paiement a été vérifiée et validée avec succès. Votre solde a été mis à jour.", false, true),
            ]
        );

        // Payment Rejected
        EmailTemplate::updateOrCreate(
            ['slug' => 'payment_rejected'],
            [
                'name' => '✗ Paiement refusé',
                'published_subject' => 'Action Requise : Preuve de Paiement Refusée #[[code_reference]]',
                'published_content' => $this->getBaseLayout('#ef4444', '✗', "Nous n'avons pas pu valider votre preuve de paiement. Motif : <strong>[[motif_rejet]]</strong>. Merci de soumettre une nouvelle preuve.", false),
            ]
        );
    }

    private function getBaseLayout($color, $icon, $message, $showGroups = true, $isVerified = false)
    {
        $groupTable = '';
        if ($showGroups) {
            $groupTable = '
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:20px 0;border-collapse:collapse;">
                <thead style="background:#f8fafc">
                    <tr>
                        <th align="left" style="padding:10px 12px;font-size:11px;color:#94a3b8;text-transform:uppercase;">Période</th>
                        <th align="right" style="padding:10px 12px;font-size:11px;color:#94a3b8;text-transform:uppercase;">Occupants</th>
                    </tr>
                </thead>
                <tbody>
                    <tr data-repeat="groups">
                        <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;">
                            <div style="font-weight:800;color:#1e293b;margin-bottom:2px;">Période [[group_index]]</div>
                            <div style="color:#64748b;">Du [[group_arrival]] au [[group_departure]]</div>
                        </td>
                        <td align="right" style="padding:12px;border-bottom:1px solid #f1f5f9;vertical-align:middle;">
                            <span style="background:#f1f5f9;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;color:#475569;">[[group_pax]] Pers.</span>
                        </td>
                    </tr>
                </tbody>
            </table>';
        }

        $devisTable = $showGroups ? '[[tableau_devis]]' : '';
        
        $paymentInfo = '';
        if ($isVerified) {
             $paymentInfo = '
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color: #059669;">Montant Crédité</p>
                    <div style="font-size: 24px; font-weight: 800; color: #059669;">[[montant_paye]]</div>
                </div>';
        }

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: {$color}; color: #ffffff; padding: 40px 20px; text-align: center; }
        .content { padding: 40px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .button { display: inline-block; padding: 12px 28px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 10px;">{$icon}</div>
            <h1 style="margin: 0; font-size: 24px;">[[status_label]]</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>[[nom_contact]]</strong>,</p>
            <p>{$message}</p>
            
            {$paymentInfo}

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Résumé de votre séjour</p>
                <div style="font-size: 14px;">
                    <div style="margin-bottom: 8px;">
                        <span style="color: #64748b;">Hôtel :</span> <strong style="color: #1e293b;">[[hotel_name]]</strong> ([[hotel_ville]])
                    </div>
                </div>
            </div>

            {$groupTable}
            
            <div style="margin: 30px 0;">
                <p style="font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 10px; border-left: 4px solid {$color}; padding-left: 10px;">DÉTAIL DES PRESTATIONS</p>
                {$devisTable}
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="[[lien_dossier]]" class="button">Accéder à mon dossier en ligne</a>
            </div>

            <p style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 13px;">
                À très bientôt,<br>
                <strong>L'équipe du Groupe Résidences Hôtelières</strong>
            </p>
        </div>
        <div class="footer">
            &copy; {date('Y')} Groupe Résidences Hôtelières. Tous droits réservés.<br>
            <span style="font-size: 10px;">Ceci est un e-mail automatique, merci de ne pas y répondre directement.</span>
        </div>
    </div>
</body>
</html>
HTML;
    }
}
