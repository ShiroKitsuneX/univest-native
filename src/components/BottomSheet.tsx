import type { ReactNode } from 'react'
import { Modal, ScrollView, TouchableWithoutFeedback, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ThemeColors } from '@/theme/palette'

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  T: ThemeColors
}

export function BottomSheet({ visible, onClose, children, T }: Props) {
  const insets = useSafeAreaInsets()

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
                maxHeight: '90%',
                borderTopWidth: 1,
                borderColor: T.border,
                paddingBottom: insets.bottom + 10,
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
