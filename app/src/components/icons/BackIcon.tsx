import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

const BackIcon: React.FC<IconProps> = ({ color = "#fff", size = 30, style, ...props }) => {

  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
    style={style}
    {...props}
  >
    <G clipPath="url(#clip0_8_1158)">
      <Path
        d="M12.5 27.5L0 15 12.5 2.5l2.219 2.219L4.438 15l10.28 10.281L12.5 27.5z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_8_1158">
        <Path fill="#fff" d="M0 0H30V30H0z" />
      </ClipPath>
    </Defs>
  </Svg>
  )
}

export default BackIcon
