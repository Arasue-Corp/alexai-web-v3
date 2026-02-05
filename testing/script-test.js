/* --- MOBILE MENU TOGGLE --- */
function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    nav.classList.toggle('active');
    
    // Cambiar icono de hamburguesa a X (opcional)
    const btnIcon = document.querySelector('.mobile-menu-toggle i');
    if(nav.classList.contains('active')) {
        btnIcon.classList.remove('fa-bars');
        btnIcon.classList.add('fa-xmark');
    } else {
        btnIcon.classList.remove('fa-xmark');
        btnIcon.classList.add('fa-bars');
    }
}

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

    // 2. Actualizar UI (Pasos, Botones, Sidebar)
    function updateUI() {
        // Mostrar panel correcto
        steps.forEach((s, i) => {
            if (i === currentStep) {
                s.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                s.classList.remove('active');
            }
        });

        // Actualizar Sidebar
        sidebarItems.forEach((li, i) => {
            li.classList.remove('active');
            
            // Texto original limpio
            const text = li.innerText.replace('✓', '').trim();
            
            if (i < currentStep) {
                li.innerHTML = `<i class="fa-solid fa-check" style="color:#10B981; margin-right:8px;"></i> ${text}`;
                li.style.color = '#10B981';
                li.style.fontWeight = '600';
            } else if (i === currentStep) {
                li.classList.add('active');
                li.innerHTML = `<span class="pulse-dot"></span> ${text}`;
                li.style.color = '#1E293B';
                li.style.fontWeight = '700';
            } else {
                li.innerHTML = `<i class="fa-regular fa-circle" style="margin-right:8px;"></i> ${text}`;
                li.style.color = '#94A3B8';
                li.style.fontWeight = '400';
            }
        });

        // Botones
        if (btnPrev) btnPrev.style.display = currentStep === 0 ? 'none' : 'block';
        
        if (currentStep === totalSteps - 1) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnSubmit) btnSubmit.style.display = 'block';
        } else {
            if (btnNext) btnNext.style.display = 'block';
            if (btnSubmit) btnSubmit.style.display = 'none';
        }

        // Progreso
        if (progress) progress.style.width = ((currentStep + 1) / totalSteps) * 100 + '%';
        if (stepNumDisplay) stepNumDisplay.innerText = currentStep + 1;
    }

    // Event Listeners Navegación
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            if (validateStep(currentStep)) {
                currentStep++;
                updateUI();
            } else {
                // Si tienes showToast global, úsalo
                if(typeof showToast === 'function') showToast("Please fill in required fields.", "warning");
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentStep > 0) {
                currentStep--;
                updateUI();
            }
        });
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

    // Inicializar UI
    updateUI();
}

// HOMEOWNERS

document.addEventListener("DOMContentLoaded", () => {
    initWizard();
});

function initWizard() {
    let currentStep = 0;
    const steps = document.querySelectorAll('.form-tab-panel');
    const sidebarItems = document.querySelectorAll('#sidebarList li');
    const totalSteps = steps.length;
    
    // UI Refs
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progress = document.getElementById('visualProgressBar');
    const stepNumDisplay = document.getElementById('stepNumberDisplay');
    const stepTitle = document.getElementById('stepTitle');
    const stepDesc = document.getElementById('stepDesc');
    
    const meta = [
        {title: "Client Information", desc: "Let's start with the primary policyholder details."},
        {title: "Property Location", desc: "Where is the home you want to insure?"},
        {title: "Property Specs", desc: "Tell us about the structure and build."},
        {title: "Safety Features", desc: "Does the home have protective devices?"},
        {title: "Claim History", desc: "Any losses in the past 5 years?"},
        {title: "Current Policy", desc: "Details about your existing coverage."},
        {title: "Valuables", desc: "High-value items requiring extra coverage."}
    ];

    // 1. INICIALIZAR FLATPICKR
    if (typeof flatpickr !== 'undefined') {
        flatpickr(".date-picker", {
            dateFormat: "m/d/Y",
            allowInput: true,
            disableMobile: "true"
        });
    }

    // 2. VALIDACIÓN VISCERAL (Shake Infalible)
    function validateStep(index) {
        const currentPanel = document.getElementById(`tab-${index}`);
        if (!currentPanel) return true;

        // Buscar inputs requeridos VISIBLES
        const inputs = Array.from(currentPanel.querySelectorAll('.validate-req, input[required], select[required]'));
        let isValid = true;
        let firstError = null;

        inputs.forEach(input => {
            // Ignorar inputs en secciones ocultas (ej: 2do asegurado no activo)
            if (input.offsetParent === null) return;

            const val = input.value.trim();
            // Encontrar el wrapper visual correcto (input-rich-wrapper o checkbox-card)
            const wrapper = input.closest('.input-rich-wrapper') || input.closest('.checkbox-card') || input.parentElement;
            
            // Validar
            if (!val) {
                isValid = false;
                
                // SHAKE LOGIC: Force Reflow
                if(wrapper) {
                    wrapper.classList.remove('shake-anim');
                    wrapper.classList.remove('input-error');
                    
                    // El truco mágico: leer propiedad para forzar repintado
                    void wrapper.offsetWidth; 
                    
                    wrapper.classList.add('input-error');
                    wrapper.classList.add('shake-anim');
                    
                    // Limpieza automática
                    setTimeout(() => wrapper.classList.remove('shake-anim'), 500);
                }
                
                // Limpiar error al escribir
                input.addEventListener('input', () => {
                    if(wrapper) wrapper.classList.remove('input-error');
                }, {once:true});

                if(!firstError) firstError = wrapper || input;
            }
        });

        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const innerInput = firstError.querySelector('input');
            if(innerInput) innerInput.focus({preventScroll: true});
        }
        return isValid;
    }

    // 3. UPDATE UI
    function updateUI() {
        // Mostrar panel correcto
        for(let i=0; i<7; i++) { 
            const panel = document.getElementById(`tab-${i}`);
            if(panel) {
                if(i === currentStep) {
                    panel.classList.add('active');
                    panel.style.display = 'block';
                } else {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                }
            }
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Sidebar Update
        if (sidebarItems.length) {
            sidebarItems.forEach((li, i) => {
                li.classList.remove('active', 'done');
                const text = li.innerText.replace('✓', '').trim(); // Limpiar ícono anterior
                
                if (i < currentStep) {
                    li.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10B981; margin-right:8px;"></i> ${text}`;
                    li.style.color = '#10B981';
                    li.style.fontWeight = '600';
                } else if (i === currentStep) {
                    li.classList.add('active');
                    li.innerHTML = `<span class="pulse-dot"></span> ${text}`;
                    li.style.color = '#1E293B';
                    li.style.fontWeight = '700';
                } else {
                    li.innerHTML = `<i class="fa-regular fa-circle" style="margin-right:8px;"></i> ${text}`;
                    li.style.color = '#94A3B8';
                    li.style.fontWeight = '400';
                }
            });
        }

        // Botones
        if (btnPrev) btnPrev.style.display = currentStep === 0 ? 'none' : 'flex';
        
        if (currentStep === 6) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnSubmit) btnSubmit.style.display = 'flex';
        } else {
            if (btnNext) btnNext.style.display = 'flex';
            if (btnSubmit) btnSubmit.style.display = 'none';
        }

        // Textos Header
        if (progress) progress.style.width = ((currentStep + 1) / 7) * 100 + '%';
        if (stepNumDisplay) stepNumDisplay.innerText = currentStep + 1;
        if (stepTitle) stepTitle.innerText = meta[currentStep].title;
        if (stepDesc) stepDesc.innerText = meta[currentStep].desc;
    }

    // 4. NAVEGACIÓN (TOAST FIX)
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation(); // IMPORTANTE: Evita doble disparo

            if (validateStep(currentStep)) {
                if (currentStep < 6) {
                    currentStep++;
                    updateUI();
                }
            } else {
                showToast("Please complete the required fields.", "warning");
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentStep > 0) {
                currentStep--;
                updateUI();
            }
        });
    }

    // Lógica dinámica (2nd Insured)
    const toggle2nd = document.getElementById('toggleSecondInsured');
    const secSection = document.getElementById('secondInsuredSection');
    if (toggle2nd && secSection) {
        toggle2nd.addEventListener('change', (e) => {
            if (e.target.checked) {
                secSection.classList.remove('hidden-anim');
                secSection.style.display = 'block'; // Fallback
                secSection.querySelectorAll('input').forEach(i => i.setAttribute('required', 'true'));
            } else {
                secSection.classList.add('hidden-anim');
                secSection.style.display = 'none';
                secSection.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
            }
        });
    }

    // Pérdidas Dinámicas
    const lossSelect = document.getElementById('num-losses');
    const lossContainer = document.getElementById('dynamic-loss-container');
    if (lossSelect && lossContainer) {
        lossSelect.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            lossContainer.innerHTML = '';
            
            for(let i = 1; i <= count; i++) {
                const html = `
                    <div style="background:#FFF; border:1px solid #E2E8F0; border-left:4px solid #EF4444; padding:15px; border-radius:8px; margin-bottom:15px; animation: fadeIn 0.3s ease;">
                        <div style="font-weight:700; color:#EF4444; margin-bottom:10px;"><i class="fa-solid fa-triangle-exclamation"></i> Loss Incident #${i}</div>
                        <div class="grid-2-tight">
                            <div class="inp-rich-group"><label class="lbl-premium">Date</label><div class="input-rich-wrapper compact-premium"><div class="icon-slot"><i class="fa-regular fa-calendar"></i></div><input type="text" class="rich-input date-picker" placeholder="MM/DD/YYYY" required></div></div>
                            <div class="inp-rich-group"><label class="lbl-premium">Type</label><div class="input-rich-wrapper compact-premium"><div class="icon-slot"><i class="fa-solid fa-fire"></i></div><input type="text" class="rich-input" placeholder="e.g. Fire" required></div></div>
                        </div>
                    </div>`;
                lossContainer.insertAdjacentHTML('beforeend', html);
            }
            if(window.flatpickr) flatpickr(".date-picker", { dateFormat: "m/d/Y" });
        });
    }

    // Modal Exito
    const form = document.getElementById('home-quote-form');
    const modal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if(modal) {
                modal.style.display = 'flex';
                // Animación simple de entrada
                const content = modal.querySelector('.premium-white-card');
                if(content) {
                    content.style.transform = 'scale(0.8)';
                    content.style.opacity = '0';
                    setTimeout(() => {
                        content.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        content.style.transform = 'scale(1)';
                        content.style.opacity = '1';
                    }, 10);
                }
            }
        });
    }
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            window.location.href = "../index.html"; 
        });
    }

    updateUI();
}

// TOAST FUNCTION GLOBAL (Debounced)
let toastTimeout;
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Limpiar anteriores para evitar pila infinita
    container.innerHTML = '';

    const toast = document.createElement('div');
    let iconClass = type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';

    toast.className = `alex-toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon-box"><i class="fa-solid ${iconClass}"></i></div>
        <div class="toast-content">
            <span class="toast-title">${type.toUpperCase()}</span>
            <span class="toast-sub">${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.add('show'));
    
    if(toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        if(toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); 
        }
    }, 3000);
}