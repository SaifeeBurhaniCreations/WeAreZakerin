import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Select from './Select';
import { getColor } from '@/src/constants/colors';
import { useDebouncedEffect } from '@/src/hooks/useDebouncedEffect';
import Typography from '../typography/Typography';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import RecordingStartIcon from '../icons/RecordingStartIcon';
import RecordingStopIcon from '../icons/RecordingStopIcon';
import Playback from '../icons/Playback';

const sounds = {
  click: require('../../assets/notes/sound/click.mp3'),
  ping: require('../../assets/notes/sound/ping.mp3'),
  metal: require('../../assets/notes/sound/metal.mp3'),
  wood: require('../../assets/notes/sound/wood.mp3'),
};

interface MetronomeProps {
  recStart: {
    onRecStartPress: () => void;
    disabled: boolean;
  },
  recStop: {
    onRecStopPress: () => void;
    disabled: boolean;
  },
  playback: {
    playbackRecordedNotes: () => void;
    disabled: boolean;
  },
}
const Metronome = ({ recStart, recStop, playback }: MetronomeProps) => {
  const [bpm, setBpm] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [soundVariant, setSoundVariant] = useState<'click' | 'ping' | 'metal' | 'wood'>('click');
  const tickSound = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMutedRef = useRef(isMuted);
  const [debouncedBpm, setDebouncedBpm] = useState(bpm);

  useEffect(() => {
    setDebouncedBpm(bpm);
  }, [bpm]);

  useDebouncedEffect(() => {
    if (isRunning) {
      stopMetronome();
      startMetronome();
    }
  }, [bpm], 300);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    loadSound();
  }, [soundVariant]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      tickSound.current?.unloadAsync();
    };
  }, []);
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      tickSound.current?.unloadAsync();
    };
  }, []);

  const loadSound = async () => {
    if (tickSound.current) {
      await tickSound.current.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(sounds[soundVariant]);
    tickSound.current = sound;
  };

  const playTick = async () => {
    if (isMutedRef.current) return;
    console.log("Metronome Tick")
    if (tickSound.current) {
      try {
        await tickSound.current.replayAsync();
      } catch (e) {
        console.warn('Could not play sound:', e);
      }
    }
  };


  const startMetronome = async () => {
    await loadSound();
    setIsRunning(true);
    intervalRef.current = setInterval(playTick, (60 / bpm) * 1000);
  };

  const stopMetronome = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      return newMuted;
    });
  };

  const handleToggleMetronome = async () => {
    if (isRunning) {
      stopMetronome();
    } else {
      await startMetronome();
    }
  };

  const { onRecStartPress, disabled: startDisabled } = recStart;
  const { onRecStopPress, disabled: stopDisabled } = recStop;
  const { playbackRecordedNotes, disabled: playbackDisabled } = playback;
  return (
    <View style={styles.container}>
      <View style={styles.controls}>

        <View style={styles.sliderContainer}>
          <Typography variant='h4'>{bpm} BPM</Typography>

          <MultiSlider
            values={[bpm]}
            min={40}
            max={200}
            step={1}
            sliderLength={250}
            onValuesChange={([value]) => setBpm(value)}
            selectedStyle={{
              backgroundColor: getColor("green"),
            }}
            unselectedStyle={{
              backgroundColor: getColor("green", 100),
            }}
            markerStyle={{
              height: 20,
              width: 20,
              borderRadius: 10,
              backgroundColor: getColor("green"),
              borderWidth: 1,
              borderColor: '#fff',
            }}
            containerStyle={{ alignSelf: 'center' }}
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onRecStartPress} disabled={startDisabled} style={styles.actionButton}>
            <RecordingStartIcon color={getColor("green", startDisabled ? 100 : 700)} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRecStopPress} disabled={stopDisabled} style={styles.actionButton}>
            <RecordingStopIcon color={getColor("green", stopDisabled ? 100 : 700)} />
          </TouchableOpacity>
          <TouchableOpacity onPress={playbackRecordedNotes} disabled={playbackDisabled} style={styles.actionButton}>
            <Playback color={getColor("green", playbackDisabled ? 100 : 700)} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMute} style={styles.actionButton}>
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={32}
              color={getColor("green", 700)}
            />
          </TouchableOpacity>

          <View style={styles.selectWrapper}>
            <Select
              options={[
                { label: "Click", value: "click" },
                { label: "Ping", value: "ping" },
                { label: "Metal", value: "metal" },
                { label: "Wood", value: "wood" },
              ]}
              value={soundVariant}
              onSelect={(itemValue) => setSoundVariant((itemValue as 'click' | 'ping' | 'metal' | 'wood'))}
              placeholder="Click"
            />
          </View>

          <TouchableOpacity onPress={handleToggleMetronome} style={styles.actionButton}>
            <Ionicons
              name={isRunning ? 'pause-circle' : 'play-circle'}
              size={48}
              color={getColor("green")}
            />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  dialContainer: {
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
    width: '100%',
  },
  sliderContainer: {
    alignItems: 'center',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  actionButton: {
    paddingHorizontal: 8,
  },

  selectWrapper: {
    marginHorizontal: 8,
    minWidth: 100,
  },

});

export default Metronome;
