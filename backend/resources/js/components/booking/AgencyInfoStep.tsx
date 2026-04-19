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

  const bookingType = watch('bookingType');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#54b172] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20">
            1
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
            Informations {bookingType === 'agence' ? 'Agence' : 'Contact'}
          </h2>
        </div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-[52px]">
          Identité et contact de l'émetteur
        </p>
      </div>


      {/* toggle button Agence/Groupe */}
      <div className="flex gap-4 mb-8">
        <label className={`flex-1 flex items-center justify-center gap-3 px-6 py-2 rounded-2xl border-2 transition-all cursor-pointer ${bookingType === 'groupe' ? 'border-[#54b172] bg-emerald-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
          <input type="radio" value="groupe" {...register('bookingType')} className="hidden" />
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${bookingType === 'groupe' ? 'border-[#54b172]' : 'border-slate-300'}`}>
            {bookingType === 'groupe' && <div className="w-2.5 h-2.5 rounded-full bg-[#54b172]" />}
          </div>
          <span className={`font-bold text-sm ${bookingType === 'groupe' ? 'text-[#54b172]' : 'text-slate-500'}`}>Groupe Privé</span>
        </label>
        
        <label className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-6 py-2 rounded-2xl border-2 transition-all cursor-pointer ${bookingType === 'agence' ? 'border-[#54b172] bg-emerald-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
          <input type="radio" value="agence" {...register('bookingType')} className="hidden" />
          <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${bookingType === 'agence' ? 'border-[#54b172]' : 'border-slate-300'}`}>
                {bookingType === 'agence' && <div className="w-2.5 h-2.5 rounded-full bg-[#54b172]" />}
              </div>
              <span className={`font-bold text-sm ${bookingType === 'agence' ? 'text-[#54b172]' : 'text-slate-500'}`}>Agence de Voyage</span>
          </div>
        </label>
      </div>




      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {bookingType === 'agence' && (
          <>
        {/* Nom Agence */}
        <div className="space-y-2">
          <Label htmlFor="agencyName" className="text-slate-700 font-semibold text-sm">Nom de l'agence de voyage</Label>
          <div className="relative">
            <Input 
              id="agencyName" 
              {...register('agencyName')} 
              placeholder="Ex : Oasis Voyages" 
              className={`h-12 px-4 rounded-xl transition-all focus:ring-2 focus:ring-slate-100 ${errors.agencyName ? 'border-red-400 focus:ring-red-50' : 'border-slate-200'}`} 
            />
            {errors.agencyName && (
              <span className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tight">
                {errors.agencyName.message}
              </span>
            )}
          </div>
        </div>

        {/* Code Agence */}
        <div className="space-y-2">
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
        </>
        )}

        {/* Contact */}
        <div className="space-y-2">
          <Label
            htmlFor="contactName"
            className="text-slate-700 font-semibold text-sm"
          >
            {bookingType === 'agence' ? 'Responsable du dossier' : 'Chef de groupe (Nom complet)'}
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
