import React, { useState } from "react";
import { Animated, PanResponder, Dimensions } from "react-native";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75;

const Comments = () => {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  // Animation setup
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 20,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
        opacity.setValue(1 - gestureState.dy / MODAL_HEIGHT);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > MODAL_HEIGHT * 0.2) {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: MODAL_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => router.back());
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleSubmitComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: String(comments.length + 1),
        username: "currentUser",
        comment: comment.trim(),
        time: "now",
        userAvatar: "https://via.placeholder.com/32",
        isLiked: false,
      };
      setComments([...comments, newComment]);
      setComment("");
    }
  };

  const renderComment = ({ item }) => (
    <View
      style={{ flexDirection: "row", padding: 12, alignItems: "flex-start" }}
    >
      <Image
        source={{ uri: item.userAvatar }}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
          {item.username}
        </Text>
        <Text style={{ marginBottom: 8 }}>{item.comment}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#999" }}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        opacity: opacity,
      }}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          height: MODAL_HEIGHT,
          backgroundColor: "white",
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          transform: [{ translateY }],
        }}
      >
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1 }}>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#DBDBDB",
              padding: 16,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#DBDBDB",
                borderRadius: 2,
                marginBottom: 8,
              }}
            />
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Comments</Text>
          </View>

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            style={{ flex: 1, paddingHorizontal: 16 }}
          />

          <View
            style={{
              borderTopWidth: 2,
              borderTopColor: "#DBDBDB",
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 16,
            }}
          >
            <Image
              // source={{uri={}}}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 12,
              }}
            />
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment..."
              style={{
                flex: 1,
                fontSize: 14,
                paddingVertical: 4,
              }}
              onSubmitEditing={handleSubmitComment}
            />
            {comment.length > 0 && (
              <TouchableOpacity onPress={handleSubmitComment}>
                <Text style={{ color: "#318bfb", fontWeight: "600" }}>
                  Post
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default Comments;
