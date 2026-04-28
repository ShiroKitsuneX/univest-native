import { Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Props = {
  uniName: string
  uniColor: string
  isViewed: boolean
  onPress: () => void
  size?: number
}

export function StoryCircle({
  uniName,
  uniColor,
  isViewed,
  onPress,
  size = 68,
}: Props) {
  const { T, brand, shadow } = useTheme()
  const ringColor = isViewed ? T.border : brand.primary
  const ringWidth = isViewed ? 2 : 3

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ alignItems: 'center', marginRight: 14, width: size + 8 }}
    >
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: uniColor,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: ringWidth,
            borderColor: ringColor,
          },
          isViewed ? null : shadow.primary,
        ]}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
          {uniName.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text
        style={{
          color: isViewed ? T.muted : T.text,
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
          maxWidth: size + 12,
        }}
        numberOfLines={1}
      >
        {uniName}
      </Text>
    </TouchableOpacity>
  )
}
