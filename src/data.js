export const estudiantes = [
  { id:1, nombre:'Lucía Fernández Torres',     iniciales:'LF', codigo:'2021034521', ciclo:'V',   ultima_nota:9.5,  base:14.2, desv:-4.7, susti:true,  riesgo:'ROJO',  personalidad:'perfeccionista_ansioso' },
  { id:2, nombre:'Carlos Quispe Mamani',        iniciales:'CQ', codigo:'2020018743', ciclo:'V',   ultima_nota:11.0, base:14.8, desv:-3.8, susti:false, riesgo:'AMBAR', personalidad:'perfeccionista_ansioso' },
  { id:3, nombre:'Andrea Salcedo Vega',         iniciales:'AS', codigo:'2022041009', ciclo:'V',   ultima_nota:10.5, base:13.1, desv:-2.6, susti:true,  riesgo:'ROJO',  personalidad:'desmotivado' },
  { id:4, nombre:'Jorge Huamán Ccallo',         iniciales:'JH', codigo:'2021029834', ciclo:'VI',  ultima_nota:12.0, base:15.1, desv:-3.1, susti:false, riesgo:'AMBAR', personalidad:'perfeccionista_ansioso' },
  { id:5, nombre:'María Condori Apaza',         iniciales:'MC', codigo:'2020053217', ciclo:'VI',  ultima_nota:14.5, base:14.0, desv:+0.5, susti:false, riesgo:'VERDE', personalidad:'equilibrado' },
  { id:6, nombre:'Pedro Lazo Rivas',            iniciales:'PL', codigo:'2022007654', ciclo:'V',   ultima_nota:8.0,  base:12.5, desv:-4.5, susti:true,  riesgo:'ROJO',  personalidad:'desmotivado' },
  { id:7, nombre:'Valeria Pumacayo Torres',     iniciales:'VP', codigo:'2021061230', ciclo:'VII', ultima_nota:16.0, base:15.5, desv:+0.5, susti:false, riesgo:'VERDE', personalidad:'resiliente' },
  { id:8, nombre:'Daniel Rios Espinoza',        iniciales:'DR', codigo:'2020034899', ciclo:'VII', ultima_nota:15.5, base:14.9, desv:+0.6, susti:false, riesgo:'VERDE', personalidad:'equilibrado' },
  { id:9, nombre:'Sofía Mendez Cárdenas',       iniciales:'SM', codigo:'2022015678', ciclo:'V',   ultima_nota:13.0, base:16.0, desv:-3.0, susti:false, riesgo:'AMBAR', personalidad:'perfeccionista_ansioso' },
  { id:10, nombre:'Luis Ccama Huayta',          iniciales:'LC', codigo:'2021047823', ciclo:'VI',  ultima_nota:17.5, base:16.8, desv:+0.7, susti:false, riesgo:'VERDE', personalidad:'resiliente' },
]

export const kpis = [
  { label:'Estudiantes asignados', icon:'ti-users',          iconColor:'#6B7280', value:'47',    delta:'+2 este ciclo',    deltaColor:'#16A34A', valColor:'#111827' },
  { label:'Promedio general',      icon:'ti-chart-line',     iconColor:'#6B7280', value:'13.6',  delta:'−0.4 vs período ant.', deltaColor:'#DC2626', valColor:'#111827' },
  { label:'Tercio superior',       icon:'ti-trophy',         iconColor:'#16A34A', value:'14',    delta:'29.8% del grupo',  deltaColor:'#16A34A', valColor:'#111827' },
  { label:'Décimo quinto',         icon:'ti-star',           iconColor:'#D97706', value:'3',     delta:'6.4% del grupo',   deltaColor:'#D97706', valColor:'#111827' },
  { label:'Jalados',               icon:'ti-alert-circle',   iconColor:'#DC2626', value:'8',     delta:'17.0% del grupo',  deltaColor:'#DC2626', valColor:'#DC2626' },
  { label:'Con sustitutorio',      icon:'ti-pencil',         iconColor:'#D97706', value:'6',     delta:'12.8% del grupo',  deltaColor:'#D97706', valColor:'#D97706' },
]

export const semaforo = [
  { estado:'VERDE', label:'Sin riesgo',     count:29, pct:61.7, color:'#16A34A', pillBg:'#F0FDF4', pillColor:'#15803D', tag:null,       tagBg:'', tagColor:'', desc:'Rendimiento estable o en mejora.' },
  { estado:'AMBAR', label:'Riesgo moderado',count:12, pct:25.5, color:'#D97706', pillBg:'#FFFBEB', pillColor:'#B45309', tag:'PRIORIDAD', tagBg:'#FDE68A', tagColor:'#92400E', desc:'Caída en tendencia, aún aprobados.' },
  { estado:'ROJO',  label:'Riesgo alto',    count:6,  pct:12.8, color:'#DC2626', pillBg:'#FEF2F2', pillColor:'#991B1B', tag:'URGENTE',   tagBg:'#FECACA', tagColor:'#991B1B', desc:'Nota reprobatoria. Intervención inmediata.' },
]

export const ranking = [
  { pos:1,  nombre:'Valeria Pumacayo Torres', promedio:17.8, distincion:'Décimo XV' },
  { pos:2,  nombre:'Luis Ccama Huayta',       promedio:17.5, distincion:'Décimo XV' },
  { pos:3,  nombre:'Daniel Rios Espinoza',    promedio:16.9, distincion:'Tercio Sup.' },
  { pos:4,  nombre:'María Condori Apaza',     promedio:15.2, distincion:'Tercio Sup.' },
  { pos:5,  nombre:'Sofía Mendez Cárdenas',   promedio:14.1, distincion:'Tercio Sup.' },
]

export const facultades = [
  { nombre:'Ing. de Sistemas',  alumnos:312, promedio:13.6, riesgo:8.3  },
  { nombre:'Medicina',          alumnos:428, promedio:12.8, riesgo:14.7 },
  { nombre:'Derecho',           alumnos:389, promedio:13.1, riesgo:11.3 },
  { nombre:'Cs. Económicas',    alumnos:267, promedio:13.9, riesgo:7.1  },
  { nombre:'Arquitectura',      alumnos:198, promedio:14.2, riesgo:5.6  },
]

export const alertas = estudiantes.filter(e => e.riesgo === 'ROJO' || e.riesgo === 'AMBAR')

export const perfilDetalle = {
  ciclo: 'V Ciclo',
  escuela: 'Ing. de Sistemas',
  facultad: 'FISI - UNFV',
  periodo: '2026-I',
  personalidad: 'Perfeccionista ansioso',
  asistencia: 71,
  notaActual: 9.5,
  base: 14.2,
  desviacion: -4.7,
  rankGlobal: 41,
  totalEstudiantes: 47,
  notas: [
    { evaluacion:'Práctica Calificada 1', tipo:'PC',    fecha:'12 Mar', nota:11, peso:10 },
    { evaluacion:'Práctica Calificada 2', tipo:'PC',    fecha:'02 Abr', nota:10, peso:10 },
    { evaluacion:'Examen Parcial',        tipo:'EP',    fecha:'25 Abr', nota:8,  peso:30 },
    { evaluacion:'Práctica Calificada 3', tipo:'PC',    fecha:'14 May', nota:9,  peso:10 },
    { evaluacion:'Laboratorio',           tipo:'LAB',   fecha:'21 May', nota:13, peso:20 },
    { evaluacion:'Examen Final',          tipo:'EF',    fecha:'15 Jun', nota:10, peso:20 },
    { evaluacion:'Sustitutorio',          tipo:'SUSTI', fecha:'Pendiente', nota:null, peso:0 },
  ],
  asistenciaMensual: [
    { mes:'Marzo', total:8, asistidas:7 },
    { mes:'Abril', total:9, asistidas:6 },
    { mes:'Mayo',  total:10, asistidas:7 },
    { mes:'Junio', total:5,  asistidas:3 },
  ],
  observaciones: [
    { fecha:'10 Jun 2026', autor:'Mg. Jorge Mendoza', texto:'Estudiante presentó dificultades en el examen parcial. Se coordinó sesión de refuerzo.' },
    { fecha:'28 May 2026', autor:'Mg. Jorge Mendoza', texto:'Asistencia irregular desde abril. Se contactó a la estudiante vía correo institucional.' },
  ],
}
