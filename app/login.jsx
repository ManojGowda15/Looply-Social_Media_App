import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import Input from "../components/Input";
import Icons from "../assets/Icons";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onsubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please fill the details");
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    // console.log("session: ", session);
    console.log("error: ", error);
    if (error) {
      Alert.alert("Sign In", error.message);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Welcome Text */}
        <View>
          <Text style={styles.welcomeText}>Hey,</Text>
          <Text style={styles.welcomeText}>Welcome Back.</Text>
        </View>

        {/* Forms */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please Sign In to continue
          </Text>
          <Input
            icon={<Icons name="mail" />}
            placeholder="Enter your Email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icons name="lock" />}
            placeholder="Enter your Password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
        </View>

        <Text style={styles.forgotPassword}>Forgot Password?</Text>

        {/* Button */}
        <Button
          title="Sign In"
          buttonStyle={{ marginHorizontal: wp(3) }}
          loading={loading}
          onPress={onsubmit}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an Account?</Text>
          <Pressable onPress={() => router.push("signUp")}>
            <Text
              style={[
                styles.footerText1,
                {
                  color: theme.colors.primaryDark,
                  fontWeight: theme.fonts.semibold,
                },
              ]}
            >
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
  footerText1: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.9),
  },
});
