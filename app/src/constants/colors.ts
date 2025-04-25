export const colors = {
  red: {
    100: "#FCE6E2", // light blush
    200: "#FAB4AA", // warm coral tint
    300: "#F88778", // soft but noticeable
    400: "#F66855", // warm and alive
    500: "#F55747", // (you already have this)
    700: "#CB1D0B", // (you already have this)
  },
  blue: {
    100: "#E1F4FD", // icy blue
    200: "#B3E1FA", // soft sky blue
    300: "#83CDF7", // calm and smooth
    400: "#5AC1F8", // a bit punchier
    500: "#45B3F7", // (you already have this)
    700: "#0982CE", // (you already have this)
  },
  green: {
    100: "#DDEAD5", 
    200: "#9BC698",
    300: "#7BA67E",
    400: "#548076",
    500: "#A8C686", 
    700: "#4A6848",
  },
  yellow: {
    100: "#F6EADA",
    500: "#FF9D00",
    700: "#CC7E00",
  },
  light: {
    200: "#FCF9F7",
    500: "#FFFFFF",
  },
  dark:{
    300: "#52615A", // lighter charcoal — good for borders or disabled text
    500: "#2E3830", // main charcoal — excellent for primary text and icons
    700: "#1E281E", // deep charcoal — perfect for headers, footers, or strong accents
  },
  gradients: {
    primary: ["#3182ce", "#2c5282"],
    secondary: ["#D1D5DB", "#4B5563"],
  },
  transparency: {
    overlay: "rgba(0,0,0,0.5)",
  },
} as const;
// Type definitions
type ColorType = keyof typeof colors;

// Fallback color
const FALLBACK_COLOR = "#808080"; 

const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = args.join("-");
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const getColor = memoize((type: ColorType, shade?: number, opacity?: number | string): string => {
  const colorSet = colors[type];

  if (!colorSet || typeof colorSet !== "object") {
    console.warn(`Color type "${type}" not found, using fallback`);
    return FALLBACK_COLOR;
  }

  const isShadedColor = (obj: any): obj is Record<number, string> =>
    typeof obj === "object" && Object.keys(obj).every((key) => !isNaN(Number(key)));

  if (isShadedColor(colorSet)) {
    const shadeValue = colorSet[shade as keyof typeof colorSet] ?? colorSet[500] ?? FALLBACK_COLOR;

    if (opacity !== undefined) {
      const opacityValue = typeof opacity === "string" ? parseFloat(opacity) / 100 : opacity;
      return convertToRGBA(shadeValue, opacityValue);
    }

    return shadeValue;
  }

  console.warn(`Invalid shade "${shade}" for "${type}", using fallback`);
  return FALLBACK_COLOR;
});

const convertToRGBA = (hex: string, opacity: number = 1): string => {
  const hexCode = hex.replace("#", "");

  const r = parseInt(hexCode.substring(0, 2), 16);
  const g = parseInt(hexCode.substring(2, 4), 16);
  const b = parseInt(hexCode.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};



export const useTheme = (isDarkMode: boolean): { text: string; bg: string; border: string } => ({
  text: isDarkMode ? colors.dark[500] : colors.light[500],
  bg: isDarkMode ? colors.dark[500] : colors.light[500],
  border: isDarkMode ? colors.dark[500] : colors.light[500],
});
