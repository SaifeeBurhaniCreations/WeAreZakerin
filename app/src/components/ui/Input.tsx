import { getColor } from '@/src/constants/colors'
import { InputProps } from '@/src/types'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import Typography from '../typography/Typography';
import ClockIcon from '../icons/ClockIcon';
import Calendar from '@/src/screens/ScheduleEventScreen';
import Calendar12Icon from '../icons/Calendar12Icon';

const Input = ({
    children,
    placeholder,
    onChangeText,
    onBlur,
    onFocus,
    value,
    color = "green",
    icon,
    post,
    addonText,
    error,
    secureTextEntry,
    keyboardType,
    maxLength,
    mask,
    style,
    onIconPress,
    ...props
}: InputProps) => {
    
    const renderIcon = (icon: React.ReactNode, onPress?: () => void) => {
        const isString = typeof icon === 'string';
      
        return (
          <Pressable onPress={onPress} style={styles.icon}>
            {isString ? <Typography variant='b3'>{icon}</Typography> : icon}
            {mask === "time" ? <ClockIcon /> : mask === "date" && <Calendar12Icon />}
          </Pressable>
        );
      };
      
    const renderAddonText = (text: string) => (
        <Typography variant='b2' color={getColor("green", 200)} style={styles.addonText}>{text}</Typography>
    );

    const inputInside = (
        <View style={{ width: "100%" }}>
        <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            onChangeText={onChangeText}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholderTextColor={getColor("green", 700, 0.7)}
            textAlignVertical="center"
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            maxLength={maxLength}
            pointerEvents={mask === "date" || mask === "time" ? "none" : undefined}
            {...props}
        />
        </View>
    )

    const inputWithIcon = (
        <View style={[
          styles.inputWrapper,
          { borderColor: error ? getColor("red", 300) : getColor(color, 100) },
          style
        ]}>
          {!post && (icon || mask === "time" || mask === "date") && renderIcon(icon, onIconPress)}
          {!post && addonText && renderAddonText(addonText)}
      
          <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            onChangeText={onChangeText}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholderTextColor={getColor("green", 700, 0.7)}
            textAlignVertical="center"
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            maxLength={maxLength}
            pointerEvents={mask === "date" || mask === "time" ? "none" : undefined}
            {...props}
          />
      
          {post && addonText && renderAddonText(addonText)}
          {post && icon && renderIcon(icon, onIconPress)}
        </View>
      );
      

    return children ? (
        <View style={styles.inputContainer}>
            <Typography variant='h5'>{children}</Typography>
            {inputWithIcon}
            {error && <Typography variant='b4' color={getColor("red", 700)}>{error}</Typography>}
        </View>
    ) : (
        inputWithIcon
    );
};

export default Input;

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "column",
        gap: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: getColor("light"),
        paddingHorizontal: 12,
        height: 48,  
        width: "100%",
    },
    textInput: {
        fontFamily: "FunnelSans-Regular",
        fontSize: 16,
        color: getColor("green", 400),
        paddingVertical: 0,
        flex: 1, 
        height: '100%',  
    },
    icon: {
        height: 24, 
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    addonText: {
        paddingRight: 8,
    },
});
