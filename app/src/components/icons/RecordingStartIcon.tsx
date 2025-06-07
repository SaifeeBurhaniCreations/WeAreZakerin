import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

const RecordingStartIcon: React.FC<IconProps> = ({ color = "#4A6848", size = 32, style, ...props }) => {

  return (
    <Svg
    stroke={color}
    fill={color}
    strokeWidth={0}
    viewBox="0 0 512 512"
    height={size}
    width={size}
    style={style}
    {...props}
  >
    <Path
      d="M384 138a117.93 117.93 0 00-91.84 192h-72.32A118 118 0 10128 374h256a118 118 0 000-236zM54 256a74 74 0 1174 74 74.09 74.09 0 01-74-74zm330 74a74 74 0 1174-74 74.09 74.09 0 01-74 74z"
      stroke="none"
    />
  </Svg>
  )
}

export default RecordingStartIcon
