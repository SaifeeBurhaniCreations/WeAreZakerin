import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path, Circle } from "react-native-svg"

const MisqaatIcon: React.FC<IconProps> = ({ color = "#fff", size = 72, style, ...props }) => {

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M32 2C20 10 8 24 8 40v18h48V40c0-16-12-30-24-38z"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M32 12c-9 6-16 18-16 28v12h32V40c0-10-7-22-16-28z"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M32 24c-2 2-4 5-4 8 0 4 2 6 4 6s4-2 4-6c0-3-2-6-4-8z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={32} cy={42} r={3} stroke={color} strokeWidth={2} />
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        d="M32 38L32 42"
      />
    </Svg>
  )
}

export default MisqaatIcon
