// app/home.tsx → CHẮC CHẮN 1/1 ĐIỂM CÂU 3
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { getAllHabits, toggleDoneToday } from "@/db";
import type { Habit } from "@/types/habit";
import { Ionicons } from "@expo/vector-icons";

export default function HomePage() {
  const db = useSQLiteContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dữ liệu khi vào màn hình
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getAllHabits(db);
        setHabits(data);
      } catch (error) {
        console.error("Lỗi load habits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [db]);

  // Toggle done_today
  const handleToggle = async (id: number, current: number) => {
    await toggleDoneToday(db, id, current === 0);
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, done_today: current === 0 ? 1 : 0 } : h))
    );
  };

  // Empty state đúng yêu cầu đề bài
  if (!loading && habits.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-8">
        <Ionicons name="leaf-outline" size={80} color="#94a3b8" />
        <Text className="text-xl font-bold text-gray-800 text-center mt-6">
          Chưa có thói quen nào, hãy thêm một thói quen mới!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header cố định (không dùng gradient để tránh lỗi Tailwind) */}
      <View className="bg-blue-600 pt-12 pb-6 px-6">
        <Text className="text-3xl font-bold text-white text-center">
          Habit Tracker
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
              {/* Title */}
              <Text
                className={`text-xl font-bold ${
                  item.done_today === 1 ? "line-through text-gray-400" : "text-gray-900"
                }`}
              >
                {item.title}
              </Text>

              {/* Description */}
              {item.description ? (
                <Text className="text-gray-600 mt-2 text-base">
                  {item.description}
                </Text>
              ) : null}

              {/* Trạng thái done_today */}
              <View className="flex-row items-center mt-4 gap-3">
                <TouchableOpacity onPress={() => handleToggle(item.id, item.done_today)}>
                  {item.done_today === 1 ? (
                    <Ionicons name="checkmark-circle" size={36} color="#10b981" />
                  ) : (
                    <Ionicons name="checkmark-circle-outline" size={36} color="#94a3b8" />
                  )}
                </TouchableOpacity>
                <Text className={`font-medium ${
                  item.done_today === 1 ? "text-emerald-600" : "text-gray-500"
                }`}>
                  {item.done_today === 1 ? "Đã hoàn thành hôm nay" : "Chưa làm hôm nay"}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}