import { View, StyleSheet } from 'react-native';
import PianoKey from '../components/ui/PianoKey';
import { getColor } from '../constants/colors';
import { useState, useEffect, useRef } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import Metronome from '../components/ui/Mentronome';
import { Audio } from 'expo-av';

const whiteNotes = ["A", "B", 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const blackNotes = ["A#", "B#", 'C#', 'D#', 'F#', 'G#', 'H#', 'I#', 'J#'];

const noteSoundFiles: Record<string, any> = {
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

export default function PianoScreen() {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [recordedNotes, setRecordedNotes] = useState<{note: string; time: number}[]>([]);
  const [playingBack, setPlayingBack] = useState(false);

  const soundsRef = useRef<Record<string, Audio.Sound>>({});

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    async function loadSounds() {
      for (const note in noteSoundFiles) {
        const { sound } = await Audio.Sound.createAsync(noteSoundFiles[note]);
        soundsRef.current[note] = sound;
      }
    }
    loadSounds();

    return () => {
      Object.values(soundsRef.current).forEach(sound => {
        if (sound) sound.unloadAsync();
      });
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const playSound = async (note: string) => {
    const sound = soundsRef.current[note];
    if (sound) {
      try {
        await sound.replayAsync(); 
      } catch (error) {
        console.warn('Error playing sound:', error);
      }
    }
  };

  const onNotePress = (note: string) => {
    setActiveNote(note);
    playSound(note);

    if (recording && recordStartTime !== null) {
      const elapsed = (Date.now() - recordStartTime) / 1000;
      setRecordedNotes((prev) => [...prev, { note, time: elapsed }]);
    }
  };

  const playbackRecordedNotes = () => {
    if (recordedNotes.length === 0) return;

    setPlayingBack(true);
    let timeouts: NodeJS.Timeout[] = [];

    recordedNotes.forEach(({ note, time }) => {
      const timeout = setTimeout(() => {
        setActiveNote(note);
        playSound(note);
      }, time * 1000);

      timeouts.push(timeout);
    });

    const lastTime = recordedNotes[recordedNotes.length - 1].time;
    const endTimeout = setTimeout(() => {
      setActiveNote(null);
      setPlayingBack(false);
    }, lastTime * 1000 + 500);

    timeouts.push(endTimeout);

    return () => timeouts.forEach(clearTimeout);
  };

  return (
    <View style={styles.pageContainer}>
    <Metronome recStart={
      { 
        onRecStartPress: () => {
        setRecordedNotes([]);
        setRecordStartTime(Date.now());
        setRecording(true);
      },
      disabled: recording || playingBack
    }} recStop={
      { 
        onRecStopPress: () => {
          setRecording(false);
          setRecordStartTime(null);
      },
      disabled: !recording
    }}  playback={{
      playbackRecordedNotes: playbackRecordedNotes, 
      disabled: recording || recordedNotes.length === 0 || playingBack,
    }} />

      <View style={styles.piano}>
        {whiteNotes.map((note) => (
          <PianoKey
            key={note}
            note={note}
            type="white"
            isActive={activeNote === note}
            onPress={() => onNotePress(note)}
          />
        ))}
        {blackNotes.map((note, index) => (
          <PianoKey
            key={note}
            note={note}
            type="black"
            isActive={activeNote === note}
            onPress={() => onNotePress(note)}
            style={{ left: 75 * index + 60 }}
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
