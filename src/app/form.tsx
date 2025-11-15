// app/form.tsx → HOÀN CHỈNH – LƯU THÀNH CÔNG + TỰ XÓA INPUT
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createHabit, updateHabit, getHabitById } from "@/db";
import { MaterialIcons } from "@expo/vector-icons";

export default function HabitFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Load dữ liệu khi sửa
  useEffect(() => {
    if (id) {
      (async () => {
        const habit = await getHabitById(db, Number(id));
        if (habit) {
          setTitle(habit.title);
          setDescription(habit.description || "");
        }
      })();
    }
  }, [id, db]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Tiêu đề không được để trống!");
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await updateHabit(db, {
          id: Number(id),
          title: title.trim(),
          description: description.trim() || null,
        });
      } else {
        await createHabit(db, {
          title: title.trim(),
          description: description.trim() || null,
        });
        // XÓA SẠCH INPUT SAU KHI THÊM MỚI
        setTitle("");
        setDescription("");
      }

      router.back(); // ← Về home → home tự reload nhờ useFocusEffect
    } catch (err) {
      Alert.alert("Lỗi", "Không thể lưu thói quen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-8">
        <View className="max-w-md w-full mx-auto">
          <Text className="text-3xl font-bold text-center text-gray-900 mb-10">
            {id ? "Sửa thói quen" : "Thêm thói quen mới"}
          </Text>

          <View className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ví dụ: Uống 2 lít nước"
                className="bg-gray-50 border border-gray-300 rounded-xl px-5 py-4 text-base"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="mb-8">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Mô tả (không bắt buộc)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Ví dụ: Uống đủ nước mỗi ngày để khỏe mạnh"
                multiline
                numberOfLines={3}
                className="bg-gray-50 border border-gray-300 rounded-xl px-5 py-4 text-base"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || !title.trim()}
              className={`py-4 rounded-xl flex-row justify-center items-center gap-3 ${
                title.trim() ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <MaterialIcons name="save" size={22} color="white" />
              <Text className="text-white font-bold text-lg">
                {loading ? "Đang lưu..." : id ? "Cập nhật" : "Lưu thói quen"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 flex-row justify-center items-center gap-2"
          >
            <MaterialIcons name="arrow-back" size={20} color="#6b7280" />
            <Text className="text-gray-600">Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}