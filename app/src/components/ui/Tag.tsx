import { View, StyleSheet } from "react-native";
import { getColor } from "@/src/constants/colors";
import { TagProps } from "@/src/types";
import { findPadding, getTagFont } from "@/src/utils/common";
import { useMemoizedStyle } from "@/src/hooks/useMemoizedStyle";
import Typography from "../typography/Typography";

const TagComponent = ({ size = "sm", color = "green", children }: TagProps) => {
  const { paddingHorizontal, paddingVertical } = findPadding(size);

  const dynamicStyle = useMemoizedStyle(
    {
      paddingHorizontal,
      paddingVertical,
      backgroundColor: getColor(color, 500),
      borderColor: getColor(color, 700),
    },
    [paddingHorizontal, paddingVertical, color]
  );

  const textStyle = useMemoizedStyle(
    {
      color: getColor("light", 500),
    },
    [color]
  );

  return (
    <View style={[styles.tag, dynamicStyle]}>
      <Typography variant={getTagFont(size)} style={textStyle}>{children}</Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
  },
});

const Tag = TagComponent;
export default Tag
