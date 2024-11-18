import { Text, View } from "react-native";
import { app } from "./firebase";

export default function Index() {
    alert(JSON.stringify(app, null))

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Tester</Text>
    </View>
  );
}
