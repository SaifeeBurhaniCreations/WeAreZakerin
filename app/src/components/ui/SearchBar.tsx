import { SearchIcon } from '@/components/ui/icon'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { getColor } from '@/src/constants/colors'
import { StyleSheet } from 'react-native'

const SearchBar = () => {
    return (
        <Input
            variant="outline"
            size="xl"
            isInvalid={false}
            style={styles.input}>
                            <InputSlot>
                <InputIcon style={{ marginLeft: 12, color: getColor("green", 700) }} as={SearchIcon}></InputIcon>
            </InputSlot>
            <InputField placeholder="Search by party name, ITS" placeholderTextColor={getColor("green", 700)} type="text"
            />

        </Input>
    )
}

export default SearchBar


const styles = StyleSheet.create({
    input: {
        borderRadius: 8,
        width: "100%",
        backgroundColor: getColor("light"),
        borderWidth: 1,
        borderColor: getColor("green", 100)
    },
})