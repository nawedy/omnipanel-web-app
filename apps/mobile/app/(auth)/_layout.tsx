import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function AuthLayout(): JSX.Element {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="welcome" 
        options={{
          title: 'Welcome',
        }}
      />
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          title: 'Sign Up',
        }}
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{
          title: 'Reset Password',
        }}
      />
    </Stack>
  );
} 