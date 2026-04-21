import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
  Animated,
  Modal,
  PanResponder,
} from 'react-native'
import { useStoriesStore } from '@/stores/storiesStore'

const { width } = Dimensions.get('window')
const STORY_DURATION = 5000
const SWIPE_THRESHOLD = 50

export function StoryViewer({ visible, stories, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const progressAnim = useRef(new Animated.Value(0)).current
  const animationRef = useRef(null)
  const imageLoadedRef = useRef(false)

  const markViewed = useStoriesStore(s => s.markViewed)

  const currentStory = stories[currentIndex]
  const isLastStory = currentIndex === stories.length - 1
  const isFirstStory = currentIndex === 0

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop()
      animationRef.current = null
    }
  }, [])

  const resetAnimation = useCallback(() => {
    stopAnimation()
    progressAnim.setValue(0)
    imageLoadedRef.current = false
  }, [stopAnimation, progressAnim])

  const goToNext = useCallback(() => {
    stopAnimation()
    if (isLastStory) {
      onClose()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [isLastStory, onClose, stopAnimation])

  const goToPrev = useCallback(() => {
    stopAnimation()
    if (!isFirstStory) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [isFirstStory, stopAnimation])

  useEffect(() => {
    if (!visible || !currentStory) return

    markViewed(currentStory.id)
    resetAnimation()
    imageLoadedRef.current = true

    animationRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    })

    animationRef.current.start(({ finished }) => {
      if (finished && imageLoadedRef.current && !isLastStory) {
        setCurrentIndex(prev => prev + 1)
      } else if (finished && imageLoadedRef.current && isLastStory) {
        onClose()
      }
    })

    return () => {
      stopAnimation()
    }
  }, [visible, currentIndex, currentStory])

  const handleTap = useCallback(
    x => {
      if (x < width / 3) {
        goToPrev()
      } else if (x > (width * 2) / 3) {
        goToNext()
      }
    },
    [goToPrev, goToNext]
  )

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState
        if (dx <= -SWIPE_THRESHOLD) {
          goToNext()
        } else if (dx >= SWIPE_THRESHOLD) {
          goToPrev()
        } else if (dy >= SWIPE_THRESHOLD) {
          onClose()
        }
      },
    })
  ).current

  if (!visible || !currentStory) return null

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container} {...panResponder.panHandlers}>
        <StatusBar barStyle="light-content" />

        <TouchableOpacity
          activeOpacity={1}
          style={styles.imageContainer}
          onPress={e => handleTap(e.nativeEvent.locationX)}
        >
          <Image
            source={{ uri: currentStory.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.uniInfo}>
              <View
                style={[
                  styles.uniAvatar,
                  { backgroundColor: currentStory.uniColor },
                ]}
              >
                <Text style={styles.uniInitial}>
                  {currentStory.uniName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.uniName}>{currentStory.uniName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            {stories.map((s, i) => (
              <View key={s.id} style={styles.progressBarBg}>
                {i < currentIndex ? (
                  <View style={styles.progressBarFill} />
                ) : i === currentIndex ? (
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                ) : (
                  <View style={styles.progressBarEmpty} />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uniInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uniInitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  uniName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  progressBarEmpty: {
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 1,
  },
})
