import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
      <View style={styles.container}>
        {/* Header with the Novonesis logo image */}
        <View style={styles.header}>
          <Image
              source={require('../assets/images/novonesis.png')} // Ensure path is correct
              style={styles.logo}
          />
        </View>

        {/* Background image */}
        <Image
            source={require('../assets/images/homepage.webp')}
            style={styles.image}
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
    backgroundColor: "#ffffff",
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 40, // Ensure header is above other elements
  },
  logo: {
    width: 100,  // Adjust logo size
    height: 80, // Adjust logo size
  },
  image: {
    width: "100%",
    height: 600,
    resizeMode: "cover",
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
