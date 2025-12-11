import { useEffect, useMemo, useState } from 'react'

type Variant = 'A' | 'B'

const STORAGE_KEY = 'lp_ab_variant'

export function useABVariant(): Variant {
  const [variant, setVariant] = useState<Variant>('A')

  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const param = url.searchParams.get('ab')
      if (param === 'A' || param === 'B') {
        localStorage.setItem(STORAGE_KEY, param)
        setVariant(param)
        return
      }

      const stored = localStorage.getItem(STORAGE_KEY) as Variant | null
      if (stored === 'A' || stored === 'B') {
        setVariant(stored)
        return
      }

      const random = Math.random() < 0.5 ? 'A' : 'B'
      localStorage.setItem(STORAGE_KEY, random)
      setVariant(random)
    } catch {
      setVariant('A')
    }
  }, [])

  return variant
}

