import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, Image, TouchableOpacity, Dimensions, StyleSheet,
  StatusBar, Animated, Modal, PanResponder, Alert,
} from "react-native";
import { useStoriesStore } from "../stores/storiesStore";

const { width, height } = Dimensions.get("window");
const STORY_DURATION = 5000;

export function StoryViewer({ visible, stories, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const imageLoadedRef = useRef(false);

  const markViewed = useStoriesStore(s => s.markViewed);

  const currentStory = stories[currentIndex];
  const isLastStory = currentIndex === stories.length - 1;

  const resetAnimation = useCallback(() => {
    progressAnim.setValue(0);
    imageLoadedRef.current = false;
  }, [progressAnim]);

  const startProgress = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    progressAnim.setValue(0);
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && visible && imageLoadedRef.current) {
        if (isLastStory) {
          onClose();
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }
    });
  }, [visible, isLastStory, onClose, progressAnim]);

  useEffect(() => {
    if (visible && currentStory) {
      markViewed(currentStory.id);
      resetAnimation();
      setTimeout(() => {
        imageLoadedRef.current = true;
        startProgress();
      }, 100);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, currentIndex, currentStory]);

  useEffect(() => {
    if (currentIndex > 0 && visible) {
      resetAnimation();
      setTimeout(() => {
        imageLoadedRef.current = true;
        startProgress();
      }, 100);
    }
  }, [currentIndex, visible]);

  const nextStory = () => {
    if (isLastStory) {
      onClose();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = (event) => {
    const x = event.nativeEvent.locationX;
    if (x < width / 3) {
      prevStory();
    } else if (x > (width * 2) / 3) {
      nextStory();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          progressAnim.setValue(1 - gestureState.dy / 200);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          onClose();
        } else {
          startProgress();
        }
      },
    })
  ).current;

  if (!visible || !currentStory) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container} {...panResponder.panHandlers}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        <TouchableOpacity
          activeOpacity={1}
          onTouchStart={handleTouchStart}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: currentStory.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          
          <View style={styles.overlay}>
            <View style={styles.header}>
              <View style={styles.uniInfo}>
                <View style={[styles.uniAvatar, { backgroundColor: currentStory.uniColor }]}>
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
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: i < currentIndex ? "100%" : i === currentIndex ? progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }) : "0%",
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  uniInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  uniInitial: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  uniName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    gap: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 1,
  },
});