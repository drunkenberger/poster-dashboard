import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

const HASH = 'c85c932b7aa2fb67f60fb4941cb5dd3cc6a2524a1806de76fb898b68e549686c'
const SESSION_KEY = 'poster-auth'

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function PasswordGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  )
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  if (authenticated) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setError(false)

    const hash = await sha256(password)
    if (hash === HASH) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthenticated(true)
    } else {
      setError(true)
      setPassword('')
    }
    setChecking(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('common.appName')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('auth.prompt')}
          </p>
        </div>

        <div className="space-y-2">
          <input
            id="gate-password-051"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('auth.placeholder')}
            autoFocus
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {error && (
            <p className="text-sm text-red-500">{t('auth.error')}</p>
          )}
        </div>

        <button
          id="gate-submit-052"
          type="submit"
          disabled={checking || !password}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-white font-medium transition-colors"
        >
          {checking ? t('common.loading') : t('auth.submit')}
        </button>
      </form>
    </div>
  )
}
