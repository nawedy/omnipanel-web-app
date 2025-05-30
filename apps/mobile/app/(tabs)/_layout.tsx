import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { 
  MessageCircle, 
  Code, 
  FileText, 
  Terminal, 
  FolderOpen,
  Settings 
} from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout(): JSX.Element {
  const { colors, theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS === 'android',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon 
              icon={MessageCircle} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="code"
        options={{
          title: 'Code',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon 
              icon={Code} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notebook"
        options={{
          title: 'Notebook',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon 
              icon={FileText} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="terminal"
        options={{
          title: 'Terminal',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon 
              icon={Terminal} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: 'Files',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon 
              icon={FolderOpen} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon 
              icon={Settings} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
    </Tabs>
  );
} 