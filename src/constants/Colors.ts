// src/ui/theme/colors.ts

const BaseColors = {
  white: "#FFFFFF",
  black: "#000000",
  dark: "#1A1A1A",
  primary: "#EEC887",
  primary50: "rgba(238, 200, 135, 0.5)",
  secondary: "#477A71",
};

const Colors = {
  // 🎨 Base
  ...BaseColors,

  // 🖼️ Backgrounds
  backgroundDefault: BaseColors.white,
  backgroundDark: BaseColors.dark,
  backgroundPrimary: BaseColors.primary50,

  // 🔤 Text
  textPrimary: BaseColors.dark,
  textSecondary: "#666666",
  textInverse: BaseColors.white,
  textOnPrimary: BaseColors.white,

  // 🔘 Buttons
  buttonPrimary: BaseColors.primary,
  buttonPrimaryText: BaseColors.dark,
  buttonSecondary: BaseColors.primary50,
  buttonSecondaryText: BaseColors.dark,
  buttonOutline: "transparent",
  buttonOutlineBorder: BaseColors.primary,
  buttonOutlineText: BaseColors.primary,

  // 🧭 Headers, TabBar, etc.
  headerBackground: BaseColors.primary,
  headerText: BaseColors.white,
};

export default Colors;
