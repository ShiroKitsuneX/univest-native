import type { ReactNode } from 'react'
import {
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from 'react-native'
import type { ThemeColors } from '@/theme/palette'

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  T: ThemeColors
}

export function SidePanel({ visible, onClose, children, T }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.panel, { backgroundColor: T.card }]}>
          <View style={[styles.handle, { backgroundColor: T.muted }]} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    width: '85%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
})
