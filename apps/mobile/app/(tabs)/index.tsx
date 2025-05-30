import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  ScrollView 
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

export default function ChatScreen(): JSX.Element {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    welcomeText: {
      fontSize: 18,
      color: colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    placeholderText: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
        
        <ScrollView style={styles.content}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </Text>
          
          <Text style={styles.subtitle}>
            Start a conversation with any AI model. Your chat history will sync across all your devices.
          </Text>
          
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Chat interface coming soon...{'\n\n'}
              • Multi-model support{'\n'}
              • Real-time streaming{'\n'}
              • Voice input{'\n'}
              • File attachments{'\n'}
              • Code generation
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
} 