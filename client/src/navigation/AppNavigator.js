import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import AmazonSearchScreen from '../screens/AmazonSearchScreen';
import FlipkartSearchScreen from '../screens/FlipkartSearchScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' },
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="AmazonSearch" 
          component={AmazonSearchScreen}
          options={{
            gestureEnabled: false // Disable swipe back gesture to prevent accidental navigation during scraping
          }}
        />
        <Stack.Screen 
          name="FlipkartSearch" 
          component={FlipkartSearchScreen}
          options={{
            gestureEnabled: false // Disable swipe back gesture to prevent accidental navigation during scraping
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
