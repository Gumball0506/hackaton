// Ejecutar: node supabase/setup.js
// Hace el seed de 61 estudiantes, curso, matrículas, notas y asistencias

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = 'https://obtoeouejhukiywafdhy.supabase.co'
const SUPABASE_SERVICE = 'sb_secret_m-Vs_RSuzpBxmMSNixkMgQ_Zoabe4MA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const TUTOR_ID = '00000000-0000-0000-0000-000000000001'
const CURSO_ID = '00000000-0000-0000-0000-000000000002'

const TUTOR = {
  id: TUTOR_ID,
  email: 'jorge.mendoza@unfv.edu.pe',
  nombre_completo: 'Mg. Jorge Mendoza Quispe',
  codigo: 'DOC-2024-0847'
}

const CURSO = {
  id: CURSO_ID,
  nombre: 'Base de Datos II',
  facultad: 'Ingeniería Electrónica e Informática',
  escuela: 'Informática',
  ciclo: 5,
  periodo: '2026-I',
  total_sesiones: 16,
  tutor_id: TUTOR_ID
}

const SECCION_A = [
  { codigo:'2021017455', apellidos_y_nombres:'ALFARO GARCIA HUGO ANDRE',                 seccion:'A', grupo:null, ord:1  },
  { codigo:'2022015446', apellidos_y_nombres:'ANDIA DIAZ LUIS ANGEL',                    seccion:'A', grupo:null, ord:2  },
  { codigo:'2022015295', apellidos_y_nombres:'ARELLANO CHAUCA ALEX DANIEL',              seccion:'A', grupo:null, ord:3  },
  { codigo:'2021017446', apellidos_y_nombres:'ASCORRA VILCAPOMA AUGUSTO JOS',            seccion:'A', grupo:null, ord:4  },
  { codigo:'2021024059', apellidos_y_nombres:'BALLUMBROSIO ORMEÑO LUIS ANTHONY',         seccion:'A', grupo:null, ord:5  },
  { codigo:'2020010981', apellidos_y_nombres:'BERROSPI MALLMA MARICRUZ PILAR',           seccion:'A', grupo:null, ord:6  },
  { codigo:'2022015312', apellidos_y_nombres:'BUSTAMANTE PINTO SANDRA',                  seccion:'A', grupo:null, ord:7  },
  { codigo:'2020100793', apellidos_y_nombres:'CHUQUINO FRANCO LUIS ANGEL',               seccion:'A', grupo:null, ord:8  },
  { codigo:'2021017357', apellidos_y_nombres:'CONISLLA PINTO JULIO BRANDO',              seccion:'A', grupo:null, ord:9  },
  { codigo:'2022015205', apellidos_y_nombres:'EUSTAQUIO TARAZONA HIDALGO HERMINIO',      seccion:'A', grupo:null, ord:10 },
  { codigo:'2021017544', apellidos_y_nombres:'FLORES ESPADA CHRISTIAN ARNOLD',           seccion:'A', grupo:null, ord:11 },
  { codigo:'2017011506', apellidos_y_nombres:'GALVAN CARHUACHIN JOAN MANUEL',            seccion:'A', grupo:null, ord:12 },
  { codigo:'2020010883', apellidos_y_nombres:'GALVEZ EGAS JAIME ALEJANDRO',              seccion:'A', grupo:null, ord:13 },
  { codigo:'2022000135', apellidos_y_nombres:'GONZALEZ TOVAR WERNER EDUARDO',            seccion:'A', grupo:null, ord:14 },
  { codigo:'2022015491', apellidos_y_nombres:'HUAMAN CUYUBAMBA FRANCK ANGEL',            seccion:'A', grupo:null, ord:15 },
  { codigo:'2021017464', apellidos_y_nombres:'HUAMAN LLANTERHUAY JOSUE RICARDO',         seccion:'A', grupo:null, ord:16 },
  { codigo:'2021017437', apellidos_y_nombres:'HUAMAN NAVALLES CLAUDIA PATRICIA NATHALI', seccion:'A', grupo:null, ord:17 },
  { codigo:'2022015348', apellidos_y_nombres:'HUERTAS ZAMUDIO SEBASTIAN ALEJANDRO',      seccion:'A', grupo:null, ord:18 },
  { codigo:'2021017473', apellidos_y_nombres:'IPENZA ALBA ANTHONY JUNIOR',               seccion:'A', grupo:null, ord:19 },
  { codigo:'2018010076', apellidos_y_nombres:'JARA BECERRA JOSE MARIA',                  seccion:'A', grupo:null, ord:20 },
  { codigo:'2022015419', apellidos_y_nombres:'LAZO SOLANO LUIS EDUARDO',                 seccion:'A', grupo:null, ord:21 },
  { codigo:'2022015223', apellidos_y_nombres:'MAGUIÑA REYES GABRIEL OMAR',               seccion:'A', grupo:null, ord:22 },
  { codigo:'2022015232', apellidos_y_nombres:'ORBEGOZO RELUZ DIEGO RODRIGO',             seccion:'A', grupo:null, ord:23 },
  { codigo:'2022015188', apellidos_y_nombres:'PASHANASTE FASABI DHANERY NATALIA',        seccion:'A', grupo:null, ord:24 },
  { codigo:'2022015241', apellidos_y_nombres:'QUIJANO OCHOA EDGARD DABERT',              seccion:'A', grupo:null, ord:25 },
  { codigo:'2020011069', apellidos_y_nombres:'RUIZ SAAVEDRA DANIEL SEBASTIAN',           seccion:'A', grupo:null, ord:26 },
  { codigo:'2018018533', apellidos_y_nombres:'SANCHEZ HERMITAÑO ELIAS SMIT',             seccion:'A', grupo:null, ord:27 },
  { codigo:'2021017321', apellidos_y_nombres:'SANTAMARIA MACHACA VICTOR RICARDO',        seccion:'A', grupo:null, ord:28 },
  { codigo:'2022015197', apellidos_y_nombres:'VENTURA LOPEZ LEONEL SANTIAGO',            seccion:'A', grupo:null, ord:29 },
  { codigo:'2021017339', apellidos_y_nombres:'VILLEGAS DIAZ CHRISTIAN DARLING',          seccion:'A', grupo:null, ord:30 },
  { codigo:'2018021862', apellidos_y_nombres:'YRAMATEGUI LOZANO GERSON RENATO',          seccion:'A', grupo:null, ord:31 },
]

const SECCION_B = [
  { codigo:'2022015428', apellidos_y_nombres:'ALBARRACIN RIVERA JOSUE',               seccion:'B', grupo:'2',  ord:1  },
  { codigo:'2021017375', apellidos_y_nombres:'ARI TIPULA IVAN CRISTIAN',              seccion:'B', grupo:'2',  ord:2  },
  { codigo:'2019015483', apellidos_y_nombres:'AYASTA CHAVEZ EDUARDO MARCELO',         seccion:'B', grupo:null, ord:3  },
  { codigo:'2022015161', apellidos_y_nombres:'AYLLON HUALPARUCA GIANCARLO',           seccion:'B', grupo:'3',  ord:4  },
  { codigo:'202314592',  apellidos_y_nombres:'BONILLA NIEVES LINCOLN ANTHONY',        seccion:'B', grupo:'2',  ord:5  },
  { codigo:'202197196',  apellidos_y_nombres:'CASTRO JIMENEZ MIGUEL ANGEL',           seccion:'B', grupo:'6',  ord:6  },
  { codigo:'202232098',  apellidos_y_nombres:'CCANRE TAYA FABIOLA LISSETT',           seccion:'B', grupo:'6',  ord:7  },
  { codigo:'202118289',  apellidos_y_nombres:'CRUZADO PACHECO ANTONI POE',            seccion:'B', grupo:'1',  ord:8  },
  { codigo:'202313434',  apellidos_y_nombres:'GALLEGOS GOMEZ JEFERSON GERMAN',        seccion:'B', grupo:'4',  ord:9  },
  { codigo:'202397080',  apellidos_y_nombres:'HUAMAN SINARAHUA JENNERY',              seccion:'B', grupo:'6',  ord:10 },
  { codigo:'202311395',  apellidos_y_nombres:'LAGUNA SIERRALTA ANGELLO LUCIANO',      seccion:'B', grupo:null, ord:11 },
  { codigo:'202355302',  apellidos_y_nombres:'LOYOLA VERA LUIS SEBASTIAN',            seccion:'B', grupo:'3',  ord:12 },
  { codigo:'202103905',  apellidos_y_nombres:'LOZA BENITES ABRA FERNANDO',            seccion:'B', grupo:'3',  ord:13 },
  { codigo:'202128657',  apellidos_y_nombres:'LUJAN BERNAOLA GERAL EMILIO',           seccion:'B', grupo:null, ord:14 },
  { codigo:'202166237',  apellidos_y_nombres:'MITAC ESPINOZA FAVIO JUAN',             seccion:'B', grupo:null, ord:15 },
  { codigo:'202303478',  apellidos_y_nombres:'MONTES TRIVEÑO OSCAR',                  seccion:'B', grupo:'4',  ord:16 },
  { codigo:'202326062',  apellidos_y_nombres:'NIEVES CAMPOS ELIZABETH YOLANDA',       seccion:'B', grupo:'5',  ord:17 },
  { codigo:'202385181',  apellidos_y_nombres:'OBREGON CASTILLEJO ALVARO AMIR',        seccion:'B', grupo:'5',  ord:18 },
  { codigo:'202371426',  apellidos_y_nombres:'ORTIZ GALVEZ HAROLD ARTURO',            seccion:'B', grupo:'5',  ord:19 },
  { codigo:'202228893',  apellidos_y_nombres:'POTESTA TOLEDO ANGEL DIEGO',            seccion:'B', grupo:'1',  ord:20 },
  { codigo:'202277236',  apellidos_y_nombres:'QUISPE CHINGUEL HAYLEY DAVID',          seccion:'B', grupo:'4',  ord:21 },
  { codigo:'202200851',  apellidos_y_nombres:'ROQUE AQUISE LILY',                     seccion:'B', grupo:'5',  ord:22 },
  { codigo:'202191506',  apellidos_y_nombres:'SALINAS FERNANDEZ MATEO RAFAEL',        seccion:'B', grupo:'1',  ord:23 },
  { codigo:'202244597',  apellidos_y_nombres:'TESILLO HUAMANGA JACKELINE',            seccion:'B', grupo:'4',  ord:24 },
  { codigo:'202220379',  apellidos_y_nombres:'VEGA GUTIERREZ WILLIAM FACUNDO CELSO',  seccion:'B', grupo:'3',  ord:25 },
  { codigo:'202144118',  apellidos_y_nombres:'VIDAL PEREZ SERGIO ESTEBAN',            seccion:'B', grupo:'5',  ord:26 },
  { codigo:'202112156',  apellidos_y_nombres:'VILLA MALLMA JOSUE EMANUEL',            seccion:'B', grupo:'1',  ord:27 },
  { codigo:'202212676',  apellidos_y_nombres:'VILLAVERDE CONDORI ARMANDO',            seccion:'B', grupo:'6',  ord:28 },
  { codigo:'202245082',  apellidos_y_nombres:'VIVAS CHAPOÑAN JAIME RAMIRO',           seccion:'B', grupo:'1',  ord:29 },
  { codigo:'202334671',  apellidos_y_nombres:'YAPIAS CALZADA JAMES LISTER',           seccion:'B', grupo:'4',  ord:30 },
]

async function run() {
  console.log('🚀 Iniciando seed E-Tutor UNFV...\n')

  // 1. Tutor
  const { error: e1 } = await supabase.from('tutores').upsert(TUTOR, { onConflict: 'id' })
  if (e1) { console.error('❌ tutores:', e1.message); process.exit(1) }
  console.log('✅ Tutor insertado')

  // 2. Curso
  const { error: e2 } = await supabase.from('cursos').upsert(CURSO, { onConflict: 'id' })
  if (e2) { console.error('❌ cursos:', e2.message); process.exit(1) }
  console.log('✅ Curso insertado: Base de Datos II')

  // 3. Estudiantes
  const todos = [...SECCION_A, ...SECCION_B]
  const { error: e3 } = await supabase.from('estudiantes').upsert(todos, { onConflict: 'codigo' })
  if (e3) { console.error('❌ estudiantes:', e3.message); process.exit(1) }
  console.log(`✅ ${todos.length} estudiantes insertados (31 Sección A + 30 Sección B)`)

  // 4. Obtener IDs de estudiantes
  const { data: estData, error: e4 } = await supabase
    .from('estudiantes').select('id, codigo')
  if (e4) { console.error('❌ fetch estudiantes:', e4.message); process.exit(1) }

  // 5. Matrículas
  const matriculas = estData.map(e => ({
    estudiante_id: e.id,
    curso_id: CURSO_ID,
    periodo: '2026-I'
  }))
  const { error: e5 } = await supabase
    .from('matriculas').upsert(matriculas, { onConflict: 'estudiante_id,curso_id,periodo' })
  if (e5) { console.error('❌ matriculas:', e5.message); process.exit(1) }
  console.log(`✅ ${matriculas.length} matrículas creadas`)

  // 6. Obtener IDs de matrículas
  const { data: matData, error: e6 } = await supabase
    .from('matriculas').select('id').eq('curso_id', CURSO_ID)
  if (e6) { console.error('❌ fetch matriculas:', e6.message); process.exit(1) }

  // 7. Notas vacías (null)
  const notasRows = matData.map(m => ({ matricula_id: m.id }))
  const { error: e7 } = await supabase
    .from('notas').upsert(notasRows, { onConflict: 'matricula_id' })
  if (e7) { console.error('❌ notas:', e7.message); process.exit(1) }
  console.log(`✅ ${notasRows.length} registros de notas creados (todas null)`)

  // 8. Asistencias — 16 sesiones por estudiante
  const asistencias = []
  for (const m of matData) {
    for (let s = 1; s <= 16; s++) {
      asistencias.push({ matricula_id: m.id, sesion: s, presente: null })
    }
  }
  // Insertar en chunks de 500
  for (let i = 0; i < asistencias.length; i += 500) {
    const chunk = asistencias.slice(i, i + 500)
    const { error: e8 } = await supabase
      .from('asistencias').upsert(chunk, { onConflict: 'matricula_id,sesion' })
    if (e8) { console.error('❌ asistencias chunk:', e8.message); process.exit(1) }
  }
  console.log(`✅ ${asistencias.length} sesiones de asistencia creadas (${matData.length} × 16)`)

  console.log('\n🎉 Seed completado exitosamente!')
  console.log(`   Proyecto: E-Tutor UNFV`)
  console.log(`   Curso:    Base de Datos II | Ciclo V | 2026-I`)
  console.log(`   Escuela:  Informática — Ing. Electrónica e Informática`)
  console.log(`   Total:    61 estudiantes, 61 matrículas, 976 sesiones de asistencia`)
}

run().catch(console.error)
