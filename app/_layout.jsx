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
            <Stack.Screen name="department" options={{ title: "Afdeling",
                headerLeft: null,
                headerRight: () => (
                    <Button onPress={() => signingOut(router)}
                            title="Sign Out"
                            color="black"
                    />
                ),
            }}
            />

            {/* Dashboard Screen */}
            <Stack.Screen name="dashboard" options={{ title: "Opslagstavle",
                headerRight: () => (
                    <Button onPress={() => signingOut(router)}
                            title="Sign Out"
                            color="black"
                    />
                ),
            }}
            />

            {/* Project Screen */}
            <Stack.Screen name="project" options={{ title: "Projekt"}}/>

            {/* Scrum board Screen */}
            <Stack.Screen name="scrumboard" options={{ title: "Scrum board"}}/>

            {/* Calender Screen */}
            <Stack.Screen name="calendar" options={{ title: "Kalender"}}/>

            {/* Timeline Screen */}
            <Stack.Screen name="timeline" options={{ title: "Tidslinje"}}/>

            {/* Error Screen */}
            <Stack.Screen name="error" options={{headerShown: false}}/>

        </Stack>
    );
}
