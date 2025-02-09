import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleManager,
  Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  stopScan(): void;
  connectedDevice: Device | null;
  setConnectedDevice: Dispatch<SetStateAction<Device | null>>;
  setDeviceSearching: Dispatch<SetStateAction<boolean>>;
  deviceSearching: boolean;
  rssi: number;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [rssi, setRssi] = useState<number>(0);
  const [deviceSearching, setDeviceSearching] = useState<boolean>(false);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      setDeviceSearching(true);

      if (error) {
        console.log("Scan-Fehler:", error);
        return;
      }

      if (device && device.name === "Holy-IOT") {
        setConnectedDevice(device);
        setRssi(device.rssi ?? 0);
        setDeviceSearching(false);
      }
    });
  };

  const stopScan = () => {
    bleManager.stopDeviceScan();
  };

  return {
    requestPermissions,
    scanForPeripherals,
    stopScan,
    connectedDevice,
    setConnectedDevice,
    setDeviceSearching,
    deviceSearching,
    rssi,
  };
}

export default useBLE;