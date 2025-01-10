import { Platform, Alert } from "react-native";

export const showAlert = (title, message, options = {}) => {
    if (Platform.OS === "web") {
        const defaultCallback = () => console.log("Alert dismissed on web");
        const callback = options.onDismiss || defaultCallback;
        alert(`${title}: ${message}`);
        callback();
    } else {
        Alert.alert(
            title,
            message,
            options.buttons || [{ text: "OK", onPress: () => {} }],
            { cancelable: options.cancelable || true }
        );
    }
};
