import React, { useState, useRef } from "react";
import {
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
} from "react-native";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
  UIManager,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.8;
const FULL_HEIGHT = SCREEN_HEIGHT;

const Comments = () => {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [expandedComment, setExpandedComment] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [modalHeight, setModalHeight] = useState(MODAL_HEIGHT);

  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const borderRadius = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const calculateDerivedValues = (gestureState) => {
    const dragDistance = Math.max(0, gestureState.dy);
    const dragProgress = Math.min(dragDistance / (MODAL_HEIGHT * 0.5), 1);
    const newScale = 1 - dragProgress * 0.1; // Scale between 1 and 0.9
    const newBorderRadius = 24 + dragProgress * 16; // Border radius between 24 and 40
    const newOpacity = 1 - dragProgress * 0.5; // Opacity between 1 and 0.5

    return { newScale, newBorderRadius, newOpacity };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dy) > 10,
    onPanResponderMove: (_, gestureState) => {
      if (!isFullScreen && gestureState.dy > 0) {
        // Enhanced downward sliding animation
        translateY.setValue(gestureState.dy);
        const { newScale, newBorderRadius, newOpacity } =
          calculateDerivedValues(gestureState);
        scale.setValue(newScale);
        borderRadius.setValue(newBorderRadius);
        opacity.setValue(newOpacity);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!isFullScreen && gestureState.dy < -50) {
        // Expand to fullscreen with spring animation
        LayoutAnimation.configureNext({
          duration: 300,
          create: { type: "easeInEaseOut", property: "opacity" },
          update: { type: "spring", springDamping: 0.8 },
          delete: { type: "easeInEaseOut", property: "opacity" },
        });
        setModalHeight(FULL_HEIGHT);
        setIsFullScreen(true);

        Animated.parallel([
          Animated.spring(borderRadius, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (isFullScreen && gestureState.dy > 50) {
        // Collapse from fullscreen
        LayoutAnimation.configureNext({
          duration: 300,
          create: { type: "easeInEaseOut", property: "opacity" },
          update: { type: "spring", springDamping: 0.8 },
          delete: { type: "easeInEaseOut", property: "opacity" },
        });
        setModalHeight(MODAL_HEIGHT);
        setIsFullScreen(false);

        Animated.parallel([
          Animated.spring(borderRadius, {
            toValue: 24,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (!isFullScreen && gestureState.dy > MODAL_HEIGHT * 0.2) {
        // Enhanced closing animation
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: MODAL_HEIGHT,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(borderRadius, {
            toValue: 40,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => router.back());
      } else {
        // Reset to current state with spring animation
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(borderRadius, {
            toValue: isFullScreen ? 0 : 24,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  // Rest of the component functions remain the same
  const handleSubmitComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: String(Date.now()),
        // username: "User_" + Math.floor(Math.random() * 1000),
        comment: comment.trim(),
        time: new Date().toLocaleTimeString(),
      };
      setComments([newComment, ...comments]);
      setComment("");
    }
  };

  // const toggleLike = (commentId) => {
  //   setComments(
  //     comments.map((c) =>
  //       c.id === commentId ? { ...c, likes: c.likes + 1 } : c
  //     )
  //   );
  // };

  // const giveAward = (commentId) => {
  //   setComments(
  //     comments.map((c) =>
  //       c.id === commentId ? { ...c, awards: c.awards + 1 } : c
  //     )
  //   );
  // };

  const renderComment = ({ item }) => (
    <Animated.View
      style={[
        styles.commentContainer,
        {
          transform: [
            {
              scale: expandedComment === item.id ? scale : 1,
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.commentContent}
        onPress={() =>
          setExpandedComment(expandedComment === item.id ? null : item.id)
        }
      >
        <View style={styles.commentHeader}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>

        {/* <View style={styles.interactionBar}>
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => toggleLike(item.id)}
          >
            <MaterialCommunityIcons
              name="thumb-up-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.interactionText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => giveAward(item.id)}
          >
            <MaterialCommunityIcons
              name="star-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.interactionText}>{item.awards}</Text>
          </TouchableOpacity>
        </View> */}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacity,
        },
      ]}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.modal,
          {
            height: modalHeight,
            transform: [{ translateY }, { scale }],
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
          },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <View style={styles.handle} />
          <MaterialCommunityIcons
            name="message-outline"
            size={24}
            color="#333"
          />
          <Text style={styles.headerText}>
            {isFullScreen ? "All Comments" : "Comments"}
          </Text>
          {isFullScreen && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                LayoutAnimation.configureNext({
                  duration: 300,
                  create: { type: "easeInEaseOut", property: "opacity" },
                  update: { type: "spring", springDamping: 0.8 },
                  delete: { type: "easeInEaseOut", property: "opacity" },
                });
                setModalHeight(MODAL_HEIGHT);
                setIsFullScreen(false);

                Animated.spring(borderRadius, {
                  toValue: 24,
                  tension: 40,
                  friction: 8,
                  useNativeDriver: true,
                }).start();
              }}
            >
              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={[styles.commentsList, isFullScreen && styles.fullScreenList]}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share your thoughts..."
            style={styles.input}
            multiline
          />
          {comment.length > 0 && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSubmitComment}
            >
              <Feather
                name="send"
                size={20}
                color="#fff"
                style={{ paddingRight: 2, paddingTop: 4 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
    position: "absolute",
    top: 8,
    left: (SCREEN_WIDTH - 40) / 2,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  fullScreenList: {
    paddingTop: 8,
  },
  commentContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  commentContent: {
    padding: 16,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  username: {
    fontWeight: "600",
    color: "#333",
  },
  time: {
    color: "#666",
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },
  interactionBar: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  interactionText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: "#0095f6",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Comments;
