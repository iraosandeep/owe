import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { db } from '@/db/client';
import migrations from '@/drizzle/migrations';
import { seedDatabase } from '@/db/seed';
import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (success) {
      seedDatabase().then(() => setSeeded(true));
    }
  }, [success]);

  if (error) {
    console.error('Migration error:', error);
  }

  if (!success || !seeded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-entry"
            options={{
              presentation: 'modal',
              title: 'Add Entry',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="person/[name]"
            options={{
              title: 'Person',
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
