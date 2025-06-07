import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const RecordingStopIcon: React.FC<IconProps> = ({ color = "#4A6848", size = 32, style, ...props }) => {

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
      d="M504 256C504 119 393 8 256 8S8 119 8 256s111 248 248 248 248-111 248-248zm-448 0c0-110.5 89.5-200 200-200s200 89.5 200 200-89.5 200-200 200S56 366.5 56 256zm296-80v160c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V176c0-8.8 7.2-16 16-16h160c8.8 0 16 7.2 16 16z"
      stroke="none"
    />
  </Svg>
  )
}

export default RecordingStopIcon
