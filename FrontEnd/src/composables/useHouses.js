import { ref } from "vue";
import api from "@/services/api";

export function useHouses() {
  const houses = ref([]);
  const currentHouse = ref(null);

  const loadHouses = async () => {
    const res = await api.get("/houses");

    houses.value = res.data.houses;
    currentHouse.value = houses.value[0] || null;
  };

  const selectHouse = (house) => {
    currentHouse.value = house;
  };

  return {
    houses,
    currentHouse,
    loadHouses,
    selectHouse,
  };
}