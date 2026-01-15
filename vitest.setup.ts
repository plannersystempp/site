import '@testing-library/jest-dom'

// Polyfill básico para ResizeObserver requerido por cmdk/radix em testes jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Mocking ResizeObserver for testing environment
global.ResizeObserver = global.ResizeObserver || ResizeObserverMock

// jsdom não implementa scrollIntoView; fornecer stub
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function() {}
}

