import { useState, useEffect } from "react";
import * as Location from "expo-location";

const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
  
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
  
      // Regelmäßiges Aktualisieren der Location alle 10 Sekunden
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => setLocation(newLocation)
      );
    }
  
    getCurrentLocation();
  
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);
  
  return { location };
};

export default useLocation;