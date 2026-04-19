import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";

import FeedScreen from "../screens/FeedScreen";
import ExplorarScreen from "../screens/ExplorarScreen";
import NotasScreen from "../screens/NotasScreen";
import PerfilScreen from "../screens/PerfilScreen";
import { useTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }) => {
  const icons = {
    Feed: "📰",
    Explorar: "🔍",
    Notas: "📊",
    Perfil: "👤",
  };
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.5 }]}>
        {icons[name] || "📱"}
      </Text>
    </View>
  );
};

const AppNavigator = () => {
  const { theme: T, isDark } = useTheme();
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: T.nav,
            borderTopColor: T.border,
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 20,
            paddingTop: 8,
          },
          tabBarActiveTintColor: T.accent,
          tabBarInactiveTintColor: T.muted,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
        })}
      >
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Explorar" component={ExplorarScreen} />
        <Tab.Screen name="Notas" component={NotasScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 22,
  },
});

export default AppNavigator;