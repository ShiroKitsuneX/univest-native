import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@/theme/useTheme'

export function StoryCircle({
  uniName,
  uniColor,
  isViewed,
  onPress,
  size = 64,
}) {
  const { T, isDark } = useTheme()

  const ringColor = isViewed ? T.muted : uniColor
  const ringWidth = isViewed ? 2 : 2.5

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ alignItems: 'center', marginRight: 12, width: size + 4 }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: uniColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ringWidth,
          borderColor: ringColor,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>
          {uniName.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text
        style={{
          color: isViewed ? T.muted : T.text,
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          maxWidth: size + 8,
        }}
        numberOfLines={1}
      >
        {uniName}
      </Text>
    </TouchableOpacity>
  )
}
