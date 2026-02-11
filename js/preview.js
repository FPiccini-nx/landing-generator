/**
 * Lógica de preview - Landing Generator v2
 */

let sessionData = null;
let seccionActual = null;

document.addEventListener('DOMContentLoaded', () => {
    initPreview();
});

function initPreview() {
    const storedData = sessionStorage.getItem('landing_session');
    
    if (!storedData) {
        alert('No hay datos de sesión. Redirigiendo al formulario...');
        window.location.href = 'index.html';
        return;
    }
    
    sessionData = JSON.parse(storedData);
    
    renderHeader();
    renderSidebarInfo();
    renderSidebarSections();
    renderSections();
    updateProgress();
    
    setupModalListeners();
    setupActionButtons();
}

/**
 * Renderiza el header principal
 */
function renderHeader() {
    const title = document.getElementById('preview-title');
    const badge = document.getElementById('type-badge');
    
    title.textContent = sessionData.nombre_producto || 'Preview de Landing';
    badge.textContent = sessionData.tipo_landing === 'producto' ? 'Producto' : 'Agrupadora';
}

/**
 * Renderiza info en el sidebar
 */
function renderSidebarInfo() {
    document.getElementById('sidebar-tipo').textContent = 
        sessionData.tipo_landing === 'producto' ? 'Producto' : 'Agrupadora';
    document.getElementById('sidebar-producto').textContent = 
        sessionData.nombre_producto || '-';
}

/**
 * Renderiza la navegación de secciones en el sidebar
 */
function renderSidebarSections() {
    const container = document.getElementById('sidebar-sections');
    const template = document.getElementById('template-sidebar-item');
    const tipo = sessionData.tipo_landing;
    const seccionesConfig = CONFIG.SECCIONES[tipo];
    const orden = CONFIG.ORDEN_SECCIONES[tipo];
    
    container.innerHTML = '';
    
    orden.forEach(seccionKey => {
        if (!sessionData.secciones || !sessionData.secciones[seccionKey]) return;
        
        const config = seccionesConfig[seccionKey];
        const seccionData = sessionData.secciones[seccionKey];
        
        const item = template.content.cloneNode(true);
        const link = item.querySelector('.section-nav-item');
        
        link.dataset.seccion = seccionKey;
        link.querySelector('.section-nav-icon').textContent = config.icono;
        link.querySelector('.section-nav-name').textContent = config.nombre;
        
        if (seccionData.estado === 'aprobada') {
            link.classList.add('approved');
            link.querySelector('.section-nav-status').textContent = '✓';
        }
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection(seccionKey);
        });
        
        container.appendChild(item);
    });
}

/**
 * Scroll a una sección específica
 */
function scrollToSection(seccionKey) {
    const card = document.querySelector(`[data-seccion="${seccionKey}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('highlight');
        setTimeout(() => card.classList.remove('highlight'), 1500);
    }
}

/**
 * Renderiza todas las secciones
 */
function renderSections() {
    const container = document.getElementById('sections-container');
    const template = document.getElementById('template-seccion');
    const tipo = sessionData.tipo_landing;
    const seccionesConfig = CONFIG.SECCIONES[tipo];
    const orden = CONFIG.ORDEN_SECCIONES[tipo];
    
    container.innerHTML = '';
    
    const seccionesOrdenadas = orden.filter(s => 
        sessionData.secciones && sessionData.secciones[s]
    );
    
    seccionesOrdenadas.forEach(seccionKey => {
        const seccionInfo = seccionesConfig[seccionKey];
        const seccionData = sessionData.secciones[seccionKey];
        
        if (!seccionInfo || !seccionData) return;
        
        const card = template.content.cloneNode(true);
        const article = card.querySelector('.section-card-streamlit');
        
        article.dataset.seccion = seccionKey;
        article.querySelector('.section-icon-streamlit').textContent = seccionInfo.icono;
        article.querySelector('.section-name-streamlit').textContent = seccionInfo.nombre;
        article.querySelector('.section-content').innerHTML = formatContent(seccionData.contenido);
        
        if (seccionData.estado === 'aprobada') {
            article.classList.add('approved');
            article.querySelector('.status-pill').textContent = 'Aprobada';
            article.querySelector('.status-pill').className = 'status-pill status-approved';
            article.querySelector('.btn-aprobar').textContent = '✓ Aprobada';
            article.querySelector('.btn-aprobar').classList.add('approved');
        }
        
        // Event listeners
        article.querySelector('.btn-aprobar').addEventListener('click', () => handleAprobar(seccionKey));
        article.querySelector('.btn-regenerar').addEventListener('click', () => handleRegenerarClick(seccionKey));
        article.querySelector('.btn-copy').addEventListener('click', () => handleCopiar(seccionKey));
        
        container.appendChild(card);
    });
    
    document.getElementById('total-count').textContent = seccionesOrdenadas.length;
}

/**
 * Formatea el contenido para mostrar
 */
function formatContent(contenido) {
    if (!contenido) return '<em style="color: #9CA3AF;">Sin contenido generado</em>';
    
    let formatted = contenido
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Markdown básico
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/^- (.+)$/gm, '• $1<br>');
    formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '$1. $2<br>');
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = '<p>' + formatted + '</p>';
    
    return formatted;
}

/**
 * Actualiza el progreso
 */
function updateProgress() {
    const secciones = sessionData.secciones || {};
    const total = Object.keys(secciones).length;
    const aprobadas = Object.values(secciones).filter(s => s.estado === 'aprobada').length;
    
    document.getElementById('aprobadas-count').textContent = aprobadas;
    document.getElementById('total-count').textContent = total;
    
    const porcentaje = total > 0 ? (aprobadas / total) * 100 : 0;
    document.getElementById('progress-mini-fill').style.width = `${porcentaje}%`;
    
    // Banner de éxito
    const banner = document.getElementById('success-banner');
    if (aprobadas === total && total > 0) {
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
    
    // Actualizar sidebar
    renderSidebarSections();
}

/**
 * Aprueba o desaprueba una sección
 */
function handleAprobar(seccionKey) {
    const seccion = sessionData.secciones[seccionKey];
    
    seccion.estado = seccion.estado === 'aprobada' ? 'pendiente' : 'aprobada';
    
    sessionStorage.setItem('landing_session', JSON.stringify(sessionData));
    
    renderSections();
    updateProgress();
}

/**
 * Abre el modal de regeneración
 */
function handleRegenerarClick(seccionKey) {
    seccionActual = seccionKey;
    
    const tipo = sessionData.tipo_landing;
    const seccionInfo = CONFIG.SECCIONES[tipo][seccionKey];
    const seccionData = sessionData.secciones[seccionKey];
    
    document.getElementById('modal-titulo').textContent = `Editar: ${seccionInfo.nombre}`;
    document.getElementById('modal-contenido-actual').innerHTML = formatContent(seccionData.contenido);
    document.getElementById('chat-history').innerHTML = '';
    document.getElementById('chat-input').value = '';
    
    document.getElementById('modal-regenerar').classList.remove('hidden');
    document.getElementById('chat-input').focus();
}

/**
 * Configura listeners del modal
 */
function setupModalListeners() {
    const modal = document.getElementById('modal-regenerar');
    
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancelar-modal').addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.getElementById('btn-enviar-chat').addEventListener('click', handleEnviarChat);
    
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviarChat();
        }
    });
    
    document.getElementById('btn-usar-version').addEventListener('click', handleUsarVersion);
}

function closeModal() {
    document.getElementById('modal-regenerar').classList.add('hidden');
    seccionActual = null;
}

/**
 * Envía solicitud de regeneración
 */
async function handleEnviarChat() {
    const input = document.getElementById('chat-input');
    const mensaje = input.value.trim();
    
    if (!mensaje || !seccionActual) return;
    
    addChatMessage('user', mensaje);
    input.value = '';
    
    const btn = document.getElementById('btn-enviar-chat');
    btn.querySelector('.btn-text').classList.add('hidden');
    btn.querySelector('.btn-loading').classList.remove('hidden');
    btn.disabled = true;
    
    try {
        const response = await fetch(CONFIG.WEBHOOK_REGENERAR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionData.id,
                seccion: seccionActual,
                contenido_actual: sessionData.secciones[seccionActual].contenido,
                instruccion: mensaje,
                tipo_landing: sessionData.tipo_landing,
                nombre_producto: sessionData.nombre_producto,
                keywords: sessionData.keywords
            })
        });
        
        if (!response.ok) throw new Error('Error del servidor');
        
        const result = await response.json();
        
        sessionData.secciones[seccionActual].contenido = result.nuevo_contenido;
        sessionData.secciones[seccionActual].estado = 'pendiente';
        
        if (!sessionData.secciones[seccionActual].historial) {
            sessionData.secciones[seccionActual].historial = [];
        }
        sessionData.secciones[seccionActual].historial.push({
            version: sessionData.secciones[seccionActual].historial.length + 1,
            contenido: result.nuevo_contenido,
            feedback: mensaje,
            timestamp: new Date().toISOString()
        });
        
        sessionStorage.setItem('landing_session', JSON.stringify(sessionData));
        
        addChatMessage('assistant', result.nuevo_contenido);
        document.getElementById('modal-contenido-actual').innerHTML = formatContent(result.nuevo_contenido);
        
    } catch (error) {
        console.error('Error:', error);
        addChatMessage('assistant', '❌ Error al regenerar. Intentá de nuevo.');
    } finally {
        btn.querySelector('.btn-text').classList.remove('hidden');
        btn.querySelector('.btn-loading').classList.add('hidden');
        btn.disabled = false;
    }
}

function addChatMessage(role, content) {
    const container = document.getElementById('chat-history');
    
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = role === 'assistant' ? formatContent(content) : content;
    
    div.appendChild(bubble);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function handleUsarVersion() {
    renderSections();
    updateProgress();
    closeModal();
}

/**
 * Copia el contenido de una sección
 */
function handleCopiar(seccionKey) {
    const contenido = sessionData.secciones[seccionKey]?.contenido || '';
    
    navigator.clipboard.writeText(contenido).then(() => {
        const card = document.querySelector(`[data-seccion="${seccionKey}"]`);
        const btn = card.querySelector('.btn-copy');
        const original = btn.textContent;
        
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = original, 1500);
    });
}

/**
 * Configura botones de acción del sidebar
 */
function setupActionButtons() {
    document.getElementById('btn-copiar-todo').addEventListener('click', handleCopiarTodo);
    document.getElementById('btn-descargar').addEventListener('click', handleDescargar);
}

function handleCopiarTodo() {
    const tipo = sessionData.tipo_landing;
    const orden = CONFIG.ORDEN_SECCIONES[tipo];
    const seccionesConfig = CONFIG.SECCIONES[tipo];
    
    let contenido = `# ${sessionData.nombre_producto}\n`;
    contenido += `Tipo: Landing de ${tipo === 'producto' ? 'Producto' : 'Agrupadora'}\n\n`;
    contenido += `---\n\n`;
    
    orden.forEach(key => {
        const seccion = sessionData.secciones[key];
        const config = seccionesConfig[key];
        
        if (seccion && config) {
            contenido += `## ${config.icono} ${config.nombre}\n\n`;
            contenido += seccion.contenido + '\n\n';
            contenido += `---\n\n`;
        }
    });
    
    navigator.clipboard.writeText(contenido).then(() => {
        const btn = document.getElementById('btn-copiar-todo');
        const original = btn.textContent;
        btn.textContent = '✓ Copiado!';
        setTimeout(() => btn.textContent = original, 2000);
    });
}

function handleDescargar() {
    const tipo = sessionData.tipo_landing;
    const orden = CONFIG.ORDEN_SECCIONES[tipo];
    const seccionesConfig = CONFIG.SECCIONES[tipo];
    
    let contenido = `${sessionData.nombre_producto}\n`;
    contenido += `Tipo: Landing de ${tipo === 'producto' ? 'Producto' : 'Agrupadora'}\n`;
    contenido += `Generado: ${new Date().toLocaleDateString('es-AR')}\n\n`;
    contenido += `========================================\n\n`;
    
    orden.forEach(key => {
        const seccion = sessionData.secciones[key];
        const config = seccionesConfig[key];
        
        if (seccion && config) {
            contenido += `[${config.nombre.toUpperCase()}]\n\n`;
            contenido += seccion.contenido + '\n\n';
            contenido += `----------------------------------------\n\n`;
        }
    });
    
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landing-${sessionData.nombre_producto.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
