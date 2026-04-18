import { useMemo } from 'react'

const PieChart = ({ 
  data = [], 
  size = 200, 
  innerRadius = 0.6, 
  showLegend = true,
  showLabels = false,
  title = ''
}) => {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data])
  
  const slices = useMemo(() => {
    let currentAngle = -90 // Start from top
    return data.map((item) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0
      const angle = (percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle
      
      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
      }
    })
  }, [data, total])

  const center = size / 2
  const radius = size / 2 - 10
  const innerRadiusPx = radius * innerRadius

  const getArcPath = (startAngle, endAngle, outerR, innerR) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = center + outerR * Math.cos(startRad)
    const y1 = center + outerR * Math.sin(startRad)
    const x2 = center + outerR * Math.cos(endRad)
    const y2 = center + outerR * Math.sin(endRad)
    const x3 = center + innerR * Math.cos(endRad)
    const y3 = center + innerR * Math.sin(endRad)
    const x4 = center + innerR * Math.cos(startRad)
    const y4 = center + innerR * Math.sin(startRad)
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    if (innerR === 0) {
      // Full pie slice
      return `M ${center} ${center} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    }
    
    // Donut slice
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`
  }

  const defaultColors = [
    '#6366f1', // indigo
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#84cc16', // lime
  ]

  if (!data.length || total === 0) {
    return (
      <div className="text-center p-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill="none" 
            stroke="#e5e7eb" 
            strokeWidth={radius - innerRadiusPx || 2}
          />
          <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" fill="#9ca3af" fontSize="14">
            No data
          </text>
        </svg>
      </div>
    )
  }

  return (
    <div className="pie-chart-container">
      {title && <h6 className="text-center mb-3 text-muted">{title}</h6>}
      
      <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, index) => {
            if (slice.percentage === 0) return null
            
            // Handle 100% case
            if (slice.percentage >= 99.9) {
              return (
                <circle 
                  key={index}
                  cx={center} 
                  cy={center} 
                  r={(radius + innerRadiusPx) / 2}
                  fill="none"
                  stroke={slice.color || defaultColors[index % defaultColors.length]}
                  strokeWidth={radius - innerRadiusPx}
                />
              )
            }
            
            return (
              <path
                key={index}
                d={getArcPath(slice.startAngle, slice.endAngle, radius, innerRadiusPx)}
                fill={slice.color || defaultColors[index % defaultColors.length]}
                stroke="#fff"
                strokeWidth={2}
                className="pie-slice"
                style={{ transition: 'opacity 0.2s' }}
              >
                <title>{`${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
              </path>
            )
          })}
          
          {/* Center text */}
          {innerRadius > 0 && (
            <text x={center} y={center} textAnchor="middle" dominantBaseline="middle">
              <tspan x={center} dy="-5" fontSize="18" fontWeight="bold" fill="#1e293b">
                {total.toLocaleString()}
              </tspan>
              <tspan x={center} dy="20" fontSize="12" fill="#64748b">
                Total
              </tspan>
            </text>
          )}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="pie-legend">
            {slices.map((slice, index) => (
              <div key={index} className="d-flex align-items-center gap-2 mb-2">
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '3px',
                    backgroundColor: slice.color || defaultColors[index % defaultColors.length]
                  }}
                />
                <span className="small text-muted">{slice.label}</span>
                <span className="small fw-semibold ms-auto">{slice.value}</span>
                <span className="small text-muted">({slice.percentage.toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pie-chart-container {
          padding: 16px;
        }
        .pie-slice:hover {
          opacity: 0.8;
          cursor: pointer;
        }
        .pie-legend {
          min-width: 150px;
        }
      `}</style>
    </div>
  )
}

export default PieChart
