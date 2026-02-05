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
    
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progress = document.getElementById('visualProgressBar');
    const stepNumDisplay = document.getElementById('stepNumberDisplay');
    const stepTitle = document.getElementById('stepTitle');
    const stepDesc = document.getElementById('stepDesc');
    
    // Metadata
    const meta = [
        {title: "Customer Information", desc: "Let's start with the primary homeowner details."},
        {title: "Property Location", desc: "Where is the home you want to insure?"},
        {title: "Property Specs", desc: "Tell us about the structure and build."},
        {title: "Protection & Safety", desc: "Does the home have protective devices?"},
        {title: "Loss History", desc: "Any losses in the past 5 years?"},
        {title: "Current Coverage", desc: "Details about your existing coverage."},
        {title: "Valuables", desc: "High-value items requiring extra coverage."}
    ];

    // 1. FLATPICKR
    if (typeof flatpickr !== 'undefined') {
        flatpickr(".date-picker", { dateFormat: "m/d/Y", allowInput: true, disableMobile: "true" });
    }

    // 2. VALIDATION
    function validateStep(index) {
        const currentPanel = document.getElementById(`tab-${index}`);
        if (!currentPanel) return true;

        const inputs = Array.from(currentPanel.querySelectorAll('.validate-req, input[required], select[required]'));
        let isValid = true;
        let firstError = null;

        inputs.forEach(input => {
            if (input.offsetParent === null) return; // Ignorar ocultos

            const val = input.value.trim();
            const wrapper = input.closest('.input-rich-wrapper') || input.closest('.premium-select')?.parentElement || input.parentElement;
            
            if (!val) {
                isValid = false;
                if(wrapper) {
                    wrapper.classList.remove('shake-anim', 'input-error');
                    void wrapper.offsetWidth; 
                    wrapper.classList.add('input-error', 'shake-anim');
                    setTimeout(() => wrapper.classList.remove('shake-anim'), 500);
                }
                
                input.addEventListener('input', () => { if(wrapper) wrapper.classList.remove('input-error'); }, {once:true});
                input.addEventListener('change', () => { if(wrapper) wrapper.classList.remove('input-error'); }, {once:true});

                if(!firstError) firstError = input;
            }
        });

        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if(firstError.tagName !== 'SELECT') firstError.focus({preventScroll: true});
        }
        return isValid;
    }

    // 3. UI UPDATE
    function updateUI() {
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

        if (sidebarItems.length) {
            sidebarItems.forEach((li, i) => {
                li.classList.remove('active');
                if (i <= currentStep) li.classList.add('active');
            });
        }

        if (btnPrev) btnPrev.style.display = currentStep === 0 ? 'none' : 'flex';
        
        if (currentStep === 6) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnSubmit) btnSubmit.style.display = 'flex';
        } else {
            if (btnNext) btnNext.style.display = 'flex';
            if (btnSubmit) btnSubmit.style.display = 'none';
        }

        if (progress) progress.style.width = ((currentStep + 1) / 7) * 100 + '%';
        if (stepNumDisplay) stepNumDisplay.innerText = currentStep + 1;
        if (stepTitle) stepTitle.innerText = meta[currentStep].title;
        if (stepDesc) stepDesc.innerText = meta[currentStep].desc;
    }

    // 4. NAV
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (validateStep(currentStep)) {
                if (currentStep < 6) {
                    currentStep++;
                    updateUI();
                }
            } else {
                showToast("Please complete required fields", "warning");
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

    // 5. SMART TOGGLE 2ND INSURED
// Lógica del Smart Toggle
    const toggle2nd = document.getElementById('toggleSecondInsured');
    const secSection = document.getElementById('secondInsuredSection');
    
    if (toggle2nd && secSection) {
        toggle2nd.addEventListener('change', (e) => {
            if (e.target.checked) {
                // MOSTRAR SECCIÓN
                secSection.style.display = 'block';
                // Pequeño delay para permitir que el navegador procese el display block antes de animar opacidad (si usas CSS transitions)
                setTimeout(() => {
                    secSection.style.opacity = '1';
                    secSection.style.transform = 'translateY(0)';
                }, 10);
                
                // Hacer requeridos los campos
                secSection.querySelectorAll('input').forEach(i => i.setAttribute('required', 'true'));
                secSection.querySelectorAll('input').forEach(i => i.classList.add('validate-req'));
            } else {
                // OCULTAR SECCIÓN
                secSection.style.opacity = '0';
                secSection.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    secSection.style.display = 'none';
                }, 300); // Esperar animación CSS
                
                // Quitar requeridos
                secSection.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
                secSection.querySelectorAll('input').forEach(i => i.classList.remove('validate-req'));
            }
        });
    }
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    container.innerHTML = '';
    const toast = document.createElement('div');
    toast.className = `alex-toast ${type}`;
    toast.innerHTML = `<div class="toast-content"><span class="toast-title">${type.toUpperCase()}</span><span class="toast-sub">${message}</span></div>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { if(toast.parentNode) toast.remove(); }, 3000);
}