// app/_layout.tsx  (hoặc app/layout.tsx – tùy bạn đang đặt)
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import * as SQLite from "expo-sqlite";
import { initTable, seedSampleHabits } from "@/db"; 
import { Icon } from "react-native-paper";

export default function Layout() {
  return (
    <SQLiteProvider
      databaseName="habitTracker.db"  
      onInit={async (db) => {
        await initTable(db);
        await seedSampleHabits(db);  
      }}
    >
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white">
          

          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: "#007AFF",
              tabBarInactiveTintColor: "#8E8E93",
              tabBarStyle: {
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderTopColor: "#e0e0e0",
              },
            }}
          >
            {/* Tab Home - Danh sách thói quen */}
            <Tabs.Screen
              name="home"
              options={{
                title: "Home",
                tabBarIcon: ({ focused, color }) => (
                  <Icon
                    source={focused ? "home" : "home-outline"}
                    size={28}
                    color={color}
                  />
                ),
              }}
            />

            {/* Tab Form - Thêm / Sửa */}
            <Tabs.Screen
              name="form"
              options={{
                title: "Thêm",
                tabBarIcon: ({ color }) => (
                  <Icon source="plus-circle" size={32} color="#007AFF" />
                ),
              }}
            />

            {/* Tab Trash - Thùng rác (có thể làm sau) */}
            <Tabs.Screen
              name="trash"
              options={{
                title: "Thùng rác",
                tabBarIcon: ({ color }) => (
                  <Icon source="trash-can-outline" size={26} color={color} />
                ),
              }}
            />

            {/* Tab Sync - Import từ API */}
            <Tabs.Screen
              name="sync"
              options={{
                title: "Đồng bộ",
                tabBarIcon: ({ color }) => (
                  <Icon source="cloud-download-outline" size={26} color={color} />
                ),
              }}
            />

            {/* Ẩn tab index (không cho vào tab bar) */}
            <Tabs.Screen
              name="index"
              options={{
                href: null,
              }}
            />
          </Tabs>
        </SafeAreaView>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}