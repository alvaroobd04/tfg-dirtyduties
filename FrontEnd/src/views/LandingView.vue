<template>
  <div class="landing-page">
    <header class="navbar">
      <img src="@/assets/logo.png" alt="Logo DirtyDuties" class="logo1" />
      <nav>
        <a href="#hero" :class="{ active: activeSection === 'hero' }" @click.prevent="scrollTo('hero')">Bienvenida</a>
        <a href="#funciones" :class="{ active: activeSection === 'funciones' }" @click.prevent="scrollTo('funciones')">Funciones</a>
        <a href="#acerca-de" :class="{ active: activeSection === 'acerca-de' }" @click.prevent="scrollTo('acerca-de')">Acerca de DirtyDuties</a>
        <a href="#contacto" :class="{ active: activeSection === 'contacto' }" @click.prevent="scrollTo('contacto')">Contacto</a>
      </nav>
      <RouterLink to="/login" class="btn-nav">Empezar</RouterLink>
    </header>

    <main>
      <section id="hero" ref="heroRef" class="hero">
        <h1>DirtyDuties</h1>
        <p>Reparte, organiza y olvídate del drama</p>
        <img src="@/assets/logo.png" alt="Logo DirtyDuties" class="logo2" />
        <div class="hero-description">
          <p>Con DirtyDuties, <span style="color: #344f59;">organiza</span> las tareas del hogar nunca fue tan fácil. Nuestra aplicación te permite repartir responsabilidades, seguir el progreso y <span style="color: #344f59;">colaborar</span> con tus compañeros de casa en tiempo real. Di adiós a las discusiones y hola a una convivencia <span style="color: #344f59;">sin drama</span>.</p>
          <RouterLink to="/login" class="hero-btn">Prueba DirtyDuties</RouterLink>
        </div>
      </section>

      <section id="funciones" ref="funcionesRef" class="content">
        <h2>Funciones de DirtyDuties</h2>
        <p>DirtyDuties es una aplicación diseñada para simplificar la organización de tareas domésticas en hogares compartidos. Con una interfaz intuitiva y funciones colaborativas, asegura que todos cumplan con sus responsabilidades sin conflictos.</p>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <section id="acerca-de" ref="acercaRef" class="content">
        <h2>Acerca de DirtyDuties</h2>
        <p><span style="color: #344f59;">DirtyDuties</span> nació en las aulas de la Universidad de Salamanca, en una clase de Interacción Persona-Ordenador, donde dos compañeros de tercero de Ingeniería Informática se propusieron resolver un problema tan cotidiano como universal: las discusiones por las tareas del hogar. Lo que empezó como un proyecto académico se convirtió en nuestra pasión, una herramienta diseñada con cariño para transformar la <span style="color: #344f59;">convivencia</span> en pisos compartidos, casas familiares o cualquier espacio donde las responsabilidades se reparten. Inspirados por las quejas de amigos sobre compañeros que dejaban los platos sucios o se escaqueaban de limpiar, creamos una aplicación intuitiva que organiza tareas, fomenta la colaboración y elimina conflictos. Este es nuestro <span style="color: #344f59;">proyecto</span>, y estamos emocionados de compartirlo contigo. ¡Únete y descubre cómo hacer que el hogar sea un lugar más armonioso!</p>
        <p><strong>Nuestros valores:</strong></p>
        <ul>
          <li><strong>Colaboración:</strong> Creemos que el trabajo en equipo hace que el sueño funcione.</li>
          <li><strong>Transparencia:</strong> Todos saben qué hacer y cuándo hacerlo.</li>
          <li><strong>Simplicidad:</strong> Una aplicación fácil de usar para todos.</li>
        </ul>
        <p>Únete a miles de usuarios que ya han transformado su forma de compartir responsabilidades con DirtyDuties.</p>
      </section>

      <section id="contacto" ref="contactoRef" class="content">
        <h2>Contacto</h2>
        <p>¿Tienes preguntas, sugerencias o necesitas soporte? ¡Estamos aquí para ayudarte! Completa el formulario o contáctanos directamente.</p>
        <form class="contact-form" @submit.prevent="submitContact">
          <input v-model="contact.name" type="text" placeholder="Nombre" required />
          <input v-model="contact.email" type="email" placeholder="Correo electrónico" required />
          <textarea v-model="contact.message" placeholder="Tu mensaje" required></textarea>
          <button type="submit">Enviar</button>
        </form>
        <div class="confirmation-message" :class="{ visible: showConfirmation }">Correo enviado con éxito</div>
        <div class="contact-info">
          <p>Correo: <a href="mailto:info@dirtyduties.com">info@dirtyduties.com</a></p>
          <p>Síguenos en: 📱 📘 📸 📹</p>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-links">
        <a href="#">Política de Privacidad</a>
        <a href="#">Términos de Uso</a>
        <a href="#">Soporte</a>
        <a href="#">Blog</a>
      </div>
      <div class="social-icons">📱 📘 📸 📹</div>
      <p class="copyright">© 2025 DirtyDuties - Todos los derechos reservados</p>
    </footer>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

const activeSection = ref('hero')
const showConfirmation = ref(false)
const heroRef = ref(null)
const funcionesRef = ref(null)
const acercaRef = ref(null)
const contactoRef = ref(null)

const contact = reactive({ name: '', email: '', message: '' })

const features = [
  { title: 'Gestión de Casas', description: 'Crea y administra múltiples casas, asignando tareas y personas a cada una. Perfecto para roommates, familias o casas de vacaciones.' },
  { title: 'Asignación de Tareas', description: 'Reparte tareas fácilmente, establece fechas límite y recibe notificaciones para mantener todo en orden.' },
  { title: 'Sistema de Castigos', description: 'Si alguien no cumple, se asignan castigos automáticos (como tareas extra) para mantener la equidad.' },
  { title: 'Calendario Integrado', description: 'Visualiza tareas y castigos en un calendario mensual para planificar mejor tu tiempo.' },
  { title: 'Notificaciones', description: 'Recibe alertas sobre tareas pendientes, castigos asignados o cambios en la casa.' },
  { title: 'Colaboración en Tiempo Real', description: 'Comparte casas con otros usuarios y trabaja juntos para mantener todo limpio y organizado.' },
  { title: 'Historial de Tareas', description: 'Consulta el historial de tareas completadas para llevar un registro de las responsabilidades cumplidas.' },
  { title: 'Personalización', description: 'Adapta la aplicación a tus necesidades con opciones de personalización para tareas y casas.' }
]

function scrollTo(id) {
  const target = document.getElementById(id)
  if (!target) return
  window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' })
}

function updateActiveLink() {
  const sections = [heroRef.value, funcionesRef.value, acercaRef.value, contactoRef.value].filter(Boolean)
  for (const section of sections) {
    const top = section.offsetTop
    const height = section.offsetHeight
    if (window.scrollY >= top - 80 && window.scrollY < top + height - 80) {
      activeSection.value = section.id
      break
    }
  }
}

function submitContact() {
  showConfirmation.value = true
  contact.name = ''
  contact.email = ''
  contact.message = ''
  setTimeout(() => {
    showConfirmation.value = false
  }, 3000)
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveLink)
  updateActiveLink()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateActiveLink)
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { overflow-x: hidden; }
.landing-page { margin: 0; font-family: 'Montserrat', sans-serif; background: #f4f4f4; color: #333; min-height: 100vh; display: flex; flex-direction: column; }
.navbar { display: flex; align-items: center; justify-content: space-between; background: #344f59; padding: 1rem 2rem; width: 100%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: fixed; top: 0; left: 0; z-index: 1000; }
.navbar nav { display: flex; flex-wrap: wrap; }
.navbar nav a { margin: 0.5rem 1rem; text-decoration: none; color: #ffffff; font-weight: 500; font-size: 1rem; transition: color 0.2s ease; cursor: pointer; }
.navbar nav a:hover, .navbar nav a.active { color: #7ff2ec; }
.navbar nav a.active { border-bottom: 2px solid #7ff2ec; }
.logo1 { height: 90px; width: auto; object-fit: contain; }
.logo2 {
  width: 160px;
  height: auto;
  display: block;
  margin: 25px auto;
}
.btn-nav, .hero-btn { background: #7ff2ec; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; text-decoration: none; color: #000000; font-weight: 600; font-size: 1rem; transition: background 0.2s ease; cursor: pointer; text-transform: uppercase; display: inline-block; }
.btn-nav:hover, .hero-btn:hover, .contact-form button:hover { background: #5ab8b2; }
.hero {
  text-align: center;
  padding: 9rem 2rem 4rem;
  background: #efefef;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-description {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  border: 1px solid #344f59;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background: #ffffff;
}
.hero h1 { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 2px; margin-bottom: 0.5rem; }
.hero p { font-size: 1.5rem; font-weight: 500; color: #777; margin-bottom: 1rem; }
.hero-description p { font-size: 1.2rem; line-height: 1.6; color: #555; }
.content { padding: 5rem 2rem; background: #f4f4f4; }
.content h2 { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; color: #344f59; text-align: center; margin-bottom: 2rem; }
.content p { font-size: 1.2rem; line-height: 1.6; color: #555; max-width: 800px; margin: 0 auto 1.5rem; }
.content ul { max-width: 800px; margin: 0 auto 1.5rem; padding-left: 1.5rem; }
.content ul li { font-size: 1.2rem; line-height: 1.6; color: #555; margin-bottom: 0.5rem; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
.feature-card { background: #6ad9d3; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; transition: transform 0.2s ease, background 0.2s ease; }
.feature-card:hover { transform: scale(1.2); background: #5ab8b2; }
.feature-card h3 { font-size: 1.5rem; color: #1a2f36; margin-bottom: 1rem; }
.feature-card p { font-size: 1rem; color: #344f59; }
.contact-form { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
.contact-form input, .contact-form textarea { padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; width: 100%; }
.contact-form textarea { resize: vertical; min-height: 120px; }
.contact-form button { background: #7ff2ec; padding: 0.75rem; border: none; border-radius: 4px; color: #000000; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s ease; text-transform: uppercase; }
.confirmation-message { display: none; text-align: center; margin-top: 1rem; padding: 0.8rem; background: #e0f7fa; border-radius: 4px; color: #344f59; font-size: 1rem; font-weight: 500; }
.confirmation-message.visible { display: block; }
.contact-info { text-align: center; margin-top: 2rem; }
.contact-info p { font-size: 1.1rem; margin-bottom: 0.5rem; }
.contact-info a { color: #344f59; text-decoration: none; }
.contact-info a:hover { text-decoration: underline; }
.footer { background: #344f59; color: #ffffff; padding: 2rem; text-align: center; width: 100%; }
.footer-links { display: flex; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem; }
.footer-links a { color: #ffffff; text-decoration: none; margin: 0 1rem; padding: 0.5rem 0; }
.footer-links a:hover { color: #7ff2ec; }
.social-icons { font-size: 1.5rem; margin-bottom: 1rem; }
.copyright { font-size: 0.9rem; margin-top: 1rem; }
@media (max-width: 768px) {
  .navbar { flex-direction: column; padding: 1rem; }
  .navbar nav { margin: 1rem 0; justify-content: center; flex-direction: column; align-items: center; }
  .navbar nav a { margin: 0.5rem 0; }
  .btn-nav { margin-top: 0.5rem; width: 100%; text-align: center; }
  .hero { padding: 7rem 1rem 3rem; }
  .content { padding: 3rem 1rem; }
  .hero h1, .content h2 { font-size: 2.5rem; }
  .hero p, .hero-description p, .content p, .content ul li { font-size: 1rem; }
  .hero-description { padding: 1rem; margin: 0 1rem 1.5rem; }
  .hero-btn { padding: 0.6rem 1.2rem; font-size: 0.9rem; }
  .logo2 { width: 90%; max-width: 300px; margin: 132px auto 132px auto; }
  .features-grid { grid-template-columns: 1fr; }
  .contact-form { padding: 0 1rem; }
}
</style>
