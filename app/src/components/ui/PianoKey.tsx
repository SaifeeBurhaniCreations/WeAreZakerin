import { Pressable, StyleSheet, Text, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { getColor } from '@/src/constants/colors';
import { useRef } from 'react';

const { height: screenHeight } = Dimensions.get("screen");

const semitoneOffsets: Record<string, number> = {
  'C': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11,
};



const PianoKey = ({
  type,
  note,
  color,
  isActive,
  onPressInCallback,
  onPressOutCallback,
  style
}: {
  type: 'white' | 'black';
  note: string;
  color?: string;
  isActive?: boolean;
  onPressInCallback?: () => void;
  onPressOutCallback?: () => void;
  style?: any;
}) => {

  const soundRef = useRef<Audio.Sound | null>(null);
  function getNoteOffset(note: string) {
    const match = /^([A-G]#?|Bb|Db|Gb|Ab|Eb)(\d)$/.exec(note);
    if (!match) return undefined;
    const [, baseNote, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    const baseOffset = semitoneOffsets[baseNote];
    if (baseOffset === undefined) return undefined;
    // C3 is your sample, so offset from C3
    return (octave - 3) * 12 + baseOffset;
  }
  

  const playNote = async () => {
    const offset = getNoteOffset(note); // note = "D#3", for example
    if (offset === undefined) return;
  
    const { sound } = await Audio.Sound.createAsync(
      require('@/src/assets/notes/harmonium.wav'),
      { shouldPlay: true }
    );
  
    soundRef.current = sound;
    
    
    try {
      const rate = Math.pow(2, offset / 12);
      await sound.setRateAsync(rate, true);
      // console.log(rate);
      await sound.playAsync();
    } catch (error) {
      console.error("Playback error:", error);
      await sound.unloadAsync();
    }
  };
  

  const stopNote = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (e) {
        console.error("Error stopping sound:", e);
      }
    }
  };

  const keyStyles = [
    styles.key,
    type === 'white' ? styles.whiteKey : styles.blackKey,
    {
      backgroundColor: isActive
        ? type === 'white'
          ? getColor('green', 100)
          : getColor('dark', 700)
        : color ?? (type === 'white' ? getColor('light', 500) : getColor('dark')),
    },
    isActive && type === 'white' && styles.activeWhiteKey,
    isActive && type === 'black' && styles.activeKey,
    style,
  ];

  return (
    <Pressable
      onPressIn={() => {
        onPressInCallback?.();
        playNote();
      }}
      onPressOut={() => {
        onPressOutCallback?.();
        stopNote();
      }}
      style={keyStyles}
    >
      <Text style={styles.label}>{note}</Text>
    </Pressable>
  );
};

export default PianoKey;

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
    height: screenHeight * 0.38,
    backgroundColor: getColor('light', 500),
    zIndex: 1,
    borderRadius: 8,
  },
  blackKey: {
    width: 32,
    height: screenHeight * 0.2,
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
  activeWhiteKey: {
    borderColor: getColor('green', 300),
    borderWidth: 2,
  },
  label: {
    fontSize: 12,
    color: getColor('dark', 100),
  },
});
