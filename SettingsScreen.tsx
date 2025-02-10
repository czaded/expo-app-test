import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Keyboard } from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const SettingsScreen = () => {
  const [emergencyNumber, setEmergencyNumber] = useState('+49');
  const [alarmThreshold, setAlarmThreshold] = useState(-70);

  const saveData = async () => {
    Keyboard.dismiss();
    try {
      await AsyncStorage.setItem('emergencyNumber', emergencyNumber);
      await AsyncStorage.setItem('alarmThreshold', alarmThreshold.toString());
      console.log('Daten gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const number = await AsyncStorage.getItem('emergencyNumber');
      const threshold = await AsyncStorage.getItem('alarmThreshold');
  
      if (number) {
        setEmergencyNumber(number);
      }

      if (threshold) {
        setAlarmThreshold(Number(threshold));
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Einstellungen</Text>
      
      <Text style={styles.label}>Notfallnummer:</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+49 123 4567890"
        value={emergencyNumber}
        onChangeText={setEmergencyNumber}
      />
      
      <Text style={styles.label}>Alarm-Sensitivität:</Text>
      <Text>{alarmThreshold}</Text>
      <Slider
        style={styles.slider}
        minimumValue={-100}
        maximumValue={-20}
        step={1}
        value={alarmThreshold}
        onValueChange={setAlarmThreshold}
        minimumTrackTintColor="red"
        maximumTrackTintColor="gray"
      />
      
      <Button title="Speichern" onPress={saveData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginTop: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: 'white',
  },
  slider: {
    width: 250,
    height: 40,
    marginTop: 10,
  },
});

export default SettingsScreen;