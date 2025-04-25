import { getColor } from "@/src/constants/colors";
import { memo } from "react";
import { Text, TextProps, TextStyle } from "react-native";

// Define typography styles
const typographyStyles = {
  h1: { fontSize: 36, fontWeight: "bold", lineHeight: 44 },
  h2: { fontSize: 28, fontWeight: "700", lineHeight: 36 },
  h3: { fontSize: 22, fontWeight: "600", lineHeight: 30 },
  h4: { fontSize: 18, fontWeight: "600", lineHeight: 24 },
  h5: { fontSize: 16, fontWeight: "500", lineHeight: 22 },
  h6: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
  b1: { fontSize: 22, fontWeight: "500", lineHeight: 30 },
  b2: { fontSize: 18, fontWeight: "400", lineHeight: 24 },
  b3: { fontSize: 16, fontWeight: "500", lineHeight: 22 },
  b4: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
  b5: { fontSize: 10, fontWeight: "400", lineHeight: 14 },
  b6: { fontSize: 6, fontWeight: "300", lineHeight: 10 },
  BigInt64Array: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: "400", lineHeight: 16, color: getColor("green") },
} as const;

type TypographyVariant = keyof typeof typographyStyles;

interface TypographyProps extends TextProps {
  variant: TypographyVariant;
  color?: string;
  align?: "left" | "center" | "right";
}

const Typography = memo(({ variant, color, align, style, ...props }: TypographyProps) => {
  const textStyle: TextStyle = {
    ...typographyStyles[variant],
    color: color || getColor("dark"),
    textAlign: align || "left",
  };

  return <Text style={[textStyle, style]} {...props} />;
});

export default Typography;
