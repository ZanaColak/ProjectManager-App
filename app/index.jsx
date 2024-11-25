import { Text, View, Button, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
      <View style={styles.container}>
        {/* Title in the top-left corner */}
        <Text style={styles.title}>Novonesis</Text>

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
        </View>

        {/* Login button */}
        <View style={styles.buttonContainer}>
          <Button
              title="Login"
              onPress={() => router.push("/signIn")}
              color="#007AFF"
          />
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
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  title: {
    position: "absolute", // Places title on top of the image
    top: 10,              // Positions it closer to the top
    left: 10,             // Aligns it to the left edge
    fontSize: 20,         // Slightly smaller font size
    fontWeight: "bold",
    color: "black",       // Ensures it contrasts with the image
  },
  overlayTextContainer: {
    position: "absolute",  // Ensures that the text is on top of the image
    top: "50%",            // Positions the text centrally on the image
    left: 20,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -20 }], // Adjusts the vertical alignment
  },
  textAboveButton: {
    fontSize: 36,  // Larger text size
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  textHighlight: {
    backgroundColor: "rgba(0, 122, 255, 0.7)", // Transparent blue background
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "white",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
});
