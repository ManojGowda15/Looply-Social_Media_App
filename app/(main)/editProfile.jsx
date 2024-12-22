import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { getUserImageSrc, uploadFile } from "../../services/imageService";
import Input from "../../components/Input";
import Icons from "../../assets/Icons/index";
import Button from "../../components/Button";
import { updateUser } from "../../services/userService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const EditProfile = () => {
  const { user: currentUser, setUserData } = useAuth();

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [user, setUser] = useState({
    name: "",
    phoneNumber: "",
    image: null,
    bio: "",
    address: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        phoneNumber: currentUser.phoneNumber || "",
        image: currentUser.image || "",
        address: currentUser.address || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setUser({ ...user, image: result.assets[0] });
    }
  };

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phoneNumber, address, image, bio } = userData;
    if (!name || !address || !image || !bio) {
      Alert.alert(
        "Profile",
        "Please enter your details to procced the changes"
      );
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid 10-digit phone number"
      );
      return;
    }

    setLoading(true);
    // Upload images
    if (typeof image == "object") {
      let imageRes = await uploadFile("profiles", image?.uri, true);
      if (imageRes.success) userData.image = imageRes.data;
      else userData.image = null;
    }

    // Update user function
    const res = await updateUser(currentUser?.id, userData);
    setLoading(false);
    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      router.back();
    }
  };

  let imageSource =
    user.image && typeof user.image === "object"
      ? { uri: user.image.uri }
      : user.image
      ? getUserImageSrc(user.image)
      : require("../../assets/images/defaultUser.jpeg");

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Header title="Edit Profile" />

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icons name="cam" />
              </Pressable>
            </View>

            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              Please fill your Profile Details
            </Text>
            <Input
              icon={<Icons name="user" />}
              placeholder="Enter your Name"
              value={user.name}
              onChangeText={(value) => setUser({ ...user, name: value })}
            />
            <Input
              icon={<Icons name="call" />}
              placeholder="Enter your Number"
              value={user.phoneNumber}
              onChangeText={(value) => setUser({ ...user, phoneNumber: value })}
            />
            <Input
              icon={<Icons name="loc" />}
              placeholder="Enter your Location"
              value={user.address}
              onChangeText={(value) => setUser({ ...user, address: value })}
            />
            <Input
              placeholder="Bio"
              value={user.bio}
              multiline={true}
              containerStyle={styles.bio}
              onChangeText={(value) => setUser({ ...user, bio: value })}
            />

            <Button
              title="Save"
              loading={loading}
              disabled={loading}
              onPress={onSubmit}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.round,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: -6,
    padding: 6,
    borderRadius: 60,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  form: {
    gap: 18,
    marginTop: 20,
  },
  input: {
    flexDirection: "row",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    padding: 17,
    paddingHorizontal: 20,
    gap: 15,
  },
  bio: {
    bio: {
      flexDirection: "row",
      height: hp(15),
      borderWidth: 1,
      borderColor: theme.colors.textLight,
      borderRadius: theme.radius.xxl,
      paddingVertical: 15,
      paddingHorizontal: 10,
      textAlignVertical: "top",
    },
  },
});
