
export function findPadding(size: string | undefined) {
    switch (size) {
        case "sm":
            return { paddingHorizontal: 4, paddingVertical: 2 };
        case "md":
            return { paddingHorizontal: 6, paddingVertical: 4 };
        case "lg":
            return { paddingHorizontal: 8, paddingVertical: 6 };
        case "xl":
            return { paddingHorizontal: 10, paddingVertical: 8 };
        default:
            return { paddingHorizontal: 8, paddingVertical: 6 };
    }
}

export const getTagFont = (size: string) => {
    switch (size) {
        case "sm": return "b4";
        case "md": return "b3";
        case "lg": return "b2";
        case "xl": return "b1";
        default: return "b3";
    }
};
