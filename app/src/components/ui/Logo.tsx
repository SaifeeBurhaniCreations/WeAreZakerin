import { Image } from "@/components/ui/image"
const Logo = () => {
    return (
        <Image   
        className="rounded-full"
        style={{ aspectRatio: 1 }}
        source={require("@/src/assets/images/logo.jpg")}
        alt='logo'
        size='xl' />
    )
}

export default Logo
