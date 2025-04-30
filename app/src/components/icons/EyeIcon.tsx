import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const EyeIconOutline: React.FC<IconProps> = ({ color = "#548076", size = 20, style, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M10 5c-2.725 0-5.2 1.036-7.16 2.996-1.472 1.471-2.134 2.94-2.161 3a.625.625 0 000 .508c.027.061.689 1.529 2.16 3 1.96 1.96 4.436 2.995 7.161 2.995s5.2-1.036 7.16-2.996c1.472-1.471 2.134-2.94 2.161-3a.625.625 0 000-.508c-.027-.061-.689-1.529-2.16-3C15.2 6.036 12.725 5 10 5zm0 9.375A3.75 3.75 0 1110 6.875a3.75 3.75 0 010 7.5zm0-6.25a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"
        stroke={color}
        strokeWidth={1.1}
      />
    </Svg>
  )
}

export default EyeIconOutline
