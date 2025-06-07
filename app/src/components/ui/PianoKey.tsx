  import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
  import { Audio } from 'expo-av';
  import { getColor } from '@/src/constants/colors';

  const noteSounds: Record<string, any> = {
    'A': require('@/src/assets/notes/A.mp3'),
    'B': require('@/src/assets/notes/B.mp3'),
    'C': require('@/src/assets/notes/C.mp3'),
    'D': require('@/src/assets/notes/D.mp3'),
    'E': require('@/src/assets/notes/E.mp3'),
    'F': require('@/src/assets/notes/F.mp3'),
    'G': require('@/src/assets/notes/G.mp3'),
    'H': require('@/src/assets/notes/ASharp.mp3'),
    'I': require('@/src/assets/notes/DSharp.mp3'),
    'J': require('@/src/assets/notes/GSharp.mp3'),
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
        
      const playNote = async () => {
        const soundFile = noteSounds[note];
        if (!soundFile) return;
      
        const { sound } = await Audio.Sound.createAsync(soundFile);
      
        try {
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync();
            }
          });
        } catch (error) {
          console.error("Playback error:", error);
          await sound.unloadAsync(); 
        }
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
          height: screenHeight * 0.45,
          backgroundColor: getColor('light', 500),
          zIndex: 1,
          borderRadius: 8,
      },
      blackKey: {
          width: 36,
          height: screenHeight * 0.25,
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
      activeWhiteKey: {
        borderColor: getColor('green', 300),
        borderWidth: 2,
      },
      
  });
