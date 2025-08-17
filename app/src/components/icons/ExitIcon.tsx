import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

const ExitIcon: React.FC<IconProps> = ({ color = "#fff", size = 24, style, ...props }) => {
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
            <Path d="M336 376V272H191a16 16 0 0 1 0-32h145V136a56.06 56.06 0 0 0-56-56H88a56.06 56.06 0 0 0-56 56v240a56.06 56.06 0 0 0 56 56h192a56.06 56.06 0 0 0 56-56zm89.37-104-52.68 52.69a16 16 0 0 0 22.62 22.62l80-80a16 16 0 0 0 0-22.62l-80-80a16 16 0 0 0-22.62 22.62L425.37 240H336v32z"></Path>
        </Svg>
    )
}

export default ExitIcon