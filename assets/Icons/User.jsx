import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { theme } from "../../constants/theme";

const User = () => {
  return (
    <FontAwesome5 name="user-circle" size={26} color={theme.colors.textLight} />
  );
};

export default User;
