export function Skeleton({ width = '100%', height = 20, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 8, ...style }}
    />
  )
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}><Skeleton height={14} /></td>
      ))}
    </tr>
  )
}

export function SkeletonCard({ height = 120 }) {
  return <div className="skeleton" style={{ width: '100%', height, borderRadius: 16 }} />
}

export function LoadingSpinner({ size = 32, centered = false }) {
  const style = {
    width: size,
    height: size,
    border: '3px solid rgba(232,98,122,0.2)',
    borderTopColor: 'var(--color-rose)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  }
  if (centered) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
        <div style={style} />
      </div>
    )
  }
  return <div style={style} />
}
