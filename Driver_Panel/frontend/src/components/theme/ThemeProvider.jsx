import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'light', setTheme: () => { } })

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ defaultTheme = 'light', storageKey = 'safarsaathi-theme', children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(storageKey)
    return (stored === 'light' || stored === 'dark') ? stored : defaultTheme
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
