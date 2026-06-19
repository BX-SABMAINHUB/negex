import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD13N4-9MjTrmlPwGP7mves0Exje4v2ACw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kahoot-8529e.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://kahoot-8529e-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kahoot-8529e',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kahoot-8529e.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '313414356056',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:313414356056:web:4aab4587f7df9393008e2d',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-8T4CPC1BQ3',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const defaultVerticalCanvas = {
  version: '6.0.0',
  objects: [
    { type: 'rect', left: 0, top: 0, width: 1080, height: 1920, fill: '#f8fafc', selectable: false },
    { type: 'i-text', left: 100, top: 200, text: 'Título Principal', fontFamily: 'Inter', fontSize: 64, fontWeight: 'bold', fill: '#1e293b' },
    { type: 'i-text', left: 100, top: 320, text: 'Subtítulo descriptivo aquí', fontFamily: 'Inter', fontSize: 28, fill: '#64748b' },
    { type: 'rect', left: 80, top: 500, width: 920, height: 600, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 2, rx: 16, ry: 16 },
    { type: 'i-text', left: 140, top: 560, text: 'Sección de contenido', fontFamily: 'Inter', fontSize: 32, fontWeight: 'bold', fill: '#2563EB' },
    { type: 'i-text', left: 140, top: 620, width: 800, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', fontFamily: 'Inter', fontSize: 20, fill: '#475569' },
  ],
};

const defaultHorizontalCanvas = {
  version: '6.0.0',
  objects: [
    { type: 'rect', left: 0, top: 0, width: 1920, height: 1080, fill: '#0f172a', selectable: false },
    { type: 'i-text', left: 200, top: 350, text: 'Presentación Corporativa', fontFamily: 'Inter', fontSize: 72, fontWeight: 'bold', fill: '#ffffff' },
    { type: 'i-text', left: 200, top: 460, text: 'Subtítulo profesional', fontFamily: 'Inter', fontSize: 32, fill: '#94a3b8' },
    { type: 'rect', left: 1400, top: 200, width: 400, height: 400, fill: 'transparent', stroke: '#2563EB', strokeWidth: 4, rx: 20, ry: 20 },
    { type: 'i-text', left: 1480, top: 370, text: 'N', fontFamily: 'Inter', fontSize: 100, fontWeight: 'bold', fill: '#06B6D4' },
  ],
};

const defaultChartCanvas = {
  version: '6.0.0',
  objects: [
    { type: 'rect', left: 0, top: 0, width: 1200, height: 800, fill: '#ffffff', selectable: false },
    { type: 'i-text', left: 50, top: 30, text: 'Reporte Financiero 2024', fontFamily: 'Inter', fontSize: 36, fontWeight: 'bold', fill: '#1e293b' },
    { type: 'rect', left: 50, top: 100, width: 500, height: 350, fill: '#f1f5f9', stroke: '#e2e8f0', strokeWidth: 1, rx: 8, ry: 8 },
    { type: 'i-text', left: 70, top: 120, text: '📊 Ingresos por trimestre', fontFamily: 'Inter', fontSize: 18, fontWeight: 'bold', fill: '#2563EB' },
    { type: 'rect', left: 50, top: 480, width: 500, height: 280, fill: '#f1f5f9', stroke: '#e2e8f0', strokeWidth: 1, rx: 8, ry: 8 },
    { type: 'i-text', left: 70, top: 500, text: '📈 Gastos operativos', fontFamily: 'Inter', fontSize: 18, fontWeight: 'bold', fill: '#06B6D4' },
  ],
};

const defaultTableCanvas = {
  version: '6.0.0',
  objects: [
    { type: 'rect', left: 0, top: 0, width: 1200, height: 800, fill: '#f8fafc', selectable: false },
    { type: 'i-text', left: 50, top: 30, text: 'Planificador Semanal', fontFamily: 'Inter', fontSize: 36, fontWeight: 'bold', fill: '#1e293b' },
    { type: 'rect', left: 40, top: 100, width: 1120, height: 600, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1, rx: 8, ry: 8 },
    { type: 'i-text', left: 80, top: 130, text: 'Lunes    | Martes  | Miércoles | Jueves  | Viernes', fontFamily: 'JetBrains Mono', fontSize: 18, fill: '#475569' },
    { type: 'line', x1: 40, y1: 170, x2: 1160, y2: 170, stroke: '#e2e8f0', strokeWidth: 2 },
    { type: 'i-text', left: 80, top: 190, text: 'Tarea 1  | Tarea 2 | Tarea 3  | Tarea 4 | Tarea 5', fontFamily: 'JetBrains Mono', fontSize: 16, fill: '#64748b' },
  ],
};

const templates = [
  // Verticales (5)
  { name: 'Infografía corporativa vertical', category: 'vertical', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultVerticalCanvas, description: 'Infografía profesional vertical para presentaciones corporativas.', isPremium: false },
  { name: 'Curriculum vitae moderno', category: 'vertical', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultVerticalCanvas, description: 'CV moderno y elegante para destacar tu experiencia.', isPremium: false },
  { name: 'Flyer de evento', category: 'vertical', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultVerticalCanvas, description: 'Flyer llamativo para promocionar eventos.', isPremium: false },
  { name: 'Post de Instagram', category: 'vertical', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultVerticalCanvas, description: 'Formato 1080x1920 optimizado para Instagram.', isPremium: false },
  { name: 'Menú de restaurante', category: 'vertical', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultVerticalCanvas, description: 'Menú elegante para restaurantes y cafeterías.', isPremium: true },
  // Horizontales (4)
  { name: 'Presentación corporativa (16:9)', category: 'horizontal', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultHorizontalCanvas, description: 'Presentación profesional en formato panorámico.', isPremium: false },
  { name: 'Banner publicitario web', category: 'horizontal', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultHorizontalCanvas, description: 'Banner optimizado para publicidad digital.', isPremium: false },
  { name: 'Portada de informe', category: 'horizontal', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultHorizontalCanvas, description: 'Portada impactante para informes y reportes.', isPremium: false },
  { name: 'Certificado de reconocimiento', category: 'horizontal', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultHorizontalCanvas, description: 'Certificado elegante para premiaciones.', isPremium: true },
  // Gráficas (3)
  { name: 'Reporte financiero con gráficos de barras', category: 'graficas', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultChartCanvas, description: 'Reporte financiero profesional con gráficos de barras.', isPremium: false },
  { name: 'Dashboard de métricas con gráficos circulares', category: 'graficas', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultChartCanvas, description: 'Dashboard ejecutivo con métricas clave.', isPremium: false },
  { name: 'Infografía estadística con gráficos de líneas', category: 'graficas', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultChartCanvas, description: 'Infografía con tendencias y estadísticas.', isPremium: true },
  // Tablas (2)
  { name: 'Hoja de cálculo de presupuesto', category: 'tablas', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultTableCanvas, description: 'Plantilla de presupuesto editable.', isPremium: false },
  { name: 'Planificador semanal', category: 'tablas', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultTableCanvas, description: 'Organizador semanal personalizable.', isPremium: false },
  // Otros (1)
  { name: 'Diseño mixto con vídeo incrustado', category: 'otros', thumbnailUrl: '/templates/placeholder.svg', defaultCanvasData: defaultHorizontalCanvas, description: 'Diseño multimedia con soporte para vídeo.', isPremium: false },
];

async function seed() {
  console.log('🌱 Sembrando plantillas en Firestore...');
  const col = collection(db, 'plantillas');
  for (const tpl of templates) {
    await addDoc(col, { ...tpl, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    console.log(`  ✅ Insertada: ${tpl.name}`);
  }
  console.log('🎉 ¡Seed completado!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
