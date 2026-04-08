@php
    $s = $settings ?? [];
    $headerBg      = $s['header_bg'] ?? '#10b981';
    $accentColor   = $s['accent_color'] ?? '#059669';
    $company       = $s['header_company'] ?? 'GRH Hôtels';
    $tagline       = $s['header_tagline'] ?? 'Paiement & Confirmation';
    $footerCompany = $s['footer_company'] ?? 'Groupe Résidences Hôtelières';
    $footerLegal   = $s['footer_legal'] ?? 'Cet e-mail a été généré automatiquement.';
    $btnColor      = $s['button_color'] ?? '#10b981';
    $btnText       = $s['button_text'] ?? 'Voir mon dossier →';
    $blocks        = $s['blocks'] ?? [];
    $showAmountBox = $blocks['amount_box'] ?? true;
    $showViewBtn   = $blocks['view_button'] ?? true;
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Paiement Validé</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07); }
        .header { padding: 40px 20px; text-align: center; }
        .content { padding: 40px; }
        .footer-wrap { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .body-content { font-size: 14px; line-height: 1.75; color: #334155; margin-bottom: 24px; }
        .body-content p { margin-bottom: 12px; }
        .body-content strong { color: #0f172a; }
        .body-content ul, .body-content ol { padding-left: 22px; margin-bottom: 12px; }
        .body-content h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header" style="background: {{ $headerBg }};">
        <h1 style="margin:0; font-size:24px; font-weight:800; color:#fff;">✓ Paiement Validé</h1>
        <p style="color:rgba(255,255,255,0.7); font-size:13px; margin-top:4px;">{{ $company }} — {{ $tagline }}</p>
    </div>
    <div class="content">

        {{-- Editable Body Content --}}
        <div class="body-content">{!! $body !!}</div>

        {{-- Amount Box --}}
        @if($showAmountBox)
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:#166534;">Montant Crédité</p>
            <div style="font-size:26px; font-weight:800; color:{{ $accentColor }}; margin-top:6px;">{{ number_format($payment->amount, 2) }} MAD</div>
        </div>
        @endif

        {{-- View Button --}}
        @if($showViewBtn)
        <div style="text-align:center; margin-top:24px;">
            <a href="{{ $verifyUrl }}" style="display:inline-block; padding:13px 28px; background:{{ $btnColor }}; color:#fff; font-size:14px; font-weight:700; border-radius:10px; text-decoration:none;">
                {{ $btnText }}
            </a>
        </div>
        @endif
    </div>
    <div class="footer-wrap">
        <p>© {{ date('Y') }} {{ $footerCompany }}. Tous droits réservés.</p>
        <p style="margin-top:4px;">{{ $footerLegal }}</p>
    </div>
</div>
</body>
</html>
