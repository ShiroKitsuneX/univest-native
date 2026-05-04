import { useRef, useState } from 'react'
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { Button } from '@/shared/components'
import { useAuthStore } from '@/stores/authStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { setOnboardingDone } from '@/features/onboarding/repositories/onboardingRepository'
import { logger } from '@/core/logging/logger'

type Slide = {
  emoji: string
  title: string
  body: string
  accent: 'progress' | 'simulado' | 'goal' | 'news' | 'notas'
}

const SLIDES: Slide[] = [
  {
    emoji: '📣',
    title: 'Você publica direto no feed',
    body: 'Use o botão flutuante "+" na aba Feed para publicar Notícias, Listas de Obras, Inscrições, Notas de Corte e Simulados. Quem segue sua universidade vê tudo no feed deles.',
    accent: 'news',
  },
  {
    emoji: '📸',
    title: 'Stories ficam 24 horas no topo',
    body: 'Mesmo botão "+" abre o composer de stories. É a forma rápida de mostrar bastidores, eventos do dia e prazos curtos.',
    accent: 'simulado',
  },
  {
    emoji: '📊',
    title: 'Analytics no seu perfil',
    body: 'A aba Perfil é o seu painel: seguidores, alcance dos posts, engajamento dos últimos 30 dias, e o post de maior performance.',
    accent: 'progress',
  },
  {
    emoji: '🎨',
    title: 'Personalize a identidade visual',
    body: 'Toque em "Editar perfil" para alterar a cor da universidade, descrição, vestibular, cursos e livros obrigatórios.',
    accent: 'goal',
  },
]

export function InstitutionOnboardingScreen() {
  const insets = useSafeAreaInsets()
  const { T, isDark, brand, radius, typography, domain, shadow } = useTheme()
  const setDone = useOnboardingStore(s => s.setDone)
  const currentUser = useAuthStore(s => s.currentUser)
  const linkedUniId = useAuthStore(s => s.getLinkedUniId)()
  const unis = useUniversitiesStore(s => s.unis)
  const linkedUni = unis.find(u => String(u.id) === String(linkedUniId))

  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const fade = useRef(new Animated.Value(1)).current

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  const advance = (next: number) => {
    Animated.timing(fade, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setIndex(next)
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    })
  }

  const handleNext = async () => {
    if (!isLast) {
      advance(index + 1)
      return
    }
    setSubmitting(true)
    setDone(true)
    if (currentUser) {
      try {
        await setOnboardingDone(currentUser.uid)
      } catch (err) {
        logger.warn(
          'institution onboarding finish:',
          (err as Error)?.message
        )
      }
    }
    setSubmitting(false)
  }

  const accent = domain[slide.accent]

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 12,
          paddingBottom: 8,
        }}
      >
        <Text style={[typography.eyebrow, { color: T.muted }]}>
          BOAS-VINDAS · CONTA INSTITUCIONAL
        </Text>
        <Text
          style={[
            typography.title,
            { color: T.text, marginTop: 2, fontSize: 22 },
          ]}
          numberOfLines={1}
        >
          {linkedUni?.name || 'Sua universidade'}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 100,
          alignItems: 'center',
        }}
      >
        <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
          <View
            style={[
              styles.glyphTile,
              {
                backgroundColor: accent.bg,
                borderRadius: radius.xl,
              },
              shadow.card,
            ]}
          >
            <Text style={{ fontSize: 56 }}>{slide.emoji}</Text>
          </View>
          <Text
            style={[
              typography.title,
              {
                color: T.text,
                marginTop: 24,
                fontSize: 26,
                textAlign: 'center',
                paddingHorizontal: 8,
              },
            ]}
          >
            {slide.title}
          </Text>
          <Text
            style={{
              color: T.sub,
              fontSize: 14,
              lineHeight: 22,
              textAlign: 'center',
              marginTop: 12,
              maxWidth: 320,
            }}
          >
            {slide.body}
          </Text>
        </Animated.View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: insets.bottom + 12,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === index ? brand.primary : T.border,
              }}
            />
          ))}
        </View>
        <Button
          onPress={handleNext}
          variant="primary"
          size="lg"
          loading={submitting}
          fullWidth
        >
          {isLast ? 'Começar 🚀' : 'Continuar →'}
        </Button>
        {!isLast && (
          <Text
            onPress={() => advance(SLIDES.length - 1)}
            style={{
              color: T.muted,
              fontSize: 12,
              textAlign: 'center',
              marginTop: 10,
              fontWeight: '600',
            }}
          >
            Pular tutorial
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  glyphTile: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
