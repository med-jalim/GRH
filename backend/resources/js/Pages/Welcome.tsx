import { Link, Head, useForm, usePage } from '@inertiajs/react';
import { 
    Building2, 
    CalendarCheck, 
    Coffee, 
    Wifi, 
    Car, 
    Star,
    ChevronRight,
    MapPin,
    Phone,
    BedDouble,
    Send,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';

interface WelcomeProps {
    auth?: {
        user: any;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Welcome({ auth, flash }: WelcomeProps) {
    const [scrolled, setScrolled] = useState(false);
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        company_name: '',
        email: '',
        phone: '',
        type: 'agency',
        message: ''
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const submitRequest = (e: FormEvent) => {
        e.preventDefault();
        post('/partner-request', {
            preserveScroll: true,
            onSuccess: () => reset()
        });
    };

    const features = [
        { icon: BedDouble, title: 'Gestion de Groupes', desc: 'Une interface dédiée pour gérer vos réservations multiples en toute simplicité.' },
        { icon: Star, title: 'Tarifs Préférentiels', desc: 'Bénéficiez de remises exclusives et de tarifs négociés pour vos clients.' },
        { icon: Building2, title: 'Réservation Sécurisée', desc: 'Accès exclusif par lien sécurisé pour garantir la confidentialité de vos opérations.' },
    ];

    return (
        <>
            <Head title="Portail Partenaires - GRH Hôtels" />

            {/* Banner Indivual clients redirection */}
            <div className="bg-gray-900 text-white text-center py-2 px-4 text-sm font-medium z-[60] relative">
                Vous êtes un particulier ? <a href="#" className="underline hover:text-[#54b172] ml-1 transition-colors">Réservez sur notre site officiel</a>
            </div>

            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-[#54b172] selection:text-white">
                
                {/* Navbar */}
                <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3 top-0' : 'bg-transparent py-5 top-8'}`}>
                    <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold shadow-lg transition-colors ${scrolled ? 'bg-[#54b172] text-white' : 'bg-white text-[#54b172]'}`}>
                                G
                            </div>
                            <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white drop-shadow-md'}`}>
                                GRH Partenaires
                            </span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#avantages" className={`font-medium transition-colors hover:text-[#54b172] ${scrolled ? 'text-gray-600' : 'text-white drop-shadow-sm'}`}>Avantages</a>
                            <a href="#services" className={`font-medium transition-colors hover:text-[#54b172] ${scrolled ? 'text-gray-600' : 'text-white drop-shadow-sm'}`}>Services</a>
                            <a href="#contact" className={`font-medium transition-colors hover:text-[#54b172] ${scrolled ? 'text-gray-600' : 'text-white drop-shadow-sm'}`}>Demander un Accès</a>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link
                                    href="/admin/dashboard"
                                    className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg ${scrolled ? 'bg-gray-900 text-white hover:bg-[#54b172]' : 'bg-white text-gray-900 hover:bg-[#54b172] hover:text-white'}`}
                                >
                                    Espace Admin
                                </Link>
                            ) : (
                                <Link
                                    href="/admin/login"
                                    className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg ${scrolled ? 'bg-[#54b172] text-white hover:bg-green-600' : 'bg-white text-gray-900 hover:bg-[#54b172] hover:text-white'}`}
                                >
                                    Connexion Partenaire
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0 bg-gray-900">
                        <img 
                            src="https://images.unsplash.com/photo-1566073171589-7fa361c40212?auto=format&fit=crop&w=2000&q=80" 
                            alt="Luxury Hotel Exterior" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>

                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <span className="inline-block py-1 px-3 rounded-full bg-[#54b172]/20 backdrop-blur-md border border-[#54b172]/50 text-[#54b172] text-sm font-semibold tracking-wider uppercase mb-6">
                            Portail B2B - Agences & Groupes
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                            Le partenaire de vos <br className="hidden md:block"/> événements d'exception.
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
                            Gérez vos réservations de groupes et profitez de tarifs préférentiels pour vos clients. Un accès exclusif pensé pour les professionnels du tourisme.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a 
                                href="#contact" 
                                className="w-full sm:w-auto px-8 py-4 bg-[#54b172] hover:bg-green-600 text-white rounded-full font-bold text-lg shadow-lg shadow-green-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <CalendarCheck size={20} />
                                Demander un Accès
                            </a>
                        </div>
                    </div>
                </section>

                {/* Experience / Features Section */}
                <section id="avantages" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Pourquoi devenir partenaire ?</h2>
                            <p className="text-gray-500 text-lg">Nous offrons aux professionnels du voyage des outils sur-mesure pour faciliter l'organisation de leurs séjours.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {features.map((feature, idx) => (
                                <div key={idx} className="group p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100">
                                    <div className="w-14 h-14 bg-green-50 text-[#54b172] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact / Request Section */}
                <section id="contact" className="py-24 bg-gray-50 border-t border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#54b172] rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16">
                            
                            <div className="lg:w-5/12">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Demande de Partenariat ou de Devis</h2>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Remplissez ce formulaire pour entrer en contact avec notre équipe commerciale. Nous vous fournirons un lien d'accès sécurisé pour gérer vos réservations.
                                </p>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#54b172]">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Réservé aux professionnels</h4>
                                            <p className="text-sm text-gray-500">Agences de voyage, Tour Opérateurs, CE</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#54b172]">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Support dédié</h4>
                                            <p className="text-sm text-gray-500">Un conseiller vous est assigné dès l'ouverture du compte</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-7/12">
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                                    
                                    {wasSuccessful && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3">
                                            <CheckCircle2 className="shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold">Demande envoyée !</h4>
                                                <p className="text-sm">Nous avons bien reçu votre demande, notre équipe vous recontactera très rapidement.</p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={submitRequest} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de demande *</label>
                                                <select 
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:border-[#54b172] focus:ring-4 focus:ring-[#54b172]/10 transition-all text-gray-900"
                                                    value={data.type}
                                                    onChange={e => setData('type', e.target.value)}
                                                    required
                                                >
                                                    <option value="agency">Accès Agence de Voyage</option>
                                                    <option value="group">Devis pour Groupe ( 10 pers.)</option>
                                                </select>
                                                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entité *</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Nom de votre agence ou groupe"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:border-[#54b172] focus:ring-4 focus:ring-[#54b172]/10 transition-all text-gray-900 placeholder-gray-400"
                                                    value={data.company_name}
                                                    onChange={e => setData('company_name', e.target.value)}
                                                    required
                                                />
                                                {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel *</label>
                                                <input 
                                                    type="email" 
                                                    placeholder="contact@agence.com"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:border-[#54b172] focus:ring-4 focus:ring-[#54b172]/10 transition-all text-gray-900 placeholder-gray-400"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    required
                                                />
                                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                                                <input 
                                                    type="tel" 
                                                    placeholder="+33 1 23 45 67 89"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:border-[#54b172] focus:ring-4 focus:ring-[#54b172]/10 transition-all text-gray-900 placeholder-gray-400"
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    required
                                                />
                                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
                                            <textarea 
                                                rows={4}
                                                placeholder="Précisez votre besoin (dates souhaitées, nombre de chambres, requêtes spécifiques...)"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:border-[#54b172] focus:ring-4 focus:ring-[#54b172]/10 transition-all text-gray-900 placeholder-gray-400 resize-none"
                                                value={data.message}
                                                onChange={e => setData('message', e.target.value)}
                                            ></textarea>
                                            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={processing}
                                            className="w-full py-3.5 bg-[#54b172] hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {processing ? 'Envoi en cours...' : (
                                                <>Envoyer la demande <Send size={18} /></>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 pt-20 pb-10 border-t border-gray-800 text-gray-400">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-10 h-10 bg-[#54b172] flex items-center justify-center rounded-xl font-bold text-white shadow-md">
                                        G
                                    </div>
                                    <span className="font-bold text-xl text-white tracking-tight">
                                        GRH Partenaires
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-6">Portail de réservation exclusif pour les agences de voyages et les groupes.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-white mb-4">Liens Rapides</h4>
                                <ul className="space-y-3">
                                    <li><a href="#avantages" className="hover:text-[#54b172] transition-colors">Avantages</a></li>
                                    <li><a href="#contact" className="hover:text-[#54b172] transition-colors">Nous contacter</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-white mb-4">Légal</h4>
                                <ul className="space-y-3">
                                    <li><a href="#" className="hover:text-[#54b172] transition-colors">Mentions Légales</a></li>
                                    <li><a href="#" className="hover:text-[#54b172] transition-colors">Politique de Confidentialité</a></li>
                                    <li><a href="#" className="hover:text-[#54b172] transition-colors">CGV B2B</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-white mb-4">Contact</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <MapPin size={20} className="text-[#54b172] shrink-0 mt-0.5" />
                                        <span>123 Avenue des Champs-Élysées<br/>75008 Paris, France</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Phone size={20} className="text-[#54b172] shrink-0" />
                                        <span>+33 1 23 45 67 89</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-800 text-center flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm">© {new Date().getFullYear()} GRH Hôtels. Tous droits réservés.</p>
                            
                            <Link href="/admin/login" className="text-sm font-medium hover:text-[#54b172] flex items-center gap-1 transition-colors">
                                <Building2 size={14} /> Accès Administration
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
