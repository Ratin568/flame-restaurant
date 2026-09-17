export function Stars({value, className = 'text-base'}: {value: number; className?: string}) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-yellow-400' : 'text-muted-foreground/30'}>
          ★
        </span>
      ))}
    </span>
  );
}