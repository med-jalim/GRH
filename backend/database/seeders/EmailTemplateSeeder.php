<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $commonStyles = '
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">';

        $commonFooter = '
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #999999; font-size: 12px;">
                                <p style="margin: 0;">© 2026 GRH Hôtels. Tous droits réservés.</p>
                                <p style="margin: 5px 0 0 0;">Cet e-mail est automatique, merci de ne pas y répondre.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>';

        $validationHtml = $commonStyles . '
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #54b172; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Confirmation de Réservation</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Bonjour <strong>{{NOM_CLIENT}}</strong>,</p>
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Nous avons le plaisir de vous informer que votre demande de réservation pour l\'hôtel <strong>{{NOM_HOTEL}}</strong> est actuellement en cours de traitement.</p>
                                
                                <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #54b172;">
                                    <p style="margin: 0; font-size: 14px; color: #666666;">Référence : <strong>{{CODE_REF}}</strong></p>
                                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666666;">Dates : <strong>{{DATES_SEJOUR}}</strong></p>
                                </div>

                                <h3 style="color: #54b172; font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px;">Détails de votre séjour</h3>
                                {{TABLEAU_DEVIS}}

                                <div align="center" style="margin-top: 40px;">
                                    <a href="{{PORTAL_URL}}" style="background-color: #54b172; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accéder à mon espace client</a>
                                </div>
                            </td>
                        </tr>' . $commonFooter;

        $statusHtml = $commonStyles . '
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #4338ca; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Mise à jour de votre séjour</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Bonjour <strong>{{NOM_CLIENT}}</strong>,</p>
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Le statut de votre réservation <strong>{{CODE_REF}}</strong> a été mis à jour par l\'administration.</p>
                                
                                <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #4338ca;">
                                    <p style="margin: 0; font-size: 18px; color: #4338ca; font-weight: bold;">Statut : {{STATUT_LABEL}}</p>
                                </div>

                                <p style="font-size: 14px; color: #666666; line-height: 1.6;">Vous pouvez consulter les détails complets de votre réservation ainsi que les éventuelles consignes de paiement sur votre espace client.</p>

                                <div align="center" style="margin-top: 40px;">
                                    <a href="{{PORTAL_URL}}" style="background-color: #4338ca; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Voir ma réservation</a>
                                </div>
                            </td>
                        </tr>' . $commonFooter;

        $confirmedHtml = $commonStyles . '
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #059669; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Réservation Confirmée</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Bonjour <strong>{{NOM_CLIENT}}</strong>,</p>
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Nous avons le plaisir de vous confirmer que votre réservation <strong>{{CODE_REF}}</strong> est désormais **validée et confirmée** !</p>
                                
                                <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #059669;">
                                    <p style="margin: 0; font-size: 14px; color: #166534;">Hôtel : <strong>{{NOM_HOTEL}}</strong></p>
                                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #166534;">Dates : <strong>{{DATES_SEJOUR}}</strong></p>
                                </div>

                                <h3 style="color: #059669; font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px;">Récapitulatif</h3>
                                {{TABLEAU_DEVIS}}

                                <div align="center" style="margin-top: 40px;">
                                    <a href="{{PORTAL_URL}}" style="background-color: #059669; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Gérer mon séjour</a>
                                </div>
                            </td>
                        </tr>' . $commonFooter;

        $cancelledHtml = $commonStyles . '
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #be123c; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Réservation Annulée</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Bonjour <strong>{{NOM_CLIENT}}</strong>,</p>
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Nous vous informons que votre réservation <strong>{{CODE_REF}}</strong> a été annulée.</p>
                                
                                <div style="margin: 30px 0; padding: 20px; background-color: #fff1f2; border-left: 4px solid #be123c;">
                                    <p style="margin: 0; font-size: 14px; color: #9f1239; font-weight: bold;">Raison de l\'annulation :</p>
                                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #9f1239;">{{RAISON_ANNULATION}}</p>
                                </div>

                                <p style="font-size: 14px; color: #666666; line-height: 1.6;">N\'hésitez pas à nous contacter pour toute question relative à cette annulation.</p>

                                <div align="center" style="margin-top: 40px;">
                                    <a href="{{PORTAL_URL}}" style="background-color: #be123c; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Consulter mon dossier</a>
                                </div>
                            </td>
                        </tr>' . $commonFooter;

        $paymentRequiredHtml = $commonStyles . '
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #4338ca; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Paiement Requis</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Bonjour <strong>{{NOM_CLIENT}}</strong>,</p>
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Votre réservation <strong>{{CODE_REF}}</strong> est en attente de règlement.</p>
                                
                                <div style="margin: 30px 0; padding: 30px; background-color: #eef2ff; border: 1px dashed #4338ca; text-align: center; border-radius: 12px;">
                                    <p style="margin: 0; font-size: 14px; color: #4338ca;">Montant total à régler :</p>
                                    <p style="margin: 10px 0; font-size: 32px; color: #4338ca; font-weight: 800;">{{PRIX_TOTAL}}</p>
                                    <a href="{{PAYMENT_LINK}}" style="background-color: #4338ca; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 10px;">💳 Payer en ligne</a>
                                </div>

                                <p style="font-size: 14px; color: #666666; line-height: 1.6; margin-top: 20px;">Vous pouvez également joindre un justificatif de virement depuis votre espace client.</p>

                                <div align="center" style="margin-top: 30px;">
                                    <a href="{{PORTAL_URL}}" style="color: #4338ca; text-decoration: underline; font-weight: bold;">Accéder à mon espace client</a>
                                </div>
                            </td>
                        </tr>' . $commonFooter;

        $paymentReceivedHtml = $commonStyles . '
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #0d9488; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Paiement Reçu</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Bonjour <strong>{{NOM_CLIENT}}</strong>,</p>
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Nous avons bien reçu votre paiement de <strong>{{MONTANT_PAYE}}</strong> pour la réservation <strong>{{CODE_REF}}</strong>.</p>
                                
                                <table style="width:100%; border-collapse: collapse; margin: 30px 0; font-family: sans-serif; font-size: 14px; background-color: #f0fdfa; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #ccfbf1; color: #0f766e;">Total de la réservation</td>
                                        <td style="padding: 15px; border-bottom: 1px solid #ccfbf1; text-align: right; font-weight: bold;">{{PRIX_TOTAL}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #ccfbf1; color: #0f766e;">Total payé à ce jour</td>
                                        <td style="padding: 15px; border-bottom: 1px solid #ccfbf1; text-align: right; font-weight: bold;">{{TOTAL_PAYE}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; color: #0f766e; font-weight: bold; font-size: 16px;">Solde restant</td>
                                        <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #0d9488;">{{SOLDE_RESTANT}}</td>
                                    </tr>
                                </table>

                                <div align="center" style="margin-top: 40px;">
                                    <a href="{{PORTAL_URL}}" style="background-color: #0d9488; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Voir mon espace client</a>
                                </div>
                            </td>
                        </tr>' . $commonFooter;

        $paymentRejectedHtml = $commonStyles . '
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #be123c; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Virement Refusé</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Bonjour <strong>{{NOM_CLIENT}}</strong>,</p>
                                <p style="font-size: 16px; color: #333333; line-height: 1.6;">Votre justificatif de paiement de <strong>{{MONTANT}}</strong> pour la réservation <strong>{{CODE_REF}}</strong> a été refusé par l\'administration.</p>
                                
                                <div style="margin: 30px 0; padding: 20px; background-color: #fff1f2; border-left: 4px solid #be123c;">
                                    <p style="margin: 0; font-size: 14px; color: #9f1239; font-weight: bold;">Raison du refus :</p>
                                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #9f1239;">{{RAISON}}</p>
                                </div>

                                <p style="font-size: 14px; color: #666666; line-height: 1.6;">Nous ne pouvons pas valider votre paiement en l\'état. Veuillez soumettre un nouveau justificatif valide depuis votre espace client.</p>

                                <div align="center" style="margin-top: 40px;">
                                    <a href="{{PORTAL_URL}}" style="background-color: #be123c; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accéder à mon espace client</a>
                                </div>
                            </td>
                        </tr>' . $commonFooter;

        EmailTemplate::updateOrCreate(
            ['slug' => 'reservation_validation'],
            [
                'name'    => 'Validation de Réservation',
                'subject' => 'Confirmation de votre réservation {{CODE_REF}}',
                'content_html' => $validationHtml,
                'content_json' => null,
            ]
        );

        EmailTemplate::updateOrCreate(
            ['slug' => 'reservation_status_updated'],
            [
                'name'    => 'Mise à jour du Statut',
                'subject' => 'Mise à jour de votre réservation {{CODE_REF}}',
                'content_html' => $statusHtml,
                'content_json' => null,
            ]
        );

        EmailTemplate::updateOrCreate(
            ['slug' => 'reservation_confirmed'],
            [
                'name'    => 'Confirmation Définitive',
                'subject' => 'Votre réservation {{CODE_REF}} est CONFIRMÉE !',
                'content_html' => $confirmedHtml,
                'content_json' => null,
            ]
        );

        EmailTemplate::updateOrCreate(
            ['slug' => 'reservation_cancelled'],
            [
                'name'    => 'Annulation de Réservation',
                'subject' => 'Annulation de votre réservation {{CODE_REF}}',
                'content_html' => $cancelledHtml,
                'content_json' => null,
            ]
        );

        EmailTemplate::updateOrCreate(
            ['slug' => 'payment_required'],
            [
                'name'    => 'Demande de Paiement',
                'subject' => 'Paiement requis — Réservation {{CODE_REF}}',
                'content_html' => $paymentRequiredHtml,
                'content_json' => null,
            ]
        );

        EmailTemplate::updateOrCreate(
            ['slug' => 'payment_received'],
            [
                'name'    => 'Accusé de Réception de Paiement',
                'subject' => 'Paiement reçu — Réservation {{CODE_REF}}',
                'content_html' => $paymentReceivedHtml,
                'content_json' => null,
            ]
        );

        EmailTemplate::updateOrCreate(
            ['slug' => 'payment_rejected'],
            [
                'name'    => 'Refus de Paiement',
                'subject' => 'Virement refusé — Réservation {{CODE_REF}}',
                'content_html' => $paymentRejectedHtml,
                'content_json' => null,
            ]
        );
    }
}
