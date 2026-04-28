import type { ReactNode } from 'react'
import {
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import type { ThemeColors } from '@/theme/palette'

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  // Theme colours from `useTheme()`. Passed down rather than read here so the
  // sheet stays a thin presentational shell with no store dependency.
  T: ThemeColors
  height?: number
}

export function BottomSheet({
  visible,
  onClose,
  children,
  T,
  height = 200,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: T.card,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                minHeight: height,
                borderTopWidth: 1,
                borderColor: T.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: T.muted,
                  opacity: 0.5,
                  borderRadius: 2,
                  alignSelf: 'center',
                  marginTop: 10,
                  marginBottom: 6,
                }}
              />
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              >
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
