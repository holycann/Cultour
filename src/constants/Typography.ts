export type FontFamily = "regular" | "medium" | "semibold" | "bold";

export const Typography = {
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  } as const,

  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  } as const,

  fontFamily: {
    regular: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semibold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
  } as const,

  styles: {
    title: {
      fontSize: 24,
      fontWeight: "700",
      lineHeight: 32,
      fontFamily: "Poppins_700Bold",
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 24,
      fontFamily: "Poppins_600SemiBold",
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
      fontFamily: "Poppins_400Regular",
    },
    caption: {
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 16,
      fontFamily: "Poppins_400Regular",
    },
  } as const,
};
