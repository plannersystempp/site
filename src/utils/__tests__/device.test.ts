import { describe, it, expect } from 'vitest'
import { isIOSSafari, isIOS } from '../../utils/device'

describe('device utils', () => {
  it('detects iOS by UA/mac touch', () => {
    const originalNavigator = globalThis.navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', maxTouchPoints: 5 },
      configurable: true
    })
    expect(isIOS()).toBe(true)
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator })
  })

  it('detects iOS Safari (not Chrome/CriOS)', () => {
    const originalNavigator = globalThis.navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1', platform: 'MacIntel', maxTouchPoints: 10 },
      configurable: true
    })
    expect(isIOSSafari()).toBe(true)
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator })
  })

  it('does not treat iOS Chrome as Safari', () => {
    const originalNavigator = globalThis.navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/114.0.0.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', maxTouchPoints: 5 },
      configurable: true
    })
    expect(isIOSSafari()).toBe(false)
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator })
  })
})
