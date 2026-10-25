import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** Ersatzinhalt; `reset` versucht es erneut */
  fallback: (reset: () => void) => ReactNode
  /** ändert sich der Wert (z. B. beim Screenwechsel), wird der Fehlerzustand zurückgesetzt */
  resetKey?: unknown
  children: ReactNode
}

interface ErrorBoundaryState {
  failed: boolean
  resetKey?: unknown
}

/**
 * Fängt Fehler beim Rendern und in Effekten der Kinder ab, damit nicht die ganze App verschwindet.
 * (React erlaubt Fehlergrenzen nur als Klassenkomponente.)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { failed: true }
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    return props.resetKey !== state.resetKey ? { failed: false, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[DigiFL]', error, info.componentStack)
  }

  private reset = () => this.setState({ failed: false })

  render() {
    return this.state.failed ? this.props.fallback(this.reset) : this.props.children
  }
}
