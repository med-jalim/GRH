<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@yield('title', 'GRH Hôtels - Notification')</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: #f3f4f6; /* bg-gray-100 */
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937; /* text-gray-800 */
            padding: 40px 16px;
            line-height: 1.6;
        }

        .container { 
            max-width: 640px; 
            margin: 0 auto; 
        }

        /* Header */
        .header {
            background-color: #111827; /* bg-gray-900 */
            border-radius: 16px 16px 0 0;
            padding: 32px 40px;
            text-align: center;
        }
        
        .header-logo-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .logo-icon {
            background-color: #54b172;
            color: #ffffff;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            font-weight: 800;
            font-size: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
        }

        .header .logo-text {
            font-size: 24px; 
            font-weight: 800;
            color: #ffffff; 
            letter-spacing: -0.5px;
            vertical-align: middle;
            display: inline-block;
        }

        .header p { 
            color: #9ca3af; /* text-gray-400 */
            font-size: 14px; 
            margin-top: 8px; 
        }

        /* Main Card */
        .card {
            background: #ffffff;
            border-radius: 0 0 16px 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            text-align: center; /* Center content by default */
        }

        /* Reusable components for children */
        .greeting { 
            font-size: 18px; 
            font-weight: 700; 
            color: #111827; 
            margin-bottom: 12px; 
        }
        
        .intro { 
            font-size: 15px; 
            color: #4b5563; 
            margin-bottom: 32px; 
        }

        .details-title {
            font-size: 12px; 
            font-weight: 700;
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            color: #9ca3af; 
            margin-bottom: 16px;
        }

        .details-table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 14px; 
            margin: 0 auto 32px auto; 
            background: #f9fafb;
            border-radius: 8px;
            overflow: hidden;
            text-align: left; /* Keep text left aligned inside the table */
        }
        
        .details-table tr { 
            border-bottom: 1px solid #f3f4f6; 
        }
        
        .details-table tr:last-child { 
            border-bottom: none; 
        }
        
        .details-table td { 
            padding: 12px 16px; 
            vertical-align: top; 
        }
        
        .details-table .label { 
            color: #6b7280; 
            font-weight: 500; 
            width: 40%; 
        }
        
        .details-table .value { 
            color: #111827; 
            font-weight: 600; 
        }

        .ref-badge {
            display: inline-block;
            background: #f0fdf4; 
            color: #166534;
            font-family: 'Courier New', monospace;
            font-size: 13px; 
            font-weight: 700;
            padding: 4px 12px; 
            border-radius: 6px;
            border: 1px solid #bbf7d0;
        }

        .btn {
            display: inline-block;
            padding: 14px 28px;
            background: #54b172;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 15px; 
            font-weight: 600;
            border-radius: 10px;
            text-align: center;
        }

        .btn-danger {
            background: #ef4444;
        }

        .btn-warning {
            background: #f59e0b;
        }

        .divider { 
            height: 1px; 
            background: #e5e7eb; 
            margin: 32px 0; 
        }

        .notice-text {
            font-size: 13px; 
            color: #6b7280; 
            text-align: center;
        }

        /* Footer */
        .footer { 
            text-align: center; 
            margin-top: 32px; 
            font-size: 12px; 
            color: #9ca3af; 
        }
        
        .footer a { 
            color: #54b172; 
            text-decoration: none; 
            font-weight: 500;
        }
        
        /* Utility */
        .text-center { text-align: center; }
        .mt-4 { margin-top: 16px; }
        .mb-4 { margin-bottom: 16px; }
    </style>
</head>
<body>
<div class="container">

    {{-- Header --}}
    <div class="header">
        <div class="header-logo-wrapper">
            <span class="logo-icon">G</span>
            <span class="logo-text">GRH Hôtels</span>
        </div>
        <p>@yield('header_subtitle', 'Système de gestion des réservations')</p>
    </div>

    {{-- Main card --}}
    <div class="card">
        @yield('content')
    </div>

    {{-- Footer --}}
    <div class="footer">
        <p>© {{ date('Y') }} GRH Hôtels. Tous droits réservés.</p>
        <p style="margin-top:8px;">
            Vous recevez cet email car vous êtes un partenaire ou client de GRH Hôtels.<br>
            Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
        </p>
    </div>

</div>
</body>
</html>
