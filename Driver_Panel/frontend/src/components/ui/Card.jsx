import React from 'react'

export function Card({ className = '', children }) {
  return <div className={["card", "card-glass", className].join(' ').trim()}>{children}</div>
}
export function CardHeader({ className = '', children }) {
  return <div className={["card-header", className].join(' ').trim()}>{children}</div>
}
export function CardContent({ className = '', children }) {
  return <div className={["card-content", className].join(' ').trim()}>{children}</div>
}
export function CardFooter({ className = '', children }) {
  return <div className={["card-footer", className].join(' ').trim()}>{children}</div>
}
