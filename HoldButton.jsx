import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, Animated, StyleSheet } from "react-native";

const HoldButton = ({ onLongPress, label }) => {
  const [progress] = useState(new Animated.Value(0));
  const [holding, setHolding] = useState(false);
  
  useEffect(() => {
    if (holding) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          onLongPress();
          progress.setValue(0);
        }
      });
    } else {
      progress.setValue(0);
    }
  }, [holding]);

  return (
    <TouchableOpacity
      onPressIn={() => setHolding(true)}
      onPressOut={() => setHolding(false)}
      style={styles.button}
    >
      <View style={styles.progressContainer}>
        <Animated.View
          style={[styles.progressBar, { width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"]
          }) }]}
        />
      </View>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default HoldButton;
