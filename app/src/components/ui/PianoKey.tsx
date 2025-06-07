import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import { Audio } from 'expo-av';
import { getColor } from '@/src/constants/colors';

const noteSounds: Record<string, any> = {
  'A': require('@/assets/notes/A.mp3'),
  'A#': require('@/assets/notes/Asharp.mp3'),
  'B': require('@/assets/notes/B.mp3'),
  // 'B#': require('@/assets/notes/Bsharp.mp3'),
  'C': require('@/assets/notes/C.mp3'),
  'C#': require('@/assets/notes/Csharp.mp3'),
  'D': require('@/assets/notes/D.mp3'),
  'D#': require('@/assets/notes/Dsharp.mp3'),
  'E': require('@/assets/notes/E.mp3'),
  // 'E#': require('@/assets/notes/Esharp.mp3'),
  'F': require('@/assets/notes/F.mp3'),
  // 'F#': require('@/assets/notes/Fsharp.mp3'),
  'G': require('@/assets/notes/G.mp3'),
  'G#': require('@/assets/notes/Gsharp.mp3'),
};

const { height: screenHeight } = Dimensions.get("screen")
const PianoKey = ({
    type,
    note,
    color,
    isActive,
    onPress,
    style
  }: {
    type: 'white' | 'black';
    note: string;
    color?: string;
    isActive?: boolean;
    onPress?: () => void;
    style?: any;
  }) => {
    const keyStyles = [
        styles.key,
        type === 'white' ? styles.whiteKey : styles.blackKey,
        isActive && styles.activeKey, 
        {
          backgroundColor: isActive
            ? type === 'white' ? getColor('green', 100) : getColor('dark', 700)
            : color ?? (type === 'white' ? getColor('light', 500) : getColor('dark'))
        },
        style,
      ];
      
      
      const playNote = async () => {
        const soundFile = noteSounds[note];
        if (!soundFile) return;
      
        const { sound } = await Audio.Sound.createAsync(soundFile);
        await sound.playAsync();
      };
      
  
    return (
      <Pressable  onPress={() => {
        onPress?.();
        playNote();
      }} style={keyStyles}>
        <Text style={styles.label}>{note}</Text>
      </Pressable>
    );
  }

  export default PianoKey 
const styles = StyleSheet.create({
    key: {
        position: 'relative',
        borderColor: getColor("dark"),
        borderWidth: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 8,
    },
    whiteKey: {
        flex: 1,
        height: screenHeight * 0.4,
        backgroundColor: getColor('light', 500),
        zIndex: 1,
        borderRadius: 8,
    },
    blackKey: {
        width: 36,
        height: screenHeight * 0.3,
        backgroundColor: getColor("dark"),
        position: 'absolute',
        top: 0,
        zIndex: 2,
        marginLeft: -12,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderTopWidth: 0,
        borderColor: getColor("dark", 100)
    },
    activeKey: {
        shadowColor: getColor('green', 500),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      
        elevation: 8,
      },
      
    label: {
        fontSize: 12,
        color: getColor('dark', 100),
    },
});
