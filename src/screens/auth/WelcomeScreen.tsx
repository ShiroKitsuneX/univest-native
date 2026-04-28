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
      toValue: 0.96,
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
    <View style={{ flex: 1, backgroundColor: T.bg, overflow: 'hidden' }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Soft violet halo behind the hero — gives the screen depth without
          a gradient lib. Three stacked rgba-violet circles. */}
      <View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            top: insets.top - 80,
            backgroundColor: brand.primary,
            opacity: isDark ? 0.18 : 0.12,
          },
        ]}
      />

      <ScrollView
        bounces={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 28,
          paddingTop: insets.top + 56,
          paddingBottom: insets.bottom + 28,
        }}
      >
        {/* Hero block — big logo tile with primary glow, centered display
            wordmark, supportive subtitle. Matches the inspiration pattern
            of "big anchor + supportive caption" for landing screens. */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View
            style={[
              styles.logoTile,
              {
                backgroundColor: brand.primary,
                borderRadius: radius.xl,
              },
              shadow.primary,
            ]}
          >
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <Text
            style={[
              typography.title,
              {
                color: T.text,
                fontSize: 36,
                marginTop: 18,
                textAlign: 'center',
                letterSpacing: -1,
              },
            ]}
          >
            Uni<Text style={{ color: brand.primary }}>Vest</Text>
          </Text>
          <Text
            style={{
              color: T.sub,
              fontSize: 15,
              textAlign: 'center',
              marginTop: 8,
              maxWidth: 300,
              lineHeight: 22,
            }}
          >
            Sua jornada acadêmica começa aqui ✨
          </Text>
        </View>

        {/* Tier list — soft rounded cards, icon tile in the tier colour at
            22% opacity, label on the right. Less visual noise than coloured
            backgrounds; the colour reads as a category cue, not a fill. */}
        <View style={{ gap: 8, marginBottom: 24 }}>
          {TIERS.map(([id, ic, l, cor]) => (
            <View
              key={id}
              style={[
                styles.tierRow,
                {
                  backgroundColor: T.card,
                  borderColor: T.border,
                  borderRadius: radius.md,
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
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: cor,
                }}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={handleEnterPress} activeOpacity={0.92}>
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

        <Text
          style={{
            color: T.muted,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          Ao continuar você concorda com nossos termos
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    alignSelf: 'center',
  },
  logoTile: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 44 },
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
