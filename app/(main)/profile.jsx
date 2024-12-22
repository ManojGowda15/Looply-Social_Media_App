import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import Icons from "../../assets/Icons";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";

const Profile = () => {
  const { user, sethAuth } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("SignOut", "Error Signing Out!");
    } else {
      sethAuth(null); // Clear the user context
      router.replace("login"); // Redirect to login screen
    }
  };

  const handleLogout = async () => {
    Alert.alert("Confirm", "Are you sure you want to Log Out", [
      {
        text: "Cancel",
        onPress: () => console.log("Logout Cancelled"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenWrapper bg="white">
      <UserHeader user={user} router={router} handleLogout={handleLogout} />
    </ScreenWrapper>
  );
};

const UserHeader = ({ user, router, handleLogout }) => {
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.headerRow}>
        <Header title="Profile" mb={40} />
        <View style={{ paddingRight: 10 }}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icons name="logout" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.profileContainer}>
          {/* User Information Section - Left Side */}
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user && user.name}</Text>

            {user && user.address && (
              <View style={styles.infoRow}>
                <Icons name="location" />
                <Text style={styles.infoText}>{user.address}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Icons name="mail" />
              <Text style={styles.infoText}>{user && user.email}</Text>
            </View>

            {user && user.phoneNumber && (
              <View style={styles.infoRow}>
                <Icons name="call" />
                <Text style={styles.infoText}>{user.phoneNumber}</Text>
              </View>
            )}

            {user && user.bio && (
              <Text style={[styles.infoText, { marginTop: 10 }]}>
                {user.bio}
              </Text>
            )}
          </View>

          {/* Avatar Section - Right Side */}
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(15)}
              rounded={theme.radius.round}
            />
            <Pressable
              style={styles.editIcon}
              onPress={() => router.push("editProfile")}
            >
              <Icons name="edit" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    marginTop: -20,
  },
  profileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    marginBottom: 10,
  },
  avatarContainer: {
    position: "relative",
  },
  editIcon: {
    position: "absolute",
    bottom: -10,
    right: 15,
    padding: 4,
    borderRadius: 50,
    backgroundColor: "#f1f1f1",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3.5),
    fontWeight: "500",
    color: theme.colors.textDark,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  infoText: {
    fontSize: hp(1.5),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    padding: 4,
    borderRadius: theme.radius.round,
    backgroundColor: "#faf2f2",
    marginBottom: 33,
    left: 10,
  },
});
