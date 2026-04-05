import { ref } from "vue";
import api from "@/services/api";

export function useInvitations() {
  const invitations = ref([]);

  const loadInvitations = async (houseId) => {
    const res = await api.get(`/houses/${houseId}/invitations`);
    invitations.value = res.data;
  };

  const joinByToken = async (token) => {
    await api.post("/invitations/join", { token });
  };

  return {
    invitations,
    loadInvitations,
    joinByToken,
  };
}