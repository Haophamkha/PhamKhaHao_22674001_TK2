// app/home.tsx – FULL HOÀN CHỈNH (Nút Sync đẹp ở trên cùng, không Alert)
import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  getAllHabits,
  toggleDoneToday,
  deleteHabit,
  createHabit,
} from "@/db";
import type { Habit } from "@/types/habit";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const MOCKAPI_URL = "https://6917eadd21a96359486e3d8a.mockapi.io/habit";

export default function HomePage() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<{ id: number; title: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [db])
  );

  const loadHabits = async () => {
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

  const filteredHabits = useMemo(() => {
    let result = habits;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h => h.title.toLowerCase().includes(q));
    }
    if (showActiveOnly) {
      result = result.filter(h => h.active === 1);
    }
    return result;
  }, [habits, searchQuery, showActiveOnly]);

  const handleToggle = async (id: number, current: number) => {
    await toggleDoneToday(db, id, current === 0);
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, done_today: current === 0 ? 1 : 0 } : h))
    );
  };

  const toggleActive = async (id: number, current: number) => {
    const newActive = current === 1 ? 0 : 1;
    await db.runAsync(`UPDATE habits SET active = ? WHERE id = ?`, [newActive, id]);
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, active: newActive } : h))
    );
  };

  const openDeleteModal = (id: number, title: string) => {
    setHabitToDelete({ id, title });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    await deleteHabit(db, habitToDelete.id);
    setHabits(prev => prev.filter(h => h.id !== habitToDelete.id));
    setDeleteModalVisible(false);
    setHabitToDelete(null);
  };

  // SYNC KHÔNG ALERT – CHẠY NGAY
  const syncWithMockAPI = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const response = await fetch(MOCKAPI_URL);
      const serverHabits = response.ok ? await response.json() : [];

      await Promise.all(
        serverHabits.map((h: any) =>
          fetch(`${MOCKAPI_URL}/${h.id}`, { method: "DELETE" }).catch(() => {})
        )
      );

      const localHabits = await getAllHabits(db);
      await Promise.all(
        localHabits.map(habit =>
          fetch(MOCKAPI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: habit.title,
              description: habit.description || "",
              active: habit.active ?? 1,
              done_today: habit.done_today ?? 0,
            }),
          }).catch(() => {})
        )
      );

      await loadHabits();
    } catch (error) {
      console.warn("Sync lỗi:", error);
    } finally {
      setSyncing(false);
    }
  };

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
      {/* HEADER SIÊU ĐẸP VỚI NÚT SYNC Ở TRÊN CÙNG */}
      <View className="bg-blue-600 pt-12 pb-6 px-6 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-white">
          Habit Tracker
        </Text>

        {/* NÚT SYNC ĐẸP NHẤT – TRÊN CÙNG */}
        <TouchableOpacity
          onPress={syncWithMockAPI}
          disabled={syncing}
          className={`bg-white/20 backdrop-blur-lg rounded-full p-3 ${
            syncing ? "opacity-70" : ""
          }`}
          activeOpacity={0.8}
        >
          {syncing ? (
            <ActivityIndicator size={28} color="white" />
          ) : (
            <MaterialIcons name="sync" size={32} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View className="px-4 pt-4 pb-2 bg-gray-50 border-b border-gray-200">
        <View className="flex-row items-center bg-white rounded-xl shadow-sm border border-gray-300">
          <Ionicons name="search" size={20} color="#94a3b8" className="ml-4" />
          <TextInput
            placeholder="Tìm kiếm thói quen..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 px-3 py-3 text-base"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="pr-4">
              <Ionicons name="close-circle" size={22} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-sm font-medium text-gray-700">Ẩn thói quen đã dừng</Text>
          <TouchableOpacity
            onPress={() => setShowActiveOnly(v => !v)}
            className={`px-5 py-2.5 rounded-full flex-row items-center gap-2 ${
              showActiveOnly ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Ionicons name={showActiveOnly ? "eye-outline" : "eye-off-outline"} size={18} color="white" />
            <Text className="font-semibold text-white text-sm">
              {showActiveOnly ? "Bật" : "Tắt"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filteredHabits}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className={`bg-white border-2 rounded-xl p-5 mb-4 shadow-sm ${
              item.active === 0 ? "opacity-60 border-orange-300" : "border-gray-200"
            }`}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className={`text-xl font-bold flex-1 mr-3 ${
                  item.done_today === 1 ? "line-through text-gray-400" : "text-gray-900"
                }`}>
                  {item.title}
                </Text>

                <TouchableOpacity
                  onPress={() => toggleActive(item.id, item.active ?? 1)}
                  className={`px-3 py-2 rounded-lg mr-2 ${
                    item.active === 1 ? "bg-emerald-100" : "bg-orange-100"
                  }`}
                >
                  <Text className={`font-semibold text-sm ${
                    item.active === 1 ? "text-emerald-700" : "text-orange-700"
                  }`}>
                    {item.active === 1 ? "Bật" : "Tắt"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push(`/form?id=${item.id}`)}
                  className="bg-blue-100 p-2 rounded-lg mr-2"
                >
                  <MaterialIcons name="edit" size={22} color="#2563eb" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openDeleteModal(item.id, item.title)}
                  className="bg-red-100 p-2 rounded-lg"
                >
                  <MaterialIcons name="delete-forever" size={24} color="#dc2626" />
                </TouchableOpacity>
              </View>

              {item.description ? (
                <Text className="text-gray-600 text-base">{item.description}</Text>
              ) : null}

              <TouchableOpacity
                onPress={() => handleToggle(item.id, item.done_today)}
                className={`mt-4 px-5 py-3 rounded-full flex-row items-center gap-3 self-start ${
                  item.done_today === 1
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
                  {item.done_today === 1 ? "Hoàn thành!" : "Chưa làm"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* NÚT THÊM */}
      <TouchableOpacity
        onPress={() => router.push("/form")}
        className="absolute bottom-8 right-6 bg-blue-600 rounded-full p-5 shadow-2xl z-20"
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={36} color="white" />
      </TouchableOpacity>

      {/* Modal xóa */}
      <Modal transparent visible={deleteModalVisible} animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setDeleteModalVisible(false)}
        >
          <View className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <Text className="text-xl font-bold text-center mb-4">Xóa thói quen?</Text>
            <Text className="text-gray-600 text-center mb-6">
              Xóa <Text className="font-bold">"{habitToDelete?.title}"</Text>?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                <Text className="text-center font-semibold text-gray-700">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} className="flex-1 bg-red-500 py-3 rounded-xl">
                <Text className="text-center font-bold text-white">Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}