import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

const CheckIcon: React.FC<IconProps> = ({ color = "#548076", size = 20, style, ...props }) => {

  return (
  <Svg 
    stroke={color}
    fill={color}
    strokeWidth={0}
    viewBox="0 0 24 24"
    height={size}
    width={size}
    style={style}
    {...props}
  ><G id="Circle_Check"><G><Path d="M15.81,10.4a.5.5,0,0,0-.71-.71l-3.56,3.56L9.81,11.52a.5.5,0,0,0-.71.71l2.08,2.08a.513.513,0,0,0,.71,0Z"></Path><path d="M12,21.934A9.934,9.934,0,1,1,21.933,12,9.945,9.945,0,0,1,12,21.934ZM12,3.067A8.934,8.934,0,1,0,20.933,12,8.944,8.944,0,0,0,12,3.067Z"></path></G></G></Svg>
  )
}

export default CheckIcon
