document.addEventListener("DOMContentLoaded", () => {
    console.log("Alex AI Insurtech - JS Initialized");

    // 1. Funciones Globales UI
    initMobileMenu();
    initFloatingMegaMenu();
    initFAQAccordion();
    initFloatingChat();
    
    // 2. Lógica del Home (Video y Productos)
    if(document.getElementById('heroVideoElement')) {
        initQuoteTransition();
        initProductTriggers();
        initProductVideos();
        initProductTriggersHome();
        initProductTriggersRenters();

    }

    // 3. Lógica Step 1 (Formulario)
    if(document.getElementById('quoteFormStart')) {
        initQuoteFormLogic();
        initTableSelectors(); // Para el modal de Step 1
    }

    // 4. Lógica Step 3 (Comparador)
    // Se ejecuta si detecta elementos de esa página
    if(document.querySelector('.quote-result-card')) {
        initQuoteComparison();
        initMobileFilters();
    }
});

/* =========================================
   CORE FUNCTIONS
   ========================================= */

function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const siteHeader = document.querySelector('.site-header');
    if (!menuToggle || !siteHeader) return;

    menuToggle.addEventListener('click', () => {
        siteHeader.classList.toggle('nav-open');
        const icon = menuToggle.querySelector('i');
        if(siteHeader.classList.contains('nav-open')) {
            icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark');
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    });
}

function initFloatingMegaMenu() {
    const triggerBtn = document.querySelector('.js-toggle-mega-menu');
    const menuList = document.getElementById('megaMenu');
    if(!triggerBtn || !menuList) return;

    triggerBtn.addEventListener('click', () => {
        menuList.classList.toggle('is-open');
    });
    
    // Cerrar al clickear fuera
    document.addEventListener('click', (e) => {
        if (!triggerBtn.contains(e.target) && !menuList.contains(e.target)) {
            menuList.classList.remove('is-open');
        }
    });
}

function initFAQAccordion() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
        });
    });
}

function initFloatingChat() {
    const chatBubble = document.getElementById('chatGreeting');
    const chatTriggers = document.querySelectorAll('.js-trigger-chat');
    setTimeout(() => { if (chatBubble) chatBubble.classList.add('is-visible'); }, 2500);
    chatTriggers.forEach(btn => btn.addEventListener('click', () => alert('🤖 Alex AI Chat Opening...')));
}

/* =========================================
   HOME PAGE LOGIC
   ========================================= */
function initQuoteTransition() {
    const heroVideo = document.getElementById('heroVideoElement');
    const videoContainer = document.querySelector('.hero-video-organic');
    const triggerButtons = document.querySelectorAll('.js-trigger-quote');
    const overlay = document.getElementById('transition-overlay'); 
    const targetUrl = "quote/quote.html"; 

    if (!heroVideo || !overlay) return;

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            btn.innerHTML = "Starting...";
            btn.style.pointerEvents = "none"; 
            if (videoContainer) videoContainer.classList.add('is-playing');
            heroVideo.currentTime = 0; heroVideo.muted = true;

            const go = () => { overlay.classList.add('is-active'); setTimeout(() => window.location.href = targetUrl, 500); };
            heroVideo.addEventListener('ended', go, { once: true });
            heroVideo.play().catch(go); // Si falla autoplay, ir directo
        });
    });
}

function initProductVideos() { // Puedes mantener el nombre o cambiarlo a initHoverVideos
    // Seleccionamos TODOS los videos que tengan la clase js-hover-video
    document.querySelectorAll('.js-hover-video').forEach(video => {
        
        // El disparador (trigger) será la tarjeta o la caja contenedora (organic-box)
        // Si no encuentra ninguno, usa el propio video como disparador
        const trigger = video.closest('.product-card') || video.closest('.organic-box') || video;

        if (!trigger) return;

        trigger.addEventListener('mouseenter', () => {
            // Intentar reproducir (capturamos error por si el navegador bloquea)
            video.play().catch(() => {}); 
        });

        trigger.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0; // Reiniciar al principio
        });
    });
}

function initProductTriggers() {
    document.querySelectorAll('.js-product-trigger').forEach(btn => {
        btn.addEventListener('click', () => window.location.href = "./quote/quote.html");
    });
}

function initProductTriggersHome() {
    document.querySelectorAll('.js-product-trigger-home').forEach(btn => {
        btn.addEventListener('click', () => window.location.href = "./homeowners-quotation/index.html");
    });
}

function initProductTriggersRenters() {
    document.querySelectorAll('.js-product-trigger-renters').forEach(btn => {
        btn.addEventListener('click', () => window.location.href = "./renters-quotation/index.html");
    });
}

/* =========================================
   QUOTE STEP 1 LOGIC
   ========================================= */
function initQuoteFormLogic() {
    const quoteForm = document.getElementById('quoteFormStart');
    const modal = document.getElementById('quotesModal');
    const closeButtons = document.querySelectorAll('.js-close-modal');
    const startNewBtn = document.querySelector('.js-start-new');

    quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = quoteForm.querySelector('button');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
        setTimeout(() => {
            btn.innerHTML = original;
            if(modal) modal.classList.add('is-active');
        }, 1500);
    });

    closeButtons.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('is-active')));
    
    if (startNewBtn) {
        startNewBtn.addEventListener('click', () => {
            startNewBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
            setTimeout(() => { window.location.href = "quote-2.html"; }, 1000);
        });
    }
}

function initTableSelectors() {
    document.querySelectorAll('.btn-select').forEach(btn => {
        btn.addEventListener('click', () => alert('Loading existing quote...'));
    });
}

/* =========================================
   QUOTE STEP 3 LOGIC (Unified)
   ========================================= */
function initQuoteComparison() {
    // 1. Manejo de Selección de Tarjetas
    const selectBtns = document.querySelectorAll('.js-select-quote');
    const priceDisplay = document.getElementById('selected-price-display');
    const mobilePriceDisplay = document.getElementById('mobile-price-display'); // Nuevo elemento móvil

    selectBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.quote-result-card');
            const wasSelected = card.classList.contains('is-selected');

            // Reset visual
            document.querySelectorAll('.quote-result-card').forEach(c => {
                c.classList.remove('is-selected');
                const b = c.querySelector('.js-select-quote');
                if(b) { b.innerHTML = 'Select Plan'; b.classList.remove('selected-state'); b.className = 'btn-blue-sketch js-select-quote'; }
            });

            if (!wasSelected) {
                // Activar selección
                card.classList.add('is-selected');
                this.innerHTML = 'Selected';
                this.className = 'btn-green-sketch js-select-quote selected-state'; // Cambiar clase
                
                // Extraer precio y actualizar UI
                const priceText = card.querySelector('.price-group').innerText.replace('/mo','').replace('$','').trim();
                const formattedPrice = '$' + priceText.match(/\d+/)[0] + '/mo';
                
                if(priceDisplay) {
                    priceDisplay.innerHTML = formattedPrice;
                    priceDisplay.style.color = 'var(--alex-ink)';
                }
                if(mobilePriceDisplay) {
                    mobilePriceDisplay.innerHTML = formattedPrice;
                    mobilePriceDisplay.parentElement.classList.add('has-value');
                }
            } else {
                // Deseleccionar
                if(priceDisplay) {
                    priceDisplay.innerHTML = '--';
                    priceDisplay.style.color = '#94A3B8';
                }
                if(mobilePriceDisplay) {
                    mobilePriceDisplay.innerHTML = '--';
                    mobilePriceDisplay.parentElement.classList.remove('has-value');
                }
            }
        });
    });

    // 2. Modal de Comparación
    const compareBtn = document.querySelector('.js-open-compare');
    const compareModal = document.getElementById('compareModal');
    const closeCompareBtns = document.querySelectorAll('.js-close-compare');

    if (compareBtn && compareModal) {
        compareBtn.addEventListener('click', () => compareModal.classList.add('is-active'));
    }
    closeCompareBtns.forEach(btn => btn.addEventListener('click', () => compareModal.classList.remove('is-active')));

    // 3. Filtros (Basic vs Full)
    const modeInputs = document.querySelectorAll('.js-filter-mode');
    modeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            updateFilters(e.target.value);
        });
    });
}

function updateFilters(mode) {
    // Referencias a elementos
    const aspireTags = document.getElementById('tags-aspire');
    const aspirePrice = document.getElementById('price-aspire');
    
    // Inputs del sidebar (para sincronizar visualmente)
    const limitBi = document.getElementById('limit-bi');
    const dedComp = document.getElementById('ded-comp');
    
    if(mode === 'basic') {
        if(limitBi) limitBi.value = 'state';
        if(dedComp) dedComp.value = '0';
        if(aspirePrice) aspirePrice.innerHTML = '<div class="highlighter-mark"></div> <span class="currency">$</span>45<span class="mo">/mo</span>';
        if(aspireTags) aspireTags.innerHTML = '<span class="spec-tag warning"><i class="fa-solid fa-triangle-exclamation"></i> Liability Only</span><span class="spec-tag">State Mins</span>';
    } else {
        if(limitBi) limitBi.value = '100/300';
        if(dedComp) dedComp.value = '500';
        if(aspirePrice) aspirePrice.innerHTML = '<div class="highlighter-mark"></div> <span class="currency">$</span>79<span class="mo">/mo</span>';
        if(aspireTags) aspireTags.innerHTML = '<span class="spec-tag"><i class="fa-solid fa-shield-halved"></i> Full Coverage</span><span class="spec-tag"><i class="fa-solid fa-wrench"></i> Low Ded ($500)</span>';
    }
}

function initMobileFilters() {
    const filterBtn = document.querySelector('.js-toggle-filters');
    const closeFilterBtn = document.querySelector('.js-close-filters');
    const filterPanel = document.getElementById('mobileFiltersPanel');
    const applyBtn = document.querySelector('.js-apply-filters');

    if (!filterBtn || !filterPanel) return;

    filterBtn.addEventListener('click', () => {
        filterPanel.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    });

    const closeFunc = () => {
        filterPanel.classList.remove('is-visible');
        document.body.style.overflow = '';
    };

    if(closeFilterBtn) closeFilterBtn.addEventListener('click', closeFunc);
    
    if(applyBtn) {
        applyBtn.addEventListener('click', () => {
            const original = applyBtn.innerHTML;
            applyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Applied!';
            setTimeout(() => {
                applyBtn.innerHTML = original;
                closeFunc();
            }, 500);
        });
    }
}

/* --- LÓGICA DEL COTIZADOR DE HOGAR --- */
function initHomeQuoteWizard() {
    let currentStep = 0;
    const steps = document.querySelectorAll('.form-tab-panel');
    const sidebarItems = document.querySelectorAll('#sidebarList li');
    const totalSteps = steps.length;
    
    // Botones
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progress = document.getElementById('visualProgressBar');
    const stepNumDisplay = document.getElementById('stepNumber');

    // Función para validar campos requeridos antes de avanzar
    function validateStep(index) {
        const currentPanel = steps[index];
        const requiredInputs = currentPanel.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value || input.value.trim() === '') {
                isValid = false;
                input.style.borderColor = 'red';
                // Pequeña animación de error
                input.classList.add('shake-anim');
                setTimeout(() => input.classList.remove('shake-anim'), 500);
            } else {
                input.style.borderColor = '#E2E8F0';
            }
        });
        return isValid;
    }

    // Función para actualizar qué paso se ve
    function updateUI() {
        // 1. Mostrar/Ocultar Pasos
        steps.forEach((s, i) => {
            if (i === currentStep) {
                s.classList.add('active'); // CSS se encarga de mostrarlo
                window.scrollTo(0, 0); // Subir al inicio
            } else {
                s.classList.remove('active');
            }
        });

        // 2. Actualizar Sidebar
        if(sidebarItems.length) {
            sidebarItems.forEach((li, i) => {
                li.classList.remove('active', 'done');
                // Limpiamos iconos previos
                let text = li.innerText.replace('✓', '').trim(); 
                
                if (i < currentStep) {
                    li.classList.add('done');
                    // Icono de Check si ya pasó
                    if(!li.innerHTML.includes('fa-check')) li.innerHTML = '<i class="fa-solid fa-check"></i> ' + text;
                } else if (i === currentStep) {
                    li.classList.add('active');
                }
            });
        }

        // 3. Botones (Mostrar/Ocultar)
        if(btnPrev) btnPrev.style.display = currentStep === 0 ? 'none' : 'inline-flex';
        
        if (currentStep === totalSteps - 1) {
            if(btnNext) btnNext.style.display = 'none';
            if(btnSubmit) btnSubmit.style.display = 'inline-flex';
        } else {
            if(btnNext) btnNext.style.display = 'inline-flex';
            if(btnSubmit) btnSubmit.style.display = 'none';
        }

        // 4. Barra de Progreso
        if(progress) progress.style.width = ((currentStep + 1) / totalSteps) * 100 + '%';
        if(stepNumDisplay) stepNumDisplay.innerText = currentStep + 1;
    }

    // Listeners de Botones
    if(btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            if(validateStep(currentStep)) {
                currentStep++;
                updateUI();
            } else {
                // Opcional: alert("Please fill required fields");
            }
        });
    }

    if(btnPrev) {
        btnPrev.addEventListener('click', (e) => {
            e.preventDefault();
            if(currentStep > 0) {
                currentStep--;
                updateUI();
            }
        });
    }

    // Inicializar UI
    updateUI();

    // --- 6. INICIALIZAR CALENDARIOS BONITOS (FLATPICKR) ---
    // Esto convierte los inputs .date-picker en calendarios reales
    flatpickr(".date-picker", {
        dateFormat: "m/d/Y",  // Formato Mes/Día/Año
        altInput: true,       // Muestra un input alternativo bonito
        altFormat: "F j, Y",  // Lo que ve el usuario: "September 29, 2025"
        disableMobile: "true" // Fuerza el diseño bonito incluso en móviles
    });

    // --- 7. MANEJO DEL MODAL DE ÉXITO (Sin mensaje feo) ---
    const form = document.getElementById('home-quote-form');
    const modal = document.getElementById('successModal'); // Asegúrate de tener el HTML del modal pegado
    const closeModalBtn = document.getElementById('closeModalBtn');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Detiene recarga y alertas nativas
            
            // Mostrar Modal Bonito
            if(modal) {
                modal.classList.add('is-open');
            } else {
                console.error("Falta el HTML del modal en tu archivo");
            }
        });
    }

    if(closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('is-open');
            // Redirigir al home
            window.location.href = "../../index.html"; 
        });
    }
}

// AUTO-INICIAR SI ESTAMOS EN LA PÁGINA CORRECTA
document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById('home-quote-form')) {
        initHomeQuoteWizard();
    }

/* --- LÓGICA ESPECÍFICA COTIZADOR HOGAR --- */

// Lógica de Historial de Pérdidas (1 a 5)
const lossSelect = document.getElementById('num-losses');
const lossContainer = document.getElementById('dynamic-loss-container');

if(lossSelect && lossContainer) {
    lossSelect.addEventListener('change', (e) => {
        const count = parseInt(e.target.value);
        lossContainer.innerHTML = ''; // Limpiar contenedor

        if (count > 0) {
            for(let i = 1; i <= count; i++) {
                // Crear HTML del mini-formulario
                const html = `
                    <div class="loss-entry-card">
                        <div class="loss-title"><i class="fa-solid fa-triangle-exclamation"></i> Loss Incident #${i}</div>
                        <div class="form-row-2">
                            <div class="alex-input-group flex-grow">
                                <label>Date of Loss <span class="req">*</span></label>
                                <input type="text" class="alex-input-modern date-picker" placeholder="MM/DD/YYYY" required>
                            </div>
                            <div class="alex-input-group flex-grow">
                                <label>Type of Loss <span class="req">*</span></label>
                                <input type="text" class="alex-input-modern" placeholder="e.g. Fire, Theft" required>
                            </div>
                        </div>
                        <div class="form-row-2">
                            <div class="alex-input-group flex-grow">
                                <label>Details <span class="req">*</span></label>
                                <input type="text" class="alex-input-modern" placeholder="Description" required>
                            </div>
                            <div class="alex-input-group flex-grow">
                                <label>Amount Paid <span class="req">*</span></label>
                                <input type="number" class="alex-input-modern" placeholder="$0.00" required>
                            </div>
                        </div>
                    </div>
                `;
                lossContainer.insertAdjacentHTML('beforeend', html);
            }
        }
    });
}

// Lógica Toggle Segundo Asegurado
const toggle2nd = document.getElementById('toggleSecondInsured');
const secSection = document.getElementById('secondInsuredSection');

if(toggle2nd && secSection) {
    toggle2nd.addEventListener('change', (e) => {
        if(e.target.checked) {
            secSection.style.display = 'block';
            // Volver obligatorios los campos al mostrarse (opcional pero recomendado)
            secSection.querySelectorAll('input').forEach(i => i.setAttribute('required', 'true'));
        } else {
            secSection.style.display = 'none';
            // Quitar obligatoriedad al ocultarse
            secSection.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
        }
    });
}

});

/* --- LÓGICA DE UI (MODAL & UPLOAD) --- */

// 1. Manejo del Input de Archivo (Cambiar texto al subir)
const fileInput = document.getElementById('declarationPageInput');
const fileText = document.getElementById('uploadText');

if(fileInput && fileText) {
    fileInput.addEventListener('change', function(e) {
        if(this.files && this.files.length > 0) {
            // Cambiar texto al nombre del archivo
            fileText.innerHTML = `<i class="fa-solid fa-check" style="color:#10B981"></i> ${this.files[0].name}`;
            fileText.style.color = '#10B981';
        }
    });
}

// 2. Manejo del Modal de Éxito
const modal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const form = document.getElementById('home-quote-form'); // Asegúrate que tu form tenga este ID

// Función para abrir modal
function showSuccessModal() {
    if(modal) {
        modal.classList.add('is-open');
        // Efecto confetti o sonido opcional aquí
    }
}

// Función para cerrar modal
if(closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('is-open');
        // Redirigir al home o resetear form
        window.location.href = "../../index.html"; 
    });
}

// Interceptar el envío del formulario para mostrar el modal
if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita recarga real
        showSuccessModal();
    });
}

// Función específica para Renters Insurance - Property Tab
function toggleRentersFields() {
    const residenceSelect = document.getElementById('residence-type');
    const complexGroup = document.getElementById('group-complex-name');
    const condoAptGroup = document.getElementById('group-condo-apt-details');
    
    // Inputs internos para manejar atributos 'required' si fuera necesario
    const complexInput = document.getElementById('complex-name');
    const gatedInput = document.getElementById('gated-community');
    const unitsInput = document.getElementById('num-units');

    const type = residenceSelect.value;

    // 1. Resetear visibilidad (Ocultar todo primero)
    complexGroup.classList.add('hidden');
    condoAptGroup.classList.add('hidden');

    // 2. Lógica condicional
    if (type === 'Apartment') {
        // Mostrar todo
        complexGroup.classList.remove('hidden');
        condoAptGroup.classList.remove('hidden');
        
        // Hacer requeridos si es necesario (opcional)
        // complexInput.setAttribute('required', 'true');
        // unitsInput.setAttribute('required', 'true');

    } else if (type === 'Condo') {
        // Mostrar solo Gated y Units
        condoAptGroup.classList.remove('hidden');
        
        // complexInput.removeAttribute('required'); // Asegurar que Complex no sea required
        // unitsInput.setAttribute('required', 'true');
    } else {
        // Limpiar valores si se ocultan para no enviar basura (opcional)
        complexInput.value = '';
        gatedInput.value = 'No';
        unitsInput.value = '';
        
        // Quitar required
        // complexInput.removeAttribute('required');
        // unitsInput.removeAttribute('required');
    }
}

// Inicializar al cargar la página por si el navegador guardó la selección
document.addEventListener('DOMContentLoaded', function() {
    const residenceSelect = document.getElementById('residence-type');
    if(residenceSelect) {
        toggleRentersFields(); // Ejecutar lógica inicial
    }
});