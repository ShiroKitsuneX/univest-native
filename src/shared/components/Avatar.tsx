import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { AVATAR_COLORS, AVATAR_PRESETS } from '@/theme/avatar'
import { useTheme } from '@/theme/useTheme'

type Props = {
  // Direct emoji/glyph to render. Wins over `avatarIdx` if provided. Use
  // when the upstream profile stores the glyph as a string (e.g.
  // `profileStore.av`).
  glyph?: string
  // Index into AVATAR_PRESETS — fallback when `glyph` is omitted.
  avatarIdx?: number
  // Index into AVATAR_COLORS (gradient pair). Falls back to first pair.
  bgIdx?: number
  size?: number
  // Adds a violet ring around the avatar (used for unviewed-story / active
  // states). Ring colour is the brand primary.
  ring?: boolean
  // Slight inner border so the avatar reads on busy backgrounds.
  bordered?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export function Avatar({
  glyph,
  avatarIdx = 0,
  bgIdx = 0,
  size = 44,
  ring = false,
  bordered = true,
  onPress,
  style,
}: Props) {
  const { T, brand } = useTheme()
  const emoji = glyph ?? AVATAR_PRESETS[avatarIdx % AVATAR_PRESETS.length]
  const color = AVATAR_COLORS[bgIdx % AVATAR_COLORS.length][0]
  const ringSize = ring ? size + 6 : size
  const innerSize = size

  const inner = (
    <View
      style={[
        styles.center,
        {
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          backgroundColor: ring ? brand.primary : 'transparent',
          padding: ring ? 2 : 0,
        },
        style,
      ]}
    >
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: color,
          borderWidth: bordered ? 2 : 0,
          borderColor: T.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: innerSize * 0.5 }}>{emoji}</Text>
      </View>
    </View>
  )

  if (!onPress) return inner
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      {inner}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
})
