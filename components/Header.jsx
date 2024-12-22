import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { hp } from "./../helpers/common";
import { theme } from "./../constants/theme";

const Header = ({ title, mb = 10, style }) => {
  return (
    <View style={[styles.container, { marginBottom: mb }, style]}>
      <Text style={styles.title}>{title || ""}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
    marginLeft: 10,
    gap: 10,
  },
  title: {
    fontSize: hp(2.7),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
});
