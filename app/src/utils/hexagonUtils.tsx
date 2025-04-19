import { View } from "react-native";
import HexagonIcon from "../components/icons/HexagonIcon";

export const renderHexagonRow = (index: number, ScreenWidth: number, color: string) => {
    return (
      <View key={index} style={{ flexDirection: 'row' }}>
        <HexagonIcon color={color} size={ScreenWidth + 56} />
      </View>
    );
  };