import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from "react-native";
import useBLE from "./useBLE";
import Slider from "@react-native-community/slider";
import { LinearGradient } from 'expo-linear-gradient';
import CheckBox from '@react-native-community/checkbox';
import useAudioPlayer from './useAudioPlayer';
import useLocation from "./useLocation";

const audioSource = require('./img/alert.mp3');

const HomeScreen = () => {
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
  const [showMetaData, setShowMetaData] = useState<boolean>(false);


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
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          } else {
            clearInterval(interval);
            setRssiAlert(true);
            playSound();
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

                <Text style={styles.sliderLabel}>Schwellenwert: {rssiTreshold}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={-100}
                  maximumValue={-30}
                  step={1}
                  value={rssiTreshold}
                  onValueChange={setRssiTrheshold}
                  minimumTrackTintColor="red"
                  maximumTrackTintColor="gray"
                />

                {rssi < rssiTreshold && countdown !== null && (
                  <Text style={styles.countdownText}>Alarm in {countdown} Sekunden...</Text>
                )}
              </>) : (<></>)}

              {rssiAlert && <Text style={styles.alertText}>Ein Alarm wurde ausgelöst!</Text>}
              {location && <Text style={styles.alertText}>Deine Koordinaten: {location.coords.latitude}-{location.coords.longitude}</Text>}
            </>
          ) : (
            <>
              <Text style={styles.titleText}>Bitte verbinde einen Beacon!</Text>
              <Image style={styles.unicornImage} source={require('./img/unicorn_scanning.png')} />
              {deviceSearching ? <Text>Suche Beacon...</Text> : null}
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={connectedDevice ? resetApp : handleScan}
          style={[styles.ctaButton]}
        >
          <Text style={styles.ctaButtonText}>
            {connectedDevice ? "Abbrechen" : "Beacon suchen"}
          </Text>
        </TouchableOpacity>

        <View style={styles.metaData}>
          <Text>Zeige Metadaten?</Text>
          <CheckBox
            value={showMetaData}
            onValueChange={(newValue: boolean) => setShowMetaData(newValue)}
          />
        </View>
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