import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import Icons from "../assets/Icons";
import { theme } from "../constants/theme";

const BackButton = ({ size, router }) => {
  return (
    <Pressable onPress={() => router.back()} style={styles.button}>
      <Icons name="arLeft" size={size} />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(0, 0, 0, 0.007)",
  },
});
