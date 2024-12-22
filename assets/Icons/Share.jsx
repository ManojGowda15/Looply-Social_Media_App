import React from "react";
import { theme } from "../../constants/theme";
import { FontAwesome } from "@expo/vector-icons";

const Share = () => {
  return <FontAwesome name="send-o" size={19} color={theme.colors.textLight} />;
};

export default Share;
