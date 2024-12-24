import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import RichTextEditor from "../../components/RichTextEditor";
import { useRouter } from "expo-router";
import Icons from "../../assets/Icons";
import Button from "../../components/Button";
import * as ImagePicker from "expo-image-picker";
import { getSupabaseFileUrl } from "../../services/imageService";
import { Video } from "expo-av";
import { createOrUpdatePost } from "../../services/postService";

const NewPost = () => {
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Request permissions when component mounts
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissions needed",
          "Sorry, we need camera roll permissions to upload images and videos."
        );
      }
    })();

    // Cleanup function
    return () => {
      setFile(null);
      bodyRef.current = "";
    };
  }, []);

  const onPick = async (isImage) => {
    try {
      // Configure picker options
      const options = {
        mediaTypes: isImage
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: isImage ? [4, 3] : undefined,
        quality: 1,
      };

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync(options);
      console.log("Picker result:", result); // For debugging

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log("Selected asset:", selectedAsset); // For debugging
        setFile(selectedAsset);
      }
    } catch (error) {
      console.error("Media picker error:", error);
      Alert.alert(
        "Error",
        "An error occurred while picking media. Please try again."
      );
    }
  };

  const isLocalFile = (file) => {
    if (!file) return false;
    return typeof file === "object" && file.uri;
  };

  const getFileType = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type?.includes("video") ? "video" : "image";
    }
    if (typeof file === "string" && file.includes("postImages")) {
      return "image";
    }
    return "video";
  };

  const getFileUri = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }
    return getSupabaseFileUrl(file)?.uri;
  };

  const resetForm = () => {
    setFile(null);
    bodyRef.current = "";
    if (
      editorRef.current &&
      typeof editorRef.current.setContentHTML === "function"
    ) {
      editorRef.current.setContentHTML("");
    }
  };

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert("Post", "Please select an image or enter post body.");
      return;
    }

    let data = {
      file,
      body: bodyRef.current,
      userId: user?.id,
    };

    try {
      setLoading(true);
      let res = await createOrUpdatePost(data);

      if (res.success) {
        resetForm();
        router.replace("home");
      } else {
        Alert.alert("Post", res.msg || "Failed to create post");
      }
    } catch (error) {
      console.error("Post creation error:", error);
      Alert.alert("Error", "An error occurred while creating the post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header
          title="Create Post"
          style={{ justifyContent: "center", marginLeft: 0 }}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar and User Info */}
          <View style={styles.header}>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.round}
            />
            <View style={styles.userInfoContainer}>
              <Text style={styles.username}>{user?.name}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>

          {/* Text Editor */}
          <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body) => (bodyRef.current = body)}
            />
          </View>

          {/* Media Preview */}
          {file && (
            <View style={styles.file}>
              {getFileType(file) === "video" ? (
                <Video
                  style={styles.mediaPreview}
                  source={{ uri: getFileUri(file) }}
                  useNativeControls
                  resizeMode="cover"
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) }}
                  resizeMode="cover"
                  style={styles.mediaPreview}
                />
              )}
              <Pressable
                style={styles.closeIcon}
                hitSlop={10}
                onPress={() => setFile(null)}
              >
                <Icons name="del" color="white" />
              </Pressable>
            </View>
          )}

          {/* Media Picker */}
          <View style={styles.media}>
            <View style={styles.mediaTextContainer}>
              <Text style={styles.addImageText}>Add to your post</Text>
            </View>
            <View style={styles.mediaIcons}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => onPick(true)}
              >
                <Icons name="img" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => onPick(false)}
              >
                <Icons name="video" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <Button
          buttonStyle={styles.postButton}
          title="Post"
          loading={loading}
          disabled={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 1,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userInfoContainer: {
    flexDirection: "column",
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {
    minHeight: hp(15),
  },
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 20,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderColor: theme.colors.gray,
  },
  mediaTextContainer: {
    flex: 1,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  mediaButton: {
    padding: 8,
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    backgroundColor: theme.colors.gray,
  },
  mediaPreview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 5,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.34)",
    zIndex: 1,
  },
  postButton: {
    height: hp(6.2),
    marginTop: 10,
  },
});

export default NewPost;
