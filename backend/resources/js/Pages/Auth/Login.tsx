import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
            <Head title="Connexion Admin" />

            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-black text-white rounded-2xl mb-4 font-black shadow-xl shadow-black/10">
                        G
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Espace Administrateur</h1>
                    <p className="text-gray-500 text-sm mt-2">Connectez-vous pour gérer votre établissement</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                            Adresse Email
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54b172] transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#54b172]/10 focus:border-[#54b172] transition-all`}
                                placeholder="nom@exemple.com"
                                required
                                autoFocus
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-[11px] mt-1.5 font-medium ml-1">{errors.email}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5 ml-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Mot de passe
                            </label>
                            {/* <a href="#" className="text-[11px] font-bold text-[#54b172] hover:underline">Oublié ?</a> */}
                        </div>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54b172] transition-colors">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#54b172]/10 focus:border-[#54b172] transition-all`}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-[11px] mt-1.5 font-medium ml-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center ml-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#54b172] focus:ring-[#54b172]/20"
                            />
                            <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">Rester connecté</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-black hover:bg-gray-800 text-white rounded-xl py-3.5 text-sm font-bold shadow-xl shadow-black/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {processing ? (
                            <Loader2 className="w-4 h-4 animate-spin font-black" />
                        ) : (
                            <>
                                Se connecter
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        &copy; 2026 Groupe Résidences Hôtelières.
                    </p>
                </div>
            </div>
        </div>
    );
}
