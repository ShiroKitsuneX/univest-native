import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

// Phase B scaffolding: single-screen stack that renders the full MainApp.
// Phase C will split AuthStack / OnboardingStack / MainTabs out of MainApp
// and dispatch based on `useAuthStore` + `useOnboardingStore` here.
export function RootNavigator({ Main }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="Main" component={Main} />
    </Stack.Navigator>
  );
}
