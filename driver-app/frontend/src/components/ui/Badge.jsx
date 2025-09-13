import React from 'react'

export function Badge({ variant = 'default', className = '', children }) {
  const variants = {
    default: 'badge',
    success: 'badge badge-success',
    muted: 'badge badge-muted'
  };
  return <span className={[variants[variant] || variants.default, className].join(' ').trim()}>{children}</span>
}
