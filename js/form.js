/**
 * Lógica del formulario de generación de landings
 */

document.addEventListener('DOMContentLoaded', () => {
    initForm();
});

function initForm() {
    const form = document.getElementById('landing-form');
    const tipoRadios = document.querySelectorAll('input[name="tipo_landing"]');
    const modeRadios = document.querySelectorAll('input[name="section_mode"]');
    
    // Manejar cambio de tipo de landing
    tipoRadios.forEach(radio => {
        radio.addEventListener('change', handleTipoChange);
    });
    
    // Manejar cambio de modo de secciones
    modeRadios.forEach(radio => {
        radio.addEventListener('change', handleModeChange);
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleSubmit);
}

/**
 * Muestra/oculta las secciones según el tipo de landing seleccionado
 */
function handleTipoChange(e) {
    const tipo = e.target.value;
    const seccionesProducto = document.getElementById('secciones-producto');
    const seccionesAgrupadora = document.getElementById('secciones-agrupadora');
    const modeSeleccionar = document.querySelector('input[name="section_mode"][value="seleccionar"]');
    
    // Ocultar ambos primero
    seccionesProducto.classList.add('hidden');
    seccionesAgrupadora.classList.add('hidden');
    
    // Mostrar el correspondiente solo si está en modo seleccionar
    if (modeSeleccionar.checked) {
        if (tipo === 'producto') {
            seccionesProducto.classList.remove('hidden');
        } else {
            seccionesAgrupadora.classList.remove('hidden');
        }
    }
    
    // Limpiar selecciones anteriores
    document.querySelectorAll('input[name="secciones"]').forEach(cb => {
        cb.checked = false;
    });
}

/**
 * Muestra/oculta el selector de secciones según el modo
 */
function handleModeChange(e) {
    const mode = e.target.value;
    const tipoSeleccionado = document.querySelector('input[name="tipo_landing"]:checked');
    const seccionesProducto = document.getElementById('secciones-producto');
    const seccionesAgrupadora = document.getElementById('secciones-agrupadora');
    
    if (mode === 'todas') {
        // Ocultar ambos selectores
        seccionesProducto.classList.add('hidden');
        seccionesAgrupadora.classList.add('hidden');
    } else if (tipoSeleccionado) {
        // Mostrar el selector correspondiente al tipo
        if (tipoSeleccionado.value === 'producto') {
            seccionesProducto.classList.remove('hidden');
            seccionesAgrupadora.classList.add('hidden');
        } else {
            seccionesAgrupadora.classList.remove('hidden');
            seccionesProducto.classList.add('hidden');
        }
    }
}

/**
 * Procesa el envío del formulario
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = collectFormData();
    
    // Validar datos
    if (!validateFormData(formData)) {
        return;
    }
    
    // Mostrar estado de carga
    showLoading();
    
    try {
        // Enviar al webhook de n8n
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
        
        // Guardar datos en sessionStorage para la página de preview
        sessionStorage.setItem('landing_session', JSON.stringify(result));
        
        // Redirigir a la página de preview
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
    const mode = document.querySelector('input[name="section_mode"]:checked')?.value;
    
    // Determinar secciones a generar
    let secciones;
    if (mode === 'todas') {
        // Todas las secciones del tipo seleccionado
        secciones = CONFIG.ORDEN_SECCIONES[tipo] || [];
    } else {
        // Solo las seleccionadas
        secciones = Array.from(document.querySelectorAll('input[name="secciones"]:checked'))
            .map(cb => cb.value);
    }
    
    // Procesar keywords (una por línea)
    const keywordsRaw = document.getElementById('keywords').value;
    const keywords = keywordsRaw
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);
    
    // Procesar URLs (una por línea)
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
        alert('Por favor, seleccioná el tipo de landing (Producto o Agrupadora)');
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
    const loadingContainer = document.getElementById('loading-state');
    const form = document.getElementById('landing-form');
    const btnText = document.querySelector('#btn-generar .btn-text');
    const btnLoading = document.querySelector('#btn-generar .btn-loading');
    
    // Ocultar formulario y mostrar loading
    form.style.opacity = '0.5';
    form.style.pointerEvents = 'none';
    loadingContainer.classList.remove('hidden');
    
    // Cambiar estado del botón
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    
    // Iniciar animación de pasos
    animateLoadingSteps();
}

/**
 * Oculta el estado de carga
 */
function hideLoading() {
    const loadingContainer = document.getElementById('loading-state');
    const form = document.getElementById('landing-form');
    const btnText = document.querySelector('#btn-generar .btn-text');
    const btnLoading = document.querySelector('#btn-generar .btn-loading');
    
    form.style.opacity = '1';
    form.style.pointerEvents = 'auto';
    loadingContainer.classList.add('hidden');
    
    btnText.classList.remove('hidden');
    btnLoading.classList.add('hidden');
}

/**
 * Anima los pasos de carga
 */
function animateLoadingSteps() {
    const stepElement = document.getElementById('loading-step');
    const progressBar = document.getElementById('loading-progress-bar');
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
    
    // Guardar referencia para poder limpiar si hay error
    window.loadingInterval = interval;
}
