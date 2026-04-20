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

        // 1. Digital Variable Replacement (Case insensitive + allows internal spaces)
        foreach ($data as $key => $value) {
            $valStr = is_null($value) ? '' : (string)$value;
            // preserve line breaks for text fields
            $valStr = nl2br($valStr);
            
            // Regex to match {{KEY}}, {{ KEY }}, {{  key  }}, etc.
            $pattern = '/\{\{\s*' . preg_quote($key, '/') . '\s*\}\}/i';
            $html = preg_replace($pattern, $valStr, $html);
        }

        // 2. Preserve multiple spaces (Fix for "spaces not applying" issue)
        // We replace sequences of 2 or more spaces with non-breaking spaces
        $html = preg_replace_callback('/  +/', function($matches) {
            return str_repeat('&nbsp;', strlen($matches[0]));
        }, $html);

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
            'TAXE_SEJOUR' => number_format($reservation->taxe_sejour_total ?? 0, 2, ',', ' ') . ' MAD',
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
            $nights = \Carbon\Carbon::parse($group->date_arrivee)->diffInDays(\Carbon\Carbon::parse($group->date_depart));
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
        
        // Sécurité : Si le prix avant remise est manquant (anciennes réservations), on le recalcule pour l'affichage
        $prixTotal = $reservation->prix_total;
        $prixAvant = $reservation->prix_avant_remise;
        $taxeTotal = $reservation->taxe_sejour_total ?? 0;
        $remiseP = $reservation->remise_pourcentage ?? 0;

        // If we have a discount but we don't have the room subtotal, we try to derive it
        if ($remiseP > 0 && (!$prixAvant || $prixAvant <= 0) && $prixTotal > 0) {
            $roomPart = $prixTotal - $taxeTotal;
            $prixAvant = $roomPart / (1 - ($remiseP / 100));
        }

        if ($remiseP > 0 && $prixAvant) {
            $html .= "<tr>";
            $html .= "<td style='padding: 20px 12px 10px 12px; text-align: right; font-weight: bold; text-transform: uppercase; color: #64748b; font-size: 11px;'>Total Hébergement (HT)</td>";
            $html .= "<td style='padding: 20px 12px 10px 12px; font-weight: bold; font-size: 14px; color: #94a3b8; border-top: 2px solid #f1f5f9; text-align: right; text-decoration: line-through;'>" . number_format($prixAvant, 0, ',', ' ') . " MAD</td>";
            $html .= "</tr>";
            $html .= "<tr>";
            $html .= "<td style='padding: 10px 12px; text-align: right; font-weight: 800; text-transform: uppercase; color: #059669; font-size: 11px;'>Remise </td>";
            $html .= "<td style='padding: 10px 12px; font-weight: 900; font-size: 14px; color: #059669; text-align: right;'>- " . number_format($prixAvant * ($remiseP / 100), 0, ',', ' ') . " MAD</td>";
            $html .= "</tr>";
            
            // Ligne du total chambre après remise
            $html .= "<tr>";
            $html .= "<td style='padding: 10px 12px; text-align: right; font-weight: bold; text-transform: uppercase; color: #1e293b; font-size: 11px;'>Total Prix Chambre</td>";
            $html .= "<td style='padding: 10px 12px; font-weight: bold; font-size: 14px; color: #1e293b; text-align: right;'>" . number_format($prixTotal - $taxeTotal, 0, ',', ' ') . " MAD</td>";
            $html .= "</tr>";
        } else {
             // Pour les groupes/particuliers (HT)
            $html .= "<tr>";
            $html .= "<td style='padding: 20px 12px 10px 12px; text-align: right; font-weight: bold; text-transform: uppercase; color: #64748b; font-size: 11px;'>Total Prix Chambre</td>";
            $html .= "<td style='padding: 20px 12px 10px 12px; font-weight: bold; font-size: 14px; color: #1e293b; border-top: 2px solid #f1f5f9; text-align: right;'>" . number_format($prixTotal - $taxeTotal, 0, ',', ' ') . " MAD</td>";
            $html .= "</tr>";
        }

        if ($taxeTotal > 0) {
            $html .= "<tr>";
            $html .= "<td style='padding: 10px 12px; text-align: right; font-weight: bold; text-transform: uppercase; color: #64748b; font-size: 11px;'>Total Taxes de Séjour</td>";
            $html .= "<td style='padding: 10px 12px; font-weight: bold; font-size: 14px; color: #64748b; text-align: right;'>+ " . number_format($taxeTotal, 0, ',', ' ') . " MAD</td>";
            $html .= "</tr>";
        }

        $html .= "<tr>";
        $html .= "<td style='padding: 20px 12px; text-align: right; font-weight: bold; text-transform: uppercase; color: #1e293b; font-size: 11px;'>TOTAL NET À PAYER (TTC)</td>";
        $html .= "<td style='padding: 20px 12px; font-weight: 900; font-size: 18px; color: #54b172; border-top: 2px solid #f1f5f9; text-align: right;'>" . number_format($prixTotal, 0, ',', ' ') . " MAD</td>";
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
        
        // Sécurité : Si le prix avant remise est manquant, on le recalcule
        $prixTotal = $reservation->prix_total;
        $prixAvant = $reservation->prix_avant_remise;
        $taxeTotal = $reservation->taxe_sejour_total ?? 0;
        $remiseP = $reservation->remise_pourcentage ?? 0;

        if ($remiseP > 0 && (!$prixAvant || $prixAvant <= 0) && $prixTotal > 0) {
            $roomPart = $prixTotal - $taxeTotal;
            $prixAvant = $roomPart / (1 - ($remiseP / 100));
        }

        if ($remiseP > 0 && $prixAvant) {
            $html .= "<td style='padding: 15px 12px; border-bottom: 1px solid #f1f5f9; text-align: right;'>";
            $html .= "<div style='font-weight: bold; color: #94a3b8; font-size: 13px; text-decoration: line-through; margin-bottom: 2px;'>" . number_format($prixAvant, 0, ',', ' ') . " MAD</div>";
            $html .= "<div style='font-weight: 900; color: #059669; font-size: 12px; margin-bottom: 4px;'>- " . number_format($prixAvant * ($remiseP / 100), 0, ',', ' ') . " MAD (-{$remiseP}%)</div>";
            if ($taxeTotal > 0) {
                $html .= "<div style='font-weight: bold; color: #64748b; font-size: 11px; margin-bottom: 4px;'>+ " . number_format($taxeTotal, 0, ',', ' ') . " MAD (Taxes)</div>";
            }
            $html .= "<div style='font-weight: 900; color: #54b172; font-size: 16px; margin-top: 6px; border-top: 1px dashed #e2e8f0; padding-top: 6px;'>" . number_format($prixTotal, 0, ',', ' ') . " MAD</div>";
            $html .= "</td></tr>";
        } else {
            $html .= "<td style='padding: 15px 12px; border-bottom: 1px solid #f1f5f9; text-align: right;'>";
            if ($taxeTotal > 0) {
                $html .= "<div style='font-weight: bold; color: #64748b; font-size: 11px; margin-bottom: 4px;'>Chambres: " . number_format($prixTotal - $taxeTotal, 0, ',', ' ') . " MAD</div>";
                $html .= "<div style='font-weight: bold; color: #64748b; font-size: 11px; margin-bottom: 4px;'>Taxes: " . number_format($taxeTotal, 0, ',', ' ') . " MAD</div>";
            }
            $html .= "<div style='font-weight: 900; color: #54b172; font-size: 16px;'>" . number_format($prixTotal, 0, ',', ' ') . " MAD</div>";
            $html .= "</td></tr>";
        }

        $html .= '</tbody></table>';
        return $html;
    }
}
