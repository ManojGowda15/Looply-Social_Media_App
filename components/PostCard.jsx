import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icons from "../assets/Icons";
import { RenderHTML } from "react-native-render-html";
import { getSupabaseFileUrl } from "../services/imageService";
import { Video } from "expo-av";

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};

const tagsStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: {
    color: theme.colors.dark,
  },
  h4: {
    color: theme.colors.dark,
  },
};

const PostCard = ({ item, currentUser, router, hasShadow = true }) => {
  const shadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const createdAt = moment(item?.created_at).format("MMM D");

  const likes = item?.likes || [];

  const liked = likes.some((like) => like.userId === currentUser?.id);

  const openPostDetails = () => {
    router.push(`/post/${item.id}`); // Navigate to post details page
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
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={openPostDetails}>
          <Icons name="threedothoriz" />
        </TouchableOpacity>
      </View>

      {/* Post Body */}
      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            <RenderHTML
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagsStyles}
            />
          )}
        </View>

        {/* Post Media (Image or Video) */}
        {item?.file && item?.file.includes("postImages") && (
          <Image
            source={{ uri: getSupabaseFileUrl(item?.file)?.uri }}
            style={styles.postMedia}
            resizeMode="cover"
          />
        )}

        {item?.file && item?.file.includes("postVideos") && (
          <Video
            style={[styles.postMedia, { height: hp(42.5) }]}
            source={{ uri: getSupabaseFileUrl(item?.file)?.uri }}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )}
      </View>

      {/* Like, Comment and Share Buttons */}
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity>
            <Icons name="postlike" liked={liked} />
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

export default PostCard;

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
