type ScoreGaugeProps = {
  score: number; // 0-100, the internal decimal IPRS
};

const WIDTH = 260;
const HEIGHT = 140;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT - 10;
const RADIUS = 110;
const STROKE_WIDTH = 14;

function pointOnArc(angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER_X + RADIUS * Math.cos(angleRad),
    y: CENTER_Y - RADIUS * Math.sin(angleRad),
  };
}

function arcPath(startAngleDeg: number, endAngleDeg: number) {
  const start = pointOnArc(startAngleDeg);
  const end = pointOnArc(endAngleDeg);
  const largeArcFlag = startAngleDeg - endAngleDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/**
 * Dynamic semicircle gauge driven by the actual IPRS score — replaces the
 * static Figma export (fixed at 63) so every score renders correctly.
 */
export function ScoreGauge({ score }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const currentAngle = 180 - (clamped / 100) * 180;
  const tip = pointOnArc(currentAngle);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      role="img"
      aria-label={`Medidor de puntaje: ${Math.floor(clamped)} de 100`}
    >
      <path
        d={arcPath(180, 0)}
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        stroke-width={STROKE_WIDTH}
        stroke-linecap="round"
      />
      <path
        d={arcPath(180, currentAngle)}
        fill="none"
        stroke="#66cc99"
        stroke-width={STROKE_WIDTH}
        stroke-linecap="round"
      />
      {[25, 50, 75].map((threshold) => {
        const angle = 180 - (threshold / 100) * 180;
        const point = pointOnArc(angle);
        return <circle key={threshold} cx={point.x} cy={point.y} r={2.5} fill="rgba(255,255,255,0.6)" />;
      })}
      <circle cx={tip.x} cy={tip.y} r={8} fill="#66cc99" stroke="#02233b" stroke-width={2} />
    </svg>
  );
}
