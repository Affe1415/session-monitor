export function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((n) => n.toString().padStart(2, '0'))
    .join(':');
}

export function formatClockTime(
  date: Date,
  use24Hour: boolean,
  showSeconds: boolean
): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: !use24Hour,
  });
}

export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'text-green bg-green/15 border-green/30';
    case 'OPEN':
      return 'text-green bg-green/15 border-green/30';
    case 'CLOSED':
      return 'text-text-secondary bg-white/5 border-white/10';
    case 'LUNCH BREAK':
      return 'text-orange bg-orange/15 border-orange/30';
    case 'HOLIDAY':
      return 'text-red bg-red/15 border-red/30';
    case 'PRE-MARKET':
      return 'text-blue bg-blue/15 border-blue/30';
    case 'AFTER HOURS':
      return 'text-purple bg-purple/15 border-purple/30';
    default:
      return 'text-text-secondary bg-white/5 border-white/10';
  }
}

export function getStatusGlowClass(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'shadow-glow';
    case 'OPEN':
      return 'shadow-glow';
    case 'LUNCH BREAK':
      return 'shadow-glow-orange';
    default:
      return '';
  }
}
