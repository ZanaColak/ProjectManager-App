import { Text, View, TouchableOpacity, StyleSheet, Animated, Image } from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";

export default function Index() {
  const router = useRouter();

  // Create animated values for each image opacity
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;

  // Array of images to cycle through
  const images = [
    require('../assets/images/homepage.webp'),
    require('../assets/images/blomst.webp'),
    require('../assets/images/Laboratorie_glas.webp'),
  ];

  useEffect(() => {
    // Function to handle the image fade animation
    const startImageFade = () => {
      Animated.sequence([
        Animated.timing(fadeAnim1, {
          toValue: 1,  // Fade in first image
          duration: 3000,  // Duration for fade in
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim1, {
          toValue: 0,  // Fade out first image
          duration: 3000,  // Duration for fade out
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,  // Fade in second image
          duration: 3000,  // Duration for fade in
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 0,  // Fade out second image
          duration: 3000,  // Duration for fade out
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim3, {
          toValue: 1,  // Fade in third image
          duration: 3000,  // Duration for fade in
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim3, {
          toValue: 0,  // Fade out third image
          duration: 3000,  // Duration for fade out
          useNativeDriver: true,
        }),
      ]).start();
    };

    startImageFade();  // Start the fade animation on mount

    // Optional: restart animation after one cycle
    const interval = setInterval(() => {
      startImageFade();
    }, 15000); // Start a new animation every 15 seconds

    return () => clearInterval(interval);  // Cleanup the interval on unmount
  }, [fadeAnim1, fadeAnim2, fadeAnim3]);

  return (
      <View style={styles.container}>
        {/* Header with logo and Project Manager Title */}
        <View style={styles.header}>
          <Image
              source={require('../assets/images/novonesis.png')} // Ensure path is correct
              style={styles.logo}
          />
          <Text style={styles.headerTitle}>Project Management</Text>
        </View>

        {/* Animated images */}
        <Animated.Image
            source={images[0]}
            style={[styles.image, { opacity: fadeAnim1 }]}  // Fade in/out first image
        />
        <Animated.Image
            source={images[1]}
            style={[styles.image, { opacity: fadeAnim2 }]}  // Fade in/out second image
        />
        <Animated.Image
            source={images[2]}
            style={[styles.image, { opacity: fadeAnim3 }]}  // Fade in/out third image
        />

        {/* Overlay text container */}
        <View style={styles.overlayTextContainer}>
          <Text style={styles.textAboveButton}>
            The time for <Text style={styles.textHighlight}>biosolutions is now</Text>
          </Text>

          {/* Login button placed below the text */}
          <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => router.push("/signIn")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#bfe6c4",
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 10,  // Adjust top position to give some space from the top edge
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",  // Space out logo and title
    alignItems: "center",
    zIndex: 40, // Ensure header is above other elements
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",  // Make the text italic
    color: "black",  // Set text color to black
    position: "absolute",  // Position it absolutely within the header
    left: "43%",  // Position title in the middle horizontally
    transform: [{ translateX: -75 }],  // Adjust position to perfectly center the title
    opacity: 0.7,  // Make the text slightly transparent (0.0 is fully transparent, 1.0 is fully opaque)
    textTransform: 'uppercase',
  },

  logo: {
    width: 100,  // Adjust logo size
    height: 80, // Adjust logo size
  },
  image: {
    width: "100%",  // Full width
    height: 400,    // Full height (same size as current image)
    resizeMode: "cover",  // Ensure images cover the space without distortion
    position: "absolute", // Ensure images overlap each other
  },
  overlayTextContainer: {
    position: "absolute", // Ensures text is on top of the image
    top: "40%",           // Adjust for centering
    left: 20,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textAboveButton: {
    fontSize: 28,  // Adjusted size for better fit
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,  // Space between text and button
  },
  textHighlight: {
    backgroundColor: "rgba(0, 122, 255, 0.7)", // Blue background
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "white",
  },
  buttonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto",  // Applying a modern, clean font
    textTransform: 'uppercase',  // Makes the text uppercase
  },
});
