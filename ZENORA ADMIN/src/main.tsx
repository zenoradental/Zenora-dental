import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

// Inert unless VITE_SENTRY_DSN is set at build time, so local dev is unaffected.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string) || import.meta.env.MODE,
    tracesSampleRate: 0,
    // This dashboard displays patient records. Never ship request bodies, form
    // values, or session replays to an external service.
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
      }
      return event;
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#3f3f46',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#18181b' }}>
            Something went wrong
          </h1>
          <p style={{ margin: 0, fontSize: '14px', maxWidth: '420px' }}>
            The dashboard hit an unexpected error and the problem has been reported.
            Reloading usually clears it.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#18181b',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload dashboard
          </button>
        </div>
      }
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
