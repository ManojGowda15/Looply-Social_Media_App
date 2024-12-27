import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  Alert,
  View,
  Text,
  FlatList,
  StatusBar,
  StyleSheet,
  Platform,
  UIManager,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const FULL_HEIGHT = SCREEN_HEIGHT;

const Comments = ({ post }) => {
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [modalHeight, setModalHeight] = useState(MODAL_HEIGHT);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputText, setInputText] = useState("");

  // Defining translateY and borderRadius using useRef
  const translateY = useRef(new Animated.Value(0)).current;
  const borderRadius = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fetchComments();
  }, [post?.id]);

  const fetchComments = async () => {
    try {
      // Replace with your fetchComments logic
      // const response = await getComments(post.id);
      // setComments(response.data);
    } catch (err) {
      Alert.alert("Error", "Failed to load comments");
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const { dy } = gestureState;
      return Math.abs(dy) > 10 && !isFullScreen;
    },
    onPanResponderMove: (_, gestureState) => {
      if (!isFullScreen && gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy < -50) {
        expandModal();
      } else if (gestureState.dy > MODAL_HEIGHT * 0.3) {
        closeModal();
      } else {
        resetModal();
      }
    },
  });

  const expandModal = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setModalHeight(FULL_HEIGHT);
    setIsFullScreen(true);
    Animated.spring(borderRadius, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: MODAL_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const resetModal = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleSendComment = () => {
    if (inputText.trim()) {
      // Handle sending comment
      setInputText(""); // Clear input after sending
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      {/* <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.commentText}>{item.text}</Text> */}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No comments yet. Be the first to comment!
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.modal,
          {
            height: modalHeight,
            transform: [{ translateY }],
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
          },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="message-outline"
            size={24}
            color="#333"
          />
          <Text style={styles.headerText}>
            Comments {comments.length > 0 ? `(${comments.length})` : ""}
          </Text>
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id?.toString()}
          style={styles.commentsList}
          ListEmptyComponent={renderEmptyState}
        />

        <View style={styles.inputContainer}>
          {isInputFocused && <Feather style={styles.inputIcon} />}
          <TextInput
            placeholder="Share your thoughts..."
            style={[styles.input, isInputFocused && styles.inputFocused]}
            multiline
            maxLength={1000}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          {inputText.trim().length > 0 && (
            <TouchableOpacity
              onPress={handleSendComment}
              style={styles.sendButton}
            >
              <Feather name="send" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#fff",
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    marginLeft: 5,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginRight: 8,
    maxHeight: 100,
  },
  inputFocused: {
    borderColor: "#666",
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginLeft: 8,
  },
  sendButton: {
    padding: 8,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  commentsList: {
    padding: 16,
  },
  commentContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  username: {
    fontWeight: "bold",
    color: "#333",
  },
  commentText: {
    color: "#333",
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    color: "#666",
    textAlign: "center",
  },
});

export default Comments;
