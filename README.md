# E-Tutor UNFV 🎓

> Sistema de Tutoría Académica Inteligente — Universidad Nacional Federico Villarreal

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=flat&logo=chart.js)](https://chartjs.org)
[![Hackathon](https://img.shields.io/badge/Hackathon-OCIDE%202026-E85D04?style=flat)](.)

---

## ¿Qué es E-Tutor?

Plataforma web que permite al **tutor/docente** monitorear el rendimiento académico de sus estudiantes, detectar tempranamente quiénes están en riesgo y actuar antes de que sea tarde.

**El insight central:** no basta el promedio. E-Tutor cruza la última nota contra la *línea base histórica* del alumno y su perfil de personalidad para detectar caídas que un promedio aprobatorio esconde.

```
Semáforo de riesgo:
  🔴 ROJO  → nota < 11 (reprobatorio)
  🟡 ÁMBAR → nota ≥ 11 pero caída ≥ 3pts vs base + perfil vulnerable
  🟢 VERDE → sin riesgo
```

---

## Pantallas

| Pantalla | Descripción |
|----------|-------------|
| **Login** | Autenticación con correo institucional `@unfv.edu.pe` |
| **Panel General** | KPIs, semáforo animado, tabla de alertas, ranking de mérito |
| **Mis Estudiantes** | Tabla buscable con todos los estudiantes |
| **Alertas de Riesgo** | Solo Rojo + Ámbar ordenados por urgencia + diagnóstico |
| **Perfil del Estudiante** | Vista 360°: notas, tendencia, asistencia, observaciones |

---

## Stack

- **React 18** + **Vite 6** — SPA sin router externo
- **Chart.js 4** + `react-chartjs-2` — gráfico de tendencia personal
- **Tabler Icons** webfont — iconografía outline consistente
- **Inter** (Google Fonts) — tipografía institucional

> Sin backend. 100% frontend con datos mock.

---

## Arrancar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`

**Credenciales demo:**
```
Correo:     jorge.mendoza@unfv.edu.pe
Contraseña: cualquiera
```

---

## Estructura del proyecto

```
src/
├── App.jsx              # Router de pantallas (login → app)
├── Login.jsx            # Autenticación institucional
├── Sidebar.jsx          # Navegación lateral fija
├── Topbar.jsx           # Barra superior sticky
├── Dashboard.jsx        # Panel general + semáforo + tabla + widgets
├── MisEstudiantes.jsx   # Tabla buscable de todos los estudiantes
├── Alertas.jsx          # Vista de riesgo Rojo/Ámbar con diagnóstico
├── Perfil.jsx           # Perfil 360° del estudiante
└── data.js              # Mock data (estudiantes, KPIs, semáforo)
```

---

## Design Tokens

| Token | Valor | Uso |
|-------|-------|-----|
| `brand-primary` | `#E85D04` | Naranja institucional — botones, activos |
| `sidebar-bg` | `#1A1A2E` | Fondo sidebar y columna login |
| `riesgo-rojo` | `#DC2626` | Riesgo alto |
| `riesgo-ambar` | `#D97706` | Riesgo moderado |
| `riesgo-verde` | `#16A34A` | Sin riesgo |

---

## Ramas

| Rama | Contenido |
|------|-----------|
| `main` | Código estable / producción |
| `feature/login` | Pantalla de autenticación |
| `feature/dashboard` | Panel general |
| `feature/perfil` | Perfil del estudiante |

---

## Equipo

Desarrollado para el **Hackathon OCIDE 2026 — UNFV**

---

<div align="center">
  <sub>Universidad Nacional Federico Villarreal · VRINI · OCIDE · 2026</sub>
</div>
