import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const MailIcon: React.FC<IconProps> = ({ color = "#fff", size = 24, style, ...props }) => {

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
      d="M20.571 5H3.43c-.38 0-.743.147-1.01.41A1.386 1.386 0 002 6.4v11.2c0 .371.15.727.418.99.268.262.632.41 1.01.41h17.143c.38 0 .743-.148 1.01-.41.268-.263.419-.619.419-.99V6.4c0-.371-.15-.727-.418-.99a1.444 1.444 0 00-1.01-.41zM19 6.4l-7 4.746L5 6.4h14zM3.429 17.6V7.037l8.164 5.537a.724.724 0 00.814 0l8.164-5.537V17.6H3.43z"
      fill={color}
    />
  </Svg>
  )
}

export default MailIcon
