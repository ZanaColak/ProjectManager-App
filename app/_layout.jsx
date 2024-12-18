import { useRouter, Stack } from "expo-router";
import {signingOut} from "./components/signOut";
import {Button} from "react-native";

export default function RootLayout() {
    const router = useRouter();

    return (
        <Stack>

            {/* Index Screen */}
            <Stack.Screen name="index" options={{headerShown: false}}/>

            {/* Department Screen */}
            <Stack.Screen name="department" options={{
                headerRight: () => (
                    <Button onPress={() => signingOut(router)}
                            title="Sign Out"
                            color="black"
                    />
                ),
            }}
            />

            {/* Dashboard Screen */}
            <Stack.Screen name="dashboard" options={{
                headerRight: () => (
                    <Button onPress={() => signingOut(router)}
                            title="Sign Out"
                            color="black"
                    />
                ),
            }}
            />

            {/* Project Screen */}
            <Stack.Screen name="project" options={{headerShown: true}}/>

            {/* Scrum board Screen */}
            <Stack.Screen name="scrumboard" options={{headerShown: true}}/>

            {/* Calender Screen */}
            <Stack.Screen name="calendar" options={{headerShown: true}}/>

            {/* Timeline Screen */}
            <Stack.Screen name="timeline" options={{headerShown: true}}/>

        </Stack>
    );
}
