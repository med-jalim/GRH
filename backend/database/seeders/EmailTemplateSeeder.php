<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('email_templates')->truncate();

        $shared = [
            'headerBg'   => 'background: linear-gradient(135deg,#1e293b 0%,#334155 100%)',
            'accent'     => '#f59e0b',
            'company'    => 'GRH Hôtels',
            'tagline'    => 'Système de gestion des réservations',
            'footer'     => 'Cet e-mail a été envoyé automatiquement — merci de ne pas y répondre directement.',
        ];

        $commonVars = [
            ['key' => 'nom_contact',    'label' => 'Nom du client',           'example' => 'Mohammed Alami'],
            ['key' => 'code_reference', 'label' => 'Référence de réservation','example' => 'GRH-2024-001'],
            ['key' => 'hotel_name',     'label' => 'Nom de l\'hôtel',         'example' => 'Atlas Premium Hôtel'],
            ['key' => 'hotel_ville',    'label' => 'Ville de l\'hôtel',       'example' => 'Casablanca'],
            ['key' => 'nb_personnes',   'label' => 'Nombre de personnes',     'example' => '2'],
            ['key' => 'date_arrivee',   'label' => 'Date d\'arrivée',         'example' => '15 juin 2024'],
            ['key' => 'date_depart',    'label' => 'Date de départ',          'example' => '20 juin 2024'],
            ['key' => 'prix_total',     'label' => 'Prix total',              'example' => '5 000 MAD'],
            ['key' => 'status_label',   'label' => 'Statut actuel',           'example' => 'Confirmée'],
            ['key' => 'prev_label',     'label' => 'Statut précédent',        'example' => 'En attente'],
            ['key' => 'lien_paiement',  'label' => 'Lien de paiement',        'example' => 'https://...'],
            ['key' => 'lien_dossier',   'label' => 'Lien dossier client',     'example' => 'https://...'],
            ['key' => 'montant_paye',   'label' => 'Montant payé',            'example' => '2 000 MAD'],
            ['key' => 'motif_rejet',    'label' => 'Motif de rejet',          'example' => 'Reçu illisible'],
        ];

        $statusTemplates = [
            [
                'slug'    => 'status_en_attente',
                'name'    => '⏳ En attente',
                'badge'   => '#b45309', 'badgeBg' => '#fffbeb',
                'label'   => 'En attente de traitement',
                'subject' => 'Votre demande de réservation [[code_reference]] est en attente',
                'intro'   => 'Nous avons bien reçu votre demande de réservation et elle est actuellement <strong>en attente de traitement</strong> par notre équipe.',
                'body'    => 'Nous vous contacterons dans les plus brefs délais pour confirmer votre demande.',
                'closing' => 'Pour toute question, n\'hésitez pas à nous contacter.',
                'showBtn' => false,
                'showDevis' => false,
            ],
            [
                'slug'    => 'status_en_verification',
                'name'    => '🔍 En vérification',
                'badge'   => '#1d4ed8', 'badgeBg' => '#eff6ff',
                'label'   => 'En cours de vérification',
                'subject' => 'Votre réservation [[code_reference]] — Devis en cours de vérification',
                'intro'   => 'Votre réservation <strong>[[code_reference]]</strong> est actuellement <strong>en cours de vérification</strong> par notre équipe.',
                'body'    => 'Veuillez consulter le devis ci-dessous et confirmer votre accord.',
                'closing' => 'Cliquez sur le bouton ci-dessous pour vérifier et confirmer vos informations :',
                'showBtn' => true,
                'btnText' => 'Vérifier mon dossier →', 'btnColor' => '#2563eb',
                'btnVar'  => '[[lien_dossier]]',
                'showDevis' => true,
            ],
            [
                'slug'    => 'status_valide',
                'name'    => '🛡️ Validée',
                'badge'   => '#6d28d9', 'badgeBg' => '#f5f3ff',
                'label'   => 'Réservation validée',
                'subject' => 'Votre réservation [[code_reference]] a été validée',
                'intro'   => 'Nous avons le plaisir de vous informer que votre réservation <strong>[[code_reference]]</strong> a été <strong>validée</strong> par notre équipe.',
                'body'    => 'Nous vous enverrons prochainement les instructions de paiement pour confirmer définitivement votre séjour.',
                'closing' => 'Nous restons à votre disposition pour toute question.',
                'showBtn' => false,
                'showDevis' => false,
            ],
            [
                'slug'    => 'status_en_attente_paiement',
                'name'    => '💳 En attente de paiement',
                'badge'   => '#4338ca', 'badgeBg' => '#eef2ff',
                'label'   => 'En attente de paiement',
                'subject' => 'Réservation [[code_reference]] — Paiement requis',
                'intro'   => 'Votre réservation <strong>[[code_reference]]</strong> est validée. Afin de la confirmer définitivement, veuillez procéder au <strong>règlement en ligne</strong>.',
                'body'    => 'Votre séjour est prévu du [[date_arrivee]] au [[date_depart]] à [[hotel_name]], [[hotel_ville]] pour [[nb_personnes]] personne(s). Montant total : <strong>[[prix_total]]</strong>.',
                'closing' => 'Cliquez sur le bouton ci-dessous pour effectuer votre paiement :',
                'showBtn' => true,
                'btnText' => 'Payer maintenant →', 'btnColor' => '#16a34a',
                'btnVar'  => '[[lien_paiement]]',
                'showDevis' => true,
            ],
            [
                'slug'    => 'status_paye_partiellement',
                'name'    => '📊 Payée partiellement',
                'badge'   => '#0e7490', 'badgeBg' => '#ecfeff',
                'label'   => 'Payée partiellement',
                'subject' => 'Réservation [[code_reference]] — Premier versement reçu',
                'intro'   => 'Nous avons bien reçu votre premier versement de <strong>[[montant_paye]]</strong> pour la réservation <strong>[[code_reference]]</strong>.',
                'body'    => 'Votre dossier est <strong>partiellement réglé</strong>. Un solde reste à régler avant votre date d\'arrivée le [[date_arrivee]].',
                'closing' => 'Pour toute question concernant le paiement, contactez notre service client.',
                'showBtn' => false,
                'showDevis' => false,
            ],
            [
                'slug'    => 'status_confirme',
                'name'    => '✅ Confirmée',
                'badge'   => '#15803d', 'badgeBg' => '#f0fdf4',
                'label'   => 'Réservation confirmée',
                'subject' => 'Confirmation de votre réservation [[code_reference]] ✅',
                'intro'   => 'Nous avons le plaisir de <strong>confirmer votre réservation</strong> <code>[[code_reference]]</code>. Tout est prêt pour vous accueillir à <strong>[[hotel_name]]</strong>, [[hotel_ville]].',
                'body'    => 'Votre séjour est prévu du <strong>[[date_arrivee]]</strong> au <strong>[[date_depart]]</strong> pour <strong>[[nb_personnes]] personne(s)</strong>.',
                'closing' => 'Nous vous attendons avec impatience. À très bientôt !',
                'showBtn' => false,
                'showDevis' => true,
            ],
            [
                'slug'    => 'status_annule',
                'name'    => '❌ Annulée',
                'badge'   => '#be123c', 'badgeBg' => '#fff1f2',
                'label'   => 'Réservation annulée',
                'subject' => 'Votre réservation [[code_reference]] a été annulée',
                'intro'   => 'Nous vous informons que votre réservation <strong>[[code_reference]]</strong> a été <strong>annulée</strong>.',
                'body'    => 'Si vous pensez qu\'il s\'agit d\'une erreur, أو si vous souhaitez effectuer une nouvelle réservation, n\'hésitez pas à nous contacter directement.',
                'closing' => 'Nous nous excusons pour tout désagrément causé.',
                'showBtn' => false,
                'showDevis' => false,
            ],
        ];

        foreach ($statusTemplates as $t) {
            $html = $this->buildStatusHtml($t, $shared);
            EmailTemplate::create([
                'slug'              => $t['slug'],
                'name'              => $t['name'],
                'description'       => 'E-mail envoyé quand le statut de réservation passe à « ' . $t['label'] . ' »',
                'published_subject' => $t['subject'],
                'published_content' => $html,
                'variables'         => $commonVars,
                'settings'          => [],
            ]);
        }

        EmailTemplate::create([
            'slug'              => 'payment_verified',
            'name'              => '✅ Paiement validé',
            'description'       => 'E-mail envoyé lors de la validation d\'un paiement par un administrateur',
            'published_subject' => 'Votre paiement pour [[code_reference]] a été validé ✓',
            'published_content' => $this->buildPaymentHtml('verified', $shared),
            'variables'         => $commonVars,
            'settings'          => [],
        ]);

        EmailTemplate::create([
            'slug'              => 'payment_rejected',
            'name'              => '✗ Paiement refusé',
            'description'       => 'E-mail envoyé lors du rejet d\'un paiement par un administrateور',
            'published_subject' => 'Action requise — Paiement non validé pour [[code_reference]]',
            'published_content' => $this->buildPaymentHtml('rejected', $shared),
            'variables'         => $commonVars,
            'settings'          => [],
        ]);
    }

    private function buildStatusHtml(array $t, array $s): string
    {
        $btn = '';
        if ($t['showBtn'] ?? false) {
            $btn = "
            <tr><td align=\"center\" style=\"padding:8px 40px 28px;\">
                <a href=\"{$t['btnVar']}\" style=\"display:inline-block;background:{$t['btnColor']};color:#fff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;\">{$t['btnText']}</a>
            </td></tr>";
        }

        $devisHtml = "";
        if ($t['showDevis'] ?? false) {
            $devisHtml = "
            <!-- Editable Repeater Table -->
            <tr><td style=\"padding:20px 40px 0;\">
              <p style=\"font-size:13px;font-weight:700;color:#334155;margin-bottom:10px;\">Détail des prestations :</p>
              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;border-collapse:collapse;\">
                <thead>
                  <tr style=\"background:#f8fafc\">
                    <th align=\"left\" style=\"padding:12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;\">Désignation</th>
                    <th align=\"center\" style=\"padding:12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;\">Qté</th>
                    <th align=\"left\" style=\"padding:12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;\">P.U</th>
                    <th align=\"left\" style=\"padding:12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;\">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr data-repeat=\"devis\">
                    <td style=\"padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#0f172a;\">[[item_designation]]</td>
                    <td align=\"center\" style=\"padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;\">[[item_qty]]</td>
                    <td style=\"padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;\">[[item_pu]]</td>
                    <td style=\"padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600;color:#0f172a;\">[[item_total]]</td>
                  </tr>
                  <tr style=\"background:#f8fafc\">
                    <td colspan=\"3\" style=\"padding:12px;font-size:13px;font-weight:700;text-align:right;color:#0f172a\">Total H.T</td>
                    <td style=\"padding:12px;font-size:15px;font-weight:800;color:#d97706\">[[prix_total]]</td>
                  </tr>
                </tbody>
              </table>
            </td></tr>";
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{$s['company']}</title></head>
<body style="margin:0;padding:40px 16px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
  <tr><td style="{$s['headerBg']};border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
    <div style="font-size:22px;font-weight:800;color:#fff;">{$s['company']}</div>
    <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:6px 0 0;">{$s['tagline']}</p>
  </td></tr>
  <tr><td style="background:#fff;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:32px 40px 20px;">
        <div style="background:{$t['badgeBg']};border-radius:16px;padding:24px 32px;text-align:center;display:inline-block;width:100%;box-sizing:border-box;">
          <p style="font-size:14px;font-weight:700;color:{$t['badge']};margin:0;">{$t['label']}</p>
        </div>
      </td></tr>
      <tr><td style="padding:4px 40px 0;font-size:14px;line-height:1.75;color:#334155;">
        <p style="margin:0 0 12px;">Bonjour <strong>[[nom_contact]]</strong>,</p>
        <p style="margin:0 0 12px;">{$t['intro']}</p>
        <p style="margin:0 0 12px;">{$t['body']}</p>
        <p style="margin:0 0 20px;color:#64748b;">{$t['closing']}</p>
      </td></tr>
      {$btn}
      {$devisHtml}
      <tr><td style="padding:20px 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;">
          <tr><td style="padding:16px 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;">Détails de la réservation</td></tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#64748b;width:45%;">Référence</td>
            <td style="padding:8px 0;font-size:13px;font-weight:700;color:#0f172a;font-family:monospace;">[[code_reference]]</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#64748b;">Hôtel</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#0f172a;">[[hotel_name]], [[hotel_ville]]</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#64748b;">Arrivée</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#0f172a;">[[date_arrivee]]</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#64748b;">Départ</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#0f172a;">[[date_depart]]</td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#fff;border-radius:0 0 20px 20px;padding:0 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
        <p style="margin:0;">© {year} GRH Hôtels. Tous droits réservés.</p>
        <p style="margin:4px 0 0;">Cet e-mail a été envoyé automatiquement.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>
HTML;
    }

    private function buildPaymentHtml(string $type, array $s): string
    {
        $badge  = ($type === 'verified') ? '#15803d' : '#be123c';
        $badgeBg = ($type === 'verified') ? '#f0fdf4' : '#fff1f2';
        $label = ($type === 'verified') ? '✓ Paiement validé' : '✗ Paiement non validé';
        $intro = ($type === 'verified') 
            ? 'Nous avons le plaisir de vous confirmer que votre paiement pour <strong>[[code_reference]]</strong> a été <strong>validé</strong>.'
            : 'Nous avons examiné votre paiement pour <strong>[[code_reference]]</strong>. Malheureusement, nous <strong>n\'avons pas pu le valider</strong>.';

        $motif = ($type === 'rejected') ? "
          <tr><td style=\"padding:0 40px 20px;\">
            <div style=\"background:#fff1f2;border:1.5px solid #fda4af;border-radius:12px;padding:16px 20px;\">
              <p style=\"font-size:12px;font-weight:700;color:#be123c;margin:0 0 6px;\">Motif indiqué :</p>
              <p style=\"font-size:13px;color:#1e293b;margin:0;\">[[motif_rejet]]</p>
            </div>
          </td></tr>" : '';

        return <<<HTML
<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GRH Hôtels</title></head>
<body style="margin:0;padding:40px 16px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
  <tr><td style="{$s['headerBg']};border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
    <div style="font-size:22px;font-weight:800;color:#fff;">GRH Hôtels</div>
  </td></tr>
  <tr><td style="background:#fff;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:32px 40px 20px;">
        <div style="background:{$badgeBg};border-radius:16px;padding:24px 32px;display:inline-block;width:100%;box-sizing:border-box;">
          <p style="font-size:15px;font-weight:700;color:{$badge};margin:0;">{$label}</p>
        </div>
      </td></tr>
      <tr><td style="padding:4px 40px 20px;font-size:14px;line-height:1.75;color:#334155;">
        <p style="margin:0 0 12px;">Bonjour <strong>[[nom_contact]]</strong>,</p>
        <p style="margin:0 0 12px;">{$intro}</p>
      </td></tr>
      {$motif}
    </table>
  </td></tr>
  <tr><td style="background:#fff;border-radius:0 0 20px 20px;padding:0 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;font-size:12px;color:#94a3b8;">© GRH Hôtels</td></tr>
    </table>
  </td></tr>
</table>
</body></html>
HTML;
    }
}
