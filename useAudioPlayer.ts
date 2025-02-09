import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

const useAudioPlayer = (audioSource: any) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAudio = async () => {
      const { sound } = await Audio.Sound.createAsync(audioSource, { shouldPlay: false });
      
      if (isMounted) {
        setSound(sound);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.replayAsync(); // Wiederholen, wenn das Audio fertig ist
          }
        });
      }
    };

    loadAudio();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioSource]);

  const playSound = async () => {
    if (sound) {
      await sound.playAsync();
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };

  return { playSound, stopSound };
};

export default useAudioPlayer;
