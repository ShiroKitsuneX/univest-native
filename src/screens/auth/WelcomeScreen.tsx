import { useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { useIcons } from '@/stores/hooks/useIcons'

export function WelcomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets()
  const { T, isDark, AT } = useTheme()
  const getIcon = useIcons()

  const loginBtnScale = useRef(new Animated.Value(1)).current

  const handleEnterPress = () => {
    Animated.spring(loginBtnScale, {
      toValue: 0.9,
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
        <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 14 }}>
          🎓
        </Text>
        <Text
          style={{
            fontSize: 34,
            fontWeight: '800',
            color: T.text,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Uni<Text style={{ color: T.accent }}>Vest</Text>
        </Text>
        <Text
          style={{
            color: T.sub,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          Seu portal inteligente para toda a jornada acadêmica
        </Text>
        <View style={{ gap: 10, marginBottom: 32 }}>
          {[
            ['vestibular', '🎯', 'Vestibulares & ENEM', '#e11d48'],
            ['graduacao', '🎓', 'Graduação & Pós-graduação', '#7c3aed'],
            ['mestrado', '🔬', 'Mestrado & Doutorado', '#2563eb'],
            ['tecnico', '📚', 'Ensino Médio & Técnico', '#059669'],
            ['cursos', '📖', 'Cursos e outros', '#f59e0b'],
          ].map(([id, ic, l, cor]) => (
            <View
              key={id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: T.card,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: T.border,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: cor + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
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
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: T.accent,
              alignItems: 'center',
              transform: [{ scale: loginBtnScale }],
              shadowColor: T.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Text style={{ color: AT, fontSize: 16, fontWeight: '800' }}>
              Entrar ou criar conta
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
