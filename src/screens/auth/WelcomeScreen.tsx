import { useRef } from 'react'
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { useIcons } from '@/stores/hooks/useIcons'

const TIERS: Array<[id: string, ic: string, label: string, tint: string]> = [
  ['vestibular', '🎯', 'Vestibulares & ENEM', '#7C5CFF'],
  ['graduacao', '🎓', 'Graduação & Pós-graduação', '#A78BFA'],
  ['mestrado', '🔬', 'Mestrado & Doutorado', '#6366F1'],
  ['tecnico', '📚', 'Ensino Médio & Técnico', '#0EA5E9'],
  ['cursos', '📖', 'Cursos e outros', '#F59E0B'],
]

export function WelcomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets()
  const { T, isDark, brand, radius, typography, shadow } = useTheme()
  const getIcon = useIcons()

  const loginBtnScale = useRef(new Animated.Value(1)).current

  const handleEnterPress = () => {
    Animated.spring(loginBtnScale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start()
    setTimeout(() => {
      Animated.spring(loginBtnScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
      navigation?.navigate('Login')
    }, 100)
  }

  return (
    <View style={[styles.wrap, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        bounces={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 28,
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 28,
        }}
      >
        <View
          style={[
            styles.logoTile,
            {
              backgroundColor: T.card,
              borderColor: T.border,
              borderRadius: radius.xl,
              alignSelf: 'center',
            },
            shadow.primary,
          ]}
        >
          <Text style={styles.logoEmoji}>🎓</Text>
        </View>
        <Text
          style={[
            typography.title,
            { color: T.text, textAlign: 'center', marginBottom: 6 },
          ]}
        >
          Uni<Text style={{ color: brand.primary }}>Vest</Text>
        </Text>
        <Text
          style={[
            typography.body,
            {
              color: T.sub,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 28,
              paddingHorizontal: 12,
            },
          ]}
        >
          Seu portal inteligente para toda a jornada acadêmica
        </Text>
        <View style={{ gap: 10, marginBottom: 32 }}>
          {TIERS.map(([id, ic, l, cor]) => (
            <View
              key={id}
              style={[
                styles.tierRow,
                {
                  backgroundColor: T.card,
                  borderColor: T.border,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <View
                style={[
                  styles.tierIcon,
                  { backgroundColor: cor + '22', borderRadius: radius.sm },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{getIcon(id, ic)}</Text>
              </View>
              <Text
                style={{
                  color: T.text,
                  fontSize: 14,
                  fontWeight: '600',
                  flex: 1,
                }}
              >
                {l}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={handleEnterPress} activeOpacity={0.9}>
          <Animated.View
            style={[
              styles.cta,
              {
                backgroundColor: brand.primary,
                borderRadius: radius.md,
                transform: [{ scale: loginBtnScale }],
              },
              shadow.primary,
            ]}
          >
            <Text style={styles.ctaText}>Entrar ou criar conta</Text>
          </Animated.View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: 'hidden' },
  logoTile: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
  },
  logoEmoji: { fontSize: 48 },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 14,
  },
  tierIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    padding: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
})
