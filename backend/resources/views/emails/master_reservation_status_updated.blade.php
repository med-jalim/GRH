@php
    $s = $settings ?? [];

    // ─ Design ─────────────────────────────────────────────────────────────
    $headerBgStart  = $s['header_bg_start'] ?? '#1e293b';
    $headerBgEnd    = $s['header_bg_end'] ?? '#334155';
    $accentColor    = $s['accent_color'] ?? '#f59e0b';
    $company        = $s['header_company'] ?? 'GRH Hôtels';
    $tagline        = $s['header_tagline'] ?? 'Système de gestion des réservations';
    $footerCompany  = $s['footer_company'] ?? 'GRH Hôtels';
    $footerLegal    = $s['footer_legal'] ?? 'Cet e-mail a été envoyé automatiquement.';
    $verifyBtnColor = $s['verify_button_color'] ?? '#2563eb';
    $verifyBtnText  = $s['verify_button_text'] ?? 'Vérifier et Confirmer mes détails →';
    $payBtnColor    = $s['payment_button_color'] ?? '#16a34a';
    $payBtnText     = $s['payment_button_text'] ?? 'Payer maintenant →';

    // ─ Blocks (toggle on/off) ─────────────────────────────────────────────
    $blocks = $s['blocks'] ?? [];
    $showStatusBanner   = $blocks['status_banner'] ?? true;
    $showPriceTable     = $blocks['price_table'] ?? true;
    $showBookingDetails = $blocks['booking_details'] ?? true;
    $showPaymentButton  = $blocks['payment_button'] ?? true;

    // ─ Customisable texts ─────────────────────────────────────────────────
    $detailsSectionTitle    = $s['details_section_title']    ?? 'Détails de la réservation';
    $prestationsSectionTitle= $s['prestations_section_title'] ?? 'Détail des prestations (Devis)';
    $totalLabel             = $s['table_total_label']        ?? 'Montant Total H.T';
    $paymentSectionTitle    = $s['payment_section_title']    ?? '💳 Lien de paiement';
    $paymentSectionText     = $s['payment_section_text']     ?? 'Veuillez procéder au règlement en cliquant sur le bouton ci-dessous.';
    $colType                = $s['col_type']  ?? 'Type';
    $colQty                 = $s['col_qty']   ?? 'Qté';
    $colUnit                = $s['col_unit']  ?? 'Prix Unit.';
    $colTotal               = $s['col_total'] ?? 'Total';

    // ─ Status badge colours ───────────────────────────────────────────────
    $statusColors = [
        'en_attente'          => ['bg'=>'#fffbeb','border'=>'#fde68a','badge_bg'=>'#fef3c7','badge_text'=>'#b45309','icon'=>'⏳'],
        'en_verification'     => ['bg'=>'#eff6ff','border'=>'#93c5fd','badge_bg'=>'#dbeafe','badge_text'=>'#1d4ed8','icon'=>'🔍'],
        'valide'              => ['bg'=>'#f5f3ff','border'=>'#c4b5fd','badge_bg'=>'#ede9fe','badge_text'=>'#6d28d9','icon'=>'🛡️'],
        'en_attente_paiement' => ['bg'=>'#eef2ff','border'=>'#c7d2fe','badge_bg'=>'#e0e7ff','badge_text'=>'#4338ca','icon'=>'💳'],
        'paye_partiellement'  => ['bg'=>'#ecfeff','border'=>'#67e8f9','badge_bg'=>'#cffafe','badge_text'=>'#0e7490','icon'=>'📊'],
        'confirme'            => ['bg'=>'#f0fdf4','border'=>'#86efac','badge_bg'=>'#dcfce7','badge_text'=>'#15803d','icon'=>'✅'],
        'annule'              => ['bg'=>'#fff1f2','border'=>'#fda4af','badge_bg'=>'#ffe4e6','badge_text'=>'#be123c','icon'=>'❌'],
    ];
    $c = $statusColors[$newStatut ?? 'en_attente'] ?? $statusColors['en_attente'];
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $company }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; }
        .card { background: #fff; border-radius: 0 0 20px 20px; padding: 36px 40px 40px; }
        .body-content { font-size: 14px; line-height: 1.75; color: #334155; margin-bottom: 24px; }
        .body-content p { margin-bottom: 12px; }
        .body-content strong { color: #0f172a; }
        .body-content ul, .body-content ol { padding-left: 22px; margin-bottom: 12px; }
        .body-content h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .body-content h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .body-content a { color: {{ $accentColor }}; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 10px; }
        .details-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
        .details-table tr { border-bottom: 1px solid #f1f5f9; }
        .details-table tr:last-child { border-bottom: none; }
        .details-table td { padding: 9px 0; vertical-align: top; }
        .details-table .label { color: #64748b; width: 45%; }
        .details-table .value { color: #1e293b; font-weight: 600; }
        .ref-badge { background: #fff7ed; color: #c2410c; font-family: monospace; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px; border: 1px solid #fed7aa; }
        .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; line-height: 1.6; }
    </style>
</head>
<body>
<div class="container">

    {{-- ── Header ── --}}
    <div style="background: linear-gradient(135deg, {{ $headerBgStart }} 0%, {{ $headerBgEnd }} 100%); border-radius: 20px 20px 0 0; padding: 36px 40px; text-align: center;">
        <div style="font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">{{ $company }}</div>
        <p style="color: rgba(255,255,255,0.55); font-size: 13px; margin-top: 6px;">{{ $tagline }}</p>
    </div>

    <div class="card">

        {{-- ── Status Banner ── --}}
        @if($showStatusBanner)
        <div style="background: {{ $c['bg'] }}; border: 1.5px solid {{ $c['border'] }}; border-radius: 16px; padding: 24px 32px; text-align: center; margin-bottom: 28px;">
            <div style="font-size: 38px; margin-bottom: 10px;">{{ $c['icon'] }}</div>
            <div style="display: inline-block; background: {{ $c['badge_bg'] }}; color: {{ $c['badge_text'] }}; font-size: 14px; font-weight: 700; padding: 6px 20px; border-radius: 999px;">
                {{ $statusLabel }}
            </div>
        </div>
        @endif

        {{-- ── Price Table (shown only on en_verification) ── --}}
        @if($showPriceTable && ($newStatut === 'en_verification') && $reservation->details->count() > 0)
        <div style="margin-bottom: 28px;">
            <p class="section-title">{{ $prestationsSectionTitle }}</p>
            <table style="width:100%; border-collapse:collapse; font-size:12px; border: 1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
                <thead style="background:#f8fafc;">
                    <tr>
                        <th style="padding:10px 12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#64748b;">{{ $colType }}</th>
                        <th style="padding:10px 12px; text-align:center; border-bottom:1px solid #e2e8f0; color:#64748b;">{{ $colQty }}</th>
                        <th style="padding:10px 12px; text-align:right; border-bottom:1px solid #e2e8f0; color:#64748b;">{{ $colUnit }}</th>
                        <th style="padding:10px 12px; text-align:right; border-bottom:1px solid #e2e8f0; color:#64748b;">{{ $colTotal }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($reservation->details as $item)
                    <tr>
                        <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; font-weight:600;">{{ $item->type?->nom ?? 'Type inconnu' }}</td>
                        <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; text-align:center; color:#475569;">{{ $item->quantite }}</td>
                        <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; text-align:right; color:#475569;">{{ number_format($item->prix_unitaire, 0, ',', ' ') }} MAD</td>
                        <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight:700;">{{ number_format($item->quantite * $item->prix_unitaire, 0, ',', ' ') }} MAD</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot style="background:#f8fafc;">
                    <tr>
                        <td colspan="3" style="padding:10px 12px; text-align:right; font-weight:700; color:#64748b;">{{ $totalLabel }}</td>
                        <td style="padding:10px 12px; text-align:right; font-weight:800; font-size:14px;">{{ number_format($reservation->prix_total, 0, ',', ' ') }} MAD</td>
                    </tr>
                </tfoot>
            </table>
            <div style="margin-top:16px; text-align:center;">
                <a href="{{ $verify_url }}" style="display:inline-block; background:{{ $verifyBtnColor }}; color:#fff; font-size:13px; font-weight:700; padding:10px 24px; border-radius:10px; text-decoration:none;">
                    {{ $verifyBtnText }}
                </a>
            </div>
            <div class="divider"></div>
        </div>
        @endif

        {{-- ── Editable Body ── --}}
        <div class="body-content">{!! $body !!}</div>

        {{-- ── Booking Details Table ── --}}
        @if($showBookingDetails)
        <div class="divider"></div>
        <p class="section-title">{{ $detailsSectionTitle }}</p>
        <table class="details-table">
            <tr><td class="label">Référence</td><td class="value"><span class="ref-badge">{{ $reservation->code_reference }}</span></td></tr>
            @if($reservation->hotel)
            <tr><td class="label">Hôtel</td><td class="value">{{ $reservation->hotel->name }}, {{ $reservation->hotel->ville }}</td></tr>
            @endif
            <tr><td class="label">Arrivée</td><td class="value">{{ \Carbon\Carbon::parse($reservation->date_arrivee)->translatedFormat('d F Y') }}</td></tr>
            <tr><td class="label">Départ</td><td class="value">{{ \Carbon\Carbon::parse($reservation->date_depart)->translatedFormat('d F Y') }}</td></tr>
            <tr><td class="label">Personnes</td><td class="value">{{ $reservation->nb_personnes }}</td></tr>
            <tr><td class="label">Prix total</td><td class="value" style="color:#d97706; font-size:15px;">{{ number_format($reservation->prix_total, 0, ',', ' ') }} MAD</td></tr>
        </table>
        @endif

        {{-- ── Payment Button ── --}}
        @if($showPaymentButton && !empty($lien_paiement) && $newStatut === 'en_attente_paiement')
        <div style="background: linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%); border: 1.5px solid #86efac; border-radius: 16px; padding: 24px 28px; margin-top: 24px;">
            <p style="font-size:13px; font-weight:700; color:#14532d; margin-bottom:8px;">{{ $paymentSectionTitle }}</p>
            <p style="font-size:13px; color:#166534; line-height:1.6; margin-bottom:16px;">{{ $paymentSectionText }}</p>
            <a href="{{ $lien_paiement }}" style="display:inline-block; background:{{ $payBtnColor }}; color:#fff; font-size:14px; font-weight:700; padding:12px 28px; border-radius:10px; text-decoration:none;">
                {{ $payBtnText }}
            </a>
        </div>
        @endif

    </div>

    {{-- ── Footer ── --}}
    <div class="footer">
        <p>© {{ date('Y') }} {{ $footerCompany }}. Tous droits réservés.</p>
        <p style="margin-top:4px;">{{ $footerLegal }}</p>
    </div>
</div>
</body>
</html>
