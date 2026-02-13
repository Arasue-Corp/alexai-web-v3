// =========================================
// CORE FUNCTIONS (Universal & Modular)
// =========================================

// --- FAQ Accordion Logic ---
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Cerrar otros items abiertos (opcional: solo uno abierto)
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                // Toggle del item actual
                item.classList.toggle('active');
            });
        }
    });
}

// --- BLOG Pagination & Filtering ---
function initBlogLogic() {
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
            if (btn.dataset.filter === filter) btn.classList.add('active');
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

        if (filteredCards.length > 0) {
            filteredCards.slice(start, end).forEach(card => {
                card.style.display = 'flex';
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
            if (currentPage > 1) { currentPage--; renderPage(); window.scrollTo(0, 0); }
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
                window.scrollTo(0, 0);
            });
            paginationContainer.appendChild(btn);
        }

        const nextBtn = document.createElement('a');
        nextBtn.href = '#';
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.className = `page-dot ${currentPage === totalPages ? 'disabled' : ''}`;
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) { currentPage++; renderPage(); window.scrollTo(0, 0); }
        });
        paginationContainer.appendChild(nextBtn);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyFilter(btn.dataset.filter);
        });
    });

    applyFilter('all');
}

// --- HOLOGRAPHIC MODAL CONTROLLER ---
window.openHoloModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'flex';

    const card = modal.querySelector('.holo-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 50);
    }
};

window.closeHoloModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const card = modal.querySelector('.holo-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
    }

    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

// Cerrar al clic fuera
document.querySelectorAll('.holo-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeHoloModal(overlay.id);
        }
    });
});

// --- HOMEOWNER / RENTERS QUOTE WIZARD (Merged & Universal) ---
function initQuoteWizard() {
    console.log("🌟 ALEX AI WIZARD - PREMIUM V5 (Hybrid Mode)");

    let currentStep = 0;
    const steps = document.querySelectorAll('.form-tab-panel');
    const totalSteps = steps.length;
    if (totalSteps === 0) return;

    // Detectar producto basado en el contenido del wizard-title
    const wizardContext = document.querySelector('.wizard-title')?.innerText || "";
    const isRenters = wizardContext.toLowerCase().includes("renters");

    // Configuración dinámica de contenidos
    const metaHomeowners = [
        { title: "Your Home Protection Plan", desc: "Let's start with the primary homeowner details." },
        { title: "Property Location", desc: "Where is the home you want to insure?" },
        { title: "Property Specs", desc: "Tell us about the structure and build." },
        { title: "Protection & Safety", desc: "Does the home have protective devices?" },
        { title: "Loss History", desc: "Report any losses in the past 5 years." },
        { title: "Current Coverage", desc: "Details about your existing coverage (Optional)." },
        { title: "Valuables", desc: "Select items to add specific coverage (Optional)." }
    ];

    const metaRenters = [
        { title: "Protect Your Stuff", desc: "Let's verify your personal details first." },
        { title: "Property Specs", desc: "Tell us about the place you're renting." },
        { title: "Mailing Address", desc: "Where should we send your physical documents?" },
        { title: "Coverages", desc: "Set your protection limits for your belongings." },
        { title: "Additional Insured", desc: "Add roommates or partners who need coverage." },
        { title: "Current Policy", desc: "Provide details about your current renters policy." },
        { title: "Additional Interest", desc: "Add landlord or property management details." }
    ];

    // Asignar el set de datos correcto
    const meta = isRenters ? metaRenters : metaHomeowners;

    // UI Elements
    const progress = document.getElementById('visualProgressBar');
    const stepNumDisplay = document.getElementById('step-number'); // ID actualizado para tu HTML de Renters
    const stepTitle = document.getElementById('stepTitle');
    const stepDesc = document.getElementById('stepDesc');
    const sidebarItems = document.querySelectorAll('#sidebarList li');

    // 2. UTILIDADES
    function initCalendars(scope = document) {
        if (typeof flatpickr !== 'undefined') {
            const inputs = scope.querySelectorAll(".date-picker");
            if (inputs.length > 0) {
                flatpickr(inputs, {
                    dateFormat: "m/d/Y", allowInput: true, disableMobile: "true",
                    onChange: function(selectedDates, dateStr, instance) {
                        const wrapper = instance.element.closest('.input-rich-wrapper');
                        if (wrapper) cleanErrorVisuals(wrapper);
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

    // 3. LOGICA GRID VALUABLES (ACORDEON)
    window.toggleValuableCard = function(card) {
        card.classList.toggle('active');
        if (card.classList.contains('active')) {
            setTimeout(() => {
                const input = card.querySelector('input');
                if (input) input.focus();
            }, 200);
        }
    };

    // 4. VALIDACIÓN
    function cleanErrorVisuals(wrapper) {
        if (wrapper) {
            wrapper.classList.remove('input-error', 'shake-anim');
            wrapper.style.borderColor = "";
            wrapper.style.backgroundColor = "";
        }
    }

    function validateContainer(container) {
        if (!container) return true;
        const inputs = container.querySelectorAll('.validate-req, input[required], select[required]');
        let isValid = true;
        let firstError = null;

        inputs.forEach(input => {
            if (input.disabled) return;

            // --- AJUSTE PARA SELECTS PREMIUM ---
            const isSelect = input.tagName.toLowerCase() === 'select';
            const customWrapper = input.closest('.input-rich-wrapper');
            
            // Si no es un select y está oculto, lo ignoramos.
            // Si ES un select, verificamos si su contenedor (wrapper) es visible.
            if (!isSelect && input.offsetParent === null) return;
            if (isSelect && customWrapper && customWrapper.offsetParent === null) return;

            // Lógica para valuables y otros tipos
            if (input.closest('.smart-val-card') && !input.closest('.smart-val-card').classList.contains('active')) return;
            if ((input.type === 'checkbox' || input.type === 'radio') && !input.classList.contains('validate-req')) return;

            const val = input.value.trim();
            const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
            cleanErrorVisuals(wrapper);

            if (!val) {
                isValid = false;
                if (wrapper) {
                    void wrapper.offsetWidth;
                    wrapper.classList.add('input-error', 'shake-anim');
                    wrapper.style.borderColor = "#EF4444";
                    wrapper.style.backgroundColor = "#FEF2F2";
                    setTimeout(() => wrapper.classList.remove('shake-anim'), 500);
                }
                if (!firstError) firstError = input;
                
                // Listener para limpiar error al cambiar el select
                const clear = () => cleanErrorVisuals(wrapper);
                input.addEventListener('input', clear, { once: true });
                input.addEventListener('change', clear, { once: true });
            }
        });

        if (!isValid) {
            if (typeof window.showToast === 'function') window.showToast("Please fill in all required fields.", "warning");
            else alert("Please fill in all required fields.");
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (!firstError.classList.contains('date-picker')) firstError.focus({ preventScroll: true });
            }
        }
        return isValid;
    }

    // 5. UPDATE UI
    function updateUI() {
        if (stepTitle && meta[currentStep]) {
            stepTitle.style.opacity = 0;
            if (stepDesc) stepDesc.style.opacity = 0;
            setTimeout(() => {
                stepTitle.innerText = meta[currentStep].title;
                if (stepDesc) stepDesc.innerText = meta[currentStep].desc;
                stepTitle.style.opacity = 1;
                if (stepDesc) stepDesc.style.opacity = 1;
            }, 150);
        }

        steps.forEach((panel, i) => {
            if (i === currentStep) {
                panel.classList.add('active');
                panel.style.display = 'block';
                setTimeout(() => panel.style.opacity = '1', 50);
            } else {
                panel.classList.remove('active');
                panel.style.display = 'none';
                panel.style.opacity = '0';
            }
        });

        if (sidebarItems) {
            sidebarItems.forEach((li, i) => {
                li.classList.remove('active');
                li.style.color = '';
                li.style.fontWeight = '';
                const cleanText = li.textContent.replace('✓', '').trim();
                if (i < currentStep) {
                    li.innerHTML = `<i class="fa-solid fa-check" style="color:#10B981; margin-right:8px;"></i> ${cleanText}`;
                    li.style.color = '#10B981';
                    li.style.fontWeight = '600';
                } else if (i === currentStep) {
                    li.classList.add('active');
                    li.innerHTML = `<span class="pulse-dot"></span> ${cleanText}`;
                    li.style.color = '#1E293B';
                    li.style.fontWeight = '700';
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

        if (progress) progress.style.width = ((currentStep + 1) / totalSteps) * 100 + '%';
        if (stepNumDisplay) stepNumDisplay.innerText = currentStep + 1;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 6. LISTENERS NAV
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

    // 7. CAMPOS DINÁMICOS (LOSSES)
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

    // 8. SUBMIT MODAL (HOLOGRAPHIC)
// --- 8. SUBMIT MODAL (Híbrido Homeowners/Renters) ---
const modalHome = document.getElementById('quote-processing-modal'); // ID antiguo
const modalRenters = document.getElementById('bindSuccessModal');    // Tu nuevo ID
const targetModal = modalRenters || modalHome;

if (btnSubmit) {
    btnSubmit.onclick = (e) => {
        e.preventDefault(); // Detiene la recarga de página por el type="submit"
        
        // Ejecutamos la validación con la lógica que ya corregimos antes
        if (validateContainer(steps[currentStep])) {
            if (targetModal) {
                // Mostramos el modal
                targetModal.style.display = 'flex';
                
                // Buscamos la tarjeta interna para la animación de escala
                const card = targetModal.querySelector('.zlight-card, #modal-card');
                if (card) {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                }
            } else {
                // Fallback si no hay modal en el DOM
                if (typeof window.showToast === 'function') {
                    window.showToast("Application received successfully!", "success");
                } else {
                    alert("Application Received!");
                }
            }
        }
    };
}

    // 9. EXTRAS
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
                zone.style.borderColor = '#10B981';
                zone.style.backgroundColor = '#ECFDF5';
            }
        });
    }

    // START
    updateUI();
}

// --- ALTERNATE STEP WIZARD (For .form-step variant) ---
function initFormStepWizard() {
    let currentStep = 0;
    const steps = document.querySelectorAll('.form-step');
    const totalSteps = steps.length;

    if (totalSteps === 0) return;

    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    const progressBar = document.getElementById('progressBar');
    const stepNumText = document.getElementById('stepNum');
    const sidebarItems = document.querySelectorAll('#sidebarList li');

    function updateUI() {
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        if (btnPrev) btnPrev.style.visibility = (currentStep === 0) ? 'hidden' : 'visible';
        if (btnNext) {
            btnNext.innerHTML = (currentStep === totalSteps - 1)
                ? 'Get Quote <i class="fa-solid fa-check"></i>'
                : 'Next Step <i class="fa-solid fa-arrow-right"></i>';
        }

        const percentage = ((currentStep + 1) / totalSteps) * 100;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (stepNumText) stepNumText.innerText = currentStep + 1;

        sidebarItems.forEach((item, index) => {
            item.classList.remove('active', 'completed');
            if (index === currentStep) {
                item.classList.add('active');
            } else if (index < currentStep) {
                item.classList.add('completed');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) {
                currentStep++;
                updateUI();
            } else {
                console.log("Submit Form");
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateUI();
            }
        });
    }

    const sameAddrCheck = document.getElementById('sameAddress');
    const mailingSection = document.getElementById('mailingFields');
    if (sameAddrCheck && mailingSection) {
        sameAddrCheck.addEventListener('change', function() {
            mailingSection.style.display = this.checked ? 'none' : 'block';
        });
    }

    updateUI();
}

// --- PREMIUM SELECT CONVERTER ---
function initPremiumSelects() {
    const selects = document.querySelectorAll('select.premium-select');
    if (!selects.length) return;

    selects.forEach(select => {
        if (select.getAttribute('data-premium-init') === 'true') return;
        select.setAttribute('data-premium-init', 'true');
        select.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';

        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        const selectedOption = select.options[select.selectedIndex];
        const initialText = selectedOption ? selectedOption.text : 'Select...';
        trigger.innerHTML = `<span>${initialText}</span> <i class="fa-solid fa-chevron-down custom-select-arrow"></i>`;

        wrapper.appendChild(trigger);
        select.parentNode.insertBefore(wrapper, select.nextSibling);

        const dropdown = document.createElement('div');
        dropdown.className = 'premium-select-dropdown';

        Array.from(select.options).forEach(option => {
            if (option.disabled) return;
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

                const inputWrapper = select.closest('.input-rich-wrapper');
                if (inputWrapper) {
                    inputWrapper.classList.remove('input-error', 'shake-anim');
                    inputWrapper.style.borderColor = "";
                    inputWrapper.style.backgroundColor = "";
                }
            });
            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('is-open');
            closeAllDropdowns();

            if (!isOpen) {
                trigger.classList.add('active');
                dropdown.classList.add('is-open');

                const rect = trigger.getBoundingClientRect();
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

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

    window.addEventListener('resize', closeAllDropdowns);
}

function initPremiumSelectsContact() {
    const selects = document.querySelectorAll('select.premium-select-contact');
    if (!selects.length) return;

    selects.forEach(select => {
        if (select.getAttribute('data-premium-init') === 'true') return;
        select.setAttribute('data-premium-init', 'true');
        select.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-contact-wrapper';

        const trigger = document.createElement('div');
        trigger.className = 'custom-select-contact-trigger';
        const selectedOption = select.options[select.selectedIndex];
        const initialText = selectedOption ? selectedOption.text : 'Select...';
        trigger.innerHTML = `<span>${initialText}</span> <i class="fa-solid fa-chevron-down custom-select-contact-arrow"></i>`;

        wrapper.appendChild(trigger);
        select.parentNode.insertBefore(wrapper, select.nextSibling);

        const dropdown = document.createElement('div');
        dropdown.className = 'premium-select-contact-dropdown';

        Array.from(select.options).forEach(option => {
            if (option.disabled) return;
            const item = document.createElement('div');
            item.className = 'premium-select-contact-option';
            item.textContent = option.text;

            if (option.selected) item.classList.add('selected');

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                trigger.querySelector('span').textContent = option.text;
                trigger.classList.remove('active');

                dropdown.querySelectorAll('.premium-select-contact-option').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');

                closeAllDropdowns();

                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));

                const inputWrapper = select.closest('.input-rich-wrapper');
                if (inputWrapper) {
                    inputWrapper.classList.remove('input-error', 'shake-anim');
                    inputWrapper.style.borderColor = "";
                    inputWrapper.style.backgroundColor = "";
                }
            });
            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('is-open');
            closeAllDropdowns();

            if (!isOpen) {
                trigger.classList.add('active');
                dropdown.classList.add('is-open');

                const rect = trigger.getBoundingClientRect();
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

                dropdown.style.top = (rect.bottom + scrollTop + 5) + 'px';
                dropdown.style.left = (rect.left + scrollLeft) + 'px';
                dropdown.style.width = rect.width + 'px';
            }
        });
    });

    function closeAllDropdowns() {
        document.querySelectorAll('.premium-select-contact-dropdown.is-open').forEach(el => el.classList.remove('is-open'));
        document.querySelectorAll('.custom-select-trigger.active').forEach(el => el.classList.remove('active'));
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-trigger') && !e.target.closest('.premium-select-contact-dropdown')) {
            closeAllDropdowns();
        }
    });

    window.addEventListener('resize', closeAllDropdowns);
}

// --- OTHER INIT FUNCTIONS (From Home, Quote, etc.) ---
function initHomePageLogic() {
    if (document.querySelector('.js-hover-video')) {
        initQuoteTransition();
        initProductTriggers();
        initProductVideos();
        initProductTriggersHome();
        initProductTriggersRenters();
    }
}

function initQuoteFormLogic() {
    const quoteForm = document.getElementById('quoteFormStart');
    if (!quoteForm) return;

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
            if (modal) modal.classList.add('is-active');
        }, 1500);
    });

    closeButtons.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('is-active')));

    if (startNewBtn) {
        startNewBtn.addEventListener('click', () => {
            startNewBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
            setTimeout(() => { window.location.href = "quote-2.html"; }, 1000);
        });
    }

    initTableSelectors();
}

function initTableSelectors() {
    document.querySelectorAll('.btn-select').forEach(btn => {
        btn.addEventListener('click', () => alert('Loading existing quote...'));
    });
}

function initQuoteComparison() {
    const selectBtns = document.querySelectorAll('.js-select-quote');
    if (!selectBtns.length) return;

    const priceDisplay = document.getElementById('selected-price-display');
    const mobilePriceDisplay = document.getElementById('mobile-price-display');

    selectBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.quote-result-card');
            const wasSelected = card.classList.contains('is-selected');

            document.querySelectorAll('.quote-result-card').forEach(c => {
                c.classList.remove('is-selected');
                const b = c.querySelector('.js-select-quote');
                if (b) { b.innerHTML = 'Select Plan'; b.classList.remove('selected-state'); b.className = 'btn-blue-sketch js-select-quote'; }
            });

            if (!wasSelected) {
                card.classList.add('is-selected');
                this.innerHTML = 'Selected';
                this.className = 'btn-green-sketch js-select-quote selected-state';

                const priceText = card.querySelector('.price-group').innerText.replace('/mo', '').replace('$', '').trim();
                const formattedPrice = '$' + priceText.match(/\d+/)[0] + '/mo';

                if (priceDisplay) {
                    priceDisplay.innerHTML = formattedPrice;
                    priceDisplay.style.color = 'var(--alex-ink)';
                }
                if (mobilePriceDisplay) {
                    mobilePriceDisplay.innerHTML = formattedPrice;
                    mobilePriceDisplay.parentElement.classList.add('has-value');
                }
            } else {
                if (priceDisplay) {
                    priceDisplay.innerHTML = '--';
                    priceDisplay.style.color = '#94A3B8';
                }
                if (mobilePriceDisplay) {
                    mobilePriceDisplay.innerHTML = '--';
                    mobilePriceDisplay.parentElement.classList.remove('has-value');
                }
            }
        });
    });

    const compareBtn = document.querySelector('.js-open-compare');
    const compareModal = document.getElementById('compareModal');
    const closeCompareBtns = document.querySelectorAll('.js-close-compare');

    if (compareBtn && compareModal) {
        compareBtn.addEventListener('click', () => compareModal.classList.add('is-active'));
    }
    closeCompareBtns.forEach(btn => btn.addEventListener('click', () => compareModal.classList.remove('is-active')));

    const modeInputs = document.querySelectorAll('.js-filter-mode');
    modeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            updateFilters(e.target.value);
        });
    });
}

function updateFilters(mode) {
    const aspireTags = document.getElementById('tags-aspire');
    const aspirePrice = document.getElementById('price-aspire');

    const limitBi = document.getElementById('limit-bi');
    const dedComp = document.getElementById('ded-comp');

    if (mode === 'basic') {
        if (limitBi) limitBi.value = 'state';
        if (dedComp) dedComp.value = '0';
        if (aspirePrice) aspirePrice.innerHTML = '<div class="highlighter-mark"></div> <span class="currency">$</span>45<span class="mo">/mo</span>';
        if (aspireTags) aspireTags.innerHTML = '<span class="spec-tag warning"><i class="fa-solid fa-triangle-exclamation"></i> Liability Only</span><span class="spec-tag">State Mins</span>';
    } else {
        if (limitBi) limitBi.value = '100/300';
        if (dedComp) dedComp.value = '500';
        if (aspirePrice) aspirePrice.innerHTML = '<div class="highlighter-mark"></div> <span class="currency">$</span>79<span class="mo">/mo</span>';
        if (aspireTags) aspireTags.innerHTML = '<span class="spec-tag"><i class="fa-solid fa-shield-halved"></i> Full Coverage</span><span class="spec-tag"><i class="fa-solid fa-wrench"></i> Low Ded ($500)</span>';
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

    if (closeFilterBtn) closeFilterBtn.addEventListener('click', closeFunc);

    if (applyBtn) {
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

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;

    const isOpen = menu.classList.toggle('is-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

// --- CURSOR AI LOGIC ---
function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('cursorDot');

    if (cursor && cursorDot && window.innerWidth > 991) {
        document.addEventListener('mousemove', (e) => {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';

            cursor.animate({
                left: e.clientX + 'px',
                top: e.clientY + 'px'
            }, { duration: 500, fill: "forwards" });
        });

        const hoverables = document.querySelectorAll('a, button, input, textarea, select, .hover-target');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }
}

// --- FLOATING MEGA MENU & CHAT ---
function initFloatingMegaMenu() {
    // CHAT LOGIC
    const chatBtn = document.querySelector('.js-trigger-chat');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.querySelector('.js-close-chat');

    if (chatBtn && chatWindow) {
        chatBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatWindow.classList.add('active');
            chatBtn.classList.add('open-state');
            closeMenu();
        });

        chatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeChat();
        });
    }

    function closeChat() {
        if (chatWindow) chatWindow.classList.remove('active');
        if (chatBtn) chatBtn.classList.remove('open-state');
    }

    // MEGA MENU LOGIC
    const menuBtn = document.querySelector('.js-toggle-mega-menu');
    const menuList = document.getElementById('megaMenu');
    let originalIconClass = '';

    if (menuBtn && menuList) {
        const iconElement = menuBtn.querySelector('i');
        if (iconElement) originalIconClass = iconElement.className;

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menuList.classList.contains('is-open');

            if (isOpen) {
                closeMenu();
            } else {
                menuList.classList.add('is-open');
                menuBtn.classList.add('active');
                if (iconElement) iconElement.className = 'fa-solid fa-xmark';
                closeChat();
            }
        });

        window.closeMenu = function() {
            if (menuList) menuList.classList.remove('is-open');
            if (menuBtn) {
                menuBtn.classList.remove('active');
                if (iconElement && originalIconClass) iconElement.className = originalIconClass;
            }
        };
    }

    document.addEventListener('click', (e) => {
        if (chatWindow && !chatWindow.contains(e.target) && !chatBtn.contains(e.target)) {
            closeChat();
        }
        if (menuList && !menuList.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMenu();
        }
    });
}

// --- HOME PAGE SPECIFIC ---
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
            heroVideo.currentTime = 0;
            heroVideo.muted = true;

            const go = () => { overlay.classList.add('is-active'); setTimeout(() => window.location.href = targetUrl, 500); };
            heroVideo.addEventListener('ended', go, { once: true });
            heroVideo.play().catch(go);
        });
    });
}

function initProductVideos() {
    document.querySelectorAll('.js-hover-video').forEach(video => {
        const trigger = video.closest('.product-card') || video.closest('.organic-box') || video;
        if (!trigger) return;

        trigger.addEventListener('mouseenter', () => {
            video.play().catch(() => {});
        });

        trigger.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
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
        btn.addEventListener('click', () => window.location.href = "./homeowners/index.html");
    });
}

function initProductTriggersRenters() {
    document.querySelectorAll('.js-product-trigger-renters').forEach(btn => {
        btn.addEventListener('click', () => window.location.href = "./renters/index.html");
    });
}

// --- RENTERS SPECIFIC LOGIC ---
function initRentersLogic() {
    const resSelect = document.getElementById('residence-type');
    function toggleRenters() {
        if (!resSelect) return;
        const wComplex = document.getElementById('wrapper-complex');
        const wGated = document.getElementById('wrapper-gated-units');
        const type = resSelect.value;

        if (wComplex) wComplex.style.display = 'none';
        if (wGated) wGated.style.display = 'none';

        if (type === 'Apartment') {
            if (wComplex) wComplex.style.display = 'block';
            if (wGated) wGated.style.display = 'grid';
        } else if (type === 'Condo') {
            if (wGated) wGated.style.display = 'grid';
        }
    }
    if (resSelect) { resSelect.addEventListener('change', toggleRenters); toggleRenters(); }

    const mailToggle = document.getElementById('same-as-property');
    const mailWrap = document.getElementById('mailing-address-wrapper');
    if (mailToggle && mailWrap) {
        mailToggle.addEventListener('change', () => {
            mailWrap.style.display = mailToggle.checked ? 'none' : 'block';
        });
        mailWrap.style.display = mailToggle.checked ? 'none' : 'block';
    }

    const btnAddInsured = document.getElementById('btn-add-insured');
    const listInsured = document.getElementById('additional-insured-list');
    if (btnAddInsured) {
        const newBtn = btnAddInsured.cloneNode(true);
        btnAddInsured.parentNode.replaceChild(newBtn, btnAddInsured);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = Date.now();
            listInsured.insertAdjacentHTML('beforeend', `<div class="premium-group compact-group mb-3 anim-entry" id="row-${id}" style="border:1px solid #E2E8F0; padding:20px; border-radius:12px; position:relative;"><button type="button" onclick="removeRow('row-${id}')" style="position:absolute; top:10px; right:10px; border:none; background:#FEF2F2; color:#EF4444; width:30px; height:30px; border-radius:50%; cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button><h6 style="color:#3B82F6; font-size:0.8rem; margin-bottom:10px; font-weight:700;">INSURED</h6><div class="grid-3-tight mb-3"><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-user"></i></div><input class="rich-input validate-req" placeholder="First Name"></div><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-user-tag"></i></div><input class="rich-input" placeholder="Middle"></div><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-signature"></i></div><input class="rich-input validate-req" placeholder="Last Name"></div></div><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-cake-candles"></i></div><input class="rich-input new-date-picker validate-req" placeholder="DOB"></div></div>`);
            if (typeof flatpickr !== 'undefined') flatpickr(`#row-${id} .new-date-picker`, { dateFormat: "m/d/Y" });
        });
    }

    const btnAddInterest = document.getElementById('btn-add-interest');
    const listInterest = document.getElementById('additional-interest-list');
    if (btnAddInterest) {
        const newBtn = btnAddInterest.cloneNode(true);
        btnAddInterest.parentNode.replaceChild(newBtn, btnAddInterest);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = Date.now();
            listInterest.insertAdjacentHTML('beforeend', `<div class="premium-group compact-group mb-3 anim-entry" id="row-${id}" style="border:1px solid #E2E8F0; padding:20px; border-radius:12px; position:relative;"><button type="button" onclick="removeRow('row-${id}')" style="position:absolute; top:10px; right:10px; border:none; background:#FEF2F2; color:#EF4444; width:30px; height:30px; border-radius:50%; cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button><h6 style="color:#0D9488; font-size:0.8rem; margin-bottom:10px; font-weight:700;">INTEREST</h6><div class="input-rich-wrapper compact-premium theme-teal mb-3"><div class="icon-slot"><i class="fa-regular fa-building"></i></div><input class="rich-input validate-req" placeholder="Name"></div><div class="input-rich-wrapper compact-premium theme-teal mb-3"><div class="icon-slot"><i class="fa-solid fa-map-pin"></i></div><input class="rich-input validate-req" placeholder="Address"></div><div class="grid-3-tight"><div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-city"></i></div><input class="rich-input validate-req" placeholder="City"></div><div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-flag-usa"></i></div><input class="rich-input validate-req" placeholder="State"></div><div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-hashtag"></i></div><input class="rich-input validate-req" placeholder="Zip"></div></div></div>`);
        });
    }

    document.getElementById('btnGoHome')?.addEventListener('click', () => window.location.href = "https://alexai.cloud");
}

window.removeRow = function(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
};

// --- MAIN DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', function() {
    // Global Inits
    initFAQAccordion();
    initBlogLogic();
    initQuoteWizard();
    initFormStepWizard();
    initPremiumSelects();
    initPremiumSelectsContact();
    initCustomCursor();
    initFloatingMegaMenu();
    toggleMobileMenu(); // Call if needed, but it's event-based

    // Page-Specific Inits
    initHomePageLogic();
    initQuoteFormLogic();
    if (document.querySelector('.quote-result-card')) {
        initQuoteComparison();
        initMobileFilters();
    }

    initRentersLogic();

    // Safety: Close mobile menu on load
    const menu = document.getElementById('mobileMenu');
    if (menu && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        document.body.style.overflow = '';
    }
});

// --- FLOATING FIX (Load Event) ---
window.addEventListener("load", function() {
    const targets = [document.documentElement, document.body];
    const killStyles = [
        ['transform', 'none'], ['filter', 'none'], ['perspective', 'none'],
        ['backdrop-filter', 'none'], ['contain', 'none'],
        ['will-change', 'auto'], ['animation', 'none']
    ];

    targets.forEach(el => {
        killStyles.forEach(([prop, val]) => el.style.setProperty(prop, val, 'important'));
    });

    const chat = document.getElementById('floating-chat-container');
    const menu = document.getElementById('floating-menu-container');

    const commonStyle = "position: fixed !important; z-index: 999 !important; display: flex !important; transform: none !important; top: auto !important; left: auto !important;";

    if (chat) {
        if (chat.parentElement !== document.body) document.body.appendChild(chat);
        chat.style.cssText = `${commonStyle} bottom: 30px !important; right: 30px !important;`;
    }

    if (menu) {
        if (menu.parentElement !== document.body) document.body.appendChild(menu);
        menu.style.cssText = `${commonStyle} bottom: 100px !important; right: 30px !important;`;
    }

    console.log("🚀 Alex AI: Botones flotantes alineados a la derecha.");
});

document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('smartVideoContainer');
    var video = document.getElementById('marketingVideo');

    if (container && video) {
        
        // --- LÓGICA DE ESCRITORIO (Solo si el dispositivo tiene cursor/hover) ---
        // Usamos matchMedia para asegurarnos de que esto no afecte al móvil
        if (window.matchMedia('(hover: hover)').matches) {
            
            container.addEventListener('mouseenter', function() {
                video.play().catch(function(e) { /* Autoplay bloqueado */ });
            });

            container.addEventListener('mouseleave', function() {
                video.pause();
                // Opcional: Si quieres que se reinicie al quitar el mouse
                // video.currentTime = 0; 
            });
        }

        // --- LÓGICA MÓVIL (Click / Tap) ---
        // El evento 'click' funciona perfecto para el Tap en móviles sin el error de "mantener pulsado"
        container.addEventListener('click', function() {
            // Verificamos si es móvil comprobando si NO tiene hover, o simplemente dejamos que el click actúe
            // Esta lógica hace de interruptor (Toggle)
            if (video.paused) {
                video.play();
                container.classList.add('is-playing');
            } else {
                video.pause();
                container.classList.remove('is-playing');
            }
        });
    }
});

