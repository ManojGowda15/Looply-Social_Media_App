import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { theme } from "../../constants/theme";

const ArrowLeft = () => {
  return (
    <View>
      <FontAwesome6 name="arrow-left" size={24} color={theme.colors.text} />
    </View>
  );
};

export default ArrowLeft;
