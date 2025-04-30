import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path, } from "react-native-svg"

const BackIcon: React.FC<IconProps> = ({ color = "#fff", size = 30, style, ...props }) => {

  return (
    <Svg
      stroke={color}
      fill={color}
      strokeWidth={0}
      viewBox="0 0 24 24"
      aria-hidden="true"
      height={size}
      width={size}
      {...props}
    >
      <Path
        fillRule="evenodd"
        d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
        clipRule="evenodd"
        stroke="none"
      />
    </Svg>
  )
}

export default BackIcon
