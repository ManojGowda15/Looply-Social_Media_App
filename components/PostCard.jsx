import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icons from "../assets/Icons";
import { RenderHTML } from "react-native-render-html";
import { getSupabaseFileUrl } from "../services/imageService";
import { Video } from "expo-av";
import { createPostLike, removePostLike } from "../services/postService";

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};

const tagsStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: { color: theme.colors.dark },
  h4: { color: theme.colors.dark },
};

const PostCard = ({ item, currentUser, router, hasShadow = true }) => {
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (item?.postLikes) {
      setLikes(item.postLikes);
      setIsLiked(
        item.postLikes.some((like) => like.userId === currentUser?.id)
      );
    }
  }, [item?.postLikes, currentUser?.id]);

  const handleLike = async () => {
    if (!currentUser?.id || !item?.id) {
      Alert.alert("Post", "Please login to like posts");
      return;
    }

    try {
      if (isLiked) {
        const res = await removePostLike(item.id, currentUser.id);
        if (res.success) {
          setLikes(likes.filter((like) => like.userId !== currentUser.id));
          console.log("Like Removed: ", res);
          setIsLiked(false);
        }
      } else {
        const result = await createPostLike({
          userId: currentUser.id,
          postId: item.id,
        });
        if (result.success) {
          setLikes([...likes, result.data]);
          setIsLiked(true);
          console.log("Post Liked: ", result);
        }
      }
    } catch (error) {
      Alert.alert("Post", "Something went wrong");
    }
  };

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>
              {moment(item?.created_at).format("MMM D")}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push(`/post/${item.id}`)}>
          <Icons name="threedothoriz" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {item?.body && (
          <View style={styles.postBody}>
            <RenderHTML
              contentWidth={wp(100)}
              source={{ html: item.body }}
              tagsStyles={tagsStyles}
            />
          </View>
        )}

        {item?.file &&
          (item.file.includes("postImages") ? (
            <Image
              source={{ uri: getSupabaseFileUrl(item.file)?.uri }}
              style={styles.postMedia}
              resizeMode="cover"
            />
          ) : (
            item.file.includes("postVideos") && (
              <Video
                style={[styles.postMedia, { height: hp(42.5) }]}
                source={{ uri: getSupabaseFileUrl(item.file)?.uri }}
                useNativeControls
                resizeMode="cover"
                isLooping
              />
            )
          ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={handleLike}>
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>

          <Text style={styles.count}>{likes.length}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity>
            <Icons name="cmt" />
          </TouchableOpacity>
          <Text style={styles.count}>0</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity>
            <Icons name="share" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const shadowStyles = {
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 1,
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.15,
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.4),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  postMedia: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
    borderRadius: 20,
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
});

export default PostCard;
