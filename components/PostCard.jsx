import {
  Alert,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { theme } from "../constants/theme";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icons from "../assets/Icons";
import { RenderHTML } from "react-native-render-html";
import { downloadFile, getSupabaseFileUrl } from "../services/imageService";
import { Video } from "expo-av";
import {
  createPostLike,
  removePostLike,
  fetchPostLikes,
} from "../services/postService";
import Loading from "./Loading";

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
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  const openPostDetails = () => {
    router.push({
      pathname: "(main)/postDetails",
      params: { postId: item?.id },
    });
  };

  // Generate post URL
  const getPostUrl = useCallback(() => {
    return `https://looply.app/post/${item.id}`;
  }, [item.id]);

  // Function to handle text-only sharing with URL
  const shareContent = useCallback(
    async (content) => {
      try {
        const postUrl = getPostUrl();
        const shareOptions = {
          ...content,
          message: `${content.message}\n\nView full post at: ${postUrl}`,
          title: "Looply Post",
        };

        const result = await Share.share(shareOptions);
        return result.action === Share.sharedAction;
      } catch (error) {
        console.error("Share error:", error);
        throw error;
      }
    },
    [getPostUrl]
  );

  // Function to handle file sharing with URL and preview
  const shareFile = useCallback(
    async (fileUri, mimeType, message) => {
      try {
        const isSharingAvailable = await Sharing.isAvailableAsync();
        const postUrl = getPostUrl();

        if (!isSharingAvailable) {
          const fileUrl = getSupabaseFileUrl(item?.file)?.uri;
          return shareContent({
            message: message,
            url: fileUrl,
            title: "Looply Post",
          });
        }

        if (Platform.OS === "ios") {
          await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: "Share Looply Post",
            UTI: mimeType.includes("image") ? "public.jpeg" : "public.mpeg-4",
            message: `${message}\n\nView full post at: ${postUrl}`,
          });
        } else {
          const result = await Share.share({
            message: `${message}\n\nView full post at: ${postUrl}`,
            url: fileUri,
            title: "Looply Post",
          });

          if (result.action === Share.dismissedAction) {
            console.log("Share dismissed");
            return false;
          }
        }
        return true;
      } catch (error) {
        console.error("File sharing error:", error);
        throw error;
      }
    },
    [item?.file, getPostUrl]
  );

  // Main share function
  const onShare = async () => {
    if (loading) return;

    let temporaryFileUri = null;
    setLoading(true);

    try {
      const messageText =
        stripHtmlTags(item?.body) || "Check out this post on Looply!";

      if (item?.file) {
        const fileUrl = getSupabaseFileUrl(item?.file)?.uri;
        if (!fileUrl) {
          throw new Error("Invalid file URL");
        }

        // For images, create a resized preview
        if (item.file.includes("postImages")) {
          const resizedImage = await FileSystem.downloadAsync(
            fileUrl,
            FileSystem.cacheDirectory + "share_preview.jpg"
          );
          temporaryFileUri = resizedImage.uri;
        } else {
          temporaryFileUri = await downloadFile(fileUrl);
        }

        if (!temporaryFileUri) {
          throw new Error("Failed to download media");
        }

        const mimeType = item.file.includes("postImages")
          ? "image/jpeg"
          : "video/mp4";

        await shareFile(temporaryFileUri, mimeType, messageText);
      } else {
        await shareContent({
          message: messageText,
          title: "Looply Post",
        });
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(
        "Sharing Failed",
        error.message || "Failed to share content. Please try again."
      );
    } finally {
      if (temporaryFileUri) {
        try {
          await FileSystem.deleteAsync(temporaryFileUri, { idempotent: true });
        } catch (error) {
          console.error("File cleanup error:", error);
        }
      }
      setLoading(false);
    }
  };

  // Load and refresh likes
  const loadLikes = useCallback(async () => {
    if (!item?.id) return;

    try {
      setLoadingError(null);
      const result = await fetchPostLikes(item.id);
      if (result.success) {
        setLikes(result.data);
        setIsLiked(result.data.some((like) => like.userId === currentUser?.id));
      } else {
        throw new Error("Failed to fetch likes");
      }
    } catch (error) {
      console.error("Error loading likes:", error);
      setLoadingError(error.message);
    }
  }, [item?.id, currentUser?.id]);

  // Initialize likes and polling
  useEffect(() => {
    let isMounted = true;
    let pollInterval;

    const initializeLikes = async () => {
      if (isMounted) {
        await loadLikes();
      }
    };

    initializeLikes();
    pollInterval = setInterval(initializeLikes, 10000);

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [loadLikes]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!currentUser?.id || !item?.id) {
      Alert.alert("Login Required", "Please login to like posts");
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);

      if (isLiked) {
        const res = await removePostLike(item.id, currentUser.id);
        if (res.success) {
          setLikes((prevLikes) =>
            prevLikes.filter((like) => like.userId !== currentUser.id)
          );
          setIsLiked(false);
        } else {
          throw new Error("Failed to remove like");
        }
      } else {
        const result = await createPostLike({
          userId: currentUser.id,
          postId: item.id,
        });
        if (result.success) {
          setLikes((prevLikes) => [...prevLikes, result.data]);
          setIsLiked(true);
        } else {
          throw new Error("Failed to add like");
        }
      }
    } catch (error) {
      console.error("Like error:", error);
      Alert.alert("Error", "Failed to update like. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render media content
  const renderMedia = () => {
    if (!item?.file) return null;

    const mediaUrl = getSupabaseFileUrl(item.file)?.uri;
    if (!mediaUrl) return null;

    if (item.file.includes("postImages")) {
      return (
        <Image
          source={{ uri: mediaUrl }}
          style={styles.postMedia}
          resizeMode="cover"
        />
      );
    }

    if (item.file.includes("postVideos")) {
      return (
        <Video
          style={[styles.postMedia, { height: hp(42.5) }]}
          source={{ uri: mediaUrl }}
          useNativeControls
          resizeMode="cover"
          isLooping
          shouldPlay={false}
        />
      );
    }

    return null;
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
        <TouchableOpacity
          onPress={() => router.push(`/post/${item.id}`)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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
        {renderMedia()}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity
            onPress={handleLike}
            disabled={isLoading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes.length}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={openPostDetails}
          >
            <Icons name="cmt" />
          </TouchableOpacity>
          <Text style={styles.count}>0</Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity
              onPress={onShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icons name="share" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const shadowStyles = Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: {
    elevation: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.15,
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: Platform.select({ ios: 0.5, android: 0 }),
    borderColor: theme.colors.gray,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
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
    borderRadius: 20,
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 5,
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
