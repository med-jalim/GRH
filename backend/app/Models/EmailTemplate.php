<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'description',
        'published_subject',
        'published_content',
        'draft_subject',
        'draft_content',
        'settings',
        'variables',
        'gjs_data',
        'draft_gjs_data',
    ];

    protected $casts = [
        'settings'  => 'array',
        'variables' => 'array',
    ];

    // ──────────────────────────────────────────────────────────────────────
    // Lookup
    // ──────────────────────────────────────────────────────────────────────

    public static function findBySlug(string $slug): ?self
    {
        return static::where('slug', $slug)->first();
    }

    // ──────────────────────────────────────────────────────────────────────
    // Rendering — pure variable substitution, no Blade
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Render the published HTML with [[variable]] substitution.
     */
    public function renderPublished(array $data = []): string
    {
        $html = $this->published_content ?? '';
        $html = $this->processRepeaters($html, $data);
        return $this->substitute($html, $data);
    }

    /**
     * Render the draft HTML (falls back to published if no draft).
     */
    public function renderDraft(array $data = []): string
    {
        $html = $this->draft_content ?? $this->published_content ?? '';
        $html = $this->processRepeaters($html, $data);
        return $this->substitute($html, $data);
    }

    /**
     * Render the subject line with [[variable]] substitution.
     */
    public function renderSubject(array $data = [], bool $useDraft = false): string
    {
        $subject = ($useDraft && $this->draft_subject)
            ? $this->draft_subject
            : $this->published_subject;

        return $this->substitute($subject, $data, escape: false);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Draft / Publish lifecycle
    // ──────────────────────────────────────────────────────────────────────

    public function publish(): void
    {
        $this->update([
            'published_subject' => $this->draft_subject ?? $this->published_subject,
            'published_content' => $this->draft_content ?? $this->published_content,
            'gjs_data'          => $this->draft_gjs_data ?? $this->gjs_data,
            'draft_subject'     => null,
            'draft_content'     => null,
            'draft_gjs_data'    => null,
        ]);
    }

    public function discardDraft(): void
    {
        $this->update([
            'draft_subject'  => null,
            'draft_content'  => null,
            'draft_gjs_data' => null,
        ]);
    }

    public function hasDraft(): bool
    {
        return $this->draft_content !== null;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Repeater Processing
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Process dynamic repeater blocks (e.g. <tr data-gjs-repeat="devis">...</tr>)
     */
    public function processRepeaters(string $html, array $data): string
    {
        $reservation = $data['reservation'] ?? null;
        if (!$reservation) return $html;

        // 1. Process "devis" repeaters (items flattening)
        $devisPattern = '/(<(\w+)[^>]*?data-repeat=["\']devis["\'][^>]*?>)(.*?)(<\/\2>)/is';
        $html = preg_replace_callback($devisPattern, function ($matches) use ($reservation) {
            $openingTag  = $matches[1];
            $rowTemplate = $matches[3];
            $closingTag  = $matches[4];
            
            $items = collect();
            if ($reservation->groups && $reservation->groups->count() > 0) {
                foreach ($reservation->groups as $group) {
                    $nights = max(1, \Carbon\Carbon::parse($group->date_depart)->diffInDays(\Carbon\Carbon::parse($group->date_arrivee)));
                    foreach ($group->items as $item) {
                        $cloned = clone $item;
                        $cloned->nights = $nights;
                        $items->push($cloned);
                    }
                }
            } else {
                $items = $reservation->details ?? collect();
            }
            
            if ($items->isEmpty()) return "";

            $rowsHtml = '';
            foreach ($items as $item) {
                $row = $rowTemplate;
                $nights = $item->nights ?? 1;
                $rowVars = [
                    'item_designation' => $item->type?->nom ?? 'Prestation',
                    'item_nights'      => $nights,
                    'item_qty'         => $item->quantite ?? 1,
                    'item_adultes'     => $item->nb_adultes ?? 0,
                    'item_enfants'     => $item->nb_enfants ?? 0,
                    'item_bebes'       => $item->nb_bebes ?? 0,
                    'item_pu'          => number_format((float)($item->prix_unitaire ?? 0), 0, ',', ' ') . ' MAD',
                    'item_total'       => number_format((float)(($item->quantite ?? 1) * ($item->prix_unitaire ?? 0) * (int)$nights), 0, ',', ' ') . ' MAD',
                ];
                foreach ($rowVars as $k => $v) {
                    $search = ['[[' . $k . ']]', '&lbrack;&lbrack;' . $k . '&rbrack;&rbrack;'];
                    $row = str_replace($search, htmlspecialchars((string)$v), $row);
                }
                $rowsHtml .= $openingTag . $row . $closingTag;
            }
            return $rowsHtml;
        }, $html);

        // 2. Process "groups" repeaters (periods list)
        $groupsPattern = '/(<(\w+)[^>]*?data-repeat=["\']groups["\'][^>]*?>)(.*?)(<\/\2>)/is';
        $html = preg_replace_callback($groupsPattern, function ($matches) use ($reservation) {
            $openingTag  = $matches[1];
            $rowTemplate = $matches[3];
            $closingTag  = $matches[4];
            
            $groups = $reservation->groups ?? collect();
            if ($groups->isEmpty()) return "";

            $rowsHtml = '';
            foreach ($groups as $idx => $group) {
                $row = $rowTemplate;
                $rowVars = [
                    'group_index'    => $idx + 1,
                    'group_arrival'  => \Carbon\Carbon::parse($group->date_arrivee)->translatedFormat('d F Y'),
                    'group_departure'=> \Carbon\Carbon::parse($group->date_depart)->translatedFormat('d F Y'),
                    'group_pax'      => $group->nb_personnes,
                ];
                foreach ($rowVars as $k => $v) {
                    $search = ['[[' . $k . ']]', '&lbrack;&lbrack;' . $k . '&rbrack;&rbrack;'];
                    $row = str_replace($search, htmlspecialchars((string)$v), $row);
                }
                $rowsHtml .= $openingTag . $row . $closingTag;
            }
            return $rowsHtml;
        }, $html);

        return $html;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Variable substitution helpers
    // ──────────────────────────────────────────────────────────────────────

    public function substitute(string $content, array $data, bool $escape = true): string
    {
        $flat = $this->flattenData($data);
        foreach ($flat as $key => $value) {
            // NEVER escape [[tableau_...]] variables because they contain intended HTML
            $shouldEscape = $escape && !str_starts_with($key, 'tableau_');

            $replacement = $shouldEscape
                ? htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8')
                : (string) $value;

            $search = ['[[' . $key . ']]', '&lbrack;&lbrack;' . $key . '&rbrack;&rbrack;'];
            $content = str_replace($search, $replacement, $content);
        }
        return $content;
    }

    /**
     * Flatten nested data into simple key → value pairs.
     */
    public function flattenData(array $data): array
    {
        $flat = [];

        if (isset($data['reservation'])) {
            $r = $data['reservation'];
            $flat['nom_contact']    = $r->nom_contact ?? '';
            $flat['code_reference'] = $r->code_reference ?? '';
            $flat['hotel_name']     = $r->hotel?->name ?? '';
            $flat['hotel_ville']    = $r->hotel?->ville ?? '';
            $flat['nb_personnes']   = $r->nb_personnes ?? '';
            $flat['prix_total']     = isset($r->prix_total)
                ? number_format((float) $r->prix_total, 0, ',', ' ') . ' MAD'
                : '';
            $flat['date_arrivee']   = isset($r->date_arrivee)
                ? \Carbon\Carbon::parse($r->date_arrivee)->translatedFormat('d F Y')
                : '';
            $flat['date_depart']    = isset($r->date_depart)
                ? \Carbon\Carbon::parse($r->date_depart)->translatedFormat('d F Y')
                : '';
        }

        if (isset($data['payment'])) {
            $p = $data['payment'];
            $flat['montant_paye'] = isset($p->amount)
                ? number_format((float) $p->amount, 0, ',', ' ') . ' MAD'
                : '';
            $flat['motif_rejet']  = $p->notes_admin ?? '';
        }

        $flat['status_label']  = $data['statusLabel'] ?? '';
        $flat['prev_label']    = $data['prevLabel'] ?? '';
        $flat['lien_dossier']  = $data['verify_url'] ?? $data['verifyUrl'] ?? '';
        $flat['lien_paiement'] = $data['lien_paiement'] ?? '';

        // Generate dynamic HTML tables
        $flat['tableau_devis']   = isset($data['reservation']) ? $this->generateDevisTable($data['reservation']) : '';
        $flat['tableau_details'] = isset($data['reservation']) ? $this->generateDetailsTable($data['reservation']) : '';
        $flat['tableau_groupes'] = isset($data['reservation']) ? $this->generateGroupsTable($data['reservation']) : '';

        return $flat;
    }

    /**
     * Generate HTML table for price breakdown (devis)
     */
    private function generateDevisTable($reservation): string
    {
        $items = collect();
        if ($reservation->groups && $reservation->groups->count() > 0) {
            foreach ($reservation->groups as $group) {
                $nights = max(1, \Carbon\Carbon::parse($group->date_depart)->diffInDays(\Carbon\Carbon::parse($group->date_arrivee)));
                foreach ($group->items as $item) {
                    $cloned = clone $item;
                    $cloned->nights = $nights;
                    $items->push($cloned);
                }
            }
        } else {
            $items = $reservation->details ?? collect();
        }

        if ($items->isEmpty()) return '';

        $totalHtml = "";
        if (isset($reservation->prix_total)) {
             $total = number_format((float) $reservation->prix_total, 0, ',', ' ') . ' MAD';
             $totalHtml = "
             <tr style='background:#f1f5f9'>
                <td colspan='3' style='padding:16px;font-size:14px;font-weight:700;text-align:right;color:#0f172a;border-bottom-left-radius:12px;'>Total Général (H.T)</td>
                <td style='padding:16px;font-size:18px;font-weight:800;color:#6366f1;border-bottom-right-radius:12px;text-align:right;'>{$total}</td>
             </tr>";
        }

        $rows = "";
        foreach ($items as $d) {
            $type  = $d->type?->nom ?? 'Prestation';
            $qty   = $d->quantite ?? 1;
            $nights = $d->nights ?? 1;
            $unit  = number_format((float) ($d->prix_unitaire ?? 0), 0, ',', ' ') . ' MAD';
            $lineTotal = (float)($d->quantite ?? 1) * (float)($d->prix_unitaire ?? 0) * (int)$nights;
            $totalStr = number_format($lineTotal, 0, ',', ' ') . ' MAD';
            
            $rows .= "
            <tr>
                <td style='padding:16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a'>
                    <div style='font-weight:700;margin-bottom:4px;'>{$type}</div>
                    <div style='font-size:11px;color:#64748b;font-weight:600;letter-spacing:0.5px;'>
                        <span style='background:#eff6ff;color:#3b82f6;padding:2px 6px;border-radius:4px;margin-right:5px;'>Capacité:</span>
                        Ad. {$d->nb_adultes} | Enf. " . ($d->nb_enfants ?: 0) . " | Béb. " . ($d->nb_bebes ?: 0) . "
                    </div>
                </td>
                <td style='padding:16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;text-align:center;font-weight:700'>{$qty}</td>
                <td style='padding:16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b'>{$unit}</td>
                <td style='padding:16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;text-align:right;'>{$totalStr}</td>
            </tr>";
        }

        return "
        <div style='margin:24px 0; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05);'>
            <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>
                <thead>
                    <tr style='background:#0f172a'>
                        <th align='left' style='padding:14px 16px;font-size:11px;font-weight:800;color:#f8fafc;text-transform:uppercase;letter-spacing:1px;'>Désignation</th>
                        <th style='padding:14px 16px;font-size:11px;font-weight:800;color:#f8fafc;text-transform:uppercase;letter-spacing:1px;text-align:center;'>Chambres</th>
                        <th align='left' style='padding:14px 16px;font-size:11px;font-weight:800;color:#f8fafc;text-transform:uppercase;letter-spacing:1px;'>P.U / Nuit</th>
                        <th align='right' style='padding:14px 16px;font-size:11px;font-weight:800;color:#f8fafc;text-transform:uppercase;letter-spacing:1px;'>Total H.T</th>
                    </tr>
                </thead>
                <tbody>
                    {$rows}
                    {$totalHtml}
                </tbody>
            </table>
        </div>";
    }

    /**
     * Generate HTML table for booking basic details
     */
    private function generateDetailsTable($reservation): string
    {
        $hotel = $reservation->hotel?->name ?? '---';
        $ville = $reservation->hotel?->ville ?? '';
        $ref   = $reservation->code_reference ?? '---';
        $pax   = $reservation->nb_personnes ?? 0;
        $arr   = isset($reservation->date_arrivee) ? \Carbon\Carbon::parse($reservation->date_arrivee)->translatedFormat('d F Y') : '---';
        $dep   = isset($reservation->date_depart) ? \Carbon\Carbon::parse($reservation->date_depart)->translatedFormat('d F Y') : '---';

        $rowsData = [
            ['Référence', "<span style='background:#fef3c7;padding:3px 8px;border-radius:6px;font-weight:800;color:#92400e;font-family:monospace;font-size:14px;'>{$ref}</span>"],
            ['Hôtel', "<strong style='color:#0f172a;font-size:15px;'>{$hotel}</strong> <span style='color:#64748b;'>• {$ville}</span>"],
            ['Dates de Séjour', "<span style='font-weight:700;color:#0f172a;'>Du {$arr} au {$dep}</span>"],
            ['Total Occupants', "<span style='font-weight:700;color:#0f172a;'>{$pax} Personnes</span>"],
        ];

        $rowsHtml = "";
        foreach ($rowsData as $row) {
            $rowsHtml .= "
            <tr>
                <td style='padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:140px;font-weight:600;'>{$row[0]}</td>
                <td style='padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;'>{$row[1]}</td>
            </tr>";
        }

        return "
        <div style='margin:24px 0; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; background:#ffffff;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>
                {$rowsHtml}
            </table>
        </div>";
    }

    /**
     * Generate HTML table for multiple stay periods (groups)
     */
    private function generateGroupsTable($reservation): string
    {
        $groups = $reservation->groups ?? collect();
        if ($groups->isEmpty()) return '';

        $rowsHtml = "";
        foreach ($groups as $idx => $g) {
            $arr = \Carbon\Carbon::parse($g->date_arrivee)->translatedFormat('d F Y');
            $dep = \Carbon\Carbon::parse($g->date_depart)->translatedFormat('d F Y');
            $idxDisplay = $idx + 1;
            
            $rowsHtml .= "
            <tr>
                <td style='padding:16px;border-bottom:1px solid #f1f5f9;font-size:14px;'>
                    <div style='font-weight:800;color:#0f172a;margin-bottom:4px;display:flex;align-items:center;gap:8px;'>
                        <span style='background:#6366f1;color:#ffffff;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;font-size:11px;margin-right:8px;'>{$idxDisplay}</span>
                        Période de séjour
                    </div>
                    <div style='color:#64748b;font-weight:500;padding-left:28px;'>Du {$arr} au {$dep}</div>
                </td>
                <td style='padding:16px;border-bottom:1px solid #f1f5f9;text-align:right;vertical-align:middle;'>
                    <span style='background:#f8fafc;border:1px solid #e2e8f0;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;color:#475569;'>{$g->nb_personnes} Pers.</span>
                </td>
            </tr>";
        }

        return "
        <div style='margin:24px 0; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; background:#ffffff;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>
                <thead style='background:#f8fafc'>
                    <tr>
                        <th align='left' style='padding:12px 16px;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;'>Détails des Périodes</th>
                        <th align='right' style='padding:12px 16px;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;'>Occupants</th>
                    </tr>
                </thead>
                <tbody>
                    {$rowsHtml}
                </tbody>
            </table>
        </div>";
    }
}
