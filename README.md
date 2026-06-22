# E-Tutor UNFV

> Sistema de Tutoría Académica — Hackathon OCIDE 2026  
> Universidad Nacional Federico Villarreal · VRINI

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 6 (SPA, sin router) |
| Backend / DB | Supabase (PostgreSQL 15, PostgREST, Auth, Storage, Realtime) |
| Gráficas | Chart.js 4 + react-chartjs-2 |
| Iconos | Tabler Icons (CDN webfont, clases `ti-*`) |
| Auth | Supabase Auth (`signInWithPassword`) |
| Deploy demo | Vite dev server + ngrok tunnel |

---

## Credenciales demo

| Campo | Valor |
|-------|-------|
| Email | `jorge.mendoza@unfv.edu.pe` |
| Contraseña | `Tutor2026*` |
| Curso | Base de Datos II · V Ciclo · 2026-I |
| Estudiantes | 61 (Sección A: 31, Sección B: 30) |

---

## Instalación y ejecución

```bash
npm install
npm run dev
# → http://localhost:5173
```

Para compartir por red (ngrok v3):
```bash
/tmp/ngrok http 5173
# Copiar URL https://xxxx.ngrok-free.app
```

---

## Variables de entorno

Crear `.env` en la raíz (NO commitear):

```env
VITE_SUPABASE_URL=https://obtoeouejhukiywafdhy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...      # JWT anon key (NO usar sb_publishable_*)
SUPABASE_SERVICE_KEY=eyJ...        # Solo para scripts Node de seed

# Cuando se conecte la IA al Chatbot:
# VITE_OPENAI_KEY=sk-...
# VITE_AI_ENDPOINT=https://...
```

> Las claves deben ser formato `eyJ...` (JWT). Las claves `sb_publishable_*` no funcionan con PostgREST.

---

## Estructura del proyecto

```
hackaton/
├── public/
├── src/
│   ├── lib/
│   │   ├── supabase.js          # Cliente Supabase (lee .env)
│   │   ├── queries.js           # Todas las funciones de acceso a datos
│   │   └── ai.js                # ⚠️ PENDIENTE — implementar callAI() aquí
│   │
│   ├── Login.jsx                # Auth real con Supabase Auth
│   ├── App.jsx                  # Raíz: estado global, routing por view, carga datos
│   ├── Sidebar.jsx              # Nav lateral (array NAV)
│   ├── Topbar.jsx               # Barra top: título + breadcrumb
│   │
│   ├── Dashboard.jsx            # Panel general: KPIs, alertas urgentes, actividad
│   ├── MisEstudiantes.jsx       # Tabla 61 estudiantes con búsqueda y filtro sección
│   ├── Alertas.jsx              # Alertas de riesgo: KPIs, distribución, cards expandibles
│   ├── Rendimiento.jsx          # Charts: distribución notas, ranking, comparativa A/B
│   ├── Agenda.jsx               # Citas psicólogo: crear, filtrar, confirmar/realizar
│   ├── Reportes.jsx             # KPIs agregados, exportar CSV/TXT
│   ├── Perfil.jsx               # Perfil 360°: notas, asistencia, entrevistas, mensajes
│   ├── Chatbot.jsx              # 🤖 Asistente IA — UI lista, conectar callAI()
│   ├── Configuracion.jsx        # Perfil tutor, notificaciones, contraseña
│   │
│   ├── data.js                  # (legacy) datos mock iniciales
│   ├── index.css                # Reset mínimo
│   └── main.jsx                 # Entry point
│
├── supabase/
│   ├── schema.sql               # DDL completo (tablas, vistas, RPC, RLS, Storage)
│   ├── setup.js                 # Seed inicial: tutor, curso, 61 estudiantes
│   ├── seed_notas.js            # Genera notas + asistencias ficticias para los 61
│   └── seed_harold.js           # Datos ricos del est. Harold Ortiz (entrevistas/obs/citas)
│
├── .env                         # Secrets — NO commitear
├── .gitignore
├── vite.config.js               # server.allowedHosts: true (ngrok)
├── package.json
└── README.md
```

---

## Esquema de base de datos

### Tablas

| Tabla | Descripción |
|-------|------------|
| `tutores` | Tutor: nombre, email, codigo, curso_id |
| `estudiantes` | Padrón: codigo, apellidos_y_nombres, seccion, grupo, ord |
| `cursos` | Curso: nombre, ciclo, periodo, sesiones_totales |
| `matriculas` | Relación estudiante × curso |
| `notas` | Por matrícula: parcial, final, practica |
| `asistencias` | Por matrícula × sesión (1–16): presente boolean |
| `entrevistas` | Sesiones de tutoría: json_data + storage_path (PDF) |
| `observaciones` | Notas rápidas del tutor |
| `citas_psicologo` | Citas: estado pendiente/confirmada/realizada/cancelada |
| `mensajes` | Chat tutor ↔ estudiante (remitente: 'tutor'/'estudiante') |

### Vistas y funciones

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `notas_con_promedio` | Vista | `parcial×0.3 + final×0.3 + practica×0.4` |
| `get_perfil_estudiante(p_codigo)` | RPC | JSON completo del estudiante para la IA |

### Lógica de riesgo (frontend — `src/lib/queries.js:calcRiesgo`)

```
ROJO_FALTAS  → faltas ≥ 5, sin notas
ROJO         → promedio < 11  OR  faltas ≥ 5
AMBAR        → 11 ≤ promedio < 13
VERDE        → promedio ≥ 13
PENDIENTE    → sin notas registradas
```

### IDs fijos del seed

```
TUTOR_ID = 00000000-0000-0000-0000-000000000001
CURSO_ID = 00000000-0000-0000-0000-000000000002
```

---

## Módulos del sistema

### Dashboard
KPIs generales (total, promedio, en riesgo, tasa asistencia), top 5 alertas urgentes con acceso rápido al perfil, actividad reciente del curso.

### Mis Estudiantes
Tabla completa de los 61 estudiantes. Búsqueda por nombre o código. Filtro por sección A/B. Semáforo de riesgo por fila.

### Alertas de Riesgo
Panel ejecutivo dark con total alertas activas. 8 KPI cards (estudiantes en riesgo, alertas críticas, inhabilitados, tasa atención, promedio riesgo, sustitutorios, sin nota, riesgo por sección). Distribución por tipo + insights automáticos. Tabs: Todas / Críticas / Asistencia / Académicas / Atendidas. Cards expandibles por estudiante con "Marcar atendida", "Ver perfil", "Enviar notificación".

### Rendimiento
Bar chart: distribución de notas sección A vs B. Line chart: tendencia de promedios. Ranking top 10. Comparativa A/B con KPIs.

### Agenda — Psicólogo
Citas reales desde Supabase + 6 citas ficticias de demo. Filtros por estado. Formulario crear cita (busca estudiante por nombre en DB con ilike). Confirmar / Marcar realizada.

### Reportes
8 KPIs del curso. Desglose por sección. Distribución de rangos de notas (barras). Tabla completa. Exportar CSV y TXT (client-side, sin backend).

### Perfil del Estudiante
Datos del estudiante + estado semáforo. Edición de notas con autoguardado. Registro de asistencia sesión a sesión. Entrevistas (subir PDF + JSON estructurado). Observaciones del tutor. Mensajería bidireccional con Supabase Realtime. Citas con psicólogo.

### Asistente IA — `Chatbot.jsx`
UI completa lista para conectar. Selector de estudiante con búsqueda en tiempo real. Carga perfil completo desde RPC `get_perfil_estudiante`. Chat con historial de mensajes. Preguntas rápidas sugeridas para preparar entrevistas. Ver sección "Conectar la IA" más abajo.

### Configuración
Editar perfil del tutor (guarda en `tutores`). Info del curso. Preferencias de notificaciones. Cambiar contraseña (`supabase.auth.updateUser`).

---

## Conectar la IA al Chatbot

El `Chatbot.jsx` tiene la UI completa y el flujo de mensajes listo. Solo falta el backend de IA.

### Paso 1 — Crear `src/lib/ai.js`

```js
// src/lib/ai.js

// Ejemplo con OpenAI GPT-4o:
export async function callAI(messages, context) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente de tutoría universitaria de la UNFV.
Ayudas al tutor Mg. Jorge Mendoza a entender y apoyar a sus estudiantes.
Contexto del estudiante consultado:
${JSON.stringify(context, null, 2)}
Responde en español, de forma concisa y accionable.`,
        },
        ...messages,
      ],
    }),
  })
  const json = await res.json()
  return json.choices[0].message.content
}

// Ejemplo con endpoint propio:
// export async function callAI(messages, context) {
//   const res = await fetch(import.meta.env.VITE_AI_ENDPOINT, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ messages, context }),
//   })
//   return (await res.json()).content
// }
```

### Paso 2 — Reemplazar el stub en `Chatbot.jsx`

Buscar en `Chatbot.jsx` (~línea 30):
```js
// STUB — eliminar esto:
async function callAI(_messages, _context) {
  throw new Error('IA_NOT_CONNECTED')
}

// Reemplazar por:
import { callAI } from './lib/ai'
```

### Paso 3 — Agregar variable al `.env`

```env
VITE_OPENAI_KEY=sk-...
```

### Contexto enviado a la IA

El Chatbot pasa automáticamente a `callAI` el objeto devuelto por `get_perfil_estudiante(codigo)`, que incluye:
- Datos personales del estudiante
- Notas (parcial, final, práctica, promedio)
- Asistencias (16 sesiones)
- Entrevistas con su `json_data` estructurado
- Observaciones del tutor
- Citas con psicólogo
- Historial de mensajes

---

## Flujo de datos

```
Supabase DB
    │
    ├── src/lib/queries.js          ← todas las consultas
    │       ├── getEstudiantes()    → App.jsx → props a todos los módulos
    │       ├── getEstudianteDetalle() → Perfil.jsx
    │       ├── getPerfilJSON()     → Chatbot.jsx (contexto IA)
    │       └── update*/add*/send*() → mutaciones desde módulos
    │
    └── supabase.auth               ← Login.jsx / Configuracion.jsx
```

---

## Convenciones del código

- **Un archivo por módulo** — cada pantalla es un `.jsx` en `src/`
- **Estilos inline** — sin CSS externo, portabilidad máxima para hackathon
- **Datos → queries.js** — ningún módulo hace fetch directo a Supabase (excepción: Agenda tiene un query inline menor)
- **Variables de entorno** — prefijo `VITE_` para frontend, sin prefijo para scripts Node
- **No usar `sb_publishable_*`** — solo claves JWT formato `eyJ...`
- **IDs de seed hardcodeados** — `TUTOR_ID` y `CURSO_ID` son UUIDs fijos en queries.js y todos los scripts

---

## Scripts de seed

Ejecutar con Node.js 18+ desde la raíz del proyecto:

```bash
# Datos iniciales (tutor, curso, estudiantes)
node supabase/setup.js

# Notas y asistencias ficticias para todos
node supabase/seed_notas.js

# Datos ricos del est. Harold Ortiz (entrevistas, observaciones, citas, mensajes)
node supabase/seed_harold.js
```

---

## Ramas git

| Rama | Contenido |
|------|-----------|
| `main` | Código estable — demo principal |
| `feature/login` | Auth Supabase |
| `feature/dashboard` | Panel general |
| `feature/perfil` | Perfil 360° del estudiante |

---

## Equipo

Hackathon OCIDE 2026 — Categoría Innovación Educativa  
Universidad Nacional Federico Villarreal · VRINI

---

<div align="center">
  <sub>E-Tutor UNFV v1.0 · 2026</sub>
</div>
