import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const PianoIcon: React.FC<IconProps> = ({ color = "#fff", size = 32, style, ...props }) => {

  return (
    <Svg
      stroke={color}
      fill={color}
      strokeWidth={0}
      viewBox="0 0 16 16"
      height={size}
      width={size}
      style={style}
      {...props}
    >
      <Path
        d="M1 2L0 3v6h1V3h2v5.5l.5.5h1l.5-.5V3h2v5.5l.5.5h1l.5-.5V3h2v5.5l.5.5h1l.5-.5V3h2v10h-3v-3h-1v3H8.5v-3h-1v3H5v-3H4v3H1V9H0v4l1 1h14l1-1V3l-1-1H1z"
        stroke="none"
      />
    </Svg>
  )
}

export default PianoIcon
