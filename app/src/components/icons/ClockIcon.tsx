import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ClockIcon: React.FC<IconProps> = ({ color = "#548076", size = 20, style, ...props }) => {

  return (
    <Svg
    stroke={color}
    fill={color}
    strokeWidth={0}
    viewBox="0 0 24 24"
    height={size}
    width={size}
    style={style}
    {...props}
  >
    <Path d="M12 21.933A9.933 9.933 0 1121.933 12 9.944 9.944 0 0112 21.933zm0-18.866A8.933 8.933 0 1020.933 12 8.943 8.943 0 0012 3.067z" />
    <Path d="M18 12.5h-6a.429.429 0 01-.34-.14c-.01 0-.01-.01-.02-.02a.429.429 0 01-.14-.34V6a.5.5 0 011 0v5.5H18a.5.5 0 010 1z" />
  </Svg>
  )
}

export default ClockIcon
