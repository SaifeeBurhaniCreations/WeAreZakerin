import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

const TimePicker = ({selectedTime, handleTimeChange}: {selectedTime: Date | null, handleTimeChange: (_: any, time?: Date) => void}) => {


  return (
    <DateTimePicker
    value={selectedTime || new Date()}
    mode="time"
    is24Hour={false}
    display={Platform.OS === "ios" ? "spinner" : "default"}
    onChange={handleTimeChange}
  />
  );
}

export default TimePicker