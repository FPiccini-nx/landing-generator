/**
 * Configuración del Landing Generator
 * 
 * IMPORTANTE: Actualizá estas URLs con las de tus webhooks de n8n
 */

const CONFIG = {
    // URLs de los webhooks de n8n (las vamos a configurar en la Fase 2)
    WEBHOOK_GENERAR: 'https://TU-INSTANCIA-N8N.com/webhook/generar-landing',
    WEBHOOK_REGENERAR: 'https://TU-INSTANCIA-N8N.com/webhook/regenerar-seccion',
    
    // Configuración de Supabase
    SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
    SUPABASE_ANON_KEY: 'TU-ANON-KEY',
    
    // Mapeo de secciones con sus iconos y nombres
    SECCIONES: {
        producto: {
            hero: { nombre: 'Hero', icono: '🎯' },
            definicion: { nombre: 'Definición', icono: '📖' },
            beneficios: { nombre: 'Beneficios', icono: '✨' },
            tabla_tecnica: { nombre: 'Tabla técnica', icono: '📊' },
            como_pedir: { nombre: 'Cómo pedir', icono: '📝' },
            requisitos: { nombre: 'Requisitos', icono: '✅' },
            faqs: { nombre: 'FAQs / Legales', icono: '❓' },
            texto_seo: { nombre: 'Texto SEO', icono: '🔍' },
            mas_productos: { nombre: 'Más productos', icono: '🛒' }
        },
        agrupadora: {
            sitewide: { nombre: 'Sitewide', icono: '📢' },
            hero: { nombre: 'Hero', icono: '🎯' },
            comparativa: { nombre: 'Comparativa', icono: '⚖️' },
            beneficios: { nombre: 'Beneficios', icono: '✨' },
            como_pedir: { nombre: 'Cómo pedir', icono: '📝' },
            requisitos: { nombre: 'Requisitos', icono: '✅' },
            faqs: { nombre: 'FAQs / Legales', icono: '❓' },
            texto_seo: { nombre: 'Texto SEO', icono: '🔍' },
            mas_productos: { nombre: 'Más productos', icono: '🛒' }
        }
    },
    
    // Orden de las secciones
    ORDEN_SECCIONES: {
        producto: ['hero', 'definicion', 'beneficios', 'tabla_tecnica', 'como_pedir', 'requisitos', 'faqs', 'texto_seo', 'mas_productos'],
        agrupadora: ['sitewide', 'hero', 'comparativa', 'beneficios', 'como_pedir', 'requisitos', 'faqs', 'texto_seo', 'mas_productos']
    },
    
    // Mensajes de carga
    LOADING_STEPS: [
        'Iniciando proceso...',
        'Analizando URLs de referencia...',
        'Extrayendo vocabulario y tono...',
        'Procesando keywords SEO...',
        'Generando contenido con IA...',
        'Estructurando secciones...',
        'Finalizando...'
    ]
};

window.CONFIG = CONFIG;
