import type { ReactNode } from 'react'
import { useRef, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from 'react-native'
import type { ThemeColors } from '@/theme/palette'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const PANEL_WIDTH = SCREEN_WIDTH * 0.75
const TAB_BAR_HEIGHT = 50

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  T: ThemeColors
}

export function SidePanel({ visible, onClose, children, T }: Props) {
  const insets = useSafeAreaInsets()
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  const panelTop = insets.top

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : PANEL_WIDTH,
        duration: 320,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: 240,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start()
  }, [visible])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdropTouch} />
          </TouchableWithoutFeedback>
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: T.card,
              transform: [{ translateX: slideAnim }],
              top: panelTop,
              bottom: TAB_BAR_HEIGHT + insets.bottom,
            },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {children}
          </ScrollView>
        </Animated.View>
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
  backdropTouch: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    right: 0,
    width: PANEL_WIDTH,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
})
