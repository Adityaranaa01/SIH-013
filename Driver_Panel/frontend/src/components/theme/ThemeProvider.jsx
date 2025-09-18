import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'light', setTheme: () => { } })

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ defaultTheme = 'light', storageKey = 'smarttransit-theme', children }) {
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage on first render
    const stored = localStorage.getItem(storageKey)
    return (stored === 'light' || stored === 'dark') ? stored : defaultTheme
  })

  useEffect(() => {
    // Apply theme to document and save to localStorage when theme changes
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
