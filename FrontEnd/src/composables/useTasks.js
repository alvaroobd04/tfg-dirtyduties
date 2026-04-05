import { ref } from "vue";
import api from "@/services/api";

export function useTasks() {
  const tasks = ref([]);
  const calendar = ref([]);

  const loadTasks = async (houseId) => {
    const res = await api.get(`/houses/${houseId}/tasks`);
    tasks.value = res.data.tasks;
  };

  const loadCalendar = async (houseId) => {
    const res = await api.get(`/houses/${houseId}/tasks/calendar`);
    calendar.value = res.data;
  };

  return {
    tasks,
    calendar,
    loadTasks,
    loadCalendar,
  };
}