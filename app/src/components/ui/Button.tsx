import { Pressable, Animated } from 'react-native';
import { StyleSheet } from 'react-native';
import Typography from '../typography/Typography';
import { ButtonProps } from '@/src/types';
import { getColor } from '@/src/constants/colors';

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

const Button = ({ children, variant = "fill", onPress, size = "lg", full, disabled }: ButtonProps) => {
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

  if (variant === "fill") {
    return (
      <Pressable
      onPress={(event) => !disabled && onPress?.(event)}
        onPressIn={ () => !disabled && handlePressIn()}
        onPressOut={ () => !disabled && handlePressOut()}
        style={[disabled ? styles.disabled : styles.baseFill, getButtonStyle(size), { alignSelf: full ? "stretch" : "center" }]}
      >
        <Animated.View style={animatedStyle}>
          <Typography variant={getButtonFont(size)} color={disabled ? getColor("green", 200) : getColor("light")}>{children}</Typography>
        </Animated.View>
      </Pressable>
    );
  } else {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.baseOutline, getButtonStyle(size), { alignSelf: full ? "stretch" : "center" }]}
      >
        <Animated.View style={animatedStyle}>
          <Typography variant={getButtonFont(size)} color={getColor("green")}>{children}</Typography>
        </Animated.View>
      </Pressable>
    );
  }
};

export default Button;

const styles = StyleSheet.create({
  baseFill: {
    backgroundColor: getColor("green"),
    borderRadius: 8,
    alignItems: 'center',
  },
  baseOutline: {
    borderWidth: 1,
    borderColor: getColor("green"),
    backgroundColor: getColor("light"),
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: getColor("green", 100),
    borderRadius: 8,
    alignItems: 'center',
  },
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
