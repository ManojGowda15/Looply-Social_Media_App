import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";
import { theme } from "./../../constants/theme";

const Home = () => {
  return (
    <View>
      <MaterialCommunityIcons
        name="home-outline"
        size={24}
        color={theme.colors.text}
      />
    </View>
  );
};

export default Home;
