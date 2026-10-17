import '@mantine/core/styles.css'
import React from 'react'
import { createRoot } from 'react-dom/client'

import { MantineProvider } from '@mantine/core'

import App from './App.js'
import { theme } from './theme.js'
import './styles.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('React root element was not found')
}

createRoot(root).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
)
