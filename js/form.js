/**
 * Lógica del formulario - Landing Generator v2
 */

document.addEventListener('DOMContentLoaded', () => {
    initForm();
});

function initForm() {
    const form = document.getElementById('landing-form');
    const tipoRadios = document.querySelectorAll('input[name="tipo_landing"]');
    const sectionModeSelect = document.getElementById('section-mode');
    
    // Inicializar lista de secciones
    updateSectionsList();
    
    // Event listeners
    tipoRadios.forEach(radio => {
        radio.addEventListener('change', () => updateSectionsList());
    });
    
    sectionModeSelect.addEventListener('change', handleModeChange);
    
    form.addEventListener('submit', handleSubmit);
}

/**
 * Actualiza la lista de secciones según el tipo seleccionado
 */
function updateSectionsList() {
    const tipo = document.querySelector('input[name="tipo_landing"]:checked')?.value || 'producto';
    const secciones = CONFIG.SECCIONES[tipo];
    const orden = CONFIG.ORDEN_SECCIONES[tipo];
    const lista = document.getElementById('secciones-lista');
    
    lista.innerHTML = '';
    
    orden.forEach(key => {
        const seccion = secciones[key];
        const label = document.createElement('label');
        label.className = 'checkbox-streamlit';
        label.innerHTML = `
            <input type="checkbox" name="secciones" value="${key}" checked>
            <span>${seccion.icono} ${seccion.nombre}</span>
        `;
        lista.appendChild(label);
    });
}

/**
 * Muestra/oculta el selector de secciones
 */
function handleModeChange(e) {
    const selector = document.getElementById('section-selector');
    
    if (e.target.value === 'seleccionar') {
        selector.classList.remove('hidden');
    } else {
        selector.classList.add('hidden');
    }
}

/**
 * Procesa el envío del formulario
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(CONFIG.WEBHOOK_GENERAR, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const result = await response.json();
        
        sessionStorage.setItem('landing_session', JSON.stringify(result));
        window.location.href = 'preview.html';
        
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        alert('Ocurrió un error al generar la landing. Por favor, intentá de nuevo.\n\nDetalle: ' + error.message);
    }
}

/**
 * Recolecta todos los datos del formulario
 */
function collectFormData() {
    const tipo = document.querySelector('input[name="tipo_landing"]:checked')?.value;
    const mode = document.getElementById('section-mode').value;
    
    let secciones;
    if (mode === 'todas') {
        secciones = CONFIG.ORDEN_SECCIONES[tipo] || [];
    } else {
        secciones = Array.from(document.querySelectorAll('input[name="secciones"]:checked'))
            .map(cb => cb.value);
    }
    
    const keywordsRaw = document.getElementById('keywords').value;
    const keywords = keywordsRaw
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);
    
    const urlsRaw = document.getElementById('urls_referencia').value;
    const urls = urlsRaw
        .split('\n')
        .map(u => u.trim())
        .filter(u => u.length > 0 && isValidUrl(u));
    
    return {
        tipo_landing: tipo,
        secciones_solicitadas: secciones,
        nombre_producto: document.getElementById('nombre_producto').value.trim(),
        audiencia: document.getElementById('audiencia').value.trim(),
        mensajes_clave: document.getElementById('mensajes_clave').value.trim(),
        keywords: keywords,
        urls_referencia: urls,
        ai_overview: document.getElementById('ai_overview').value.trim(),
        timestamp: new Date().toISOString()
    };
}

/**
 * Valida los datos del formulario
 */
function validateFormData(data) {
    if (!data.tipo_landing) {
        alert('Por favor, seleccioná el tipo de landing');
        return false;
    }
    
    if (data.secciones_solicitadas.length === 0) {
        alert('Por favor, seleccioná al menos una sección para generar');
        return false;
    }
    
    if (!data.nombre_producto) {
        alert('Por favor, ingresá el nombre del producto o agrupador');
        document.getElementById('nombre_producto').focus();
        return false;
    }
    
    return true;
}

/**
 * Verifica si una URL es válida
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Muestra el estado de carga
 */
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    const btn = document.getElementById('btn-generar');
    
    overlay.classList.remove('hidden');
    btn.disabled = true;
    btn.querySelector('.btn-content').classList.add('hidden');
    btn.querySelector('.btn-loading').classList.remove('hidden');
    
    animateLoadingSteps();
}

/**
 * Oculta el estado de carga
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    const btn = document.getElementById('btn-generar');
    
    overlay.classList.add('hidden');
    btn.disabled = false;
    btn.querySelector('.btn-content').classList.remove('hidden');
    btn.querySelector('.btn-loading').classList.add('hidden');
    
    if (window.loadingInterval) {
        clearInterval(window.loadingInterval);
    }
}

/**
 * Anima los pasos de carga
 */
function animateLoadingSteps() {
    const stepElement = document.getElementById('loading-step');
    const progressBar = document.getElementById('loading-bar-fill');
    const steps = CONFIG.LOADING_STEPS;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            stepElement.textContent = steps[currentStep];
            const progress = ((currentStep + 1) / steps.length) * 100;
            progressBar.style.width = `${progress}%`;
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 2000);
    
    window.loadingInterval = interval;
}
