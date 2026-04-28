import { StyleSheet, Text, View } from 'react-native'

type Props = {
  size?: number
  // Override the default platform blue (Twitter / Instagram-style verified
  // mark). The badge intentionally does NOT use the brand violet — verified
  // is a *platform attestation* signal, not a UniVest brand affordance, and
  // platform-blue is the universally-readable convention.
  color?: string
}

const DEFAULT_BLUE = '#1D9BF0'

// Inline ✓ badge rendered next to verified institution names. Behaves like
// punctuation — sits on the baseline, scales with the surrounding text.
// Source of truth for "is this institution verified?" is the `verified`
// flag on the University document.
export function VerifiedBadge({ size = 12, color = DEFAULT_BLUE }: Props) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size + 4,
          height: size + 4,
          borderRadius: (size + 4) / 2,
          backgroundColor: color,
        },
      ]}
      accessibilityLabel="Conta verificada"
    >
      <Text style={[styles.check, { fontSize: size - 2 }]}>✓</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: undefined,
  },
})
