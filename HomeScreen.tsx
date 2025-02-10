import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, Alert, Keyboard } from "react-native";
import useBLE from "./useBLE";
import { LinearGradient } from 'expo-linear-gradient';
import CheckBox from '@react-native-community/checkbox';
import useAudioPlayer from './useAudioPlayer';
import useLocation from "./useLocation";
import { useKeepAwake } from 'expo-keep-awake';
import HoldButton from "./HoldButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";


const audioSource = require('./img/alert.mp3');

const HomeScreen = () => {
  useKeepAwake();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const { playSound, stopSound } = useAudioPlayer(audioSource);
  let { location } = useLocation();
  const {
    requestPermissions,
    scanForPeripherals,
    stopScan,
    setConnectedDevice,
    setDeviceSearching,
    connectedDevice,
    deviceSearching,
    rssi,
  } = useBLE();
  const [rssiAlert, setRssiAlert] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [startCountdown, setStartCountdown] = useState<boolean>(false);
  const [rssiTreshold, setRssiTrheshold] = useState<number>(-70);
  const [emergencyNumber, setEmergencyNumber] = useState<string | null>(null);
  const [showMetaData, setShowMetaData] = useState<boolean>(false);


  const sendSMS = async (emergencyNumber: string, location: any) => {
    const url = 'http://tracking.digital-apps.de:3000/send-sms';
    const message = `Notfall! Die Koordinaten sind: https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emergencyNumber,
          message: message,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error('Fehler beim Senden der SMS');
      }
  
      console.log('SMS gesendet:', result);
    } catch (error) {
      console.error('SMS konnte nicht gesendet werden:', error);
      setTimeout(() => sendSMS(emergencyNumber, location), 60000); // Versuch in 60 Sekunden
    }
  };
  

  const loadData = async () => {
    try {
      const number = await AsyncStorage.getItem('emergencyNumber');
      const threshold = await AsyncStorage.getItem('alarmThreshold');
  
      if (number) {
        setEmergencyNumber(number);
      }

      if (threshold) {
        setRssiTrheshold(Number(threshold));
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    }
  };

  useEffect(() => {
    if (rssi < rssiTreshold) {
      setStartCountdown(true);
    } else {
      setStartCountdown(false);
      setRssiAlert(false);
      setCountdown(null);
    }
  }, [rssi, rssiTreshold]);

  useEffect(() => {
    if (startCountdown) {
      setCountdown(10);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          } else {
            clearInterval(interval);
            setRssiAlert(true);
            // playSound();

            if (emergencyNumber && location) {
              sendSMS(emergencyNumber, location);
            }

            console.log(location);
            return null;
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startCountdown]);

  const handleScan = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const getBarColor = () => {
    if (rssi >= -50) return "green";
    if (rssi >= -70) return "yellow";
    return "red";
  };

  const resetApp = () => {
    stopScan();
    setConnectedDevice(null);
    setStartCountdown(false);
    setRssiAlert(false);
    setDeviceSearching(false);
    stopSound();
  }

  return (
    <LinearGradient
      colors={['#d9a7c7', '#fffcdc']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>

        {!emergencyNumber ? (<>
          <View style={styles.contentWrapper}>
            <Text style={styles.ctaButtonText}>Bitte Nummer einfügen</Text>
          </View>
        </>) : (<>
        
          <View style={styles.contentWrapper}>
          {connectedDevice ? (
            <>
              <Text style={styles.titleText}>Beacon verbunden!</Text>
              <Text style={styles.titleSubText}>Du reitest jetzt sicher!</Text>

              {rssiAlert ? <Image style={styles.unicornImage} source={require('./img/unicorn_smiling.png')} />
                : (<Image style={styles.unicornImage} source={require('./img/unicorn_smiling.png')} />)}


              {showMetaData ? (<>
                <Text style={styles.rssiText}>RSSI: {rssi}</Text>
                <View style={[styles.rssiBar, { width: `${100 + rssi}%`, backgroundColor: getBarColor() }]} />

                {rssi < rssiTreshold && countdown !== null && (
                  <Text style={styles.countdownText}>Alarm in {countdown} Sekunden...</Text>
                )}

                {emergencyNumber && <Text style={styles.alertText}>Notfallnummer: {emergencyNumber}</Text>}
                {rssiTreshold !== null && <Text style={styles.alertText}>RSSI-Schwellenwert: {rssiTreshold}</Text>}


                {location && <Text style={styles.alertText}>Deine Koordinaten: {location.coords.latitude}-{location.coords.longitude}</Text>}

              </>) : (<></>)}

              {rssiAlert && <Text style={styles.alertText}>Ein Alarm wurde ausgelöst!</Text>}
            </>
            ) : (
              <>
                <Text style={styles.titleText}>Bitte verbinde einen Beacon!</Text>
                <Image style={styles.unicornImage} source={require('./img/unicorn_scanning.png')} />
                {deviceSearching ? <Text>Suche Beacon & Koordinaten...</Text> : null}
              </>
            )}
          </View>

          {connectedDevice ? (
            <HoldButton onLongPress={resetApp} label="Abbrechen (Halten für 3 Sekunden)" />
          ) : (
            <TouchableOpacity onPress={handleScan} style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Beacon suchen</Text>
            </TouchableOpacity>
          )}

          <View style={styles.metaData}>
            <Text>Zeige Metadaten?</Text>
            <CheckBox
              value={showMetaData}
              onValueChange={(newValue: boolean) => setShowMetaData(newValue)}
            />
          </View>
        </>)}


      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  connectedBackground: {
    backgroundColor: "#90EE90",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black"
  },
  titleSubText: {
    fontSize: 25,
    textAlign: "center",
    marginHorizontal: 20,
    color: "black"
  },
  pulse: {
    marginTop: 200,
  },
  unicornImage: {
    marginTop: 20,
    height: 220,
    width: 250
  },
  rssiText: {
    fontSize: 25,
    marginTop: 15,
  },
  alertText: {
    fontSize: 20,
    color: "red",
    marginTop: 10,
  },
  countdownText: {
    fontSize: 18,
    color: "orange",
    marginTop: 10,
  },
  rssiBar: {
    height: 20,
    borderRadius: 10,
    marginTop: 10,
    width: "50%",
  },
  sliderLabel: {
    fontSize: 18,
    marginTop: 20,
  },
  slider: {
    width: 200,
    height: 40,
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  metaData: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  }
});

export default HomeScreen;