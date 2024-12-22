import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";

const Input = ({ icon, placeholder, onChangeText, style, ...props }) => {
  return (
    <View
      style={[styles.container, props.containerStyle && props.containerStyle]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <TextInput
        style={[styles.input, style]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textLight}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: hp(7.2),
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    paddingHorizontal: 18,
    marginVertical: 12,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default Input;
