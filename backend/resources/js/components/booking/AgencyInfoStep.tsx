import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookingSchemaType } from "@/lib/schemas";

export function AgencyInfoStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<BookingSchemaType>();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 text-sm font-bold shadow-sm">
            1
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {watch('client_type') === 'agence' ? "Informations de l'agence" : "Informations du groupe"}
          </h2>
        </div>
        <p className="text-slate-400 text-sm ml-11">
          {watch('client_type') === 'agence' 
            ? "Identifiez votre agence pour le traitement du dossier." 
            : "Identifiez votre organisation pour le traitement de la réservation."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Type de Client */}
        <div className="col-span-1 md:col-span-2 space-y-3">
          <Label className="text-slate-700 font-semibold text-sm">Vous réservez en tant que :</Label>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${watch('client_type') === 'agence' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
              <input type="radio" value="agence" {...register('client_type')} className="hidden" />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch('client_type') === 'agence' ? 'border-amber-500' : 'border-slate-300'}`}>
                {watch('client_type') === 'agence' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
              </div>
              <div>
                <span className="block font-bold text-slate-800">Agence de voyage</span>
                <span className="text-xs text-slate-500">Utilisez votre code partenaire</span>
              </div>
            </label>

            <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${watch('client_type') === 'groupe' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
              <input type="radio" value="groupe" {...register('client_type')} className="hidden" />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch('client_type') === 'groupe' ? 'border-amber-500' : 'border-slate-300'}`}>
                {watch('client_type') === 'groupe' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
              </div>
              <div>
                <span className="block font-bold text-slate-800">Groupe Direct</span>
                <span className="text-xs text-slate-500">Réservation sans code agence</span>
              </div>
            </label>
          </div>
        </div>

        {/* Nom Agence / Groupe */}
        <div className="space-y-2">
          <Label htmlFor="agencyName" className="text-slate-700 font-semibold text-sm">
            {watch('client_type') === 'agence' ? "Nom de l'agence" : "Nom du groupe / organisation"}
          </Label>
          <div className="relative">
            <Input 
              id="agencyName" 
              {...register('agencyName')} 
              placeholder={watch('client_type') === 'agence' ? "Ex : Oasis Voyages" : "Ex : Association Sportive"} 
              className={`h-12 px-4 rounded-xl transition-all focus:ring-2 focus:ring-slate-100 ${errors.agencyName ? 'border-red-400 focus:ring-red-50' : 'border-slate-200'}`} 
            />
            {errors.agencyName && (
              <span className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tight">
                {errors.agencyName.message}
              </span>
            )}
          </div>
        </div>

        {/* Code Agence (Conditional) */}
        {watch('client_type') === 'agence' && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <Label htmlFor="agencyCode" className="text-slate-700 font-semibold text-sm">Code Agence <span className="text-slate-400 font-normal">(ID unique)</span></Label>
            <div className="relative">
              <Input 
                id="agencyCode" 
                {...register('agencyCode')} 
                placeholder="Ex : AG-2026" 
                className={`h-12 px-4 rounded-xl transition-all focus:ring-2 focus:ring-slate-100 ${errors.agencyCode ? 'border-red-400 focus:ring-red-50' : 'border-slate-200'}`} 
              />
              {errors.agencyCode && (
                <span className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tight">
                  {errors.agencyCode.message}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="space-y-2">
          <Label
            htmlFor="contactName"
            className="text-slate-700 font-semibold text-sm"
          >
            Responsable du dossier
          </Label>
          <div className="relative">
            <Input
              id="contactName"
              {...register("contactName")}
              placeholder="Nom et Prénom"
              className={`h-12 px-4 rounded-xl transition-all focus:ring-2 focus:ring-slate-100 ${errors.contactName ? "border-red-400 focus:ring-red-50" : "border-slate-200"}`}
            />
            {errors.contactName && (
              <span className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tight">
                {errors.contactName.message}
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2 mt-2">
          <Label
            htmlFor="email"
            className="text-slate-700 font-semibold text-sm"
          >
            Adresse e-mail professionnelle
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="contact@agence-ma.com"
              className={`h-12 px-4 rounded-xl transition-all focus:ring-2 focus:ring-slate-100 ${errors.email ? "border-red-400 focus:ring-red-50" : "border-slate-200"}`}
            />
            {errors.email && (
              <span className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tight">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2 mt-2">
          <Label
            htmlFor="phone"
            className="text-slate-700 font-semibold text-sm"
          >
            Numéro de téléphone
          </Label>
          <div className="relative">
            <Input
              id="phone"
              {...register("phone")}
              placeholder="Ex : 021 xx xx xx"
              className={`h-12 px-4 rounded-xl transition-all focus:ring-2 focus:ring-slate-100 ${errors.phone ? "border-red-400 focus:ring-red-50" : "border-slate-200"}`}
            />
            {errors.phone && (
              <span className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tight">
                {errors.phone.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
