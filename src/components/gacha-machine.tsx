import Image from "next/image";
import { RARITY } from "@/lib/capsule";

const INK = "#3a2530";
const BALL_COLORS = [RARITY.common.color, RARITY.rare.color, "#f39aa7", RARITY.epic.color, RARITY.super.color];
// x, y, rotation: a pile of capsules inside the dome (centre 130,100, radius 84).
const BALLS: [number, number, number][] = [
  [96, 152, -20], [130, 154, 10], [164, 152, 35],
  [78, 122, 15], [112, 120, -30], [148, 122, 5], [182, 122, -15],
  [96, 90, 40], [130, 88, -10], [164, 90, 20],
  [112, 58, -25], [148, 58, 30],
];

function Ball({ x, y, r = 18, rotate = 0, color }: { x: number; y: number; r?: number; rotate?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <circle r={r} fill={color} />
      <path d={`M ${-r} 0 A ${r} ${r} 0 0 0 ${r} 0 Z`} fill="#fff" />
      <line x1={-r} y1={0} x2={r} y2={0} stroke={INK} strokeWidth={2.5} />
      <circle r={r} fill="none" stroke={INK} strokeWidth={3} />
      <ellipse cx={-r * 0.4} cy={-r * 0.5} rx={r * 0.22} ry={r * 0.12} fill="#fff" opacity={0.85} />
    </g>
  );
}

// Decorative gacha machine. `drop` shows a capsule of that colour in the chute.
export function GachaMachine({
  spinning = false,
  drop = null,
  idle = false,
}: {
  spinning?: boolean;
  drop?: string | null;
  idle?: boolean;
}) {
  return (
    <div className={`relative mx-auto w-full max-w-[260px] ${idle ? "gacha-idle" : ""} ${spinning ? "gacha-spinning" : ""}`}>
      <svg viewBox="0 0 260 340" className="h-auto w-full" aria-hidden>
        <ellipse cx="130" cy="330" rx="96" ry="7" fill={INK} opacity="0.12" />
        <circle cx="130" cy="100" r="84" fill="#fff" fillOpacity="0.65" />
        <g className="gacha-balls">
          {BALLS.map(([x, y, rotate], i) => (
            <Ball key={i} x={x} y={y} rotate={rotate} color={BALL_COLORS[i % BALL_COLORS.length]} />
          ))}
        </g>
        <circle cx="130" cy="100" r="84" fill="none" stroke={INK} strokeWidth="4" />
        <path d="M 74 70 A 62 62 0 0 1 112 38" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        <rect x="104" y="8" width="52" height="16" rx="8" fill="#0f9ea5" stroke={INK} strokeWidth="4" />

        <rect x="78" y="170" width="104" height="24" rx="8" fill="#0f9ea5" stroke={INK} strokeWidth="4" />
        <rect x="34" y="188" width="192" height="136" rx="26" fill="#f39aa7" stroke={INK} strokeWidth="4" />
        <rect x="54" y="204" width="152" height="44" rx="14" fill="#fff" stroke={INK} strokeWidth="3" />
        <text x="130" y="232" textAnchor="middle" fontSize="17" fontWeight="900" fill="#0b7d83" letterSpacing="1.5">
          КАПСУЛЫ
        </text>

        <rect x="56" y="262" width="64" height="44" rx="14" fill={INK} />
        {drop && (
          <g transform="translate(88 286)">
            <g className="gacha-drop">
              <Ball x={0} y={0} r={15} rotate={-15} color={drop} />
            </g>
          </g>
        )}

        <g transform="translate(180 284)">
          <g className="gacha-crank">
            <circle r="24" fill="#fff" stroke={INK} strokeWidth="4" />
            <rect x="-5" y="-21" width="10" height="42" rx="5" fill="#e0697d" stroke={INK} strokeWidth="3" />
            <circle r="5" fill={INK} />
          </g>
        </g>
      </svg>
      <Image
        src="/bobotik/bobotik-hi.png"
        alt=""
        width={160}
        height={144}
        className="pointer-events-none absolute -left-6 bottom-0 w-24 drop-shadow-md"
      />
    </div>
  );
}
