import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Send = () => {
  return (
    <MaterialCommunityIcons
      name="send"
      size={24}
      color={theme.colors.textLight}
    />
  );
};

export default Send;
