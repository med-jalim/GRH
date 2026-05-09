import { Link, Head } from '@inertiajs/react';
import { 
    Building2, 
    CalendarCheck, 
    Coffee, 
    Wifi, 
    Car, 
    Utensils, 
    Star,
    ChevronRight,
    MapPin,
    Phone,
    BedDouble
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface WelcomeProps {
    auth?: {
        user: any;
    };
}

export default function Welcome({ auth }: WelcomeProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    const features = [
        { icon: BedDouble, title: 'Chambres Luxueuses', desc: 'Des suites spacieuses avec vue panoramique et literie premium.' },
        { icon: Utensils, title: 'Gastronomie', desc: 'Des restaurants étoilés proposant une cuisine raffinée et locale.' },
        { icon: Coffee, title: 'Spa & Bien-être', desc: 'Des espaces de relaxation complets pour votre sérénité absolue.' },
    ];

    return (
        <>
            <Head title="Accueil - GRH Hôtels" />

            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-[#54b172] selection:text-white">
                
                {/* Navbar */}
                <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
                    <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold shadow-lg transition-colors ${scrolled ? 'bg-[#54b172] text-white' : 'bg-white text-[#54b172]'}`}>
                                G
                            </div>
                            <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white drop-shadow-md'}`}>
                                GRH Hôtels
                            </span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#experience" className={`font-medium transition-colors hover:text-[#54b172] ${scrolled ? 'text-gray-600' : 'text-white drop-shadow-sm'}`}>L'Expérience</a>
                            <a href="#services" className={`font-medium transition-colors hover:text-[#54b172] ${scrolled ? 'text-gray-600' : 'text-white drop-shadow-sm'}`}>Services</a>
                            <a href="#contact" className={`font-medium transition-colors hover:text-[#54b172] ${scrolled ? 'text-gray-600' : 'text-white drop-shadow-sm'}`}>Contact</a>
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
                                    Connexion
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
                                // Fallback gradient if image fails to load
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>

                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold tracking-wider uppercase mb-6">
                            Bienvenue dans l'excellence
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                            Redéfinissez <br className="hidden md:block"/> votre séjour.
                        </h1>
                        <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto drop-shadow-md">
                            Découvrez une collection d'hôtels prestigieux où le confort absolu rencontre l'élégance intemporelle. Laissez-vous séduire par l'expérience GRH.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a 
                                href="/booking" 
                                className="w-full sm:w-auto px-8 py-4 bg-[#54b172] hover:bg-green-600 text-white rounded-full font-bold text-lg shadow-lg shadow-green-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <CalendarCheck size={20} />
                                Réserver maintenant
                            </a>
                        </div>
                    </div>
                    
                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                        <a href="#experience" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/40 transition-colors">
                            <ChevronDown className="w-5 h-5" />
                        </a>
                    </div>
                </section>

                {/* Experience / Features Section */}
                <section id="experience" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">L'Art de Recevoir</h2>
                            <p className="text-gray-500 text-lg">Chaque détail de nos établissements a été pensé pour vous offrir un confort inégalé et des souvenirs mémorables.</p>
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

                {/* Showcase Section */}
                <section id="services" className="py-24 bg-gray-900 text-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Des destinations d'exception</h2>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                    Plongez dans des univers uniques, situés dans les plus belles régions. Que ce soit pour un voyage d'affaires ou une escapade romantique, le Groupe GRH vous garantit un service sur-mesure.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-center gap-3 text-gray-300">
                                        <div className="w-6 h-6 rounded-full bg-[#54b172]/20 flex items-center justify-center text-[#54b172]"><Star size={14} /></div>
                                        Hôtels 4 et 5 étoiles certifiés
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-300">
                                        <div className="w-6 h-6 rounded-full bg-[#54b172]/20 flex items-center justify-center text-[#54b172]"><Wifi size={14} /></div>
                                        Fibre optique très haut débit incluse
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-300">
                                        <div className="w-6 h-6 rounded-full bg-[#54b172]/20 flex items-center justify-center text-[#54b172]"><Car size={14} /></div>
                                        Service voiturier et parking privé
                                    </li>
                                </ul>
                                <a href="/booking" className="inline-flex items-center gap-2 text-[#54b172] font-semibold hover:text-green-400 transition-colors">
                                    Découvrir nos offres <ChevronRight size={18} />
                                </a>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="absolute inset-0 bg-[#54b172] rounded-3xl transform translate-x-4 translate-y-4 opacity-20"></div>
                                <div className="relative rounded-3xl shadow-2xl h-[500px] w-full bg-gray-800 overflow-hidden">
                                    <img 
                                        src="https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1200&q=80" 
                                        alt="Hotel Interior" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer id="contact" className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl font-bold text-white shadow-md">
                                        G
                                    </div>
                                    <span className="font-bold text-xl text-gray-900 tracking-tight">
                                        GRH Hôtels
                                    </span>
                                </div>
                                <p className="text-gray-500 mb-6">L'excellence de l'hôtellerie à votre service depuis plus de 20 ans.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Liens Rapides</h4>
                                <ul className="space-y-3">
                                    <li><a href="#experience" className="text-gray-500 hover:text-[#54b172] transition-colors">Expérience</a></li>
                                    <li><a href="#services" className="text-gray-500 hover:text-[#54b172] transition-colors">Services</a></li>
                                    <li><a href="/booking" className="text-gray-500 hover:text-[#54b172] transition-colors">Réserver</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Légal</h4>
                                <ul className="space-y-3">
                                    <li><a href="#" className="text-gray-500 hover:text-[#54b172] transition-colors">Mentions Légales</a></li>
                                    <li><a href="#" className="text-gray-500 hover:text-[#54b172] transition-colors">Politique de Confidentialité</a></li>
                                    <li><a href="#" className="text-gray-500 hover:text-[#54b172] transition-colors">CGV</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Contact</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-gray-500">
                                        <MapPin size={20} className="text-[#54b172] shrink-0 mt-0.5" />
                                        <span>123 Avenue des Champs-Élysées<br/>75008 Paris, France</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-500">
                                        <Phone size={20} className="text-[#54b172] shrink-0" />
                                        <span>+33 1 23 45 67 89</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-200 text-center flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} GRH Hôtels. Tous droits réservés.</p>
                            
                            {/* Administration Link for quick access */}
                            <Link href="/admin/login" className="text-sm font-medium text-gray-400 hover:text-[#54b172] flex items-center gap-1 transition-colors">
                                <Building2 size={14} /> Accès Administration
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

const ChevronDown = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6"/>
    </svg>
);
