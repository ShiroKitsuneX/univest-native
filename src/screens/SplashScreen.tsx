import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

export function SplashScreen() {
  const { T, isDark, brand, radius, typography, shadow } = useTheme()

  return (
    <View style={[styles.wrap, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View
        style={[
          styles.logoTile,
          {
            backgroundColor: T.card,
            borderRadius: radius.xl,
            borderColor: T.border,
          },
          shadow.primary,
        ]}
      >
        <Text style={styles.logoEmoji}>🎓</Text>
      </View>
      <Text style={[typography.title, { color: T.text, marginBottom: 6 }]}>
        Uni<Text style={{ color: brand.primary }}>Vest</Text>
      </Text>
      <Text
        style={[
          typography.body,
          { color: T.sub, marginBottom: 32, textAlign: 'center' },
        ]}
      >
        Sua jornada acadêmica começa aqui
      </Text>
      <ActivityIndicator size="large" color={brand.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoTile: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    borderWidth: 1,
  },
  logoEmoji: { fontSize: 52 },
})
