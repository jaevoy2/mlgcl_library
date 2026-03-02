import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar, StyleSheet, Text } from "react-native";
import "react/compiler-runtime";

export default function TabsLayout() {
  return (
    <>
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={"light-content"}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#3498db",
          tabBarInactiveTintColor: "#A0A0A0",
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Dashboard
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={'grid'}
                color={focused ? "#3498db" : "#A0A0A0"}
                size={24}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="reservation"
          options={{
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Reservations
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={'bookmark-outline'}
                color={focused ? "#3498db" : "#A0A0A0"}
                size={24}
              />
            ),
          }}
        />

         <Tabs.Screen
            name="returnbook"
            options={{
              href: null,
            }}
          />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A0A0A0',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#3498db',
    fontWeight: '600',
  },
});