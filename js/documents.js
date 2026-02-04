document.addEventListener('DOMContentLoaded', function() {

    // --- 1. CONFIGURACIÓN: TOASTS (NOTIFICACIONES) ---
    function showToast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return; // Seguridad

        const toast = document.createElement('div');
        
        // Iconos según el tipo
        let iconHtml = '<i class="fa-solid fa-check"></i>';
        if(type === 'warning') iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
        if(type === 'danger') iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';

        // Clases CSS (Basadas en tu style-quote.css)
        toast.className = `alex-toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon-box">${iconHtml}</div>
            <div class="toast-content">
                <span class="toast-title">${type === 'warning' ? 'Insight' : 'Insight'}</span>
                <span class="toast-sub">${msg}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Animación de entrada
        requestAnimationFrame(() => toast.classList.add('show'));
        
        // Auto eliminar a los 4 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // --- 2. CONFIGURACIÓN: CALENDARIO (FLATPICKR) ---
    const dateInput = document.getElementById('user-dob');
    if (dateInput && typeof flatpickr !== 'undefined') {
        flatpickr(dateInput, {
            dateFormat: "m/d/Y",
            maxDate: "today", // No permite fechas futuras para nacimiento
            disableMobile: "true",
            theme: "material_blue",
            onChange: function(selectedDates, dateStr, instance) {
                // Al seleccionar, quitamos el error rojo si existía
                const wrapper = instance.element.closest('.input-rich-wrapper');
                if (wrapper) wrapper.classList.remove('input-error');
            }
        });
    }

    // --- 3. LÓGICA VISUAL DE ARCHIVOS (UPLOAD ZONES) ---
    // Maneja el cambio de color e icono cuando se sube un PDF/Imagen
    const fileInputs = ['file-agreement', 'file-annex'];

    fileInputs.forEach(id => {
        const input = document.getElementById(id);
        if(!input) return;

        input.addEventListener('change', function() {
            // Buscamos la zona padre (.file-drop-zone-premium)
            const zone = this.closest('.file-drop-zone-premium');
            const statusSpan = zone.querySelector('.file-status');
            const iconBox = zone.querySelector('.icon-upload-circle');
            
            // Limpiar error previo
            zone.classList.remove('input-error');

            if (this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                
                // Estilo de éxito visual
                zone.style.borderColor = '#10B981'; // Verde
                zone.style.backgroundColor = '#ECFDF5'; // Verde muy claro
                
                statusSpan.textContent = fileName; // Mostrar nombre
                statusSpan.style.color = '#10B981';
                statusSpan.style.fontWeight = '600';
                
                iconBox.innerHTML = '<i class="fa-solid fa-check"></i>';
                iconBox.style.background = '#10B981';
                iconBox.style.color = 'white';
            }
        });
    });

    // --- 4. VALIDACIÓN Y ENVÍO (SUBMIT) ---
    const form = document.getElementById('documents-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Evitar recarga standard

            let isValid = true;
            let firstErrorElement = null;

            // A) VALIDAR INPUTS DE TEXTO (Nombre, Apellido, Email, Tel, Fecha)
            const textInputs = form.querySelectorAll('.validate-req');
            
            textInputs.forEach(input => {
                const wrapper = input.closest('.input-rich-wrapper');
                
                // Limpiar estado anterior
                if(wrapper) wrapper.classList.remove('input-error');

                if (!input.value.trim()) {
                    isValid = false;
                    
                    // Aplicar clase de error (Shake y Borde Rojo)
                    if(wrapper) {
                        void wrapper.offsetWidth; // Truco para reiniciar la animación CSS
                        wrapper.classList.add('input-error');
                    }
                    
                    if (!firstErrorElement) firstErrorElement = input;
                }
            });

            // B) VALIDAR ARCHIVOS
            fileInputs.forEach(id => {
                const input = document.getElementById(id);
                const zone = document.getElementById(id.replace('file-', 'zone-')); // zone-agreement
                
                if (zone) zone.classList.remove('input-error');

                if (input && input.files.length === 0) {
                    isValid = false;
                    if (zone) {
                        void zone.offsetWidth;
                        zone.classList.add('input-error'); // Asume que tienes CSS para shake en esta clase también
                    }
                    if (!firstErrorElement) firstErrorElement = zone; // Enfocar la zona si falla
                }
            });

            // C) ACCIÓN SEGÚN RESULTADO
            if (!isValid) {
                // ❌ Faltan datos
                showToast("Please fill in all required fields and upload documents.", "warning");
                
                // Scroll suave al primer error
                if (firstErrorElement) {
                    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if(firstErrorElement.tagName === 'INPUT') firstErrorElement.focus({preventScroll:true});
                }
                
            } else {
                // ✅ Todo correcto: Proceder al envío
                await handleSubmission();
            }
        });
    }

    // --- 5. FUNCIÓN DE ENVÍO A SUPABASE (Simulada/Real) ---
    async function handleSubmission() {
        const btn = document.getElementById('submit-btn');
        const originalText = btn.innerHTML;
        
        // Estado de carga
        btn.disabled = true;
        btn.innerHTML = '<span>Uploading...</span> <div class="loader"></div>'; // Asegúrate de tener CSS para .loader o usa un icono fa-spin
        
        try {
            // AQUÍ IRÍA TU LÓGICA REAL DE SUPABASE
            // 1. Subir archivos a Storage
            // 2. Insertar registro en Base de Datos
            
            // Simulación de espera de red (2 segundos)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Si todo sale bien:
            showToast("Documents uploaded successfully!", "success");
            
            // Mostrar Modal de Éxito
            const modal = document.getElementById('success-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('visible'); // Asegúrate de tener estilos para esto
                modal.style.display = 'flex'; // Forzar display flex
            }

        } catch (error) {
            console.error(error);
            showToast("Error uploading documents. Please try again.", "danger");
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // --- 6. EVENTOS DE LIMPIEZA (UX) ---
    // Quita el borde rojo en cuanto el usuario escribe
    document.querySelectorAll('.validate-req').forEach(input => {
        input.addEventListener('input', function() {
            const wrapper = this.closest('.input-rich-wrapper');
            if (wrapper) wrapper.classList.remove('input-error');
        });
    });

    // Cerrar Modal
    const closeModalBtn = document.getElementById('modal-close-btn');
    const finishBtn = document.getElementById('btn-finish');
    const successModal = document.getElementById('success-modal');

    function hideModal() {
        if(successModal) successModal.style.display = 'none';
        window.location.href = "../index.html"; // Redirigir al home o donde quieras
    }

    if(closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if(finishBtn) finishBtn.addEventListener('click', hideModal);

});