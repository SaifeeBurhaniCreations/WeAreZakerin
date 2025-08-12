import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const RemoveUserIcon: React.FC<IconProps> = ({ color = "#fff", size = 24, style, ...props }) => {
    return (
        <Svg 
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            style={style}
            {...props}
        >
            <Path d="M21 14h-6c-.553 0-1-.447-1-1s.447-1 1-1h6c.553 0 1 .447 1 1s-.447 1-1 1zM14 9c0 1.381-.56 2.631-1.464 3.535-.905.905-2.155 1.465-3.536 1.465s-2.631-.56-3.536-1.465c-.904-.904-1.464-2.154-1.464-3.535s.56-2.631 1.464-3.535c.905-.905 2.155-1.465 3.536-1.465s2.631.56 3.536 1.465c.904.904 1.464 2.154 1.464 3.535zM9 15c-3.75 0-6 2-6 4 0 1 2.25 2 6 2 3.518 0 6-1 6-2 0-2-2.354-4-6-4z"></Path>
        </Svg>
    )
}

export default RemoveUserIcon