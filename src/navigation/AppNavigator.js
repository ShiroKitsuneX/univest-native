import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";

import FeedScreen from "../screens/FeedScreen";
import ExplorarScreen from "../screens/ExplorarScreen";
import NotasScreen from "../screens/NotasScreen";
import PerfilScreen from "../screens/PerfilScreen";

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused, color }) => {
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

const AppNavigator = ({ theme, isDark }) => {
  const T = theme;
  const activeColor = T.accent;
  const inactiveColor = T.muted;
  const backgroundColor = T.nav;
  const borderColor = T.border;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor,
            borderTopColor: borderColor,
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 20,
            paddingTop: 8,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={route.name} focused={focused} color={color} />
          ),
        })}
      >
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{ tabBarLabel: "Feed" }}
        />
        <Tab.Screen
          name="Explorar"
          component={ExplorarScreen}
          options={{ tabBarLabel: "Explorar" }}
        />
        <Tab.Screen
          name="Notas"
          component={NotasScreen}
          options={{ tabBarLabel: "Notas" }}
        />
        <Tab.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{ tabBarLabel: "Perfil" }}
        />
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