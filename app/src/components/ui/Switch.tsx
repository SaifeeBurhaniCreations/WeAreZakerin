import React, { useState } from 'react'
import { SwitchProps } from '@/src/types'
import { StyleSheet } from 'react-native'
import { Switch as GlueSwitch } from "@/components/ui/switch"
import { getColor } from '@/src/constants/colors'
import Typography from '../typography/Typography'
import { View } from 'moti'

const Switch = ({ text, style, value, onValueChange, ...props }: SwitchProps) => {
  const [internalValue, setInternalValue] = useState(value ?? false)

  const isControlled = value !== undefined && onValueChange !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleChange = (newVal: boolean) => {
    if (isControlled) {
      onValueChange?.(newVal)
    } else {
      setInternalValue(newVal)
    }
  }

  const trackColor = { false: getColor("green", 200), true: getColor("green", 500) }
  const thumbColor = getColor("green", 100)

  if (typeof text === 'string') {
    return (
      <View style={styles.Hstack}>
        <GlueSwitch
          value={currentValue}
          onValueChange={handleChange}
          size="md"
          isDisabled={false}
          trackColor={trackColor}
          thumbColor={thumbColor}
          ios_backgroundColor={getColor("green", 100)}
          style={style}
          {...props}
        />
        <Typography color={getColor("dark", 700)} variant='b2'>{text}</Typography>
      </View>
    )
  } else {
    return (
      <View style={styles.Hstack}>
        <Typography color={getColor("dark", 700)} variant='b2' style={{ marginRight: 6 }}>{text?.[0]}</Typography>
        <GlueSwitch
          value={currentValue}
          onValueChange={handleChange}
          size="md"
          isDisabled={false}
          trackColor={trackColor}
          thumbColor={thumbColor}
          ios_backgroundColor={getColor("green", 100)}
          style={style}
          {...props}
        />
        <Typography color={getColor("dark", 700)} variant='b2'>{text?.[1]}</Typography>
      </View>
    )
  }
}

export default Switch

const styles = StyleSheet.create({
  Hstack: {
    flexDirection: "row",
    alignItems: "center",
  }
})
