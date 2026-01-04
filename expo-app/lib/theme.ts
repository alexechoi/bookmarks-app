/**
 * Neobrutalist Design System Theme
 *
 * Matches the frontend design with bold borders, offset shadows,
 * and a warm color palette.
 */

export const colors = {
  // Core colors
  background: "#faf5e4", // Warm cream
  secondaryBackground: "#ffffff",
  foreground: "#000000",
  mainForeground: "#000000",

  // Accent colors
  main: "#facc00", // Yellow
  mainDark: "#e0b700",

  // Border and shadow
  border: "#000000",

  // Semantic colors
  destructive: "#ef4444",
  destructiveLight: "rgba(239, 68, 68, 0.1)",
  success: "#00d696",
  successLight: "rgba(0, 214, 150, 0.1)",

  // Muted
  muted: "#71717a",
  mutedForeground: "#52525b",

  // Chart/accent colors
  chart1: "#facc00",
  chart2: "#7a83ff",
  chart3: "#ff4d50",
  chart4: "#00d696",
  chart5: "#0099ff",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  base: 5,
  md: 8,
  lg: 12,
  full: 9999,
};

export const borderWidth = {
  base: 2,
  thick: 3,
};

export const shadows = {
  base: {
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  pressed: {
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

export const typography = {
  heading: {
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  body: {
    fontWeight: "500" as const,
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  typography,
};

export type Theme = typeof theme;
