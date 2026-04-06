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
    }
}
