import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Index(): JSX.Element {
  const { user, isLoading: authLoading, initialize } = useAuth();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen while checking auth state
  if (authLoading || onboardingLoading) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, redirect to auth flow
  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // If user hasn't completed onboarding, redirect to onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // User is authenticated and onboarded, redirect to main app
  return <Redirect href="/(tabs)" />;
}

// Fallback component if something goes wrong
function ErrorFallback(): JSX.Element {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Something went wrong. Please restart the app.</Text>
    </View>
  );
} 