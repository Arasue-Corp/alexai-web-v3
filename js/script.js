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
            heroVideo.currentTime = 0; heroVideo.muted = false;

            const go = () => { overlay.classList.add('is-active'); setTimeout(() => window.location.href = targetUrl, 500); };
            heroVideo.addEventListener('ended', go, { once: true });
            heroVideo.play().catch(go); // Si falla autoplay, ir directo
        });
    });
}

function initProductVideos() {
    document.querySelectorAll('.product-card').forEach(card => {
        const video = card.querySelector('.js-hover-video');
        if (!video) return;
        card.addEventListener('mouseenter', () => video.play().catch(() => {}));
        card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
    });
}

function initProductTriggers() {
    document.querySelectorAll('.js-product-trigger').forEach(btn => {
        btn.addEventListener('click', () => window.location.href = "quote/quote.html");
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