import { View, Text, TouchableOpacity } from 'react-native'

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
  const ringColor = isViewed ? 'rgba(139, 92, 246, 0.3)' : '#A855F7'
  const ringWidth = isViewed ? 2 : 3

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ alignItems: 'center', marginRight: 14, width: size + 8 }}
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
          shadowColor: isViewed ? 'transparent' : '#A855F7',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isViewed ? 0 : 0.4,
          shadowRadius: isViewed ? 0 : 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
          {uniName.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text
        style={{
          color: isViewed ? '#6b7280' : '#e6edf3',
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
