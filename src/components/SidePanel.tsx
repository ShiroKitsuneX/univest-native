import type { ReactNode } from 'react'
import { useRef, useEffect } from 'react'
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from 'react-native'
import type { ThemeColors } from '@/theme/palette'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const PANEL_WIDTH = SCREEN_WIDTH * 0.85

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  T: ThemeColors
}

export function SidePanel({ visible, onClose, children, T }: Props) {
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current
  const backdropAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PANEL_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const translateX = slideAnim.interpolate({
    inputRange: [0, PANEL_WIDTH],
    outputRange: [0, PANEL_WIDTH],
  })

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdropTouch} />
          </TouchableWithoutFeedback>
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: T.card,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: T.muted }]} />
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
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
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
