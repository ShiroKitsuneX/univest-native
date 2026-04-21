import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import type { ThemeColors } from '@/theme/palette'

type Props = {
  val: string
  set: (v: string) => void
  ph: string
  T: ThemeColors
}

export function SBox({ val, set, ph, T }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: T.inp,
        borderRadius: 13,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderWidth: 1,
        borderColor: T.inpB,
      }}
    >
      <Text style={{ fontSize: 14, marginRight: 10 }}>🔍</Text>
      <TextInput
        value={val}
        onChangeText={set}
        placeholder={ph}
        placeholderTextColor={T.muted}
        style={{ flex: 1, color: T.text, fontSize: 14, padding: 0 }}
      />
      {!!val && (
        <TouchableOpacity onPress={() => set('')}>
          <Text style={{ color: T.muted, fontSize: 13 }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
