

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
    // 5. UPDATE UI
    // ==========================================
    function updateUI() {
        if(stepTitle && meta[currentStep]) {
            stepTitle.style.opacity = 0; if(stepDesc) stepDesc.style.opacity = 0;
            setTimeout(() => {
                stepTitle.innerText = meta[currentStep].title;
                if(stepDesc) stepDesc.innerText = meta[currentStep].desc;
                stepTitle.style.opacity = 1; if(stepDesc) stepDesc.style.opacity = 1;
            }, 150);
        }

        steps.forEach((panel, i) => {
            if (i === currentStep) {
                panel.classList.add('active'); panel.style.display = 'block';
                setTimeout(() => panel.style.opacity = '1', 50);
            } else {
                panel.classList.remove('active'); panel.style.display = 'none'; panel.style.opacity = '0';
            }
        });

        if(sidebarItems) {
            sidebarItems.forEach((li, i) => {
                li.classList.remove('active'); li.style.color = ''; li.style.fontWeight = '';
                const cleanText = li.textContent.replace('✓', '').trim(); 
                if (i < currentStep) {
                    li.innerHTML = `<i class="fa-solid fa-check" style="color:#10B981; margin-right:8px;"></i> ${cleanText}`;
                    li.style.color = '#10B981'; li.style.fontWeight = '600';
                } else if (i === currentStep) {
                    li.classList.add('active');
                    li.innerHTML = `<span class="pulse-dot"></span> ${cleanText}`;
                    li.style.color = '#1E293B'; li.style.fontWeight = '700';
                } else {
                    li.innerHTML = `<i class="fa-regular fa-circle" style="margin-right:8px; font-size:0.8rem;"></i> ${cleanText}`;
                    li.style.color = '#94A3B8';
                }
            });
        }

        if (btnPrev) btnPrev.style.display = (currentStep === 0) ? 'none' : 'flex';
        
        if (currentStep === totalSteps - 1) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnSubmit) btnSubmit.style.display = 'flex';
        } else {
            if (btnNext) btnNext.style.display = 'flex';
            if (btnSubmit) btnSubmit.style.display = 'none';
        }

        if(progress) progress.style.width = ((currentStep + 1) / totalSteps) * 100 + '%';
        if(stepNumDisplay) stepNumDisplay.innerText = currentStep + 1;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==========================================
    // 6. LISTENERS NAV
    // ==========================================
    if (btnNext) {
        btnNext.onclick = (e) => {
            e.preventDefault();
            if (validateContainer(steps[currentStep])) {
                if (currentStep < totalSteps - 1) { currentStep++; updateUI(); }
            }
        };
    }
    if (btnPrev) {
        btnPrev.onclick = (e) => { e.preventDefault(); if (currentStep > 0) { currentStep--; updateUI(); } };
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

    // START
    updateUI();
});

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