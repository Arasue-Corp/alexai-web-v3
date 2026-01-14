document.addEventListener("DOMContentLoaded", () => {
    console.log("Alex AI Insurtech - Final JS Loaded");

    // Initialize the new click-to-play-until-end-and-redirect logic
    initQuoteTransition();

    // Other initializations
    initMobileMenu();
    initFloatingMegaMenu();
    initFAQAccordion();
    initFloatingChat();
    initProductTriggers();
    initProductVideos();
});

/**
 * ============================================================
 * 1. NEW: QUOTE TRANSITION WITH FADE EFFECT
 * static -> click -> play full video -> float -> fade to white -> redirect
 * ============================================================
 */
function initQuoteTransition() {
    const heroVideo = document.getElementById('heroVideoElement');
    const videoContainer = document.querySelector('.hero-video-organic');
    const triggerButtons = document.querySelectorAll('.js-trigger-quote');
    const overlay = document.getElementById('transition-overlay'); // Select the new overlay
    
    // Placeholder URL for the next step (change this to your actual quote page)
    const targetUrl = "quote.html"; 

    if (!heroVideo || triggerButtons.length === 0 || !overlay) {
        console.warn("Critical elements for transition not found.");
        return;
    }

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent default jump
            e.preventDefault(); 

            console.log("Quote sequence initiated.");
            
            // Visual feedback on button
            btn.textContent = "Starting...";
            btn.style.pointerEvents = "none"; 
            btn.style.opacity = "0.8";

            // Start floating animation
            if (videoContainer) {
                videoContainer.classList.add('is-playing');
            }

            // Reset video to start
            heroVideo.currentTime = 0;

            // --- LOGIC CHANGE: FADE TRANSITION ---
            // 1. Set up listener for when video ends naturally
            heroVideo.addEventListener('ended', () => {
                console.log("Video playback finished. Starting fade transition...");
                
                // ACTIVATE FADE OVERLAY
                overlay.classList.add('is-active');

                // Wait for fade animation (500ms matching CSS transition) before redirecting
                setTimeout(() => {
                     console.log("Fade complete. Redirecting.");
                     window.location.href = targetUrl;
                }, 500);

            }, { once: true }); // 'once: true' ensures it only runs once per click

            // 2. Start playing
            heroVideo.play().catch(err => {
                console.error("Video play failed. Triggering fallback fade-out immediately.", err);
                // Fallback: fade out and redirect immediately if video fails
                overlay.classList.add('is-active');
                setTimeout(() => { window.location.href = targetUrl; }, 500);
            });
        });
    });
}

/**
 * ============================================================
 * 2. MOBILE MENU & DROPDOWN LOGIC (Unchanged)
 * ============================================================
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const siteHeader = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.main-nav a:not(.has-dropdown > a)');
    const dropdownToggles = document.querySelectorAll('.has-dropdown > a');

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

    // Prevent closing menu if clicking the quote trigger in mobile menu,
    // let initQuoteTransition handle it.
    navLinks.forEach(link => {
        if (!link.classList.contains('js-trigger-quote')) {
             link.addEventListener('click', () => {
                  if (window.innerWidth < 768) { menuToggle.click(); }
             });
        }
    });

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                e.preventDefault();
                toggle.parentElement.classList.toggle('active');
            }
        });
    });
}

/**
 * ============================================================
 * 3. LEFT FLOATING MEGA MENU (Unchanged)
 * ============================================================
 */
function initFloatingMegaMenu() {
    const triggerBtn = document.querySelector('.js-toggle-mega-menu');
    const menuList = document.getElementById('megaMenu');
    if(!triggerBtn || !menuList) return;

    triggerBtn.addEventListener('click', () => {
        menuList.classList.toggle('is-open');
        const icon = triggerBtn.querySelector('i');
        if(menuList.classList.contains('is-open')){
             icon.classList.remove('fa-bars-staggered'); icon.classList.add('fa-xmark');
        } else {
             icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars-staggered');
        }
    });

    document.addEventListener('click', (e) => {
        if (!triggerBtn.contains(e.target) && !menuList.contains(e.target) && menuList.classList.contains('is-open')) {
            triggerBtn.click();
        }
    });
}

/**
 * ============================================================
 * 4. FAQ ACCORDION (Unchanged)
 * ============================================================
 */
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if(otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });
}

/**
 * ============================================================
 * 5. FLOATING CHAT & PRODUCT TRIGGERS (Unchanged)
 * ============================================================
 */
function initFloatingChat() {
    const chatBubble = document.getElementById('chatGreeting');
    const chatTriggers = document.querySelectorAll('.js-trigger-chat');
    setTimeout(() => { if (chatBubble) chatBubble.classList.add('is-visible'); }, 2500);
    chatTriggers.forEach(btn => btn.addEventListener('click', () => {
        if (chatBubble) chatBubble.classList.remove('is-visible');
        alert('🤖 Opening Alex AI Chat Interface...');
    }));
}

function initProductTriggers() {
    // Only target the product card buttons
    const triggers = document.querySelectorAll('.js-product-trigger');
    triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            let product = btn.getAttribute('data-product');
            alert(`🚀 Starting quote for: ${product.toUpperCase()}`);
        });
    });
}

function initProductVideos() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const video = card.querySelector('.js-hover-video');

        if (!video) return; // Si no hay video, saltar

        // Evento: Mouse entra -> Reproducir
        card.addEventListener('mouseenter', () => {
            // Usamos una promesa para evitar errores si el usuario entra y sale muy rápido
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Reproducción interrumpida (usuario salió muy rápido)");
                });
            }
        });

        // Evento: Mouse sale -> Pausar y Reiniciar
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0; // Regresa el video al fotograma 0 (opcional, pero se ve mejor)
        });
    });
}

/* ============================================================
   7. QUOTE FORM HANDLING (Modificado con Modal)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const quoteForm = document.getElementById('quoteFormStart');
    const modal = document.getElementById('quotesModal');
    
    // Botones dentro del modal
    const closeButtons = document.querySelectorAll('.js-close-modal');
    const startNewBtn = document.querySelector('.js-start-new');

    // 1. MANEJAR EL ENVÍO DEL FORMULARIO
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = quoteForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            // Efecto de carga en el botón
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking Data...';
            btn.style.opacity = '0.8';
            btn.style.pointerEvents = 'none';
            
            // Simulamos petición al servidor (1.5 segundos)
            setTimeout(() => {
                // Restauramos el botón
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'all';

                // ABRIMOS EL MODAL
                if(modal) {
                    modal.classList.add('is-active');
                }
            }, 1500);
        });
    }

    // 2. CERRAR MODAL (Botón Cancel o X)
    if (closeButtons) {
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('is-active');
            });
        });
    }

    // 3. START NEW QUOTE (Simulación de ir al siguiente paso)
    if (startNewBtn) {
        startNewBtn.addEventListener('click', () => {
            // Animación de carga en el botón del modal
            startNewBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
            
            setTimeout(() => {
                alert("🚀 Starting a FRESH quote! Redirecting to Step 2...");
                // window.location.href = "step-2.html"; 
                modal.classList.remove('is-active');
                startNewBtn.innerHTML = 'START NEW QUOTE';
            }, 1000);
        });
    }

    // 4. SELECCIONAR EXISTENTE
    const selectButtons = document.querySelectorAll('.btn-select');
    selectButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const quoteId = row.querySelector('td').innerText; // Obtiene el ID (ej: 00000718)
            alert(`📂 Loading existing quote #${quoteId}...`);
        });
    });
});