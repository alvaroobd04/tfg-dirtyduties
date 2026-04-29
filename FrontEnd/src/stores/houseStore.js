import { defineStore } from "pinia";
import api from "@/services/api";
import { generateCalendarGrid } from "@/utils/calendar.js";

export const useHouseStore = defineStore("house", {
  state: () => ({
    houses: [],
    currentHouse: null,
    tasks: [],
    calendar: [],
  }),

  actions: {
    async loadHouses() {
      const res = await api.get("/houses");

      this.houses = res.data.houses.map(h => ({
        id: h.id,
        name: h.nombre,
        modo: h.modo
      }));

      if (!this.currentHouse && this.houses.length > 0) {
        this.currentHouse = this.houses[0];
      }
    },

    async loadTasks() {
      if (!this.currentHouse) return;

      const res = await api.get(`/houses/${this.currentHouse.id}/tasks`);

      this.tasks = res.data.tasks.map(t => ({
        id: t.id,
        name: t.nombre
      }));
    },

    async loadCalendar() {
      if (!this.currentHouse) return;

      const res = await api.get(
        `/houses/${this.currentHouse.id}/tasks/calendar`
      );

      const grouped = {};

      res.data.forEach((e) => {
        const key = e.fecha.split("T")[0];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(e);
      });

      const now = new Date();
      const days = generateCalendarGrid(
        now.getFullYear(),
        now.getMonth()
      );

      this.calendar = days.map((day) => {
        if (!day) return null;

        return {
          ...day,
          executions: (grouped[day.date] || []).map(e => ({
            taskName: e.taskName,
            userName: e.usuario,
            status: e.estado
          }))
        };
      });
    },

    async refreshHouseData() {
      await this.loadTasks();
      await this.loadCalendar();
    }
  }
});