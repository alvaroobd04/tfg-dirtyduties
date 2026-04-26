import { defineStore } from "pinia";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: null,
    isReady: false
  }),

  actions: {
    /* =========================
       LOGIN
    ========================= */
async login(email, password) 
{
  try {
    const res = await api.post("/auth/login", { email, password });

    this.accessToken = res.data.accessToken;
    localStorage.setItem("accessToken", this.accessToken);

    return { success: true };

  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Credenciales incorrectas"
    };
  }
},

    /* =========================
       LOGOUT
    ========================= */
    async logout() 
    {
      try {
        await api.post("/auth/logout");
      } catch (e) {

      }

      this.user = null;
      this.accessToken = null;

      localStorage.removeItem("accessToken");
    },

    /* =========================
       INIT (AL RECARGAR)
    ========================= */
    init() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        this.accessToken = token;
        this.loadProfile();
      }
      this.isReady = true; // IMPORTANTE
    },

    /* =========================
       PROFILE
    ========================= */
    async loadProfile() 
    {
      try {
        const res = await api.get('/auth/profile');
        this.user = res.data.user;

      } catch (error) {
        console.error("Error cargando perfil");
      }
    },
  },


});

