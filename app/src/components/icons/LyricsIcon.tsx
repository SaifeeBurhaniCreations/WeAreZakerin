import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const LyricsIcon: React.FC<IconProps> = ({ color = "#fff", size = 24, style, ...props }) => {

  return (
    <Svg
      stroke={color}
      fill={color}
      strokeWidth={0}
      viewBox="0 0 24 24"
      height={size}
      width={size}
      {...props}
    ><Path fill="none" d="M0 0h24v24H0z"></Path><Path d="M6 6h7v2H6zM6 12h4v2H6z"></Path><Path d="M15 11.97V16H6l-2 2V4h11v2.03c.52-.69 1.2-1.25 2-1.6V4c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h9c1.1 0 2-.9 2-2v-2.42a5.16 5.16 0 0 1-2-1.61z"></Path><Path d="M6 9h7v2H6zM20 6.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V3h2V1h-4v5.18z"></Path></Svg>
  )
}

export default LyricsIcon
