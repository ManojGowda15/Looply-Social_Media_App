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
import React, { useRef, useState } from "react";
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

  // Request permission and pick image or video
  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: isImage
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: isImage ? [4, 3] : undefined,
      quality: 1,
    };

    // Request permissions before opening image picker
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your media library to upload images or videos."
      );
      return;
    }

    // Launch the image or video picker
    const result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const isLocalFile = (file) => {
    if (!file) return null;
    if (typeof file === "object") return true;
    return false;
  };

  const getFileType = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type;
    }

    if (file.includes("postImages ")) {
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

    setLoading(true);
    let res = await createOrUpdatePost(data);
    setLoading(false);

    if (res.success) {
      setFile(null);
      bodyRef.current = "";
      editorRef.current?.setContentHtml("");
      // Navigate to home screen after successful post using router.replace
      router.replace("home"); // Adjust the path based on your route configuration
    } else {
      Alert.alert("Post", res.msg);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header
          title="Create Post"
          style={{ justifyContent: "center", marginLeft: 0 }}
        />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* Avatar */}
          <View style={styles.header}>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.round}
            />
            <View style={styles.userInfoContainer}>
              <Text style={styles.username}>{user && user.name}</Text>
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

          {/* Image or Video Preview */}
          {file && (
            <View style={styles.file}>
              {getFileType(file) === "video" ? (
                <Video
                  style={{ flex: 1 }}
                  source={{
                    uri: getFileUri(file),
                  }}
                  useNativeControls
                  resizeMode="cover"
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              )}
              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icons name="del" color="white" />
              </Pressable>
            </View>
          )}

          {/* Add Media */}
          <View style={styles.media}>
            <View style={styles.textEditor}>
              <Text style={styles.addImageText}>Add to your post</Text>
            </View>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icons name="img" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icons name="video" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Post Button */}
        <Button
          buttonStyle={{
            height: hp(6.2),
          }}
          title="Post"
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 1,
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
  textEditor: {},
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
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
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
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 5,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.34)",
  },
});
