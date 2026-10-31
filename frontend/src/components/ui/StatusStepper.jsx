import { Check } from 'lucide-react';

const STEP_STATES = {
  done: { ring: 'ring-mint bg-mint text-white', line: 'bg-mint' },
  active: { ring: 'ring-forest bg-forest text-paper', line: 'bg-border' },
  upcoming: { ring: 'ring-border bg-paper text-ink-soft', line: 'bg-border' },
};

export function StatusStepper({ steps, currentStep }) {
  // steps: [{ key, label }], currentStep: key of active step
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const state =
          idx < currentIdx ? 'done' : idx === currentIdx ? 'active' : 'upcoming';
        const cfg = STEP_STATES[state];

        return (
          <div key={step.key} className="flex items-center min-w-0">
            {/* Connector line */}
            {idx > 0 && (
              <div className={`h-0.5 w-8 md:w-12 flex-shrink-0 ${STEP_STATES[idx <= currentIdx ? 'done' : 'upcoming'].line}`} />
            )}

            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ring-2
                  ${cfg.ring} font-semibold text-xs transition-all`}
              >
                {state === 'done' ? <Check size={14} strokeWidth={3} /> : idx + 1}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  state === 'upcoming' ? 'text-ink-soft' : 'text-ink'
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
