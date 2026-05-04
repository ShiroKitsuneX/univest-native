import { Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'

type Props = {
  visible: boolean
  onClose: () => void
  onPickPost: () => void
  onPickStory: () => void
}

// Lightweight chooser between the two institution authoring flows.
// Lifted out of any single screen so the floating "+" on the Feed tab and
// any future entry point (e.g. a quick action) can reuse the same sheet.
export function CreatorActionSheet({
  visible,
  onClose,
  onPickPost,
  onPickStory,
}: Props) {
  const { T, brand, radius, typography, domain } = useTheme()

  const Option = ({
    icon,
    title,
    description,
    accent,
    onPress,
  }: {
    icon: string
    title: string
    description: string
    accent: { bg: string; fg: string }
    onPress: () => void
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: T.card2,
        borderColor: T.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: 14,
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: radius.md,
          backgroundColor: accent.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.headline, { color: T.text, fontSize: 15 }]}>
          {title}
        </Text>
        <Text
          style={{ color: T.sub, fontSize: 12, marginTop: 2, lineHeight: 17 }}
        >
          {description}
        </Text>
      </View>
      <Text style={{ color: brand.primary, fontSize: 18, fontWeight: '800' }}>
        ›
      </Text>
    </TouchableOpacity>
  )

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding: 20, paddingBottom: 24, gap: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <View>
            <Text style={[typography.eyebrow, { color: T.muted }]}>CRIAR</Text>
            <Text
              style={[typography.headline, { color: T.text, marginTop: 2 }]}
            >
              O que você quer publicar?
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: T.card2,
              borderColor: T.border,
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: T.sub, fontSize: 16, fontWeight: '700' }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <Option
          icon="📣"
          title="Publicação"
          description="Anúncios, listas de obras, simulados, notícias — fica fixo no feed."
          accent={domain.news}
          onPress={onPickPost}
        />
        <Option
          icon="📸"
          title="Story (24h)"
          description="Foto que expira em 24 horas no topo do feed."
          accent={domain.simulado}
          onPress={onPickStory}
        />
      </View>
    </BottomSheet>
  )
}
