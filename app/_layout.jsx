import {router, Stack} from "expo-router";
import {signingOut} from "@/app/signOut";
import {Button} from "react-native";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}}/>
            <Stack.Screen name={'signIn'} options={{headerShown: false}}/>

            <Stack.Screen name={'department'} options={{
                headerLeft: null, headerRight: () => (
                    <Button
                        onPress={() => signingOut(router)}
                        title="Sign Out"
                        color="black"
                    />
                )
            }}/>
        </Stack>
    );
}
