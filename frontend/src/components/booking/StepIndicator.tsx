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
    <div className="flex items-start justify-between">
      {STEPS.map((step, i) => {
        const num = i + 1;
        const isCompleted = num < currentStep;
        const isActive    = num === currentStep;

        return (
          <div key={i} className="flex items-center flex-1">
            {/* Circle + label */}
            <div className="flex flex-col items-center min-w-[60px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${isCompleted ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-md' : ''}
                  ${isActive    ? 'bg-slate-800 text-amber-400 ring-4 ring-amber-400/25 shadow-md' : ''}
                  ${!isCompleted && !isActive ? 'bg-slate-100 text-slate-400' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : num}
              </div>
              <p className={`mt-2 text-xs font-semibold leading-tight text-center transition-colors
                ${isActive ? 'text-slate-800' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {step.label}
              </p>
              <p className={`text-[10px] text-center
                ${isActive ? 'text-slate-500' : 'text-slate-300'}`}
              >
                {step.sub}
              </p>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mb-8 rounded-full transition-all duration-500
                ${isCompleted ? 'bg-emerald-400' : 'bg-slate-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
