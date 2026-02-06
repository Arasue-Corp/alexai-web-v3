

// FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Cerrar otros items abiertos (Opcional, si quieres solo uno abierto a la vez)
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle del item actual
            item.classList.toggle('active');
        });
    });

// BLOG

document.addEventListener('DOMContentLoaded', function() {
        const itemsPerPage = 6;
        const blogContainer = document.getElementById('blog-grid');
        const paginationContainer = document.getElementById('pagination-controls');
        const filterButtons = document.querySelectorAll('.filter-pill');
        
        if (!blogContainer || !paginationContainer) return;

        const allCards = Array.from(blogContainer.getElementsByClassName('item-page'));
        
        let currentFilter = 'all';
        let currentPage = 1;
        let filteredCards = [];

        function applyFilter(filter) {
            currentFilter = filter;
            currentPage = 1;

            filterButtons.forEach(btn => {
                if(btn.dataset.filter === filter) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            if (filter === 'all') {
                filteredCards = allCards;
            } else {
                filteredCards = allCards.filter(card => card.dataset.category === filter);
            }
            renderPage();
        }

        function renderPage() {
            const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;
            if (totalPages === 0) currentPage = 1;

            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            allCards.forEach(card => card.style.display = 'none');

            if(filteredCards.length > 0) {
                filteredCards.slice(start, end).forEach(card => {
                    card.style.display = 'flex';
                    // Animación suave
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                });
            }
            updatePaginationButtons(totalPages);
        }

        function updatePaginationButtons(totalPages) {
            paginationContainer.innerHTML = '';
            if (totalPages <= 1) return;

            const prevBtn = document.createElement('a');
            prevBtn.href = '#';
            prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            prevBtn.className = `page-dot ${currentPage === 1 ? 'disabled' : ''}`;
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage > 1) { currentPage--; renderPage(); window.scrollTo(0,0); }
            });
            paginationContainer.appendChild(prevBtn);

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('a');
                btn.href = '#';
                btn.textContent = i;
                btn.className = `page-dot ${i === currentPage ? 'active' : ''}`;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i;
                    renderPage();
                    window.scrollTo(0,0);
                });
                paginationContainer.appendChild(btn);
            }

            const nextBtn = document.createElement('a');
            nextBtn.href = '#';
            nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            nextBtn.className = `page-dot ${currentPage === totalPages ? 'disabled' : ''}`;
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage < totalPages) { currentPage++; renderPage(); window.scrollTo(0,0); }
            });
            paginationContainer.appendChild(nextBtn);
        }

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                applyFilter(btn.dataset.filter);
            });
        });

        applyFilter('all');
    });

    /* =========================================
   HOMEOWNER QUOTE WIZARD LOGIC
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    console.log("🌟 ALEX AI WIZARD - PREMIUM V5 (Holographic Edition)");

    // ==========================================
    // 1. CONFIGURACIÓN GLOBAL
    // ==========================================
    let currentStep = 0;
    const steps = document.querySelectorAll('.form-tab-panel');
    const totalSteps = steps.length;
    
    // UI Elements
    const progress = document.getElementById('visualProgressBar');
    const stepNumDisplay = document.getElementById('stepNumberDisplay');
    const stepTitle = document.getElementById('stepTitle');
    const stepDesc = document.getElementById('stepDesc');
    const sidebarItems = document.querySelectorAll('#sidebarList li');

    const meta = [
        { title: "Your Home Protection Plan", desc: "Let's start with the primary homeowner details." },
        { title: "Property Location", desc: "Where is the home you want to insure?" },
        { title: "Property Specs", desc: "Tell us about the structure and build." },
        { title: "Protection & Safety", desc: "Does the home have protective devices?" },
        { title: "Loss History", desc: "Report any losses in the past 5 years." },
        { title: "Current Coverage", desc: "Details about your existing coverage (Optional)." },
        { title: "Valuables", desc: "Select items to add specific coverage (Optional)." }
    ];

    // ==========================================
    // 2. UTILIDADES
    // ==========================================
    function initCalendars(scope = document) {
        if (typeof flatpickr !== 'undefined') {
            const inputs = scope.querySelectorAll(".date-picker");
            if(inputs.length > 0) {
                flatpickr(inputs, {
                    dateFormat: "m/d/Y", allowInput: true, disableMobile: "true",
                    onChange: function(selectedDates, dateStr, instance) {
                        const wrapper = instance.element.closest('.input-rich-wrapper');
                        if(wrapper) cleanErrorVisuals(wrapper);
                    }
                });
            }
        }
    }
    initCalendars();

    function recreateButton(id) {
        const oldBtn = document.getElementById(id);
        if (oldBtn) {
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            return newBtn;
        }
        return null;
    }

    const btnNext = recreateButton('btn-next');
    const btnPrev = recreateButton('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');

    // ==========================================
    // 3. LOGICA GRID VALUABLES (ACORDEON)
    // ==========================================
    window.toggleValuableCard = function(card) {
        // Toggle clase activa
        card.classList.toggle('active');
        
        // Manejo del icono
        const icon = card.querySelector('.svc-check i');
        if(card.classList.contains('active')) {
            // Focus al primer input si se abre
            setTimeout(() => {
                const input = card.querySelector('input');
                if(input) input.focus();
            }, 200);
        }
    };

    // ==========================================
    // 4. VALIDACIÓN
    // ==========================================
    function cleanErrorVisuals(wrapper) {
        if(wrapper) {
            wrapper.classList.remove('input-error', 'shake-anim');
            wrapper.style.borderColor = ""; wrapper.style.backgroundColor = "";
        }
    }

    function validateContainer(container) {
        if (!container) return true;
        const inputs = container.querySelectorAll('.validate-req, input[required], select[required]');
        let isValid = true;
        let firstError = null;

        inputs.forEach(input => {
            if (input.disabled) return;
            // Ignorar inputs ocultos (dentro de acordeones cerrados)
            if(input.closest('.smart-val-card') && !input.closest('.smart-val-card').classList.contains('active')) return;

            if ((input.type === 'checkbox' || input.type === 'radio') && !input.classList.contains('validate-req')) return;

            const val = input.value.trim();
            const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
            cleanErrorVisuals(wrapper);

            if (!val) {
                isValid = false;
                if(wrapper) {
                    void wrapper.offsetWidth;
                    wrapper.classList.add('input-error', 'shake-anim');
                    wrapper.style.borderColor = "#EF4444"; wrapper.style.backgroundColor = "#FEF2F2";
                    setTimeout(() => wrapper.classList.remove('shake-anim'), 500);
                }
                if (!firstError) firstError = input;
                const clear = () => cleanErrorVisuals(wrapper);
                input.addEventListener('input', clear, {once: true});
                input.addEventListener('change', clear, {once: true});
            }
        });

        if (!isValid) {
            if (typeof window.showToast === 'function') window.showToast("Please fill in all required fields.", "warning");
            else alert("Please fill in all required fields.");
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if(!firstError.classList.contains('date-picker')) firstError.focus({preventScroll: true});
            }
        }
        return isValid;
    }


    // ==========================================
    // 7. CAMPOS DINÁMICOS (LOSSES)
    // ==========================================
    const lossSelect = document.getElementById('num-losses');
    const lossContainer = document.getElementById('dynamic-loss-container');
    if (lossSelect && lossContainer) {
        lossSelect.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            lossContainer.innerHTML = ''; 
            if (count > 0) {
                for (let i = 1; i <= count; i++) {
                    const html = `
                        <div class="premium-group compact-group anim-entry" style="margin-top:20px; border-left:4px solid #F59E0B; background:#FFFBEB; padding:20px; border-radius:12px;">
                            <div style="font-weight:800; color:#B45309; margin-bottom:15px; font-size:0.85rem; text-transform:uppercase;">
                                <i class="fa-solid fa-triangle-exclamation"></i> LOSS INCIDENT #${i}
                            </div>
                            <div class="grid-2-tight mb-3">
                                <div class="inp-rich-group"><label class="lbl-premium">Date</label><div class="input-rich-wrapper compact-premium theme-warning" style="background:white;"><div class="icon-slot"><i class="fa-regular fa-calendar"></i></div><input type="text" class="rich-input date-picker validate-req" placeholder="MM/DD/YYYY"></div></div>
                                <div class="inp-rich-group"><label class="lbl-premium">Type</label><div class="input-rich-wrapper compact-premium theme-warning" style="background:white;"><div class="icon-slot"><i class="fa-solid fa-fire"></i></div><select class="rich-input validate-req premium-select"><option value="" disabled selected>Select...</option><option>Fire</option><option>Water</option><option>Theft</option><option>Other</option></select></div></div>
                            </div>
                            <div class="inp-rich-group mb-3"><label class="lbl-premium">Details</label><div class="input-rich-wrapper theme-warning" style="background:white; height:auto; padding-top:10px;"><div class="icon-slot" style="height:30px;"><i class="fa-solid fa-align-left"></i></div><textarea class="rich-input validate-req" rows="2" placeholder="Details..." style="resize:none; height:60px; padding-top:0;"></textarea></div></div>
                            <div class="inp-rich-group"><label class="lbl-premium">Amount ($)</label><div class="input-rich-wrapper compact-premium theme-warning" style="background:white;"><div class="icon-slot"><i class="fa-solid fa-dollar-sign"></i></div><input type="number" class="rich-input validate-req" placeholder="0.00"></div></div>
                        </div>`;
                    lossContainer.insertAdjacentHTML('beforeend', html);
                }
                initCalendars(lossContainer);
                initPremiumSelects();
            }
        });
    }

    // ==========================================
    // 8. SUBMIT MODAL (HOLOGRAPHIC)
    // ==========================================
    const modal = document.getElementById('quote-processing-modal');
    const modalCard = document.getElementById('modal-card');

    if (btnSubmit) {
        btnSubmit.onclick = (e) => {
            e.preventDefault();
            if(validateContainer(steps[currentStep])) {
                if(modal) {
                    modal.style.display = 'flex';
                    setTimeout(() => {
                        modalCard.style.opacity = '1';
                        modalCard.style.transform = 'scale(1)';
                    }, 50);
                    // No hacemos submit real para que veas el modal
                }
            }
        };
    }

    // ==========================================
    // 9. EXTRAS
    // ==========================================
    const toggle = document.getElementById('toggleSecondInsured');
    const secSection = document.getElementById('secondInsuredSection');
    if (toggle && secSection) {
        toggle.addEventListener('change', (e) => {
            const inputs = secSection.querySelectorAll('input, select');
            if (e.target.checked) {
                secSection.style.display = 'block';
                setTimeout(() => secSection.style.opacity = '1', 10);
                inputs.forEach(i => i.classList.add('validate-req'));
            } else {
                secSection.style.opacity = '0';
                setTimeout(() => secSection.style.display = 'none', 300);
                inputs.forEach(i => {
                    i.classList.remove('validate-req');
                    i.value = '';
                    cleanErrorVisuals(i.closest('.input-rich-wrapper'));
                });
            }
        });
    }

    const fileInput = document.getElementById('declarationPageInput');
    const uploadText = document.getElementById('uploadText');
    const zone = document.getElementById('dec-upload-zone');
    if (fileInput && uploadText && zone) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                uploadText.innerHTML = `<span style="color:#10B981"><i class="fa-solid fa-check-circle"></i> ${this.files[0].name}</span>`;
                zone.style.borderColor = '#10B981'; zone.style.backgroundColor = '#ECFDF5';
            }
        });
    }
});





// ==========================================
// CONTROLADOR DE MODALES HOLOGRÁFICOS
// ==========================================

// Función para ABRIR cualquier modal por su ID
window.openHoloModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // 1. Mostrar Overlay
    modal.style.display = 'flex';
    
    // 2. Buscar la tarjeta interna para animarla
    const card = modal.querySelector('.holo-card');
    
    // Reset inicial para la animación
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';

    // 3. Trigger de animación (pequeño delay para que CSS lo detecte)
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    }, 50);
};

// Función para CERRAR
window.closeHoloModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const card = modal.querySelector('.holo-card');

    // 1. Animación de salida
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';

    // 2. Ocultar el overlay después de la animación (300ms aprox)
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

// Opcional: Cerrar al hacer clic fuera de la tarjeta
document.querySelectorAll('.holo-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeHoloModal(overlay.id);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    
    let currentStep = 0;
    const steps = document.querySelectorAll('.form-step');
    const totalSteps = steps.length;
    
    // Elementos UI
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    const progressBar = document.getElementById('progressBar');
    const stepNumText = document.getElementById('stepNum');
    const sidebarItems = document.querySelectorAll('#sidebarList li');

    // Toggle Mailing Address
    const sameAddrCheck = document.getElementById('sameAddress');
    const mailingSection = document.getElementById('mailingFields');
    if(sameAddrCheck) {
        sameAddrCheck.addEventListener('change', function() {
            mailingSection.style.display = this.checked ? 'none' : 'block';
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    console.log("Alex AI Insurtech - JS Initialized");

    // 1. Funciones Globales UI
    toggleMobileMenu();
    initFloatingMegaMenu();
    initFAQAccordion();
    
    // 2. Lógica del Home (Video y Productos)
    if(document.querySelector('.js-hover-video')) {
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


// --- LÓGICA DEL CURSOR AI ---
const cursor = document.getElementById('customCursor');
const cursorDot = document.getElementById('cursorDot');

if (cursor && cursorDot && window.innerWidth > 991) {
    document.addEventListener('mousemove', (e) => {
        // El punto va instantáneo
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        
        // El círculo grande tiene "lag" (animación CSS o JS simple)
        cursor.animate({
            left: e.clientX + 'px',
            top: e.clientY + 'px'
        }, { duration: 500, fill: "forwards" });
    });

    // Detectar hovers para agrandar el cursor
    const hoverables = document.querySelectorAll('a, button, input, textarea, select, .hover-target');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

/* --- JS MENÚ PREMIUM SEGURO --- */
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    
    // Si por alguna razón no existe, salimos
    if (!menu) return;

    // Toggleamos la clase
    const isOpen = menu.classList.toggle('is-open');

    // Manejo del scroll
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// ASEGURAR QUE EMPIECE CERRADO AL CARGAR (Safety Check)
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById('mobileMenu');
    if (menu && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open'); // Lo forzamos a cerrar al cargar
        document.body.style.overflow = '';
    }
});

       // =========================================
    // LOGICA DE BOTONES FLOTANTES (NUEVO)
    // =========================================

function initFloatingMegaMenu() {

    
    // --- 1. CHAT LOGIC ---
    const chatBtn = document.querySelector('.js-trigger-chat');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.querySelector('.js-close-chat');

    if(chatBtn && chatWindow) {
        chatBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatWindow.classList.add('active');
            chatBtn.classList.add('open-state'); // Ocultar botón
            
            // Cerrar menú si está abierto
            closeMenu();
        });

        chatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeChat();
        });
    }

    function closeChat() {
        if(chatWindow) chatWindow.classList.remove('active');
        if(chatBtn) chatBtn.classList.remove('open-state');
    }

// --- 2. MEGA MENU LOGIC (CORREGIDO & FLEXIBLE) ---
    const menuBtn = document.querySelector('.js-toggle-mega-menu');
    const menuList = document.getElementById('megaMenu');
    let originalIconClass = ''; // Variable para guardar tu icono (Brújula, Grid, etc.)

    if(menuBtn && menuList) {
        // 1. Guardamos la clase exacta de tu icono al cargar la página
        const iconElement = menuBtn.querySelector('i');
        if(iconElement) originalIconClass = iconElement.className;

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menuList.classList.contains('is-open');
            
            if(isOpen) {
                closeMenu();
            } else {
                menuList.classList.add('is-open');
                menuBtn.classList.add('active');
                
                // Cambiar icono a "X" (Cerrar)
                if(iconElement) iconElement.className = 'fa-solid fa-xmark';

                // Cerrar chat si está abierto
                if(typeof closeChat === 'function') closeChat();
            }
        });

        // Hacemos la función accesible para el listener global de clicks
        window.closeMenu = function() {
            if(menuList) menuList.classList.remove('is-open');
            if(menuBtn) {
                menuBtn.classList.remove('active');
                // RESTAURAR EL ICONO ORIGINAL EXACTO
                if(iconElement && originalIconClass) {
                    iconElement.className = originalIconClass;
                }
            }
        };
    }

    // --- 3. CERRAR AL CLICKEAR FUERA ---
    document.addEventListener('click', (e) => {
        // Si existe la función closeChat (del bloque anterior) y el clic fue fuera...
        if(typeof chatWindow !== 'undefined' && chatWindow && !chatWindow.contains(e.target) && !chatBtn.contains(e.target)) {
            if(typeof closeChat === 'function') closeChat();
        }
        
        // Cierre del menú
        if(menuList && !menuList.contains(e.target) && !menuBtn.contains(e.target)) {
            if(typeof window.closeMenu === 'function') window.closeMenu();
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

// ==========================================
// 3. REPEATERS LOGIC (Fixed & Premium Style)
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ RENTERS SCRIPT: UI Premium + Lógica Blindada");

    // --- CONFIG ---
    const steps = document.querySelectorAll('.form-tab-panel');
    const totalSteps = steps.length;
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progressBar = document.getElementById('visualProgressBar');
    const stepNumber = document.getElementById('step-number');
    const sidebarList = document.getElementById('sidebarList');
    let currentStep = 0;

    // --- VALIDATION (Lógica Oculta) ---
    function validateCurrentStep() {
        let isValid = true;
        const currentPanel = steps[currentStep];
        const inputs = currentPanel.querySelectorAll('.validate-req');
        
        // Wrappers dinámicos
        const wComplex = document.getElementById('wrapper-complex');
        const wGated = document.getElementById('wrapper-gated-units');
        const wMailing = document.getElementById('mailing-address-wrapper');

        inputs.forEach(input => {
            const wrapper = input.closest('.input-rich-wrapper') || input;
            wrapper.classList.remove('error-border');

            // Lógica: ¿Es visible este input?
            let visible = true;
            if(wComplex && wComplex.contains(input) && wComplex.style.display === 'none') visible = false;
            if(wGated && wGated.contains(input) && wGated.style.display === 'none') visible = false;
            if(wMailing && wMailing.contains(input) && wMailing.style.display === 'none') visible = false;

            if(visible) {
                if(!input.value.trim() || input.value === "Select..." || input.value === "Select Type") {
                    isValid = false;
                    wrapper.classList.add('error-border');
                    // Shake anim
                    wrapper.style.animation = 'none';
                    wrapper.offsetHeight; 
                    wrapper.style.animation = 'shake 0.3s';
                }
            }
        });
        return isValid;
    }

    // --- NAVIGATION ---
    function showStep(n) {
        steps.forEach(step => { step.classList.remove('active'); step.style.display='none'; });
        steps[n].classList.add('active'); steps[n].style.display='block';

        // Buttons
        if(btnPrev) btnPrev.style.display = (n===0) ? 'none' : 'inline-flex';
        
        if(btnNext && btnSubmit) {
            if(n === totalSteps -1) { btnNext.style.display='none'; btnSubmit.style.display='inline-flex'; }
            else { btnNext.style.display='inline-flex'; btnSubmit.style.display='none'; }
        }

        // Progress
        if(progressBar) progressBar.style.width = `${((n+1)/totalSteps)*100}%`;
        if(stepNumber) stepNumber.innerText = n+1;
        
        // Sidebar
        if(sidebarList) {
            const items = sidebarList.querySelectorAll('li');
            items.forEach((item, i) => {
                item.className = '';
                if(i === n) item.classList.add('active');
                else if(i < n) item.classList.add('completed');
            });
        }
        window.scrollTo({top:0, behavior:'smooth'});
    }
    if(steps.length>0) showStep(currentStep);

    // --- BUTTONS (Clonando para limpiar listeners viejos) ---
    if(btnNext) {
        const newBtn = btnNext.cloneNode(true);
        btnNext.parentNode.replaceChild(newBtn, btnNext);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(validateCurrentStep()) { currentStep++; showStep(currentStep); }
        });
    }
    if(btnPrev) {
        const newBtn = btnPrev.cloneNode(true);
        btnPrev.parentNode.replaceChild(newBtn, btnPrev);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(currentStep > 0) { currentStep--; showStep(currentStep); }
        });
    }
    if(btnSubmit) {
        const newBtn = btnSubmit.cloneNode(true);
        btnSubmit.parentNode.replaceChild(newBtn, btnSubmit);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(!validateCurrentStep()) return;
            
            // Success Modal
            const modal = document.getElementById('bindSuccessModal');
            newBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            setTimeout(() => {
                if(modal) { modal.style.display='flex'; setTimeout(()=>modal.classList.add('active'),10); }
            }, 1500);
        });
    }

    // --- RENTERS VISIBILITY ---
    const resSelect = document.getElementById('residence-type');
    function toggleRenters() {
        if(!resSelect) return;
        const wComplex = document.getElementById('wrapper-complex');
        const wGated = document.getElementById('wrapper-gated-units');
        const type = resSelect.value;
        
        if(wComplex) wComplex.style.display = 'none';
        if(wGated) wGated.style.display = 'none';

        if(type === 'Apartment') {
            if(wComplex) wComplex.style.display = 'block';
            if(wGated) wGated.style.display = 'grid';
        } else if(type === 'Condo') {
            if(wGated) wGated.style.display = 'grid';
        }
    }
    if(resSelect) { resSelect.addEventListener('change', toggleRenters); toggleRenters(); }

    // --- MAILING ---
    const mailToggle = document.getElementById('same-as-property');
    const mailWrap = document.getElementById('mailing-address-wrapper');
    if(mailToggle && mailWrap) {
        mailToggle.addEventListener('change', () => {
            mailWrap.style.display = mailToggle.checked ? 'none' : 'block';
        });
        // Init state
        mailWrap.style.display = mailToggle.checked ? 'none' : 'block';
    }

    // --- FLATPICKR ---
    function initDates(target=".date-picker") { if(typeof flatpickr !== 'undefined') flatpickr(target, {dateFormat:"m/d/Y"}); }
    initDates();

    // --- REPEATERS ---
    const btnAddInsured = document.getElementById('btn-add-insured');
    const listInsured = document.getElementById('additional-insured-list');
    if(btnAddInsured) {
        const newBtn = btnAddInsured.cloneNode(true);
        btnAddInsured.parentNode.replaceChild(newBtn, btnAddInsured);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = Date.now();
            listInsured.insertAdjacentHTML('beforeend', `<div class="premium-group compact-group mb-3 anim-entry" id="row-${id}" style="border:1px solid #E2E8F0; padding:20px; border-radius:12px; position:relative;"><button type="button" onclick="removeRow('row-${id}')" style="position:absolute; top:10px; right:10px; border:none; background:#FEF2F2; color:#EF4444; width:30px; height:30px; border-radius:50%; cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button><h6 style="color:#3B82F6; font-size:0.8rem; margin-bottom:10px; font-weight:700;">INSURED</h6><div class="grid-3-tight mb-3"><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-user"></i></div><input class="rich-input validate-req" placeholder="First Name"></div><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-user-tag"></i></div><input class="rich-input" placeholder="Middle"></div><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-signature"></i></div><input class="rich-input validate-req" placeholder="Last Name"></div></div><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-cake-candles"></i></div><input class="rich-input new-date-picker validate-req" placeholder="DOB"></div></div>`);
            initDates(`#row-${id} .new-date-picker`);
        });
    }

    const btnAddInterest = document.getElementById('btn-add-interest');
    const listInterest = document.getElementById('additional-interest-list');
    if(btnAddInterest) {
        const newBtn = btnAddInterest.cloneNode(true);
        btnAddInterest.parentNode.replaceChild(newBtn, btnAddInterest);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = Date.now();
            listInterest.insertAdjacentHTML('beforeend', `<div class="premium-group compact-group mb-3 anim-entry" id="row-${id}" style="border:1px solid #E2E8F0; padding:20px; border-radius:12px; position:relative;"><button type="button" onclick="removeRow('row-${id}')" style="position:absolute; top:10px; right:10px; border:none; background:#FEF2F2; color:#EF4444; width:30px; height:30px; border-radius:50%; cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button><h6 style="color:#0D9488; font-size:0.8rem; margin-bottom:10px; font-weight:700;">INTEREST</h6><div class="input-rich-wrapper compact-premium theme-teal mb-3"><div class="icon-slot"><i class="fa-regular fa-building"></i></div><input class="rich-input validate-req" placeholder="Name"></div><div class="input-rich-wrapper compact-premium theme-teal mb-3"><div class="icon-slot"><i class="fa-solid fa-map-pin"></i></div><input class="rich-input validate-req" placeholder="Address"></div><div class="grid-3-tight"><div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-city"></i></div><input class="rich-input validate-req" placeholder="City"></div><div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-flag-usa"></i></div><input class="rich-input validate-req" placeholder="State"></div><div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-hashtag"></i></div><input class="rich-input validate-req" placeholder="Zip"></div></div></div>`);
        });
    }

    document.getElementById('btnGoHome')?.addEventListener('click', () => window.location.href="https://alexai.cloud");
});

window.removeRow = function(id) { const el = document.getElementById(id); if(el) el.remove(); };

document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos
    const toggleCheck = document.getElementById('same-as-property');
    const mailingWrapper = document.getElementById('mailing-address-wrapper');

    if (toggleCheck && mailingWrapper) {
        
        // Función para actualizar visibilidad
        const updateVisibility = () => {
            if (toggleCheck.checked) {
                // Si está marcado "Same as Property" -> OCULTAR campos extra
                mailingWrapper.style.display = 'none';
                mailingWrapper.classList.remove('active-anim');
            } else {
                // Si NO está marcado -> MOSTRAR campos para escribir
                mailingWrapper.style.display = 'block';
                // Pequeño timeout para permitir que la animación CSS ocurra si la tienes
                setTimeout(() => mailingWrapper.classList.add('active-anim'), 10);
            }
        };

        // Escuchar cambios (Click en la tarjeta)
        toggleCheck.addEventListener('change', updateVisibility);

        // Ejecutar al inicio por si el navegador guardó el estado
        updateVisibility();
    }
});

/* ================================================================
   FIX FINAL: FLOTANTES ALINEADOS A LA DERECHA
   ================================================================ */
window.addEventListener("load", function() {
    
    // 1. LIMPIEZA DE "JAULAS" (Evita que se peguen al fondo)
    const targets = [document.documentElement, document.body];
    const killStyles = [
        ['transform', 'none'], ['filter', 'none'], ['perspective', 'none'],
        ['backdrop-filter', 'none'], ['contain', 'none'], 
        ['will-change', 'auto'], ['animation', 'none']
    ];

    targets.forEach(el => {
        killStyles.forEach(([prop, val]) => el.style.setProperty(prop, val, 'important'));
    });

    // 2. POSICIONAMIENTO VISUAL (Ambos a la derecha)
    const chat = document.getElementById('floating-chat-container');
    const menu = document.getElementById('floating-menu-container');

    // Estilo base obligatorio para flotar
    const commonStyle = "position: fixed !important; z-index: 2147483647 !important; display: flex !important; transform: none !important; top: auto !important; left: auto !important;";

    if (chat) {
        if(chat.parentElement !== document.body) document.body.appendChild(chat);
        // CHAT: Abajo del todo a la derecha
        chat.style.cssText = `${commonStyle} bottom: 30px !important; right: 30px !important;`;
    }

    if (menu) {
        if(menu.parentElement !== document.body) document.body.appendChild(menu);
        // MENÚ: Mismo lado (derecha), pero 70px más arriba para no tapar el chat
        menu.style.cssText = `${commonStyle} bottom: 100px !important; right: 30px !important;`;
    }

    console.log("🚀 Alex AI: Botones flotantes alineados a la derecha.");
});

/* =========================================
   HOMEOWNER QUOTE WIZARD LOGIC
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initWizard();
});

function initWizard() {
    let currentStep = 0;
    const steps = document.querySelectorAll('.form-tab-panel');
    const sidebarItems = document.querySelectorAll('#sidebarList li');
    const totalSteps = steps.length;
    
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progress = document.getElementById('visualProgressBar');
    const stepNumDisplay = document.getElementById('stepNumber');

    // 1. Validar Paso Actual
    function validateStep(index) {
        const currentPanel = steps[index];
        // Busca inputs dentro de wrappers ricos o inputs estándar
        const requiredInputs = currentPanel.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            const val = input.value.trim();
            // Soporte para input-rich-wrapper
            const wrapper = input.closest('.input-rich-wrapper') || input;
            
            if (!val) {
                isValid = false;
                wrapper.classList.add('input-error'); // Tu clase CSS de error existente
                
                // Shake Animation
                wrapper.classList.add('shake-anim');
                setTimeout(() => wrapper.classList.remove('shake-anim'), 500);
                
                // Auto-limpieza
                input.addEventListener('input', () => wrapper.classList.remove('input-error'), {once:true});
            }
        });
        return isValid;
    }

    // --- LOGICA DE CAMPOS DINAMICOS ---
    
    // 1. Segundo Asegurado
    const toggle2nd = document.getElementById('toggleSecondInsured');
    const secSection = document.getElementById('secondInsuredSection');
    if (toggle2nd && secSection) {
        toggle2nd.addEventListener('change', (e) => {
            secSection.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    // 2. Pérdidas (Loss History)
    const lossSelect = document.getElementById('num-losses');
    const lossContainer = document.getElementById('dynamic-loss-container');
    if (lossSelect && lossContainer) {
        lossSelect.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            lossContainer.innerHTML = '';
            
            for(let i = 1; i <= count; i++) {
                const html = `
                    <div class="loss-entry-card">
                        <h6 style="font-weight:700; color:#EF4444; margin-bottom:10px;">Loss Incident #${i}</h6>
                        <div class="grid-2-tight">
                            <div class="inp-rich-group"><label class="lbl-premium">Date</label><input type="text" class="rich-input date-picker" placeholder="MM/DD/YYYY"></div>
                            <div class="inp-rich-group"><label class="lbl-premium">Type</label><input type="text" class="rich-input" placeholder="e.g. Fire"></div>
                        </div>
                    </div>`;
                lossContainer.insertAdjacentHTML('beforeend', html);
            }
            // Reinicializar calendarios en los nuevos inputs
            if(window.flatpickr) flatpickr(".date-picker", { dateFormat: "m/d/Y" });
        });
    }

    // 3. Upload Visual
    const fileInput = document.getElementById('declarationPageInput');
    const uploadText = document.getElementById('uploadText');
    const zone = document.getElementById('dec-upload-zone');
    
    if (fileInput && uploadText) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                uploadText.textContent = this.files[0].name;
                zone.style.borderColor = '#10B981';
                zone.style.backgroundColor = '#ECFDF5';
            }
        });
    }
}

/* =========================================
   PREMIUM SELECT CONVERTER (UNIVERSAL)
   ========================================= */
function initPremiumSelects() {
    const selects = document.querySelectorAll('select.premium-select');

    selects.forEach(select => {
        // Evitar duplicados
        if (select.getAttribute('data-premium-init') === 'true') return;
        select.setAttribute('data-premium-init', 'true');

        // 1. Ocultar original
        select.style.display = 'none';

        // 2. Crear Trigger
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        
        const selectedOption = select.options[select.selectedIndex];
        const initialText = selectedOption ? selectedOption.text : 'Select...';
        trigger.innerHTML = `<span>${initialText}</span> <i class="fa-solid fa-chevron-down custom-select-arrow"></i>`;
        
        wrapper.appendChild(trigger);
        select.parentNode.insertBefore(wrapper, select.nextSibling);

        // 3. Crear Menú en el Body
        const dropdown = document.createElement('div');
        dropdown.className = 'premium-select-dropdown';
        
        Array.from(select.options).forEach(option => {
            if(option.disabled) return;
            const item = document.createElement('div');
            item.className = 'premium-select-option';
            item.textContent = option.text;
            
            if (option.selected) item.classList.add('selected');

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                trigger.querySelector('span').textContent = option.text;
                trigger.classList.remove('active');
                
                dropdown.querySelectorAll('.premium-select-option').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                
                closeAllDropdowns();

                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));

                // Limpiar errores visuales
                const inputWrapper = select.closest('.input-rich-wrapper');
                if(inputWrapper) {
                    inputWrapper.classList.remove('input-error', 'shake-anim');
                    inputWrapper.style.borderColor = "";
                    inputWrapper.style.backgroundColor = "";
                }
            });
            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);

        // 4. ABRIR / CERRAR (Cálculo corregido)
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('is-open');
            closeAllDropdowns(); // Cerrar otros

            if (!isOpen) {
                trigger.classList.add('active');
                dropdown.classList.add('is-open');

                // --- POSICIONAMIENTO MATEMÁTICO ---
                const rect = trigger.getBoundingClientRect();
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

                // Como es 'absolute', sumamos la posición actual + el scroll
                dropdown.style.top = (rect.bottom + scrollTop + 5) + 'px';
                dropdown.style.left = (rect.left + scrollLeft) + 'px';
                dropdown.style.width = rect.width + 'px';
            }
        });
    });

    function closeAllDropdowns() {
        document.querySelectorAll('.premium-select-dropdown.is-open').forEach(el => el.classList.remove('is-open'));
        document.querySelectorAll('.custom-select-trigger.active').forEach(el => el.classList.remove('active'));
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-trigger') && !e.target.closest('.premium-select-dropdown')) {
            closeAllDropdowns();
        }
    });
    
    // Cerrar al hacer resize para evitar desalineación
    window.addEventListener('resize', closeAllDropdowns);
}

// INICIALIZAR
document.addEventListener("DOMContentLoaded", () => {
    initPremiumSelects();
});

/* ==========================================================================
   LÓGICA UNIFICADA DE UI 
   ========================================================================== */

function updateUI() {
    // 1. GESTIÓN DE PANELES (Mostrar/Ocultar con Animación)
    steps.forEach((panel, index) => {
        if (index === currentStep) {
            panel.classList.add('active');
            panel.style.display = 'block';
            
            // Pequeño delay para permitir que el navegador procese el display:block antes de la opacidad
            // Esto permite que la transición CSS (fade in) funcione
            requestAnimationFrame(() => {
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            });
        } else {
            panel.classList.remove('active');
            panel.style.display = 'none';
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(10px)'; // Efecto de entrada suave
        }
    });

    // 2. ACTUALIZACIÓN DE TÍTULOS (Si existen los elementos)
    // Asumimos que tienes un array 'meta' con {title: '', desc: ''} definido arriba
    if (typeof stepTitle !== 'undefined' && typeof meta !== 'undefined' && meta[currentStep]) {
        if (stepTitle) {
            stepTitle.style.opacity = 0;
            if (stepDesc) stepDesc.style.opacity = 0;
            
            setTimeout(() => {
                stepTitle.innerText = meta[currentStep].title;
                if (stepDesc) stepDesc.innerText = meta[currentStep].desc;
                stepTitle.style.opacity = 1;
                if (stepDesc) stepDesc.style.opacity = 1;
            }, 200); // 200ms coincide con una transición rápida
        }
    }

    // 3. ACTUALIZACIÓN DEL SIDEBAR (Lista lateral)
    if (typeof sidebarItems !== 'undefined' && sidebarItems.length > 0) {
        sidebarItems.forEach((li, index) => {
            li.classList.remove('active', 'completed');
            li.style.color = ''; 
            li.style.fontWeight = '';

            // Limpiamos el texto para evitar acumular iconos (✓ ✓ Texto)
            // Usamos una expresión regular para quitar iconos viejos o puntos
            const cleanText = li.innerText.replace(/✓|●/g, '').trim(); 

            if (index < currentStep) {
                // PASO COMPLETADO
                li.classList.add('completed');
                li.innerHTML = `<i class="fa-solid fa-check" style="color:#10B981; margin-right:8px;"></i> ${cleanText}`;
                li.style.color = '#10B981';
                li.style.fontWeight = '600';
            } else if (index === currentStep) {
                // PASO ACTUAL
                li.classList.add('active');
                li.innerHTML = `<span class="pulse-dot"></span> ${cleanText}`; // Tu span de punto pulsante
                li.style.color = '#1E293B';
                li.style.fontWeight = '700';
            } else {
                // PASO FUTURO
                li.innerHTML = `<i class="fa-regular fa-circle" style="color:#94A3B8; margin-right:8px; font-size:0.8rem;"></i> ${cleanText}`;
                li.style.color = '#94A3B8';
            }
        });
    }

    // 4. GESTIÓN DE BOTONES (Prev, Next, Submit)
    // Ocultar botón 'Prev' si estamos en el primer paso
    if (btnPrev) {
        btnPrev.style.display = (currentStep === 0) ? 'none' : 'flex';
    }

    // Lógica 'Next' vs 'Submit'
    const isLastStep = currentStep === totalSteps - 1;

    if (isLastStep) {
        if (btnNext) btnNext.style.display = 'none';
        if (btnSubmit) btnSubmit.style.display = 'flex';
    } else {
        if (btnNext) btnNext.style.display = 'flex';
        if (btnSubmit) btnSubmit.style.display = 'none';
    }

    // 5. BARRA DE PROGRESO
    if (progress) {
        const percentage = ((currentStep + 1) / totalSteps) * 100;
        progress.style.width = `${percentage}%`;
    }
    
    if (stepNumDisplay) {
        stepNumDisplay.innerText = currentStep + 1;
    }

    // 6. SCROLL AL INICIO
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   LISTENERS UNIFICADOS (Solo una vez)
   ========================================================================== */

function setupNavigationListeners() {
    if (btnNext) {
        const newNext = btnNext.cloneNode(true);
        btnNext.parentNode.replaceChild(newNext, btnNext);
        
        newNext.addEventListener('click', (e) => {
            e.preventDefault();
            // VALIDACIÓN: Si validateContainer devuelve true, avanzamos
            if (typeof validateContainer === 'function' && !validateContainer(steps[currentStep])) {
                // Si la validación falla, nos detenemos aquí (el toast sale desde validateContainer)
                return; 
            }
            
            if (currentStep < totalSteps - 1) {
                currentStep++;
                updateUI();
            }
        });
    }

    if (btnPrev) {
        const newPrev = btnPrev.cloneNode(true);
        btnPrev.parentNode.replaceChild(newPrev, btnPrev);
        
        newPrev.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentStep > 0) {
                currentStep--;
                updateUI();
            }
        });
    }
}

// EJECUTAR INICIALIZACIÓN
setupNavigationListeners();
updateUI();