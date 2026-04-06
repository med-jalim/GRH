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
     * Generate the quote table HTML.
     */
    protected function generateQuoteTable($reservation): string
    {
        $html = '<table style="width:100%; border-collapse: collapse; margin: 20px 0; font-family: sans-serif;">';
        $html .= '<thead style="background-color: #f8f9fa; text-align: left;">';
        $html .= '<tr><th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Type</th><th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Quantité</th><th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Prix Unitaire</th><th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Total</th></tr>';
        $html .= '</thead><tbody>';

        foreach ($reservation->details as $detail) {
            $total = $detail->quantite * $detail->prix_unitaire;
            $html .= "<tr>";
            $html .= "<td style='padding: 12px; border-bottom: 1px solid #dee2e6;'>{$detail->type->nom}</td>";
            $html .= "<td style='padding: 12px; border-bottom: 1px solid #dee2e6;'>{$detail->quantite}</td>";
            $html .= "<td style='padding: 12px; border-bottom: 1px solid #dee2e6;'>" . number_format($detail->prix_unitaire, 2) . " DH</td>";
            $html .= "<td style='padding: 12px; border-bottom: 1px solid #dee2e6;'>" . number_format($total, 2) . " DH</td>";
            $html .= "</tr>";
        }

        $html .= '</tbody><tfoot>';
        $html .= "<tr><td colspan='3' style='padding: 12px; text-align: right; font-weight: bold;'>TOTAL</td><td style='padding: 12px; font-weight: bold; background-color: #f8f9fa;'>" . number_format($reservation->prix_total, 2) . " DH</td></tr>";
        $html .= '</tfoot></table>';

        return $html;
    }
}
