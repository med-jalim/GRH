interface Props {
  currentStep: number;
}

const STEPS = [
  { label: 'Agence',       sub: 'Informations' },
  { label: 'Réservation',  sub: 'Détails' },
  { label: 'Confirmation', sub: 'Récapitulatif' },
];

export function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-start justify-between w-full max-w-lg mx-auto">
      {STEPS.map((step, i) => {
        const num = i + 1;
        const isCompleted = num < currentStep;
        const isActive    = num === currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle + label */}
            <div className="flex flex-col items-center min-w-[70px]">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 border-2
                  ${isCompleted ? 'bg-[#54b172] text-white border-[#54b172] shadow-lg shadow-emerald-500/20' : ''}
                  ${isActive    ? 'bg-white text-[#54b172] border-[#54b172] shadow-xl shadow-emerald-500/10' : ''}
                  ${!isCompleted && !isActive ? 'bg-white text-slate-300 border-slate-200' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : num}
              </div>
              <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest leading-tight text-center transition-colors
                ${isActive ? 'text-slate-900 font-black' : 'text-slate-300'}`}
              >
                {step.label}
              </p>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 mb-8 bg-slate-100 relative rounded-full overflow-hidden">
                <div 
                    className="absolute inset-0 bg-[#54b172] transition-all duration-700" 
                    style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
