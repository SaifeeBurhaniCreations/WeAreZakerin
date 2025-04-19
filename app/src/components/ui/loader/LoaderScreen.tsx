import { Dimensions, StyleSheet, View, StatusBar as RNStatusBar, Platform } from 'react-native';
import { getColor } from '@/src/constants/colors';
import Typography from '../../typography/Typography';
import { renderHexagonRow } from '@/src/utils/hexagonUtils';
import MisqaatIcon from '../../icons/MisqaatIcon';
import { StatusBar } from "expo-status-bar";
import { MotiView } from 'moti';

const SCREEN_WIDTH = Dimensions.get('window').width;

const LoaderScreen = () => {
  return (
    <MotiView
      from={{ translateY: SCREEN_WIDTH, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 600,
      }}
      style={[styles.pageContainer, { paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0 }]}
    >
      <StatusBar backgroundColor={getColor("green")} style="light" />

      <View style={styles.hexagonBackground}>
        {Array.from({ length: 18 }, (_, index) => renderHexagonRow(index, SCREEN_WIDTH, getColor("light", 500, 0.5)))}
      </View>

      <View style={styles.container}>
        <MisqaatIcon />
        <Typography variant="h1" color={getColor("light")}>
          ذاكر حسين
        </Typography>
        <Typography variant="b2" color={getColor("light")}>
          We are zakerin
        </Typography>
      </View>
    </MotiView>
  );
};

export default LoaderScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green"),
    justifyContent: "center",
    alignItems: "center",
  },
  hexagonBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
