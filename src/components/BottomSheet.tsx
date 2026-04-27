import type { ReactNode } from 'react'
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import type { ThemeColors } from '@/theme/palette'

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
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
            backgroundColor: 'rgba(0,0,0,.72)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: T.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                minHeight: height,
                borderTopWidth: 1,
                borderColor: T.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  backgroundColor: T.border,
                  borderRadius: 2,
                  alignSelf: 'center',
                  marginTop: 12,
                  marginBottom: 4,
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
