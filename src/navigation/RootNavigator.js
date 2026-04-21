import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '@/stores/authStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useBootstrap } from '@/app/useBootstrap'
import { SplashScreen } from '@/screens/SplashScreen'
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen'
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen'

const Stack = createNativeStackNavigator()

export function RootNavigator({ Main }) {
  useBootstrap()

  const bootstrapped = useAuthStore(s => s.bootstrapped)
  const authLoading = useAuthStore(s => s.authLoading)
  const currentUser = useAuthStore(s => s.currentUser)
  const done = useOnboardingStore(s => s.done)

  if (!bootstrapped || authLoading) {
    return <SplashScreen />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      {!currentUser ? (
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      ) : !done ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="Main" component={Main} />
      )}
    </Stack.Navigator>
  )
}
