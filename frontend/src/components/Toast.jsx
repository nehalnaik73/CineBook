import { useState, createContext, useContext, useCallback } from 'react'
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`slide-up flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium shadow-xl border ${
            t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            'bg-white border-stone-200 text-stone-700'
          }`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
export const useToast = () => useContext(ToastContext)
