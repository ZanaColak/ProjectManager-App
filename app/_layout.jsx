import { Stack } from "expo-router";
import { signingOut } from "app/components/signOut";
import { useRouter } from "expo-router";
import { Button } from "react-native";

export default function RootLayout() {
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{headerRight: () => (
                        <Button
                            onPress={() => signingOut(router)} // Pass router correctly
                            title="Sign Out"
                            color="black"
                        />
                ),}}/>
            <Stack.Screen name="department" options={{headerRight: () => (
                        <Button
                            onPress={() => signingOut(router)} // Pass router correctly
                            title="Sign Out"
                            color="black"
                        />
                ),}}/>
        </Stack>
    );
}
