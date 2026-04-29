import { defineStore } from "pinia";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: null,
    isReady: false,
    mustChangePassword: false
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
    this.mustChangePassword = res.data.mustChangePassword ?? false;
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
      this.mustChangePassword = false;

      localStorage.removeItem("accessToken");
    },

    /* =========================
       INIT (AL RECARGAR)
    ========================= */
    async init() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        this.accessToken = token;
        await this.loadProfile();
      }
      this.isReady = true;
    },

    /* =========================
       PROFILE
    ========================= */
    async loadProfile()
    {
      try {
        const res = await api.get('/auth/profile');
        this.user = res.data.user;
        this.mustChangePassword = res.data.user.must_change_password ?? false;

      } catch (error) {
        console.error("Error cargando perfil");
      }
    },

    async socialLogin(accessToken) {
      this.accessToken = accessToken;
      localStorage.setItem('accessToken', accessToken);
      await this.loadProfile();
    },
  },


});

