<?php

namespace App\Traits;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\View;

trait HasDynamicTemplate
{
    /**
     * Resolve the template and replace variables.
     */
    protected function resolveDynamicTemplate(string $slug, array $data): ?string
    {
        $template = EmailTemplate::where('slug', $slug)->first();

        if (! $template || ! $template->content_html) {
            return null;
        }

        $html = $template->content_html;

        foreach ($data as $key => $value) {
            $html = str_replace('{{' . strtoupper($key) . '}}', (string) $value, $html);
        }

        return $html;
    }

    /**
     * Get all common variables for a reservation.
     */
    protected function getCommonVariables($reservation): array
    {
        $hotel = $reservation->hotel;
        $arrival = $reservation->date_arrivee ? $reservation->date_arrivee->format('d/m/Y') : '-';
        $departure = $reservation->date_depart ? $reservation->date_depart->format('d/m/Y') : '-';
        $created = $reservation->created_at ? $reservation->created_at->format('d/m/Y H:i') : '-';

        return [
            // Hotel
            'HOTEL_NOM' => $hotel->name ?? 'Votre hôtel',
            'HOTEL_ADRESSE' => $hotel->adresse ?? '',
            'HOTEL_VILLE' => $hotel->ville ?? '',
            'HOTEL_TELEPHONE' => $hotel->telephone ?? '',
            'HOTEL_EMAIL' => $hotel->email ?? '',
            'HOTEL_DESCRIPTION' => $hotel->description ?? '',
            
            // Client
            'NOM_CLIENT' => $reservation->nom_contact ?? '',
            'EMAIL_CLIENT' => $reservation->email ?? '',
            'TELEPHONE_CLIENT' => $reservation->telephone ?? '',
            
            // Reservation
            'CODE_REF' => $reservation->code_reference ?? '',
            'DATE_RESERVATION' => $created,
            'DATE_ARRIVEE' => $arrival,
            'DATE_DEPART' => $departure,
            'DATES_SEJOUR' => "{$arrival} au {$departure}",
            'NB_PERSONNES' => $reservation->nb_personnes ?? 0,
            'PRIX_TOTAL' => number_format($reservation->prix_total ?? 0, 2, ',', ' ') . ' MAD',
            'STATUT_RESERVATION' => $reservation->statut ?? '',
            'REMARQUES_SPECIALES' => $reservation->remarques_speciales ?? 'Aucune',
            'PORTAL_URL' => url('reservation/' . $reservation->token),
            'PAYMENT_LINK' => $reservation->payment_link ?? url('reservation/' . $reservation->token),
            
            // Tables
            'TABLEAU_DEVIS' => $this->generateQuoteTable($reservation),
            'TABLEAU_DEVIS_SIMPLIFIE' => $this->generateSimplifiedQuoteTable($reservation),
        ];
    }

    /**
     * Generate the quote table HTML.
     */
    protected function generateQuoteTable($reservation): string
    {
        $html = '<table style="width:100%; border-collapse: collapse; margin: 20px 0; font-family: sans-serif; font-size: 13px;">';
        $html .= '<thead style="background-color: #f1f5f9; text-align: left;">';
        $html .= '<tr><th style="padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Détails du Séjour</th><th style="padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; text-align: right;">Information</th></tr>';
        $html .= '</thead><tbody>';

        foreach ($reservation->groups as $group) {
            $nights = \Carbon\Carbon::parse($group->date_depart)->diffInDays(\Carbon\Carbon::parse($group->date_arrivee));
            $arrival = \Carbon\Carbon::parse($group->date_arrivee)->format('d/m/Y');
            $departure = \Carbon\Carbon::parse($group->date_depart)->format('d/m/Y');
            
            $html .= "<tr>";
            $html .= "<td style='padding: 15px 12px; border-bottom: 1px solid #f1f5f9;'>";
            $html .= "<div style='font-weight: 800; color: #1e293b; margin-bottom: 4px;'>Séjour du {$arrival} au {$departure}</div>";
            $html .= "<div style='color: #64748b; font-size: 11px;'>Durée : {$nights} nuit(s)</div>";
            $html .= "</td>";
            $html .= "<td style='padding: 15px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; vertical-align: middle;'>";
            $html .= "<span style='background-color: #f0fdf4; color: #166534; padding: 4px 8px; rounded: 6px; font-weight: bold; font-size: 11px;'>" . ($group->nb_personnes ?? 1) . " Pers.</span>";
            $html .= "</td>";
            $html .= "</tr>";
        }

        $html .= '</tbody><tfoot>';
        $html .= "<tr>";
        $html .= "<td style='padding: 20px 12px; text-align: right; font-weight: bold; text-transform: uppercase; color: #64748b; font-size: 11px;'>TOTAL GÉNÉRAL</td>";
        $html .= "<td style='padding: 20px 12px; font-weight: 900; font-size: 18px; color: #54b172; border-top: 2px solid #f1f5f9; text-align: right;'>" . number_format($reservation->prix_total, 0, ',', ' ') . " MAD</td>";
        $html .= "</tr>";
        $html .= '</tfoot></table>';

        return $html;
    }

    /**
     * Generate a simplified quote table HTML.
     */
    protected function generateSimplifiedQuoteTable($reservation): string
    {
        $arrival = $reservation->date_arrivee ? $reservation->date_arrivee->format('d/m/Y') : '-';
        $departure = $reservation->date_depart ? $reservation->date_depart->format('d/m/Y') : '-';

        $html = '<table style="width:100%; border-collapse: collapse; margin: 20px 0; font-family: sans-serif; font-size: 13px;">';
        $html .= '<thead style="background-color: #f1f5f9; text-align: left;">';
        $html .= '<tr><th style="padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; text-transform: uppercase;">Dates du séjour</th><th style="padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; text-transform: uppercase; text-align: right;">Total</th></tr>';
        $html .= '</thead><tbody>';
        $html .= "<tr><td style='padding: 15px 12px; border-bottom: 1px solid #f1f5f9;'><div style='font-weight: bold; color: #1e293b; margin-bottom: 4px;'>{$arrival} &rarr; {$departure}</div><div style='color: #64748b; font-size: 11px;'>Pour {$reservation->nb_personnes} personne(s)</div></td>";
        $html .= "<td style='padding: 15px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 900; color: #54b172; font-size: 16px;'>" . number_format($reservation->prix_total, 0, ',', ' ') . " MAD</td></tr>";
        $html .= '</tbody></table>';
        return $html;
    }
}
