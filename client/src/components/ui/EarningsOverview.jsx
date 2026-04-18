import { useState, useEffect, useMemo } from 'react'
import api from '../../services/api'
import PieChart from './PieChart'

const EarningsOverview = ({ apiUrl = '/dashboard/earnings/breakdown', title = 'Earnings Overview', currencyLabel = 'Earnings' }) => {
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get(apiUrl)
      .then(res => {
        if (!cancelled) {
          setEarnings(res.data.earnings)
          setError(null)
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load earnings')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [apiUrl])

  const pieData = useMemo(() => {
    if (!earnings) return []
    const onlyToday = earnings.daily
    const weekExclToday = Math.max(0, earnings.weekly - earnings.daily)
    const monthExclWeek = Math.max(0, earnings.monthly - earnings.weekly)
    const yearExclMonth = Math.max(0, earnings.yearly - earnings.monthly)
    return [
      { label: "Today's", value: onlyToday, color: '#10b981' },
      { label: 'This Week', value: weekExclToday, color: '#6366f1' },
      { label: 'This Month', value: monthExclWeek, color: '#0ea5e9' },
      { label: 'This Year', value: yearExclMonth, color: '#f59e0b' },
    ].filter(i => i.value > 0)
  }, [earnings])

  if (loading) {
    return (
      <div className="sk-analytics-card sk-animate">
        <div className="sk-analytics-header">
          <h3><i className="fas fa-chart-pie"></i> {title}</h3>
        </div>
        <div className="sk-analytics-body" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="sk-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '12px' }}>Loading earnings data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sk-analytics-card sk-animate">
        <div className="sk-analytics-header">
          <h3><i className="fas fa-chart-pie"></i> {title}</h3>
        </div>
        <div className="sk-analytics-body" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!earnings) return null

  const periods = [
    { key: 'daily', label: "Today's " + currencyLabel, icon: 'fa-sun', color: '#10b981', bg: '#ecfdf5' },
    { key: 'weekly', label: "This Week", icon: 'fa-calendar-week', color: '#6366f1', bg: '#eef2ff' },
    { key: 'monthly', label: "This Month", icon: 'fa-calendar-alt', color: '#0ea5e9', bg: '#e0f2fe' },
    { key: 'yearly', label: "This Year", icon: 'fa-calendar', color: '#f59e0b', bg: '#fefce8' },
  ]

  return (
    <div className="sk-analytics-card sk-animate">
      <div className="sk-analytics-header">
        <h3><i className="fas fa-chart-pie"></i> {title}</h3>
        <span className="sk-badge sk-badge-success">₹{(earnings.total || 0).toLocaleString()} total</span>
      </div>
      <div className="sk-analytics-body">
        {/* Earnings Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {periods.map(p => (
            <div key={p.key} style={{
              padding: '16px', borderRadius: '12px', background: p.bg,
              border: `1px solid ${p.color}20`, textAlign: 'center', transition: 'transform 0.2s'
            }}>
              <i className={`fas ${p.icon}`} style={{ color: p.color, fontSize: '1.1rem', marginBottom: '8px', display: 'block' }}></i>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                ₹{(earnings[p.key] || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {pieData.length > 0 ? (
            <PieChart data={pieData} size={200} innerRadius={0.6} showLegend={true} />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <i className="fas fa-coins" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '8px', display: 'block' }}></i>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No earnings data to visualize</p>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600 }}>Period</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#64748b', fontWeight: 600 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {periods.map(p => (
                <tr key={p.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }}></span>
                    {p.label}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    ₹{(earnings[p.key] || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: '8px' }}></span>
                  All Time Total
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                  ₹{(earnings.total || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EarningsOverview
