import { Pressable, Animated } from 'react-native';
import { StyleSheet } from 'react-native';
import Typography from '../typography/Typography';
import { ButtonProps } from '@/src/types';
import { getColor } from '@/src/constants/colors';
import { ViewStyle } from '@expo/html-elements/build/primitives/View';

const getButtonFont = (size: string) => {
  switch (size) {
    case "sm": return "b4";
    case "md": return "b3";
    case "lg": return "b2";
    case "xl": return "b1";
    default: return "b3";
  }
};

const getButtonStyle = (size: string) => {
  switch (size) {
    case "sm": return styles.sm;
    case "md": return styles.md;
    case "lg": return styles.lg;
    case "xl": return styles.xl;
    default: return styles.md;
  }
};

const Button = ({
  children,
  variant = "fill",
  onPress,
  size = "lg",
  full,
  disabled,
  color = "green", // ✅ default color
}: ButtonProps) => {
  const scale = new Animated.Value(1);
  const opacity = new Animated.Value(1); 

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.95,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.7, 
        duration: 100, 
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1, 
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1, 
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedStyle = {
    transform: [{ scale }],
    opacity, 
  };

  const containerStyle: ViewStyle = {
    alignSelf: full ? "stretch" : "center",
    backgroundColor: variant === "fill"
      ? disabled
        ? getColor(color, 100)
        : getColor(color)
      : getColor("light"),
    borderColor: getColor(color),
    borderWidth: variant === "outline" ? 1 : 0,
    borderRadius: 8,
    alignItems: "center",
  };

  const textColor =
    variant === "fill"
      ? disabled
        ? getColor(color, 200)
        : getColor("light")
      : getColor(color);

  return (
    <Pressable
      onPress={(event) => !disabled && onPress?.(event)}
      onPressIn={() => !disabled && handlePressIn()}
      onPressOut={() => !disabled && handlePressOut()}
      style={[containerStyle, getButtonStyle(size)]}
    >
      <Animated.View style={animatedStyle}>
        <Typography variant={getButtonFont(size)} color={textColor}>
          {children}
        </Typography>
      </Animated.View>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  lg: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  xl: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
});
