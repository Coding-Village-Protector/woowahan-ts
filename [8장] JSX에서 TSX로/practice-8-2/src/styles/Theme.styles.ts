export const theme = {
  fontSize: {
    default: "16px",
    small: "14px",
    large: "18px",
  },
  color: {
    white: "#FFFFFF",
    black: "#000000",
    orange: "#F58F00",
  },
};

export type Theme = typeof theme;
export type FontSize = keyof Theme["fontSize"];
export type Color = keyof Theme["color"];
