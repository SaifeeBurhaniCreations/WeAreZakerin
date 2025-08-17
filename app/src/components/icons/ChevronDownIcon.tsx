import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Polyline } from "react-native-svg"

const ChevronDownIcon: React.FC<IconProps> = ({
    color = "#2E3830",
    size = 30,
    style,
    ...props
}) => {
    return (
        <Svg
            viewBox="0 0 24 24"
            height={size}
            width={size}
            style={style}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <Polyline points="6 9 12 15 18 9" />
        </Svg>
    );
};

export default ChevronDownIcon;
