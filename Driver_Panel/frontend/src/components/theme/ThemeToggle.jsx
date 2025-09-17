import React from 'react'
import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'
import { Button } from '../ui/Button'

export function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <Button
      variant="outline"
      className={`border-border bg-card ${className}`}
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="w-4 h-4 stroke-amber-50" /> : <Moon className="w-4 h-4" />}
    </Button>
  )
}
