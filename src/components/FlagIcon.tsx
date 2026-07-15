import { useId } from 'react';

interface FlagIconProps {
  countryCode: string;
  className?: string;
}

export function FlagIcon({ countryCode, className = '' }: FlagIconProps) {
  const clipId = useId();

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_4px_12px_rgba(0,0,0,0.22)] ${className}`}
      title={countryCode}
      aria-label={`${countryCode} flag`}
    >
      <svg viewBox="0 0 32 32" className="h-full w-full">
        <defs>
          <clipPath id={clipId}>
            <circle cx="16" cy="16" r="16" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <FlagArtwork countryCode={countryCode} />
        </g>
      </svg>
    </span>
  );
}

function FlagArtwork({ countryCode }: { countryCode: string }) {
  switch (countryCode) {
    case 'AU':
      return <AustraliaFlag />;
    case 'CA':
      return <CanadaFlag />;
    case 'DE':
      return <GermanyFlag />;
    case 'GB':
      return <UnitedKingdomFlag />;
    case 'HK':
      return <HongKongFlag />;
    case 'JP':
      return <JapanFlag />;
    case 'US':
      return <UnitedStatesFlag />;
    default:
      return <DefaultFlag label={countryCode.slice(0, 2)} />;
  }
}

function AustraliaFlag() {
  return (
    <>
      <rect width="32" height="32" fill="#062b7a" />
      <g transform="scale(0.48)">
        <UnitedKingdomFlag />
      </g>
      <circle cx="23" cy="9" r="1.4" fill="#fff" />
      <circle cx="26" cy="15" r="1.2" fill="#fff" />
      <circle cx="21" cy="20" r="1.1" fill="#fff" />
      <circle cx="27" cy="24" r="1.3" fill="#fff" />
      <circle cx="15" cy="25" r="1.8" fill="#fff" />
    </>
  );
}

function CanadaFlag() {
  return (
    <>
      <rect width="8" height="32" fill="#d52b1e" />
      <rect x="8" width="16" height="32" fill="#fff" />
      <rect x="24" width="8" height="32" fill="#d52b1e" />
      <path
        d="M16 7l1.4 4 3.5-1.7-1.7 3.9 3.8.8-3.4 2.1 1.1 3.8-3.3-1.9-.4 5h-2l-.4-5-3.3 1.9 1.1-3.8L9 14l3.8-.8-1.7-3.9 3.5 1.7L16 7z"
        fill="#d52b1e"
      />
    </>
  );
}

function GermanyFlag() {
  return (
    <>
      <rect width="32" height="10.67" fill="#000" />
      <rect y="10.67" width="32" height="10.66" fill="#dd0000" />
      <rect y="21.33" width="32" height="10.67" fill="#ffce00" />
    </>
  );
}

function HongKongFlag() {
  return (
    <>
      <rect width="32" height="32" fill="#de2910" />
      <g fill="#fff" transform="translate(16 16)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d="M0-2.2c3-4.8 6.2-2.4 5.2.8C4.5 1 1.8 2 0 2.2c1.1-1.5 1.3-2.9 0-4.4z"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
    </>
  );
}

function JapanFlag() {
  return (
    <>
      <rect width="32" height="32" fill="#fff" />
      <circle cx="16" cy="16" r="7" fill="#bc002d" />
    </>
  );
}

function UnitedKingdomFlag() {
  return (
    <>
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0l32 32M32 0L0 32" stroke="#fff" strokeWidth="7" />
      <path d="M0 0l32 32M32 0L0 32" stroke="#c8102e" strokeWidth="3.5" />
      <path d="M16 0v32M0 16h32" stroke="#fff" strokeWidth="10" />
      <path d="M16 0v32M0 16h32" stroke="#c8102e" strokeWidth="5.5" />
    </>
  );
}

function UnitedStatesFlag() {
  return (
    <>
      <rect width="32" height="32" fill="#b22234" />
      {Array.from({ length: 6 }).map((_, index) => (
        <rect key={index} y={index * 5.33 + 2.66} width="32" height="2.66" fill="#fff" />
      ))}
      <rect width="14.5" height="17.2" fill="#3c3b6e" />
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 4 }).map((__, col) => (
          <circle
            key={`${row}-${col}`}
            cx={2.2 + col * 3.2}
            cy={2.2 + row * 3.1}
            r="0.55"
            fill="#fff"
          />
        ))
      )}
    </>
  );
}

function DefaultFlag({ label }: { label: string }) {
  return (
    <>
      <rect width="32" height="32" fill="#1f2937" />
      <text
        x="16"
        y="18"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#d1d5db"
        fontSize="9"
        fontWeight="700"
      >
        {label}
      </text>
    </>
  );
}
