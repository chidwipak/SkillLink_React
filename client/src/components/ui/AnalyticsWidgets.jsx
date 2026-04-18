import { useMemo } from 'react'

/* ─── Progress Ring: Circular progress indicator ─── */
export const ProgressRing = ({ value = 0, max = 100, size = 90, strokeWidth = 7, color = '#6366f1', label = '', sublabel = '' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="sk-progress-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" dominantBaseline="middle"
          fill="#1e293b" fontSize={size * 0.22} fontWeight="800">{Math.round(pct * 100)}%</text>
        {sublabel && (
          <text x={size / 2} y={size / 2 + 12} textAnchor="middle" dominantBaseline="middle"
            fill="#94a3b8" fontSize={size * 0.11} fontWeight="500">{sublabel}</text>
        )}
      </svg>
      {label && <span className="sk-progress-ring-label">{label}</span>}
    </div>
  )
}

/* ─── Horizontal Bar: Shows a breakdown item with bar ─── */
export const HorizontalBar = ({ label, value, max, color = '#6366f1', suffix = '' }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="sk-hbar">
      <div className="sk-hbar-header">
        <span className="sk-hbar-label">{label}</span>
        <span className="sk-hbar-value" style={{ color }}>{value}{suffix}</span>
      </div>
      <div className="sk-hbar-track">
        <div className="sk-hbar-fill" style={{ width: `${pct}%`, background: color, transition: 'width 1s ease-out' }} />
      </div>
    </div>
  )
}

/* ─── Metric Card: Enhanced stat with icon, trend ─── */
export const MetricCard = ({ icon, label, value, trend, trendLabel, color = '#6366f1', bgColor }) => {
  const bg = bgColor || `${color}12`
  const isUp = trend > 0
  return (
    <div className="sk-metric-card">
      <div className="sk-metric-icon" style={{ background: bg, color }}><i className={icon}></i></div>
      <div className="sk-metric-body">
        <span className="sk-metric-label">{label}</span>
        <span className="sk-metric-value">{value}</span>
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`sk-trend ${isUp ? 'sk-trend-up' : 'sk-trend-down'}`}>
          <i className={`fas fa-arrow-${isUp ? 'up' : 'down'}`}></i>
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span className="sk-trend-label">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}

/* ─── Mini Sparkline Bar Chart ─── */
export const SparkBars = ({ data = [], height = 40, barWidth = 6, gap = 3, color = '#6366f1' }) => {
  const maxVal = Math.max(...data.map(d => d.value || 0), 1)
  const totalWidth = data.length * (barWidth + gap) - gap
  return (
    <div className="sk-spark-bars">
      <svg width={totalWidth} height={height} viewBox={`0 0 ${totalWidth} ${height}`}>
        {data.map((d, i) => {
          const barH = Math.max((d.value / maxVal) * height * 0.85, 2)
          return (
            <rect key={i} x={i * (barWidth + gap)} y={height - barH}
              width={barWidth} height={barH} rx={barWidth / 2}
              fill={d.color || color} opacity={0.85}
              style={{ transition: 'height 0.6s ease-out, y 0.6s ease-out' }}>
              <title>{d.label}: {d.value}</title>
            </rect>
          )
        })}
      </svg>
    </div>
  )
}

/* ─── Activity Timeline Item ─── */
export const TimelineItem = ({ icon, iconColor = '#6366f1', iconBg, title, subtitle, badge, badgeClass, right }) => (
  <div className="sk-timeline-item">
    <div className="sk-timeline-dot" style={{ background: iconBg || `${iconColor}15`, color: iconColor }}>
      <i className={icon}></i>
    </div>
    <div className="sk-timeline-content">
      <p className="sk-timeline-title">{title}</p>
      {subtitle && <p className="sk-timeline-subtitle">{subtitle}</p>}
    </div>
    <div className="sk-timeline-right">
      {right && <span className="sk-timeline-amount">{right}</span>}
      {badge && <span className={`sk-badge ${badgeClass || 'sk-badge-default'}`}>{badge}</span>}
    </div>
  </div>
)

/* ─── Summary Row: Key metrics in a row ─── */
export const SummaryRow = ({ items = [] }) => (
  <div className="sk-summary-row">
    {items.map((item, i) => (
      <div key={i} className="sk-summary-item" style={{ '--accent': item.color || '#6366f1' }}>
        <div className="sk-summary-icon" style={{ background: `${item.color || '#6366f1'}15`, color: item.color || '#6366f1' }}>
          <i className={item.icon}></i>
        </div>
        <div className="sk-summary-value">{item.value}</div>
        <div className="sk-summary-label">{item.label}</div>
      </div>
    ))}
  </div>
)
