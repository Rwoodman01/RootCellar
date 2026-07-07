interface StepperProps {
  steps: string[];
  current: number;
  done: boolean[];
  onSelect?: (step: number) => void;
}

export function Stepper({ steps, current, done, onSelect }: StepperProps) {
  return (
    <nav className="stepper" aria-label="Steps">
      {steps.map((label, index) => {
        const step = index + 1;
        const isActive = step === current;
        const isDone = Boolean(done[index]);
        const classes = ["stepper-step", isActive ? "active" : "", isDone ? "done" : ""].filter(Boolean).join(" ");
        return (
          <button type="button" key={label} className={classes} onClick={() => onSelect?.(step)} disabled={!onSelect} aria-current={isActive ? "step" : undefined}>
            <span className="stepper-dot">{step}</span>
            <span className="stepper-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
