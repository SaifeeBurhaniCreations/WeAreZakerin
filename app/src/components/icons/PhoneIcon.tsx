import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const PhoneIcon: React.FC<IconProps> = ({ color = "#fff", size = 24, style, ...props }) => {

  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M14.706 15.425l1.4-1.4a1.368 1.368 0 011.463-.3l1.706.681a1.363 1.363 0 01.85 1.25v3.125a1.355 1.355 0 01-1.425 1.344C6.744 19.381 4.331 9.256 3.875 5.381a1.356 1.356 0 011.356-1.506H8.25a1.35 1.35 0 011.25.85l.681 1.706a1.35 1.35 0 01-.293 1.463l-1.4 1.4s.806 5.456 6.218 6.131z"
      fill={color}
    />
  </Svg>
  )
}

export default PhoneIcon
