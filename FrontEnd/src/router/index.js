import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/views/LandingView.vue'
import LoginView from '@/views/LoginView.vue'
import FormularioView from '@/views/FormularioView.vue'
import PrincipalView from '@/views/PrincipalView.vue'
import RegisterView from "@/views/RegisterView.vue";
import JoinView from "@/views/JoinView.vue";
import ProfileView from "@/views/ProfileView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/formulario', name: 'formulario', component: FormularioView },
    { path: '/principal', name: 'principal', component: PrincipalView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: "/join/:token", name: "join", component: JoinView },
    { path: "/profile", name: "profile", component: ProfileView }
  ]
})

export default router
