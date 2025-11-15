
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { getAllHabits, toggleDoneToday } from "@/db";
import type { Habit } from "@/types/habit";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomePage() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
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
    }, [db])
  );

  const handleToggle = async (id: number, current: number) => {
    await toggleDoneToday(db, id, current === 0);
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, done_today: current === 0 ? 1 : 0 } : h))
    );
  };

  // Empty state đúng đề bài
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
      {/* Header */}
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
          // Chỉ thay phần renderItem trong FlatList của home.tsx

          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() => router.push(`/form?id=${item.id}`)} // Nhấn lâu → mở form sửa
              delayLongPress={500}
              activeOpacity={0.7}
            >
              <View className={`bg-white border-2 rounded-xl p-5 mb-4 shadow-sm ${item.done_today === 1 ? "border-emerald-400" : "border-gray-200"
                }`}>
                {/* Title + icon hoàn thành */}
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-xl font-bold flex-1 mr-3 ${item.done_today === 1 ? "line-through text-gray-400" : "text-gray-900"
                      }`}
                  >
                    {item.title}
                  </Text>

                  {/* Nút SỬA rõ ràng */}
                  <TouchableOpacity
                    onPress={() => router.push(`/form?id=${item.id}`)}
                    className="bg-blue-100 p-2 rounded-lg"
                  >
                    <MaterialIcons name="edit" size={22} color="#2563eb" />
                  </TouchableOpacity>
                </View>

                {/* Description */}
                {item.description ? (
                  <Text className="text-gray-600 mt-2 text-base">{item.description}</Text>
                ) : null}

                {/* Toggle hoàn thành */}
                <TouchableOpacity
                  onPress={() => handleToggle(item.id, item.done_today)}
                  className={`mt-4 px-5 py-3 rounded-full flex-row items-center gap-3 self-start ${item.done_today === 1
                      ? "bg-emerald-100 border-2 border-emerald-500"
                      : "bg-gray-100 border-2 border-gray-300"
                    }`}
                >
                  {item.done_today === 1 ? (
                    <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                  ) : (
                    <Ionicons name="checkmark-circle-outline" size={32} color="#94a3b8" />
                  )}
                  <Text className={`font-semibold ${item.done_today === 1 ? "text-emerald-700" : "text-gray-600"}`}>
                    {item.done_today === 1 ? "Hoàn thành hôm nay!" : "Chưa làm hôm nay"}
                  </Text>
                </TouchableOpacity>

                {/* Gợi ý nhấn lâu */}
                <Text className="text-xs text-gray-400 mt-3 text-right">
                  Nhấn giữ để sửa nhanh
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Nút + mở form */}
      <TouchableOpacity
        onPress={() => router.push("/form")}
        className="absolute bottom-8 right-6 bg-blue-600 rounded-full p-5 shadow-2xl"
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
}