import { View, StyleSheet } from 'react-native';
import PianoKey from '../components/ui/PianoKey';
import { getColor } from '../constants/colors';
import { useState } from 'react';

const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#', 'B#'];

export default function PianoScreen() {
  const [activeNote, setActiveNote] = useState<string | null>(null);

  return (
    <View style={styles.pageContainer}>
      <View style={styles.piano}>
        {whiteNotes.map((note) => (
          <PianoKey
            key={note}
            note={note}
            type="white"
            isActive={activeNote === note}
            onPress={() => setActiveNote(note)}
          />
        ))}
          {blackNotes.map((note, index) => (
          <PianoKey
            key={note}
            note={note}
            type="black"
            isActive={activeNote === note}
            onPress={() => setActiveNote(note)}
            style={{ left: 60 * index + 50}}  
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: getColor('light', 200),
    flex: 1,
    padding: 16,
    gap: 16,
  },
  piano: {
    flexDirection: 'row',
    position: 'relative',
  },
});
