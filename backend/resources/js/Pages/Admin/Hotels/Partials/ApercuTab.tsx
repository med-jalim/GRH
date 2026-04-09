import { Link } from "@inertiajs/react";
import { BedDouble, Building2, CalendarCheck, CheckCircle, Clock, Tag, XCircle, Phone, Mail, Map, Wallet } from "lucide-react";

const STATUT_CONFIG = {
  en_attente: { label: "En attente", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  confirme:   { label: "Confirmée",  icon: CheckCircle, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  annule:     { label: "Annulée",    icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
} as const;

function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-ML").format(n) + " د.م";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Section({ title, icon: Icon, count, children, action }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
          {count !== undefined && (
            <span className="ml-1 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">{count}</span>
          )}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function ApercuTab({ hotel, chambresByType }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Left ── */}
      <div className="lg:col-span-2 flex flex-col gap-6">

        {/* Description */}
        {hotel.description && (
          <Section title="À propos" icon={Building2}>
            <p className="text-sm text-slate-600 leading-relaxed">{hotel.description}</p>
          </Section>
        )}

        {/* Coordonnées */}
        <Section title="Coordonnées & Contacts" icon={Map}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-lg"><Phone className="w-4 h-4 text-slate-500" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Téléphone</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{hotel.telephone || "Non renseigné"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-lg"><Mail className="w-4 h-4 text-slate-500" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{hotel.email || "Non renseigné"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2">
              <div className="p-2 bg-slate-50 rounded-lg"><Map className="w-4 h-4 text-slate-500" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Adresse</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{hotel.adresse || "Non renseignée"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2 border-t border-slate-100 pt-5 mt-1">
              <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0"><Wallet className="w-4 h-4 text-amber-600" /></div>
              <div className="w-full">
                <p className="text-xs font-bold text-amber-600/70 uppercase tracking-wide mb-1.5">Informations Bancaires (RIB)</p>
                {hotel.rib ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center justify-between">
                    <span className="font-mono text-sm tracking-widest text-slate-800">{hotel.rib.match(/.{1,4}/g)?.join(' ')}</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">Non renseigné</span>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Chambres Snapshot */}
        <Section title="Aperçu des Chambres" icon={BedDouble} count={hotel.chambres?.length || 0}>
          {!hotel.chambres || hotel.chambres.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Aucune chambre enregistrée.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(chambresByType).map(([typeName, rooms]: [string, any]) => (
                <div key={typeName}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{typeName}</p>
                  <div className="flex flex-wrap gap-2">
                    {rooms.map((c: any) => (
                      <span key={c.id} className="inline-flex flex-col px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="w-3 h-3" />
                          N° {c.numero}
                        </div>
                        {c.sub_type && (
                          <span className="text-[9px] text-blue-400 font-bold uppercase mt-0.5">{c.sub_type.nom}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>

      {/* ── Right ── */}
      <div className="flex flex-col gap-6">
        {/* Recent reservations */}
        <Section title="Réservations récentes" icon={CalendarCheck} count={hotel.reservations?.length || 0}>
          {!hotel.reservations || hotel.reservations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Aucune réservation pour le moment.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {hotel.reservations.slice(0, 5).map((r: any) => {
                const cfg = STATUT_CONFIG[r.statut as keyof typeof STATUT_CONFIG] ?? STATUT_CONFIG.en_attente;
                const Icon = cfg.icon;
                return (
                  <Link
                    key={r.id}
                    href={`/admin/reservations/${r.id}`}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-amber-600 truncate">
                        {r.code_reference}
                      </p>
                      <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">{r.nom_contact}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(r.date_arrivee)} → {formatDate(r.date_depart)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${cfg.cls} flex-shrink-0`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </Link>
                );
              })}

              <Link
                href={`/admin/reservations?id_hotel=${hotel.id}`}
                className="mt-1 text-xs text-center text-amber-600 hover:text-amber-700 font-semibold transition-colors"
              >
                Voir toutes les réservations →
              </Link>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
