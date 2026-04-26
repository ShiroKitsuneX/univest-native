import type { ComponentType } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '@/stores/authStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useBootstrap } from '@/app/useBootstrap'
import { SplashScreen } from '@/screens/SplashScreen'
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen'
import { TermsScreen } from '@/screens/auth/TermsScreen'
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen'
import { TermsReacceptModal } from '@/modals/TermsReacceptModal'

const Stack = createNativeStackNavigator()

type Props = {
  Main: ComponentType<object>
}

export function RootNavigator({ Main }: Props) {
  useBootstrap()

  const bootstrapped = useAuthStore(s => s.bootstrapped)
  const authLoading = useAuthStore(s => s.authLoading)
  const currentUser = useAuthStore(s => s.currentUser)
  const userData = useAuthStore(s => s.userData)
  const done = useOnboardingStore(s => s.done)
  const needsTermsReaccept = useAuthStore(s => s.needsTermsReaccept)
  const setNeedsTermsReaccept = useAuthStore(s => s.setNeedsTermsReaccept)

  const handleTermsAccepted = () => {
    setNeedsTermsReaccept(false)
  }

  const handleTermsDeclined = async () => {
    setNeedsTermsReaccept(false)
  }

  if (!bootstrapped || authLoading) {
    return <SplashScreen />
  }

  const isInstitution = userData?.tipo === 'instituicao'

  return (
    <>
      <Stack.Navigator
        id="Root"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {!currentUser ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
          </>
        ) : !done && !isInstitution ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={Main} />
        )}
      </Stack.Navigator>
      <TermsReacceptModal
        visible={needsTermsReaccept && !!currentUser}
        onAccepted={handleTermsAccepted}
        onDeclined={handleTermsDeclined}
      />
    </>
  )
}
