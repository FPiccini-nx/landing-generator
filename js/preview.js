/**
 * Lógica de la página de preview y regeneración de secciones
 */

// Estado global de la sesión
let sessionData = null;
let seccionActual = null;

document.addEventListener('DOMContentLoaded', () => {
    initPreview();
});

/**
 * Inicializa la página de preview
 */
function initPreview() {
    // Cargar datos de la sesión
    const storedData = sessionStorage.getItem('landing_session');
    
    if (!storedData) {
        // No hay datos, redirigir al formulario
        alert('No hay datos de sesión. Redirigiendo al formulario...');
        window.location.href = 'index.html';
        return;
    }
    
    sessionData = JSON.parse(storedData);
    
    // Renderizar la página
    renderHeader();
    renderSections();
    updateProgress();
    
    // Configurar event listeners del modal
    setupModalListeners();
    
    // Configurar acciones finales
    setupFinalActions();
}

/**
 * Renderiza el header con info de la sesión
 */
function renderHeader() {
    const badgeTipo = document.getElementById('badge-tipo');
    const previewTitle = document.getElementById('preview-title');
    
    badgeTipo.textContent = sessionData.tipo_landing === 'producto' ? 'Producto' : 'Agrupadora';
    previewTitle.textContent = sessionData.nombre_producto || 'Landing';
}

/**
 * Renderiza todas las secciones
 */
function renderSections() {
    const container = document.getElementById('sections-container');
    const template = document.getElementById('template-seccion');
    const tipo = sessionData.tipo_landing;
    const seccionesConfig = CONFIG.SECCIONES[tipo];
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Ordenar secciones según el orden definido
    const ordenSecciones = CONFIG.ORDEN_SECCIONES[tipo];
    const seccionesOrdenadas = ordenSecciones.filter(s => 
        sessionData.secciones && sessionData.secciones[s]
    );
    
    // Crear card para cada sección
    seccionesOrdenadas.forEach(seccionKey => {
        const seccionInfo = seccionesConfig[seccionKey];
        const seccionData = sessionData.secciones[seccionKey];
        
        if (!seccionInfo || !seccionData) return;
        
        // Clonar template
        const card = template.content.cloneNode(true);
        const article = card.querySelector('.section-card');
        
        // Configurar datos
        article.dataset.seccion = seccionKey;
        article.querySelector('.section-icon').textContent = seccionInfo.icono;
        article.querySelector('.section-name').textContent = seccionInfo.nombre;
        article.querySelector('.content-text').innerHTML = formatContent(seccionData.contenido);
        
        // Configurar estado
        if (seccionData.estado === 'aprobada') {
            article.classList.add('aprobada');
            article.querySelector('.status-badge').textContent = 'Aprobada';
            article.querySelector('.status-badge').className = 'status-badge status-aprobada';
            article.querySelector('.btn-aprobar').textContent = '✓ Aprobada';
            article.querySelector('.btn-aprobar').classList.add('aprobado');
        }
        
        // Event listeners de los botones
        article.querySelector('.btn-aprobar').addEventListener('click', () => handleAprobar(seccionKey));
        article.querySelector('.btn-regenerar').addEventListener('click', () => handleRegenerarClick(seccionKey));
        article.querySelector('.btn-copiar').addEventListener('click', () => handleCopiar(seccionKey));
        
        container.appendChild(card);
    });
    
    // Actualizar totales
    document.getElementById('secciones-total').textContent = seccionesOrdenadas.length;
}

/**
 * Formatea el contenido para mostrar
 */
function formatContent(contenido) {
    if (!contenido) return '<em>Sin contenido</em>';
    
    // Escapar HTML
    let formatted = contenido
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Convertir markdown básico a HTML
    // Títulos
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Negritas
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Listas
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
    
    // Saltos de línea
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = '<p>' + formatted + '</p>';
    
    return formatted;
}

/**
 * Actualiza la barra de progreso
 */
function updateProgress() {
    const secciones = sessionData.secciones || {};
    const total = Object.keys(secciones).length;
    const aprobadas = Object.values(secciones).filter(s => s.estado === 'aprobada').length;
    
    document.getElementById('secciones-aprobadas').textContent = aprobadas;
    document.getElementById('secciones-total').textContent = total;
    
    const progressFill = document.getElementById('progress-fill');
    const porcentaje = total > 0 ? (aprobadas / total) * 100 : 0;
    progressFill.style.width = `${porcentaje}%`;
    
    // Mostrar acciones finales si todo está aprobado
    const finalActions = document.getElementById('final-actions');
    if (aprobadas === total && total > 0) {
        finalActions.classList.remove('hidden');
    } else {
        finalActions.classList.add('hidden');
    }
}

/**
 * Maneja la aprobación de una sección
 */
function handleAprobar(seccionKey) {
    const seccion = sessionData.secciones[seccionKey];
    
    if (seccion.estado === 'aprobada') {
        // Desaprobar
        seccion.estado = 'pendiente';
    } else {
        // Aprobar
        seccion.estado = 'aprobada';
    }
    
    // Guardar en sessionStorage
    sessionStorage.setItem('landing_session', JSON.stringify(sessionData));
    
    // Re-renderizar
    renderSections();
    updateProgress();
}

/**
 * Maneja el clic en regenerar
 */
function handleRegenerarClick(seccionKey) {
    seccionActual = seccionKey;
    
    const tipo = sessionData.tipo_landing;
    const seccionInfo = CONFIG.SECCIONES[tipo][seccionKey];
    const seccionData = sessionData.secciones[seccionKey];
    
    // Configurar modal
    document.getElementById('modal-titulo').textContent = `Regenerar: ${seccionInfo.nombre}`;
    document.getElementById('modal-contenido-actual').innerHTML = formatContent(seccionData.contenido);
    
    // Limpiar chat
    document.getElementById('chat-messages').innerHTML = '';
    document.getElementById('chat-input').value = '';
    
    // Mostrar modal
    document.getElementById('modal-regenerar').classList.remove('hidden');
    document.getElementById('chat-input').focus();
}

/**
 * Configura los listeners del modal
 */
function setupModalListeners() {
    const modal = document.getElementById('modal-regenerar');
    const btnClose = document.getElementById('modal-close');
    const btnCancelar = document.getElementById('btn-cancelar-modal');
    const btnEnviar = document.getElementById('btn-enviar-chat');
    const btnUsarVersion = document.getElementById('btn-usar-version');
    const chatInput = document.getElementById('chat-input');
    
    // Cerrar modal
    btnClose.addEventListener('click', closeModal);
    btnCancelar.addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Enviar mensaje
    btnEnviar.addEventListener('click', handleEnviarChat);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviarChat();
        }
    });
    
    // Usar versión actual
    btnUsarVersion.addEventListener('click', handleUsarVersion);
}

/**
 * Cierra el modal
 */
function closeModal() {
    document.getElementById('modal-regenerar').classList.add('hidden');
    seccionActual = null;
}

/**
 * Envía un mensaje de chat para regenerar
 */
async function handleEnviarChat() {
    const input = document.getElementById('chat-input');
    const mensaje = input.value.trim();
    
    if (!mensaje || !seccionActual) return;
    
    // Agregar mensaje del usuario al chat
    addChatMessage('user', mensaje);
    input.value = '';
    
    // Mostrar estado de carga
    const btnEnviar = document.getElementById('btn-enviar-chat');
    btnEnviar.querySelector('.btn-text').classList.add('hidden');
    btnEnviar.querySelector('.btn-loading').classList.remove('hidden');
    btnEnviar.disabled = true;
    
    try {
        // Enviar al webhook de regeneración
        const response = await fetch(CONFIG.WEBHOOK_REGENERAR, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const result = await response.json();
        
        // Actualizar contenido
        sessionData.secciones[seccionActual].contenido = result.nuevo_contenido;
        sessionData.secciones[seccionActual].estado = 'pendiente';
        
        // Agregar historial
        if (!sessionData.secciones[seccionActual].historial) {
            sessionData.secciones[seccionActual].historial = [];
        }
        sessionData.secciones[seccionActual].historial.push({
            version: sessionData.secciones[seccionActual].historial.length + 1,
            contenido: result.nuevo_contenido,
            feedback: mensaje,
            timestamp: new Date().toISOString()
        });
        
        // Guardar en sessionStorage
        sessionStorage.setItem('landing_session', JSON.stringify(sessionData));
        
        // Mostrar nuevo contenido en el chat
        addChatMessage('assistant', result.nuevo_contenido);
        
        // Actualizar preview en el modal
        document.getElementById('modal-contenido-actual').innerHTML = formatContent(result.nuevo_contenido);
        
    } catch (error) {
        console.error('Error:', error);
        addChatMessage('assistant', '❌ Ocurrió un error al regenerar. Por favor, intentá de nuevo.');
    } finally {
        // Restaurar botón
        btnEnviar.querySelector('.btn-text').classList.remove('hidden');
        btnEnviar.querySelector('.btn-loading').classList.add('hidden');
        btnEnviar.disabled = false;
    }
}

/**
 * Agrega un mensaje al chat
 */
function addChatMessage(role, content) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    
    if (role === 'assistant') {
        // Formatear contenido del asistente
        bubble.innerHTML = formatContent(content);
    } else {
        bubble.textContent = content;
    }
    
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Usa la versión actual y cierra el modal
 */
function handleUsarVersion() {
    // Re-renderizar secciones con el contenido actualizado
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
        // Feedback visual
        const card = document.querySelector(`[data-seccion="${seccionKey}"]`);
        const btnCopiar = card.querySelector('.btn-copiar');
        const originalText = btnCopiar.textContent;
        
        btnCopiar.textContent = '✓ Copiado';
        setTimeout(() => {
            btnCopiar.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar al portapapeles');
    });
}

/**
 * Configura las acciones finales
 */
function setupFinalActions() {
    document.getElementById('btn-copiar-todo').addEventListener('click', handleCopiarTodo);
    document.getElementById('btn-descargar').addEventListener('click', handleDescargar);
}

/**
 * Copia todo el contenido
 */
function handleCopiarTodo() {
    const tipo = sessionData.tipo_landing;
    const orden = CONFIG.ORDEN_SECCIONES[tipo];
    const seccionesConfig = CONFIG.SECCIONES[tipo];
    
    let contenidoCompleto = `# ${sessionData.nombre_producto}\n`;
    contenidoCompleto += `Tipo: Landing de ${tipo === 'producto' ? 'Producto' : 'Agrupadora'}\n\n`;
    contenidoCompleto += `---\n\n`;
    
    orden.forEach(seccionKey => {
        const seccion = sessionData.secciones[seccionKey];
        const config = seccionesConfig[seccionKey];
        
        if (seccion && config) {
            contenidoCompleto += `## ${config.icono} ${config.nombre}\n\n`;
            contenidoCompleto += seccion.contenido + '\n\n';
            contenidoCompleto += `---\n\n`;
        }
    });
    
    navigator.clipboard.writeText(contenidoCompleto).then(() => {
        const btn = document.getElementById('btn-copiar-todo');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copiado!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

/**
 * Descarga el contenido como archivo .txt
 */
function handleDescargar() {
    const tipo = sessionData.tipo_landing;
    const orden = CONFIG.ORDEN_SECCIONES[tipo];
    const seccionesConfig = CONFIG.SECCIONES[tipo];
    
    let contenidoCompleto = `${sessionData.nombre_producto}\n`;
    contenidoCompleto += `Tipo: Landing de ${tipo === 'producto' ? 'Producto' : 'Agrupadora'}\n`;
    contenidoCompleto += `Generado: ${new Date().toLocaleDateString('es-AR')}\n\n`;
    contenidoCompleto += `========================================\n\n`;
    
    orden.forEach(seccionKey => {
        const seccion = sessionData.secciones[seccionKey];
        const config = seccionesConfig[seccionKey];
        
        if (seccion && config) {
            contenidoCompleto += `[${config.nombre.toUpperCase()}]\n\n`;
            contenidoCompleto += seccion.contenido + '\n\n';
            contenidoCompleto += `----------------------------------------\n\n`;
        }
    });
    
    // Crear y descargar archivo
    const blob = new Blob([contenidoCompleto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landing-${sessionData.nombre_producto.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
