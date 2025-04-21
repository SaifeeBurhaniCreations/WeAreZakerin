import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const LocationIcon: React.FC<IconProps> = ({ color = "#fff", size = 27, style, ...props }) => {

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 27 27"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M13.5 13.5c.619 0 1.149-.22 1.59-.662.44-.44.66-.97.66-1.588 0-.619-.22-1.149-.662-1.59A2.162 2.162 0 0013.5 9c-.619 0-1.149.22-1.59.662-.44.44-.66.97-.66 1.588 0 .619.22 1.149.662 1.59.44.44.97.66 1.588.66zm0 11.25c-3.019-2.569-5.273-4.954-6.763-7.157C5.247 15.39 4.5 13.35 4.5 11.475c0-2.813.905-5.053 2.715-6.722C9.025 3.084 11.12 2.25 13.5 2.25c2.381 0 4.477.834 6.287 2.503 1.81 1.669 2.714 3.91 2.713 6.722 0 1.875-.745 3.914-2.236 6.118-1.491 2.203-3.746 4.589-6.764 7.157z"
        fill={color}
      />
    </Svg>
  )
}

export default LocationIcon
