import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image
} from "react-native";
import useBLE from "./useBLE";
import Slider from "@react-native-community/slider";
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
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
              Alert.alert("Alarm", `Das RSSI ist seit 10 Sekunden unter ${rssiTreshold}!`);
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
    }
  
    return (
      <SafeAreaView style={[styles.container, connectedDevice ? styles.connectedBackground : null]}>
        <View style={styles.contentWrapper}>
          {connectedDevice ? (
            <>
              <Text style={styles.titleText}>Beacon verbunden</Text>
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

              <Image style={styles.unicornImage} source={require('./img/unicorn_smiling.png')} />
  
              {rssi < rssiTreshold && countdown !== null && (
                <Text style={styles.countdownText}>Alarm in {countdown} Sekunden...</Text>
              )}
              {rssiAlert && <Text style={styles.alertText}>Ein Alarm wurde ausgelöst!</Text>}
              {rssiAlert && <TouchableOpacity onPress={resetApp} style={styles.ctaButton}><Text style={styles.ctaButtonText}>Zurücksetzen</Text></TouchableOpacity>}
            </>
          ) : (
            <>
              <Text style={styles.titleText}>Verbinde bitte einen Beacon</Text>

              <Image style={styles.unicornImage} source={require('./img/unicorn_scanning.png')} />
              {deviceSearching ? <Text>Suche Beacon...</Text> : null}
            </>
          )}
        </View>
        <TouchableOpacity
          onPress={connectedDevice ? resetApp : handleScan}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>
            {connectedDevice ? "Beacon trennen" : "Beacon suchen"}
          </Text>
        </TouchableOpacity>

        <LinearGradient
            // Button Linear Gradient
            colors={['#4c669f', '#3b5998', '#192f6a']}>
            <Text >Sign in with Facebook</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f2f2f2",
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
      color: "black",
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
  });

export default HomeScreen;