import { Input as GlueInput, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { getColor } from '@/src/constants/colors'
import { InputProps } from '@/src/types'
import { StyleSheet } from 'react-native'

const Input = ({ icon, iconSize = 20, placeholder, disabled, post, style, ...props }: InputProps) => {
    const iconElement = icon ? (
        <InputSlot>
            <InputIcon style={[ post ? styles.marginRight : styles.marginLeft, { color: getColor("green", 700) }]} as={icon} />
        </InputSlot>
    ) : null;

    return (
        <GlueInput
            variant="outline"
            size="xl"
            isInvalid={false}
            style={[styles.input, style]}
            isDisabled={disabled}
             {...props}>
            {!post && iconElement}
            <InputField placeholder={placeholder || "Enter something..."} placeholderTextColor={getColor("green", 700)} 
            type="text"
            />
            {post && iconElement}
        </GlueInput>
    )
}

export default Input


const styles = StyleSheet.create({
    input: {
        borderRadius: 8,
        width: "100%",
        backgroundColor: getColor("light"),
        borderWidth: 1,
        borderColor: getColor("green", 100),
    },
    marginRight: {
        marginRight: 12,
    },
    marginLeft: {
        marginLeft: 12,
    },
})