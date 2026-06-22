// node supabase/seed_notas.js
// Llena notas y asistencias ficticias para los 61 estudiantes

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://obtoeouejhukiywafdhy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idG9lb3Vlamh1a2l5d2FmZGh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE0MDc2NywiZXhwIjoyMDk3NzE2NzY3fQ.wgvajioAhW3UqscbhH6BYhEt3zNHUYYP5cGxt30EtZA',
  { auth: { autoRefreshToken:false, persistSession:false } }
)

const CURSO_ID = '00000000-0000-0000-0000-000000000002'

// Genera nota entre lo y hi con 1 decimal
function nota(lo, hi) {
  return Math.round((Math.random() * (hi - lo) + lo) * 10) / 10
}

// Perfil académico → rangos de notas
const PERFILES = [
  { tipo:'excelente',    peso:8,  parcial:[17,20], final:[17,20], practica:[17,20], faltas:[0,1] },
  { tipo:'muy_bueno',    peso:12, parcial:[15,18], final:[14,18], practica:[15,18], faltas:[0,2] },
  { tipo:'bueno',        peso:18, parcial:[13,16], final:[12,16], practica:[13,16], faltas:[0,2] },
  { tipo:'regular',      peso:15, parcial:[11,14], final:[11,14], practica:[11,14], faltas:[1,3] },
  { tipo:'justo',        peso:12, parcial:[10,12], final:[9,12],  practica:[10,13], faltas:[2,4] },
  { tipo:'riesgo_nota',  peso:8,  parcial:[7,11],  final:[6,11],  practica:[8,11],  faltas:[1,4] },
  { tipo:'desaprobado',  peso:5,  parcial:[4,10],  final:[4,10],  practica:[5,10],  faltas:[3,6] },
  { tipo:'riesgo_faltas',peso:6,  parcial:[11,16], final:[11,15], practica:[12,16], faltas:[5,8] },
  { tipo:'doble_riesgo', peso:4,  parcial:[5,10],  final:[5,10],  practica:[6,11],  faltas:[5,9] },
  { tipo:'sin_nota',     peso:3,  parcial:null,    final:null,    practica:null,    faltas:[0,2] },
]

function elegirPerfil() {
  const total = PERFILES.reduce((s, p) => s + p.peso, 0)
  let r = Math.random() * total
  for (const p of PERFILES) { r -= p.peso; if (r <= 0) return p }
  return PERFILES[0]
}

// Genera asistencia: array de 16 booleans con N faltas
function genAsistencias(minFaltas, maxFaltas) {
  const faltas = Math.floor(Math.random() * (maxFaltas - minFaltas + 1)) + minFaltas
  const asist  = Array(16).fill(true)
  const indices = []
  while (indices.length < Math.min(faltas, 16)) {
    const i = Math.floor(Math.random() * 16)
    if (!indices.includes(i)) indices.push(i)
  }
  indices.forEach(i => asist[i] = false)
  return asist
}

async function run() {
  console.log('Obteniendo matrículas...')
  const { data: mats, error } = await sb
    .from('matriculas')
    .select('id, estudiantes(apellidos_y_nombres, seccion)')
    .eq('curso_id', CURSO_ID)

  if (error) { console.error('ERROR:', error.message); process.exit(1) }
  console.log(`${mats.length} matrículas encontradas\n`)

  let okNotas = 0, okAsist = 0, errN = 0, errA = 0

  for (const mat of mats) {
    const perfil  = elegirPerfil()
    const nombre  = mat.estudiantes?.apellidos_y_nombres ?? mat.id

    // ── NOTAS ──────────────────────────────────────────────────
    let parcial = null, final = null, practica = null
    if (perfil.parcial) {
      parcial  = nota(...perfil.parcial)
      final    = nota(...perfil.final)
      practica = nota(...perfil.practica)
    }

    const { error: eN } = await sb
      .from('notas')
      .update({ parcial, final, practica, updated_at: new Date().toISOString() })
      .eq('matricula_id', mat.id)

    if (eN) { console.error(`  ERROR nota ${nombre}:`, eN.message); errN++; continue }

    // ── ASISTENCIAS ────────────────────────────────────────────
    const asistArr = genAsistencias(...perfil.faltas)
    const updates  = asistArr.map((presente, i) => ({
      matricula_id: mat.id, sesion: i + 1, presente
    }))

    const { error: eA } = await sb
      .from('asistencias')
      .upsert(updates, { onConflict: 'matricula_id,sesion' })

    if (eA) { console.error(`  ERROR asist ${nombre}:`, eA.message); errA++; continue }

    const faltas = asistArr.filter(v => !v).length
    const promedio = perfil.parcial
      ? (parcial * 0.30 + final * 0.30 + practica * 0.40).toFixed(2)
      : 'S/N'

    console.log(`  [${perfil.tipo.padEnd(14)}] ${nombre.slice(0,35).padEnd(36)} Prom:${String(promedio).padStart(5)} Faltas:${faltas}`)
    okNotas++; okAsist++
  }

  console.log(`\nNotas:      ${okNotas} OK | ${errN} errores`)
  console.log(`Asistencias:${okAsist} OK | ${errA} errores`)
  console.log('\nSeed de datos ficticios completado.')
}

run().catch(console.error)
