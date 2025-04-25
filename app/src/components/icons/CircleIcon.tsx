import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Circle } from "react-native-svg"

const CircleIcon: React.FC<IconProps> = ({ color = "#A8C686", size = 16, style, ...props }) => {

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} {...props}>
    <Circle cx="12" cy="12" r="10" fill={color} />
  </Svg>
  )
}

export default CircleIcon
