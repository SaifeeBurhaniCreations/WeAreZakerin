import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Input as GlueInput, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import Typography from '../typography/Typography'
import { getColor } from '@/src/constants/colors'
import { InputProps } from '@/src/types'

const Input = ({
  icon,
  iconSize = 20,
  placeholder,
  disabled,
  post,
  title,
  style,
  value,
  onChangeText,
  ...props
}: InputProps) => {
  const [internalValue, setInternalValue] = useState('')

  const isControlled = value !== undefined && typeof onChangeText === 'function'
  const currentValue = isControlled ? value : internalValue

  const handleTextChange = (text: string) => {
    if (isControlled) {
      onChangeText?.(text)
    } else {
      setInternalValue(text)
    }
  }

  const iconElement = icon ? (
    <InputSlot>
      <InputIcon
        as={icon}
        style={[
          post ? styles.marginRight : styles.marginLeft,
          { color: getColor('green', 700), fontSize: iconSize },
        ]}
      />
    </InputSlot>
  ) : null

  return (
    <View style={styles.wrapper}>
      {title && (
        <Typography variant='b3' color={getColor('green', 700)}>
          {title}
        </Typography>
      )}

      <GlueInput
        variant="outline"
        size="xl"
        isInvalid={false}
        isDisabled={disabled}
        style={[styles.input, style]}
        {...props}
      >
        {!post && iconElement}

        <InputField
          value={currentValue}
          onChangeText={handleTextChange}
          placeholder={placeholder || 'Enter something...'}
          placeholderTextColor={getColor('green', 700)}
          type="text"
        />

        {post && iconElement}
      </GlueInput>
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 8,
  },
  input: {
    borderRadius: 8,
    width: '100%',
    backgroundColor: getColor('light'),
    borderWidth: 1,
    borderColor: getColor('green', 100),
  },
  marginRight: {
    marginRight: 12,
  },
  marginLeft: {
    marginLeft: 12,
  },
})
