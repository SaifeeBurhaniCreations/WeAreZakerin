import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const AdminIcon: React.FC<IconProps> = ({ color = "#fff", size = 32, style, ...props }) => {

  return (
    <Svg
    stroke={color}
    fill={color}
    strokeWidth={0}
    viewBox="0 0 24 24"
    height={size}
    width={size}
    {...props}
  >
    <Path
      d="M12 14v2a6 6 0 00-6 6H4a8 8 0 018-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm9 6h1v5h-8v-5h1v-1a3 3 0 116 0v1zm-2 0v-1a1 1 0 10-2 0v1h2z"
      stroke="none"
    />
  </Svg>
  )
}

export default AdminIcon
