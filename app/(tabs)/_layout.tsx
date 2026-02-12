import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar, Text, View } from "react-native";
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
          tabBarStyle: { height: 60 },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: focused ? "#3498db" : "transparent" }}>
                {focused ? "Dashboard" : ""}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View>
                <MaterialCommunityIcons
                  name={focused ? "view-dashboard" : "view-dashboard-outline"}
                  color={focused ? "#3498db" : "#696969"}
                  size={focused ? 28 : 32}
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="reservation"
          options={{
            tabBarLabel: ({ focused }) => (
              <View>
                <Text style={{ color: focused ? "#3498db" : "transparent" }}>
                  {focused ? "Reservations" : ""}
                </Text>
              </View>
            ),
            tabBarIcon: ({ focused }) => (
              <View>
                <MaterialCommunityIcons
                  name={focused ? "bookmark" : "bookmark-outline"}
                  color={focused ? "#3498db" : "#696969"}
                  size={focused ? 28 : 32}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="returnbook"
          options={{
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: focused ? "#3498db" : "transparent" }}>
                {focused ? "Return Book" : ""}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View>
                <MaterialCommunityIcons
                  name={focused ? "arrow-u-left-top" : "arrow-u-left-top"}
                  color={focused ? "#3498db" : "#696969"}
                  size={focused ? 28 : 32}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
