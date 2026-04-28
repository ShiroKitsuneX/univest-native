import { Component, type ReactNode, type ErrorInfo } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { logger } from '@/services/logger'

type Props = { children: ReactNode }
type State = { err: Error | null }

// ErrorBoundary is the safety-net rendered when everything else has failed,
// so hooks aren't available — colours are hardcoded against the dark
// palette specifically. Mirrors the brand violet from `palette.ts > BRAND`.
const FALLBACK = {
  bg: '#0B0B12',
  card: '#15151F',
  text: '#ECEAFB',
  sub: '#9C9AB8',
  primary: '#7C5CFF',
  err: '#F87171',
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err: Error): State {
    return { err }
  }

  componentDidCatch(err: Error, info: ErrorInfo): void {
    logger.error('ErrorBoundary caught:', err, info?.componentStack)
  }

  reset = (): void => this.setState({ err: null })

  render(): ReactNode {
    if (!this.state.err) return this.props.children
    const msg = this.state.err?.message || String(this.state.err)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: FALLBACK.bg,
          padding: 24,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>
          ⚠️
        </Text>
        <Text
          style={{
            color: FALLBACK.text,
            fontSize: 20,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Algo deu errado
        </Text>
        <Text
          style={{
            color: FALLBACK.sub,
            fontSize: 13,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          O app encontrou um erro inesperado.
        </Text>
        <ScrollView
          style={{
            maxHeight: 180,
            backgroundColor: FALLBACK.card,
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
          }}
        >
          <Text
            style={{ color: FALLBACK.err, fontSize: 11, fontFamily: 'Courier' }}
          >
            {msg}
          </Text>
        </ScrollView>
        <TouchableOpacity
          onPress={this.reset}
          style={{
            padding: 14,
            borderRadius: 14,
            backgroundColor: FALLBACK.primary,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}
