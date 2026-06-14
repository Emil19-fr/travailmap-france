interface ScoreRingProps {
  score: number
  color: string
  size?: number
  stroke?: number
}

/** Anneau de score (jauge SVG) avec le nombre au centre en mono. */
export default function ScoreRing({ score, color, size = 76, stroke = 8 }: ScoreRingProps) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(100, Math.max(0, score)) / 100)
  const center = size / 2

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="ring__track"
          cx={center}
          cy={center}
          r={r}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="ring__value"
          cx={center}
          cy={center}
          r={r}
          strokeWidth={stroke}
          stroke={color}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="ring__label">
        <span className="ring__num" style={{ color }}>
          {score}
        </span>
        <span className="ring__den">/100</span>
      </div>
    </div>
  )
}
