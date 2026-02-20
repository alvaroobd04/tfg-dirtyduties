# tfg-dirtyduties

**Trabajo Fin de Grado (TFG)**  
Grado en Ingeniería Informática  

DirtyDuties es un proyecto desarrollado como Trabajo Fin de Grado, cuyo objetivo es el diseño e implementación 
de una aplicación orientada a la gestión de tareas del hogar, aplicando buenas prácticas de ingeniería del 
software y metodologías de desarrollo modernas.

Este repositorio recoge la evolución del proyecto a lo largo de las distintas fases de desarrollo, incluyendo el frontend de la aplicación y la documentación técnica asociada.

---

## Objetivo del proyecto

El objetivo principal de este TFG es desarrollar una aplicación que sirva como caso de estudio para la aplicación práctica de conocimientos adquiridos durante el grado, tales como:

- Diseño y estructuración de aplicaciones web
- Control de versiones mediante Git y GitHub
- Organización modular del código
- Aplicación de estándares y buenas prácticas de desarrollo
- Documentación técnica del proyecto

Los detalles funcionales y técnicos de la aplicación se irán ampliando progresivamente conforme avance el desarrollo.

---

## Estructura del repositorio

tfg-dirtyduties/
│
├── Backend/               # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Configuración de entorno
│   │   ├── database/      # Conexión a base de datos
│   │   ├── errors/        # Gestión centralizada de errores
│   │   ├── middlewares/   # Middlewares (auth, error handler)
│   │   ├── modules/       # Lógica modular (auth, tasks...)
│   │   ├── app.js         # Configuración de Express
│   │   └── server.js      # Punto de entrada del servidor
│   ├── package.json
│   └── .env               # Variables de entorno (no versionado)
│
├── FrontEnd/              # Aplicación cliente (Vue.js)
│
├── .gitignore
└── README.md              # Documentación general del proyecto

