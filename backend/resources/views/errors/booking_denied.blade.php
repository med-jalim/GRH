<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès Restreint - GRH</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 text-center animate-in fade-in zoom-in duration-500">
        <div class="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-100">
            <svg class="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zm6 16a6 6 0 11-12 0 6 6 0 0112 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
            </svg>
        </div>
        
        <h1 class="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Accès Restreint</h1>
        
        <p class="text-slate-500 text-sm leading-relaxed mb-8">
            {{ $reason ?? "Ce formulaire de réservation est accessible uniquement via un lien d'invitation sécurisé envoyé par notre administration." }}
        </p>

        <div class="space-y-4">
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Comment obtenir un accès ?</p>
                <p class="text-xs font-bold text-amber-700">Contactez-nous par email pour recevoir votre lien de réservation personnalisé.</p>
            </div>
            
            <a href="/" class="block w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20">
                Retour à l'accueil
            </a>
        </div>

        <p class="mt-10 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
            &copy; 2026 GROUPE RÉSIDENCES HÔTELIÈRES
        </p>
    </div>
</body>
</html>
