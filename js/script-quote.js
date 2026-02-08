/**
 * AURORA TRANSITION ENGINE
 * Maneja la transición suave entre cualquier tipo de paneles.
 * @param {HTMLElement} currentPanel - El panel que se va.
 * @param {HTMLElement} nextPanel - El panel que entra.
 * @param {string} direction - 'next' (entra derecha) o 'prev' (entra izquierda).
 */
// --- MOTOR DE ANIMACIÓN MEJORADO (FADE SCALE) ---
    window.auroraTransition = function(currentPanel, nextPanel) {
        if (!currentPanel || !nextPanel) return;
        if (currentPanel === nextPanel) return;

        // 1. Bloquear interacción rápida durante la transición
        nextPanel.style.pointerEvents = 'none';

        // 2. FASE SALIDA (Rápida)
        currentPanel.classList.remove('active', 'anim-in');
        currentPanel.classList.add('anim-out');

        // 3. FASE ENTRADA (Coordinada)
        // Esperamos 150ms (casi al final de la salida) para que se sienta fluido
        setTimeout(() => {
            // Ocultar completamente el viejo
            currentPanel.style.display = 'none';
            currentPanel.classList.remove('anim-out');

            // Mostrar y animar el nuevo
            nextPanel.style.display = 'block';
            nextPanel.classList.add('active');
            nextPanel.classList.add('anim-in');

            // Limpieza final
            setTimeout(() => {
                nextPanel.classList.remove('anim-in');
                nextPanel.style.pointerEvents = 'auto'; // Reactivar clicks
            }, 350); // Duración de fadeInZoom

        }, 150); 
    };

document.addEventListener('DOMContentLoaded', function() {
    
    // --- DATOS DE EJEMPLO ---
    const offers = [
        { id: 1, logo: '../assets/img/Carrier-covercube-2.jpg', carrier: 'CoverCube', plan: 'Full Covercube', down: '3,920.22', monthly: '0.00', instantBind: true },
        { id: 2, logo: '../assets/img/Carrier-kemper.jpg', carrier: 'Kemper', plan: 'Kemper Auto Flex', down: '870.32', monthly: '661.64',alexChoice: true },
        { id: 3, logo: '../assets/img/Carrier-just.jpg', carrier: 'Just', plan: 'Standard Plan', down: '900.00', monthly: '710.00' },
        { id: 4, logo: '../assets/img/Carrier-clearcover.png', carrier: 'Clearcover', plan: 'Economy', down: '800.00', monthly: '640.00' }
    ];

    const container = document.getElementById('offersContainer');
    const loader = document.getElementById('loader');
    window.selectedIds = [];

    // Simular tiempo de carga inicial
    setTimeout(() => { 
        if(loader) loader.style.display = 'none'; 
        renderOffers(); 
    }, 1500);

    // --- LÓGICA DE FILTROS (IZQUIERDA) ---
    const covModeRadios = document.getElementsByName('cov_mode');
    const dedSec = document.getElementById('deductibleSection');
    const collGrp = document.getElementById('collGroup');
    
    covModeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const val = radio.value;
            if(val === 'liability') { dedSec.style.display = 'none'; }
            else if(val === 'comp') { dedSec.style.display = 'block'; collGrp.style.display = 'none'; }
            else { dedSec.style.display = 'block'; collGrp.style.display = 'block'; }
            activateRecalc();
        });
    });

    const liabRadios = document.getElementsByName('liab_mode');
    const customLiab = document.getElementById('customLiabilityOptions');
    liabRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            customLiab.classList.toggle('active', radio.value === 'custom');
            activateRecalc();
        });
    });

    // --- SISTEMA DE NOTIFICACIONES (TOAST) ---
    function showToast(msg, type = 'warning') {
        const container = document.getElementById('toast-container');
        container.innerHTML = ''; // Limpiar para que no se apilen

        const toast = document.createElement('div');
        let iconHtml = '<i class="fa-solid fa-heart"></i>';
        if(type === 'danger') iconHtml = '<i class="fa-solid fa-trash-can"></i>';
        if(type === 'warning') iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
        if(type === 'success') iconHtml = '<i class="fa-solid fa-heart"></i>';


        toast.className = `alex-toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon-box">${iconHtml}</div>
            <div class="toast-content">
                <span class="toast-title">Insight</span>
                <span class="toast-sub">${msg}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Trigger reflow para animación
        void toast.offsetWidth;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    }

    // --- RENDERIZADO DE TARJETAS ---
    function renderOffers() {
        if(!container) return;
        container.innerHTML = '';
        offers.forEach(o => {
            const div = document.createElement('div');
            div.className = 'offer-card';
            div.setAttribute('data-id', o.id);
            const choiceTagHTML = o.alexChoice 
                ? `<div class="alex-choice-tag"><i class="fa-solid fa-heart"></i> Alex Choice</div>` 
                : '';
            const bindTagHTML = o.instantBind 
                ? `<div class="alex-choice-tag" style="background: var(--brand-green)"><i class="fa-solid fa-bolt"></i> Instant Bind</div>` 
                : '';
            div.innerHTML = `
                ${choiceTagHTML}<div class="stamp-mark""><i class="fa-solid fa-check"></i> SELECTED</div>

                ${bindTagHTML}<div class="stamp-mark"><i class="fa-solid fa-check"></i> SELECTED</div>
                
                <div class="card-main">
                    <div class="logo-col"><img src="${o.logo}" class="carrier-logo"></div>
                    <div class="info-col">
                        <h4>${o.plan}</h4>
                        <div class="coverage-tags">BI | PD | UM | MED | COMP | COLL</div>
                        <div class="liability-tag">Liability: $100k / $300k / $50k</div>
                    </div>
                    <div class="price-col">
                        <div class="down-row">Down Payment: <strong>$${o.down}</strong></div>
                        <div class="monthly-row">
                            <div class="highlight-bg">
                                <span class="price-big">$${o.monthly}</span>
                            </div>
                            <span class="per-mo">Per Month</span>
                        </div>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="action-btn" onclick="toggleDetails(${o.id})">View Details</button>
                    <button class="action-btn select-btn" onclick="toggleSel(${o.id}, this, '${o.carrier}')">Select Plan</button>
                </div>

                <div id="dtl-${o.id}" class="details-expand">
                    
                    <div class="det-sec-title"><i class="fa-solid fa-shield-halved"></i> General Policy Coverages</div>
                    <div class="gen-cov-grid">
                        <div class="gen-cov-item"><span class="gen-lbl">Liability Limits</span><span class="gen-val">25/50/15</span></div>
                        <div class="gen-cov-item"><span class="gen-lbl">Uninsured BI</span><span class="gen-val">25/50</span></div>
                        <div class="gen-cov-item"><span class="gen-lbl">Underinsured BI</span><span class="gen-val">25/50</span></div>
                        <div class="gen-cov-item"><span class="gen-lbl">Medical Payments</span><span class="gen-val">$500</span></div>
                        <div class="gen-cov-item"><span class="gen-lbl">Accidental Death</span><span class="gen-val text-muted">No Coverage</span></div>
                    </div>

                    <div class="det-sec-title"><i class="fa-solid fa-car-rear"></i> Insured Vehicles (2)</div>
                    <div class="veh-details-grid">
                        
                        <div class="veh-det-card">
                            <div class="veh-det-header">
                                <div class="v-icon-box">
                                    <img src="../assets/img/logo-nissan.png" alt="Nissan Logo">
                                </div>
                                <div class="v-info">
                                    <h5>Vehicle 1: 2019 NISSAN TITAN</h5>
                                    <span>VIN: 1N6AA...3849</span>
                                </div>
                            </div>
                            <div class="veh-det-body">
                            <div class="coverage-tags">BI | PD | UM | UNDUM | MEDPM | COMP | COLL | TL | RREIM</div>
                                <div class="cov-list-row">
                                    <span class="c-label">Comprehensive</span>
                                    <div class="c-val-group">
                                        <span class="c-ded">Ded $1,000</span>
                                        <span class="c-prem">$219.48</span>
                                    </div>
                                </div>
                                <div class="cov-list-row">
                                    <span class="c-label">Collision</span>
                                    <div class="c-val-group">
                                        <span class="c-ded">Ded $1,000</span>
                                        <span class="c-prem">$1,021.42</span>
                                    </div>
                                </div>
                                
                                <div class="cov-group-header">ADDITIONAL</div>
                                <div class="cov-list-row"><span class="c-label">Towing</span><span class="c-val-group"><span class="c-ded">Included</span><span class="c-prem">$90.00</span></span></div>
                                <div class="cov-list-row"><span class="c-label">RREIM.</span><span class="c-val-group"><span class="c-ded">$40/Day</span><span class="c-prem">$31.00</span></span></div>
                                <div class="cov-list-row"><span class="c-label">GAP</span><span class="c-val-group"><span class="c-ded text-muted">No Cov</span></span></div>
                                <div class="cov-list-row"><span class="c-label">Custom</span><span class="c-val-group"><span class="c-ded text-muted">No Cov</span></span></div>
                                <div class="cov-list-row"><span class="c-label">Safety</span><span class="c-val-group"><span class="c-ded text-muted">No Cov</span></span></div>

                            </div>
                        </div>

                        <div class="veh-det-card">
                            <div class="veh-det-header">
                                <div class="v-icon-box">
                                    <img src="../assets/img/logo-gmc.png" alt="GMC Logo">
                                </div>
                                <div class="v-info">
                                    <h5>Vehicle 2: 2022 GMC CANYON</h5>
                                    <span>VIN: 2GTEA...9921</span>
                                </div>
                            </div>
                            <div class="veh-det-body">
                            <div class="coverage-tags">BI | PD | UM | UNDUM | MEDPM | COMP | COLL</div>
                                <div class="cov-list-row">
                                    <span class="c-label">Comprehensive</span>
                                    <div class="c-val-group">
                                        <span class="c-ded">Ded $500</span>
                                        <span class="c-prem">$145.20</span>
                                    </div>
                                </div>
                                <div class="cov-list-row">
                                    <span class="c-label">Collision</span>
                                    <div class="c-val-group">
                                        <span class="c-ded">Ded $500</span>
                                        <span class="c-prem">$980.50</span>
                                    </div>
                                </div>
                                
                                <div class="cov-group-header">ADDITIONAL</div>
                                <div class="cov-list-row"><span class="c-label">Towing</span><span class="c-val-group"><span class="c-ded text-muted">No Cov</span></span></div>
                                <div class="cov-list-row"><span class="c-label">RREIM</span><span class="c-val-group"><span class="c-ded text-muted">No Cov</span></span></div>
                                <div class="cov-list-row"><span class="c-label">GAP</span><span class="c-val-group"><span class="c-ded text-muted">No Cov</span></span></div>
                                <div class="cov-list-row"><span class="c-label">Custom</span><span class="c-val-group"><span class="c-ded text-muted">No Cov</span></span></div>
                                <div class="cov-list-row"><span class="c-label">Safety</span><span class="c-val-group"><span class="c-ded text-muted">No Cov</span></span></div>
                            </div>
                        </div>

                    </div>
                    
                    <button onclick="toggleDetails(${o.id})" class="close-det-btn">Close Details <i class="fa-solid fa-chevron-up"></i></button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Funciones Globales (attached to window para acceso desde HTML inyectado)
    window.toggleDetails = id => {
        const el = document.getElementById(`dtl-${id}`);
        if(el) el.classList.toggle('active');
    };
    
    window.toggleSel = function(id, btn, carrierName) {
        const card = document.querySelector(`.offer-card[data-id="${id}"]`);
        if(window.selectedIds.includes(id)) {
            window.selectedIds = window.selectedIds.filter(i => i !== id);
            card.classList.remove('selected');
            btn.textContent = 'Select Plan';
        } else {
            window.selectedIds.push(id);
            card.classList.add('selected');
            btn.textContent = 'Unselect';
            showToast(`${carrierName} Added`,'success');
        }
        updateBtns();
    }

    window.updateBtns = function() {
        const nextBtns = document.querySelectorAll('.js-btn-next');
        const compBtns = document.querySelectorAll('.js-btn-compare');

        
        nextBtns.forEach(b => b.classList.remove('active'));
        compBtns.forEach(b => b.classList.remove('active'));

        if (window.selectedIds.length === 1) {
            nextBtns.forEach(b => b.classList.add('active'));
        } else if (window.selectedIds.length >= 2) {
            compBtns.forEach(b => b.classList.add('active'));
        }
    }

    // --- LÓGICA MÓVIL Y UX ---
    window.toggleFilters = function() {
        const sb = document.getElementById('configSidebar');
        const closeBtn = document.getElementById('closeFiltersBtn');
        if(sb) {
            sb.classList.toggle('mobile-active');
            if(closeBtn) closeBtn.style.display = sb.classList.contains('mobile-active') ? 'block' : 'none';
        }
    }

    function activateRecalc() { 
        const btn = document.getElementById('btnRecalc');
        if(btn) btn.classList.add('active'); 
    }
    
    document.querySelectorAll('.recalc').forEach(el => el.addEventListener('change', activateRecalc));
    
    const btnRecalc = document.getElementById('btnRecalc');
    if(btnRecalc) {
        btnRecalc.addEventListener('click', function() {
            if(!this.classList.contains('active')) return;
            this.classList.remove('active');
            container.innerHTML = '';
            if(loader) loader.style.display = 'flex';
            
            const sb = document.getElementById('configSidebar');
            if(sb) sb.classList.remove('mobile-active'); // Cerrar móvil
            
            setTimeout(() => { 
                if(loader) loader.style.display = 'none'; 
                renderOffers(); 
            }, 1500);
        });
    }

    // Modals & Next Actions
    document.querySelectorAll('.js-btn-compare').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            e.preventDefault();
            if(btn.classList.contains('active')) {
                openCompareModal();
            }
        });
    });

    window.closeModal = () => {
        const modal = document.getElementById('compareModal');
        if(modal) modal.classList.remove('active');
    };

    document.querySelectorAll('.js-btn-next').forEach(btn => {
        btn.addEventListener('click', () => { 
            if(btn.classList.contains('active')) window.location.href = "quote-15.html";

        });
    });

    document.querySelectorAll('.js-btn-update').forEach(btn => {
        btn.addEventListener('click', () => { 
            if(btn.classList.contains('js-btn-update')) window.location.href = "quote-16.html";

        });
    });

    document.querySelectorAll('.primary').forEach(btn => {
        btn.addEventListener('click', () => { 
            if(btn.classList.contains('primary')) 
                setTimeout(() => {window.location.href = "quote-14.html";
            }, 2500); // 2500 milisegundos = 2.5 segundos

        });
    });

    //EDIT QUOTE
// --- VARIABLES ---
    const modal = document.getElementById('custom-modal');
    const confirmBtn = document.getElementById('btn-confirm-action');
    let deleteId = null;
    let deleteType = null;

    // --- TOAST FUNCTION (Colores funcionando) ---
    window.showToast = function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        let iconHtml = '<i class="fa-solid fa-heart"></i>';
        if(type === 'danger') iconHtml = '<i class="fa-solid fa-trash-can"></i>';
        if(type === 'warning') iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
        if(type === 'success') iconHtml = '<i class="fa-solid fa-heart"></i>';


        toast.className = `alex-toast ${type}`;

        toast.innerHTML = `
            <div class="toast-icon-box">${iconHtml}</div>
            <div class="toast-content">
                <span class="toast-title">Insight</span>
                <span class="toast-sub">${msg}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    };

    // --- REMOVE ---
    window.confirmRemove = function(id, type) {
        if(type === 'Vehicle') {
            // Count cards with class .vehicle-card
            const count = document.querySelectorAll('.vehicle-card').length;
            if(count <= 1) {
                showToast('Cannot remove the only vehicle', 'warning');
                return;
            }
        }
        deleteId = id;
        deleteType = type;
        modal.classList.add('active');
    };

    window.closeModalToast = function() {
        modal.classList.remove('active');
    };

    if(confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if(deleteId) {
                const el = document.getElementById(deleteId);
                if(el) {
                    el.style.opacity = '0.5';
                    setTimeout(() => {
                        el.remove();
                        showToast(`${deleteType} Removed, Quote will be recalculated`, 'danger');
                    }, 300);
                }
            }
            closeModalToast();
        });
    }

    // --- LOGIC: Conditionals ---
    const triggers = document.querySelectorAll('.js-trigger');
    triggers.forEach(t => {
        t.addEventListener('change', (e) => {
            const targetId = t.getAttribute('data-target');
            const target = document.getElementById(targetId);
            const val = e.target.value;
            
            if(target) {
                let show = (val === 'Yes' || (val !== 'None' && val !== 'No'));
                if(show) target.classList.add('visible');
                else target.classList.remove('visible');
            }
        });
    });

    // --- LOGIC: Exclude ---
    const excluders = document.querySelectorAll('.js-exclude');
    excluders.forEach(ex => {
        ex.addEventListener('change', (e) => {
            if(e.target.value === 'Yes') showToast('Warning: Driver Excluded, Quote will be recalculated', 'warning');
        });
    });

    // --- SAVE ---
    window.simulateSave = function(action) {
        showToast('Saving changes...', 'success');
        setTimeout(() => {
            if(action === 're-quote') window.location.href = 'quote-14-test.html';
            else showToast('Quotes updated!', 'success');
        }, 1500);
    };

window.addEntity = (type) => window.showToast(`New ${type} Added, Quote will be recalculated`, 'success');

    /* =========================================
   LOGIC FOR STEP 13 (SPECS)
   ========================================= */
if(document.getElementById('quoteFormStep13')) {

    // 1. FLATPICKR
    if(typeof flatpickr !== 'undefined') {
        flatpickr(".date-picker", { 
            dateFormat: "m/d/Y", 
            maxDate: "today", 
            disableMobile: "true" 
        });
    }

    // 2. SWITCH TABS (CAR 1 / CAR 2)
    window.switchTab = function(carId, btnElement) {
        const targetPanel = document.getElementById(`panel-${carId}`);
        
        // Validación existente...
        if (!targetPanel) { /* ... warning ... */ return; }

        // Actualizar Tabs...
        document.querySelectorAll('.tab-int').forEach(t => t.classList.remove('active'));
        if(btnElement) {
            btnElement.classList.add('active');
        } else {
            // Si llamamos via JS (Next/Prev) buscamos el botón
            const idx = carId === 'car-1' ? 0 : 1;
            document.querySelectorAll('.tab-int')[idx].classList.add('active');
        }

        // Panels
        document.querySelectorAll('.car-panel').forEach(p => {
            p.style.display = 'none';
            p.classList.remove('active');
        });
        
        const target = document.getElementById(`panel-${carId}`);
        if(target) {
            target.style.display = 'block'; // Fallback
            // Timeout pequeño para permitir animaciones CSS si las hubiera
            setTimeout(() => target.classList.add('active'), 10);
        }

        // OBTENER PANEL ACTUAL
        const currentPanel = document.querySelector('.car-panel.active');

        // CALCULAR DIRECCIÓN (car-1 vs car-2)
        // Extraemos los números para comparar matemáticamente (más seguro)
        const currNum = parseInt(currentPanel.getAttribute('data-id') || 0);
        const nextNum = parseInt(targetPanel.getAttribute('data-id') || 0);
        const direction = nextNum > currNum ? 'next' : 'prev';

        // LLAMADA AL MOTOR
        window.auroraTransition(currentPanel, targetPanel, direction);
    };

    // 3. AUTO CALC MILEAGE
    const milesWorkInput = document.getElementById('milesWork-1');
    const annualInput = document.getElementById('annualMiles-1');
    if(milesWorkInput && annualInput) {
        milesWorkInput.addEventListener('input', function() {
            const val = parseInt(this.value);
            if(!isNaN(val) && val > 0) annualInput.value = val * 260;
            else annualInput.value = '';
        });
    }

    // 4. MODAL LOGIC (VIP)
    const modal = document.getElementById('phoneModal');
    const stepA = document.getElementById('modalStepA');
    const stepB = document.getElementById('modalStepB');

// Validación "Next Step" con Shake + Auto-Scroll
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            let isValid = true;
            let firstError = null; // Variable para guardar el primer campo fallido
            
            // Seleccionamos solo el panel visible (Car 1 o Car 2)
            const activePanel = document.querySelector('.car-panel.active');
            const inputs = activePanel.querySelectorAll('.validate-req');
            
            inputs.forEach(input => {
                const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                
                // 1. Limpiamos estado previo
                wrapper.classList.remove('input-error');
                
                // 2. Validamos
                if(!input.value.trim()) { 
                    isValid = false; 
                    
                    // Truco para reiniciar la animación shake
                    void wrapper.offsetWidth; 
                    
                    // 3. Aplicamos error
                    wrapper.classList.add('input-error');

                    // 4. Si es el primer error que encontramos, lo guardamos
                    if (firstError === null) {
                        firstError = wrapper;
                    }
                }
            });

            if(isValid) {
                modal.classList.add('active');
            } else {
                showToast("Please fill in the required vehicle specs.", "warning");
                
                // 5. SCROLL AUTOMÁTICO AL PRIMER ERROR
                if (firstError) {
                    firstError.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' // Lo centra en la pantalla para que no quede tapado por el header
                    });
                    
                    // Opcional: Darle foco al input interno para que pueda escribir ya
                    const inputInside = firstError.querySelector('input, select');
                    if(inputInside) inputInside.focus({preventScroll: true});
                }
            }
        });
    }

    // Flujo del Modal
    document.getElementById('btnYesPhone').addEventListener('click', () => { 
        stepA.style.display = 'none'; 
        stepB.style.display = 'block'; 
    });
    
    document.getElementById('btnBackToA').addEventListener('click', () => { 
        stepB.style.display = 'none'; 
        stepA.style.display = 'block'; 
    });
    
    document.getElementById('btnNoPhone').addEventListener('click', () => {
        modal.classList.remove('active');
        showToast("Skipping phone verification...", "warning");
        setTimeout(() => window.location.href = "quote-14.html", 800);
    });

    document.getElementById('btnSavePhone').addEventListener('click', function() {
        const phone = document.getElementById('phoneNumber').value;
        const btn = this;
        
        if(phone.length < 10) { 
            document.getElementById('phoneNumber').parentElement.classList.add('input-error');
            return; 
        }

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        setTimeout(() => { 
            modal.classList.remove('active'); 
            showToast("VIP Access Unlocked!", "success"); 
            setTimeout(() => window.location.href = "quote-14.html", 1000);
        }, 1000);
    });
}
});

window.switchCompTab = function(tabId, btnElement) {
    // 1. Ocultar todos los paneles
    document.querySelectorAll('.comp-tab-content').forEach(el => el.classList.remove('active'));
    
    // 2. Desactivar todos los botones
    document.querySelectorAll('.veh-tab-btn').forEach(el => el.classList.remove('active'));
    
    // 3. Activar el panel deseado
    const targetPanel = document.getElementById(tabId);
    if(targetPanel) targetPanel.classList.add('active');
    
    // 4. Activar el botón clickeado
    if(btnElement) btnElement.classList.add('active');
};

/* =========================================
   LOGIC FOR STEP 12 (USAGE)
   ========================================= */
if(document.getElementById('quoteFormStep12')) {

    // 1. SWITCH TABS
    window.switchTab = function(carId, btnElement) {
        const targetPanel = document.getElementById(`panel-${carId}`);
        
        // Validación existente...
        if (!targetPanel) { /* ... warning ... */ return; }

        // Actualizar Tabs...
        document.querySelectorAll('.tab-int').forEach(t => t.classList.remove('active'));
        if(btnElement) {
            btnElement.classList.add('active');
        } else {
            const idx = carId === 'car-1' ? 0 : 1;
            const tabs = document.querySelectorAll('.tab-int');
            if(tabs[idx]) tabs[idx].classList.add('active');
        }

        // Panels
        document.querySelectorAll('.car-panel').forEach(p => {
            p.style.display = 'none';
            p.classList.remove('active');
        });
        
        const target = document.getElementById(`panel-${carId}`);
        if(target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }
        // OBTENER PANEL ACTUAL
        const currentPanel = document.querySelector('.car-panel.active');

        // CALCULAR DIRECCIÓN (car-1 vs car-2)
        // Extraemos los números para comparar matemáticamente (más seguro)
        const currNum = parseInt(currentPanel.getAttribute('data-id') || 0);
        const nextNum = parseInt(targetPanel.getAttribute('data-id') || 0);
        const direction = nextNum > currNum ? 'next' : 'prev';

        // LLAMADA AL MOTOR
        window.auroraTransition(currentPanel, targetPanel, direction);
    };

    // 2. VALIDATION & NEXT STEP
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            
            let isValid = true;
            let firstError = null;
            
            // Validamos el panel visible para no bloquear si el usuario va paso a paso
            const activePanel = document.querySelector('.car-panel.active');
            const selects = activePanel.querySelectorAll('.validate-req');
            
            selects.forEach(input => {
                const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                wrapper.classList.remove('input-error');
                
                if(!input.value) {
                    isValid = false;
                    void wrapper.offsetWidth; 
                    wrapper.classList.add('input-error');
                    if (firstError === null) firstError = wrapper;
                }
            });

            if(isValid) {
                const btn = document.getElementById('btnNext');
                
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                
                setTimeout(() => {
                    window.location.href = "quote-13.html";
                }, 800);
            } else {
                showToast("Please select the Vehicle Usage.", "warning");
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
}

/* =========================================
   LOGIC FOR STEP 11 (LIENHOLDER)
   ========================================= */
if(document.getElementById('quoteFormStep11')) {

    // 1. SWITCH TABS
    window.switchTab = function(carId, btnElement) {
        const targetPanel = document.getElementById(`panel-${carId}`);
        
        // Validación existente...
        if (!targetPanel) { /* ... warning ... */ return; }

        // Actualizar Tabs...
        document.querySelectorAll('.tab-int').forEach(t => t.classList.remove('active'));
        if(btnElement) {
            btnElement.classList.add('active');
        } else {
            const idx = carId === 'car-1' ? 0 : 1;
            const tabs = document.querySelectorAll('.tab-int');
            if(tabs[idx]) tabs[idx].classList.add('active');
        }

        document.querySelectorAll('.car-panel').forEach(p => {
            p.style.display = 'none';
            p.classList.remove('active');
        });
        
        const target = document.getElementById(`panel-${carId}`);
        if(target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }

        // OBTENER PANEL ACTUAL
        const currentPanel = document.querySelector('.car-panel.active');

        // CALCULAR DIRECCIÓN (car-1 vs car-2)
        // Extraemos los números para comparar matemáticamente (más seguro)
        const currNum = parseInt(currentPanel.getAttribute('data-id') || 0);
        const nextNum = parseInt(targetPanel.getAttribute('data-id') || 0);
        const direction = nextNum > currNum ? 'next' : 'prev';

        // LLAMADA AL MOTOR
        window.auroraTransition(currentPanel, targetPanel, direction);
    };

    // 2. TOGGLE FINANCE DETAILS
    window.toggleFinance = function(carId, action) {
        const detailsDiv = document.getElementById(`finance-details-${carId}`);
        if(action === 'show') {
            detailsDiv.classList.add('visible');
            // Hacer scroll suave hacia los detalles si aparecen
            setTimeout(() => {
                detailsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } else {
            detailsDiv.classList.remove('visible');
        }
    };

    // 3. VALIDATION
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            
            let isValid = true;
            let firstError = null;
            
            // Obtenemos panel activo e ID
            const activePanel = document.querySelector('.car-panel.active');
            const id = activePanel.getAttribute('data-id');
            
            // Verificamos si se seleccionó Lease/Loan
            const finOption = document.querySelector(`input[name="fin_${id}"]:checked`);
            const finValue = finOption ? finOption.value : 'none';

            if(finValue !== 'none') {
                // Solo validamos los campos internos si NO es "None"
                const requiredInputs = activePanel.querySelectorAll('.validate-cond');
                
                requiredInputs.forEach(input => {
                    const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                    wrapper.classList.remove('input-error');
                    
                    if(!input.value.trim()) {
                        isValid = false;
                        void wrapper.offsetWidth;
                        wrapper.classList.add('input-error');
                        if (firstError === null) firstError = wrapper;
                    }
                });
            }

            if(isValid) {
                const btn = document.getElementById('btnNext');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                setTimeout(() => {
                    window.location.href = "quote-12.html";
                }, 800);
            } else {
                showToast("Please fill in the Lienholder details.", "warning");
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
}

/* =========================================
   LOGIC FOR STEP 10 (VEHICLES) - NAV FIXED
   ========================================= */
if(document.getElementById('quoteFormStep10')) {

    const tabsContainer = document.getElementById('carTabs');
    const container = document.getElementById('carFormsContainer');
    const btnAdd = document.getElementById('btnAddCar');
    const maxCars = 6;

    // Listas de datos
    const yearsList = []; for(let i=2026; i>=1971; i--) yearsList.push(i);
    const makesList = ["ACURA","AUDI","BMW","CHEVROLET","DODGE","FORD","HONDA","HYUNDAI","JEEP","KIA","LEXUS","MAZDA","MERCEDES","NISSAN","RAM","SUBARU","TESLA","TOYOTA","VOLKSWAGEN"];

    // 1. POPULATE LISTS
    function populateLists(id) {
        const ySelect = document.getElementById(`year-${id}`);
        const mSelect = document.getElementById(`make-${id}`);
        if(ySelect) { 
            ySelect.innerHTML = '<option value="" disabled selected>Select</option>';
            yearsList.forEach(y => { let opt = document.createElement('option'); opt.value=y; opt.textContent=y; ySelect.appendChild(opt); }); 
        }
        if(mSelect) { 
            mSelect.innerHTML = '<option value="" disabled selected>Select</option>';
            makesList.forEach(m => { let opt = document.createElement('option'); opt.value=m; opt.textContent=m; mSelect.appendChild(opt); }); 
        }
    }
    populateLists(1);

    // 2. SWITCH TABS (CON ANIMACIÓN GLOBAL)
    window.switchTab = function(carId, btnElement) {
        
        const targetPanel = document.getElementById(`panel-${carId}`);
        if (!targetPanel) {
            const num = carId.replace('car-', '');
            window.showToast(`Please add Vehicle ${num} using the "+ Add" button first.`, "warning");
            return;
        }

        // Gestión de Tabs
        document.querySelectorAll('.tab-int').forEach(t => t.classList.remove('active'));
        if(btnElement) {
            btnElement.classList.add('active');
        } else {
            const t = document.getElementById(`tab-${carId}`);
            if(t) t.classList.add('active');
        }

        // Transición
        const currentPanel = document.querySelector('.car-panel.active');
        if (!currentPanel) {
            // Fallback si no hay activo (post-delete)
            document.querySelectorAll('.car-panel').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
            targetPanel.style.display = 'block';
            setTimeout(() => targetPanel.classList.add('active'), 10);
            return;
        }

        const currNum = parseInt(currentPanel.getAttribute('data-id') || 0);
        const nextNum = parseInt(targetPanel.getAttribute('data-id') || 0);
        const direction = nextNum > currNum ? 'next' : 'prev';

        if (typeof window.auroraTransition === 'function') {
            window.auroraTransition(currentPanel, targetPanel, direction);
        } else {
            currentPanel.style.display = 'none'; currentPanel.classList.remove('active');
            targetPanel.style.display = 'block'; setTimeout(() => targetPanel.classList.add('active'), 10);
        }
    };

    // 3. SMART NAV VISIBILITY (LA MAGIA NUEVA)
    // Oculta el botón "Next Car" en el último coche para no confundir
    function updateNavVisibility() {
        const panels = Array.from(document.querySelectorAll('.car-panel'));
        const total = panels.length;

        panels.forEach((panel, index) => {
            const isLast = index === total - 1;
            const nextBtn = panel.querySelector('.btn-next-car');
            
            // Si es el último coche, ocultamos el botón "Next Car"
            // para que el usuario pulse el botón principal "Next Step"
            if(nextBtn) {
                if(isLast) nextBtn.style.display = 'none';
                else nextBtn.style.display = 'inline-flex';
            }
        });
    }

    // 4. SMART TAB UPDATE
    window.updateTabName = function(id, makeName) {
        const tab = document.getElementById(`tab-car-${id}`);
        if(tab) {
            const span = tab.querySelector('.tab-txt');
            if(span) span.textContent = makeName;
        }
    };

    // 5. TOGGLE GARAGE
    window.toggleGarage = function(id, action) {
        const div = document.getElementById(`garage-addr-${id}`);
        if(action === 'yes') {
            div.classList.add('visible');
            const input = div.querySelector('input');
            if(input) input.classList.add('validate-req');
        } else {
            div.classList.remove('visible');
            const input = div.querySelector('input');
            if(input) {
                input.classList.remove('validate-req');
                input.closest('.input-rich-wrapper').classList.remove('input-error');
            }
        }
    };

    // 6. ADD NEW CAR
    btnAdd.addEventListener('click', () => {
        const currentTabs = document.querySelectorAll('.tab-int:not(.add-btn)');
        const carCount = currentTabs.length;
        if(carCount >= maxCars) { window.showToast("Maximum 6 cars reached.", "warning"); return; }
        
        const newId = carCount + 1;
        
        // Tab
        const newTab = document.createElement('button');
        newTab.type = 'button'; newTab.className = 'tab-int'; newTab.id = `tab-car-${newId}`;
        newTab.innerHTML = `<span class="tab-txt">Car ${newId}</span>`;
        newTab.onclick = function() { switchTab(`car-${newId}`, this); };
        tabsContainer.insertBefore(newTab, btnAdd);

        // Panel
        const newPanel = document.createElement('div');
        newPanel.className = 'car-panel'; newPanel.id = `panel-car-${newId}`; newPanel.setAttribute('data-id', newId);
        newPanel.innerHTML = getCarTemplate(newId);
        container.appendChild(newPanel);

        populateLists(newId);
        updateNavVisibility(); // Actualizar botones
        switchTab(`car-${newId}`, newTab);
        window.showToast(`Vehicle ${newId} added successfully.`, "success");
    });

    // 7. DELETE & REINDEX
    window.deleteCar = function(idToDelete) {
        if(idToDelete == 1) return;
        document.getElementById(`tab-car-${idToDelete}`).remove();
        document.getElementById(`panel-car-${idToDelete}`).remove();

        const allTabs = Array.from(tabsContainer.querySelectorAll('.tab-int:not(.add-btn)'));
        const allPanels = Array.from(container.querySelectorAll('.car-panel'));
        
        for(let i = 1; i < allTabs.length; i++) {
            const tab = allTabs[i]; const panel = allPanels[i]; const newNum = i + 1;
            
            tab.id = `tab-car-${newNum}`;
            const txtSpan = tab.querySelector('.tab-txt');
            if(txtSpan.textContent.includes('Car ')) txtSpan.textContent = `Car ${newNum}`;
            tab.onclick = function() { switchTab(`car-${newNum}`, this); };

            panel.id = `panel-car-${newNum}`; panel.setAttribute('data-id', newNum);
            
            // Inputs IDs
            const makeSel = panel.querySelector('[id^="make-"]'); if(makeSel) { makeSel.id = `make-${newNum}`; makeSel.setAttribute('onchange', `updateTabName(${newNum}, this.value)`); }
            const yearSel = panel.querySelector('[id^="year-"]'); if(yearSel) yearSel.id = `year-${newNum}`;

            // Toggles
            const radios = panel.querySelectorAll('input[type="radio"]');
            radios.forEach(r => {
                const parts = r.name.split('_'); if(parts.length > 1) r.name = `${parts[0]}_${newNum}`;
                if(r.id) r.id = r.id.replace(/\d+/, newNum); // update ID like g3_yes -> g2_yes
                if(r.nextElementSibling && r.nextElementSibling.tagName === 'LABEL') r.nextElementSibling.setAttribute('for', r.id);
                if(r.name.includes('garage')) r.setAttribute('onchange', `toggleGarage(${newNum}, '${r.value === 'yes' ? 'no' : 'yes'}')`); // Logic invertida en UI
            });
            const divG = panel.querySelector('[id^="garage-addr-"]'); if(divG) divG.id = `garage-addr-${newNum}`;

            // Botones
            const btnDel = panel.querySelector('.btn-delete-link');
            if(btnDel) { btnDel.innerHTML = `<i class="fa-solid fa-trash-can"></i> Delete Vehicle ${newNum}`; btnDel.setAttribute('onclick', `deleteCar(${newNum})`); }
            
            // Nav Interna (Prev/Next)
            const btnPrev = panel.querySelector('.btn-nav-outline[onclick*="Prev"]'); // Ojo selector
            // Mejor regeneramos los onclicks del template abajo, pero aqui actualizamos simple:
            const btnsNav = panel.querySelectorAll('.btn-nav-outline');
            btnsNav.forEach(btn => {
                const txt = btn.textContent;
                if(txt.includes('Prev')) btn.setAttribute('onclick', `switchTab('car-${newNum-1}')`);
                if(txt.includes('Next')) btn.setAttribute('onclick', `switchTab('car-${newNum+1}')`);
            });
        }
        updateNavVisibility(); // Actualizar botones
        switchTab('car-1');
        window.showToast("Vehicle list updated.", "warning");
    };

    // TEMPLATE PREMIUM (CON BOTONES PREV Y NEXT)
    function getCarTemplate(id) {
        return `
            <div style="display:flex; justify-content:flex-end; margin-bottom:20px; border-bottom:1px dashed #E2E8F0; padding-bottom:15px;">
                <button type="button" class="btn-delete-link" onclick="deleteCar(${id})"><i class="fa-solid fa-trash-can"></i> Delete Vehicle ${id}</button>
            </div>

            <div class="premium-group">
                <div class="pg-header">
                    <div class="pg-header-badge blue">
                        <i class="fa-solid fa-fingerprint"></i> IDENTIFICATION
                    </div>
                    <div class="pg-header-line"></div>
                </div>            

                <div class="inp-rich-group mb-4">
                    <label class="cov-label">Vehicle Identification Number (VIN)
                        <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('vehicle-vin')"></i>
                    </label>
                    <div class="input-rich-wrapper compact-premium theme-blue">
                        <div class="icon-slot"><i class="fa-solid fa-barcode"></i></div>
                        <input type="text" class="rich-input validate-req" placeholder="17 Characters" style="letter-spacing: 2px; font-weight: 700; text-transform: uppercase;">
                    </div>
                </div>

                <div class="grid-3-tight">
                    <div class="inp-rich-group"><label>Model Year</label><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-regular fa-calendar"></i></div><select class="rich-input validate-req" id="year-${id}"></select></div></div>
                    <div class="inp-rich-group"><label>Make</label><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-tag"></i></div><select class="rich-input validate-req" id="make-${id}" onchange="updateTabName(${id}, this.value)"></select></div></div>
                    <div class="inp-rich-group"><label>Model</label><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-car-side"></i></div><select class="rich-input validate-req"><option value="" disabled selected>Select</option><option>Model A</option><option>Model B</option></select></div></div>
                </div>

                <div class="divider-hairline"></div>

                <div class="row-switch-container">
                    <div class="switch-label-group">
                        <div class="sl-icon"><i class="fa-solid fa-location-dot"></i></div><div class="sl-text"><span class="sl-title">Garaging Address</span><span class="sl-sub">Same as home?</span></div></div>
                    <div class="aurora-toggle-segment">
                        <input type="radio" name="garage_${id}" id="g${id}_yes" value="yes" checked onchange="toggleGarage(${id}, 'no')"><label for="g${id}_yes">Yes</label>
                        <input type="radio" name="garage_${id}" id="g${id}_no" value="no" onchange="toggleGarage(${id}, 'yes')"><label for="g${id}_no">No</label>
                        <div class="segment-highlight"></div>
                    </div>
                </div>
                <div id="garage-addr-${id}" class="hidden-anim mt-3 w-100"><div class="inp-rich-group"><label>Alternate Address</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-solid fa-map-location-dot"></i></div><input type="text" class="rich-input" placeholder="Enter Address"></div></div></div>
            </div>

            <div class="premium-group">
                <div class="pg-header">
                    <div class="pg-header-badge teal">
                        <i class="fa-solid fa-shield-halved"></i> COVERAGE CONFIGURATION
                    </div>
                    <div class="pg-header-line"></div>
                </div>

                <div class="grid-2-tight">
                    <div class="inp-rich-group">
                        <label class="cov-label">Comprehensive
                            <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('comp-coverage')"></i>
                        </label>
                    <div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-cloud-showers-heavy"></i></div><select class="rich-input"><option>$500 ded</option><option>$1000 ded</option><option>No Cov</option></select></div></div>
                    <div class="inp-rich-group">
                        <label class="cov-label">Collision
                            <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('coll-coverage')"></i>
                        </label>
                    <div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-car-burst"></i></div><select class="rich-input"><option>$500 ded</option><option>$1000 ded</option><option>No Cov</option></select></div></div>
                </div>
                <div class="grid-2-tight mt-3">
                    <div class="inp-rich-group">
                        <label class="cov-label">Towing
                            <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('roadside-assistance')"></i>
                        </label>
                    <div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-truck-pickup"></i></div><select class="rich-input"><option>No Cov</option><option>$50</option></select></div></div>
                    <div class="inp-rich-group">
                        <label class="cov-label">Rental
                            <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('rental-reimbursement')"></i>
                        </label>
                    <div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-key"></i></div><select class="rich-input"><option>No Cov</option><option>$30/day</option></select></div></div>
                </div>

                <div class="extras-list-container mt-4">
                    <div class="row-switch-container compact">
                        <div class="switch-label-group">
                            <div class="sl-text"><span class="sl-title cov-label">Gap Coverage
                                <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('gap-coverage')"></i>
                            </span></div>
                        </div>
                        <div class="aurora-toggle-segment small"><input type="radio" name="gap_${id}" id="gap${id}_yes" value="yes"><label for="gap${id}_yes">Yes</label><input type="radio" name="gap_${id}" id="gap${id}_no" value="no" checked><label for="gap${id}_no">No</label><div class="segment-highlight"></div></div>
                    </div>
                    <div class="row-switch-container compact">
                        <div class="switch-label-group">
                            <div class="sl-text"><span class="sl-title cov-label">Safety Features
                                <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('safety-features')"></i>
                            </span></div>
                        </div>
                        <div class="aurora-toggle-segment small"><input type="radio" name="safe_${id}" id="safe${id}_yes" value="yes"><label for="safe${id}_yes">Yes</label><input type="radio" name="safe_${id}" id="safe${id}_no" value="no" checked><label for="safe${id}_no">No</label><div class="segment-highlight"></div></div>
                    </div>
                    <div class="row-switch-container compact">
                        <div class="switch-label-group">
                            <div class="sl-text"><span class="sl-title cov-label">Custom Equipment
                                <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('custom-equipment')"></i>
                            </span></div>
                        </div>
                        <div class="input-rich-wrapper compact-input"><span class="currency">$</span><input type="number" class="rich-input" placeholder="0"></div>
                    </div>
                </div>
            </div>


            <div class="nav-internal-row" style="margin-top:25px; display:flex; justify-content:space-between;">
                <button type="button" class="btn-nav-outline" onclick="switchTab('car-${id-1}')"><i class="fa-solid fa-chevron-left"></i> Prev Car</button>
                
                <button type="button" class="btn-nav-outline btn-next-car" onclick="switchTab('car-${id+1}')">Next Car <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        `;
    }

    // VALIDATION
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            let isValid = true;
            let firstError = null;
            const activePanel = document.querySelector('.car-panel.active');
            const reqInputs = activePanel.querySelectorAll('.validate-req');
            
            reqInputs.forEach(input => {
                const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                wrapper.classList.remove('input-error');
                if(!input.value.trim()) {
                    isValid = false; void wrapper.offsetWidth; wrapper.classList.add('input-error');
                    if (firstError === null) firstError = wrapper;
                }
            });

            if(isValid) {
                const btn = document.getElementById('btnNext');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
                setTimeout(() => { window.location.href = "quote-11.html"; }, 800);
            } else {
                window.showToast("Please complete the required vehicle fields.", "warning");
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
    
    // Inicializar visibilidad botones al carga (para Car 1)
    // Nota: Necesitas añadir manualmente el botón "Next Car" a tu HTML estático del Car 1 con la clase .btn-next-car
    updateNavVisibility();
}

/* =========================================
   LOGIC FOR STEP 9 (HABITS)
   ========================================= */
if(document.getElementById('quoteFormStep9')) {

    // 1. SWITCH DRIVER TABS
    window.switchDriverTab = function(driverId, btnElement) {
        // 1. Gestión de Tabs (Visual)
        document.querySelectorAll('.tab-int, .driver-tab').forEach(t => t.classList.remove('active'));
        if(btnElement) btnElement.classList.add('active');
        else {
            // Lógica para resaltar tab si vienes de botón Next/Prev
            const targetTab = document.querySelector(`[onclick*="'${driverId}'"]`) || document.getElementById(`tab-${driverId}`);
            if(targetTab) targetTab.classList.add('active');
        }

        // 2. SELECCIÓN DE PANELES
        const currentPanel = document.querySelector('.car-panel.active, .driver-panel.active');
        const targetPanel = document.getElementById(`panel-${driverId}`);

        // 3. DETECTAR DIRECCIÓN AUTOMÁTICAMENTE
        // Asumimos orden: d1 < d2 < d3
        const currentId = currentPanel ? currentPanel.id.replace('panel-', '') : '';
        // Comparación simple de strings funciona para 'd1' < 'd2' o 'car-1' < 'car-2'
        const direction = (driverId > currentId) ? 'next' : 'prev';

        // 4. ¡LLAMADA AL MOTOR GLOBAL!
        window.auroraTransition(currentPanel, targetPanel, direction);
    };

    // 2. VALIDATION & NEXT STEP
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            
            let isValid = true;
            let firstError = null;
            
            // Validate active panel
            const activePanel = document.querySelector('.car-panel.active');
            const inputs = activePanel.querySelectorAll('.validate-req');
            
            inputs.forEach(input => {
                const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                wrapper.classList.remove('input-error');
                
                if(!input.value.trim()) {
                    isValid = false;
                    void wrapper.offsetWidth; 
                    wrapper.classList.add('input-error');
                    if (firstError === null) firstError = wrapper;
                }
            });

            if(isValid) {
                const btn = document.getElementById('btnNext');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                
                setTimeout(() => {
                    window.location.href = "quote-10.html";
                }, 800);
            } else {
                window.showToast("Please enter daily commute miles.", "warning");
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
}

/* =========================================
   LOGIC FOR STEP 8 (EMPLOYMENT)
   ========================================= */
if(document.getElementById('quoteFormStep8')) {

    // 1. DATEPICKER WITH CALCULATION
    if(typeof flatpickr !== 'undefined') {
        flatpickr(".date-picker", { 
            dateFormat: "m/d/Y", 
            maxDate: "today", 
            disableMobile: "true",
            onChange: function(selectedDates, dateStr, instance) {
                if(selectedDates[0]) {
                    const now = new Date();
                    let years = now.getFullYear() - selectedDates[0].getFullYear();
                    // Ajuste de mes
                    const m = now.getMonth() - selectedDates[0].getMonth();
                    if (m < 0 || (m === 0 && now.getDate() < selectedDates[0].getDate())) {
                        years--;
                    }
                    years = Math.max(0, years); // Evitar negativos

                    // Buscar el input hermano
                    // Como ahora están en un grid, subimos al padre común
                    const wrapper = instance.element.closest('.inp-rich-group');
                    // Buscamos en el contexto del grid padre
                    const gridContainer = wrapper.parentElement;
                    const yearInput = gridContainer.querySelector('.years-calc');
                    
                    if(yearInput) {
                        yearInput.value = `${years} Years`;
                        // Animación visual de actualización
                        yearInput.style.color = '#10B981';
                        yearInput.style.fontWeight = '800';
                        setTimeout(() => yearInput.style.color = '', 500);
                    }
                }
            }
        });
    }

    // 2. SWITCH TABS
    window.switchDriverTab = function(driverId, btnElement) {
        // 1. Gestión de Tabs (Visual)
        document.querySelectorAll('.tab-int, .driver-tab').forEach(t => t.classList.remove('active'));
        if(btnElement) btnElement.classList.add('active');
        else {
            // Lógica para resaltar tab si vienes de botón Next/Prev
            const targetTab = document.querySelector(`[onclick*="'${driverId}'"]`) || document.getElementById(`tab-${driverId}`);
            if(targetTab) targetTab.classList.add('active');
        }

        // 2. SELECCIÓN DE PANELES
        const currentPanel = document.querySelector('.car-panel.active, .driver-panel.active');
        const targetPanel = document.getElementById(`panel-${driverId}`);

        // 3. DETECTAR DIRECCIÓN AUTOMÁTICAMENTE
        // Asumimos orden: d1 < d2 < d3
        const currentId = currentPanel ? currentPanel.id.replace('panel-', '') : '';
        // Comparación simple de strings funciona para 'd1' < 'd2' o 'car-1' < 'car-2'
        const direction = (driverId > currentId) ? 'next' : 'prev';

        // 4. ¡LLAMADA AL MOTOR GLOBAL!
        window.auroraTransition(currentPanel, targetPanel, direction);
    };

    // 3. VALIDATION
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            let isValid = true;
            let firstError = null;
            
            const activePanel = document.querySelector('.car-panel.active');
            const inputs = activePanel.querySelectorAll('.validate-req');
            
            inputs.forEach(input => {
                const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                wrapper.classList.remove('input-error');
                
                if(!input.value.trim()) {
                    isValid = false;
                    void wrapper.offsetWidth;
                    wrapper.classList.add('input-error');
                    if (firstError === null) firstError = wrapper;
                }
            });

            if(isValid) {
                const btn = document.getElementById('btnNext');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                setTimeout(() => {
                    window.location.href = "quote-9.html";
                }, 800);
            } else {
                window.showToast("Please fill in employment details.", "warning");
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    } 
}

/* =========================================
   LOGIC FOR STEP 7 (LICENSING & FILINGS) - SOLUCIÓN FINAL
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    
    const step7Container = document.getElementById('quoteFormStep7');
    const btnNext = document.getElementById('btnNext');

    if (!step7Container || !btnNext) return;

    // 1. DATEPICKERS & CALCULATIONS
    if(typeof flatpickr !== 'undefined') {
        flatpickr(".date-picker", { 
            dateFormat: "m/d/Y", 
            maxDate: "today", 
            disableMobile: "true",
            onChange: function(selectedDates, dateStr, instance) {
                if(!selectedDates[0]) return;
                const input = instance.element;
                const dateObj = selectedDates[0];
                const now = new Date();

                // A) Sincronizar Master -> Slave
                if(input.classList.contains('master-date')) {
                    const panel = input.closest('.car-panel');
                    const usBlock = panel.querySelector('div[id^="us-block-"]');
                    // Solo sincronizar si el bloque US no está deshabilitado
                    if (usBlock && !usBlock.classList.contains('disabled')) {
                        panel.querySelectorAll('.slave-date').forEach(slave => {
                            if (slave._flatpickr && !slave.value) {
                                slave._flatpickr.setDate(dateObj, true); 
                            }
                        });
                    }
                }

                // B) Antigüedad (Años)
                if(input.classList.contains('calc-years')) {
                    let years = now.getFullYear() - dateObj.getFullYear();
                    if (now.getMonth() < dateObj.getMonth() || 
                       (now.getMonth() === dateObj.getMonth() && now.getDate() < dateObj.getDate())) {
                        years--;
                    }
                    years = Math.max(0, years);
                    const wrapper = input.closest('.inp-rich-group');
                    const nextGroup = wrapper.nextElementSibling;
                    if(nextGroup) {
                        const yearInput = nextGroup.querySelector('.years-calc');
                        if(yearInput) yearInput.value = `${years} Years`;
                    }
                }

                // C) Suspensión (Meses)
                if(input.classList.contains('calc-elapsed')) {
                    let monthsDiff = (now.getFullYear() - dateObj.getFullYear()) * 12;
                    monthsDiff -= dateObj.getMonth();
                    monthsDiff += now.getMonth();
                    if (now.getDate() < dateObj.getDate()) monthsDiff--;
                    monthsDiff = Math.max(0, monthsDiff);
                    const y = Math.floor(monthsDiff / 12);
                    const m = monthsDiff % 12;
                    const section = input.closest('div[id^="susp-"]'); 
                    if(section) {
                        const yearOut = section.querySelector('.years-elapsed');
                        const monthOut = section.querySelector('.months-elapsed');
                        if(yearOut) yearOut.value = y;
                        if(monthOut) monthOut.value = m;
                    }
                }
            }
        });
    }

    // 2. TOGGLE FOREIGN LICENSE (VISUAL)
    window.toggleForeign = function(driverId, val) {
        const usBlock = document.getElementById(`us-block-${driverId}`);
        const foreignSection = document.getElementById(`foreign-section-${driverId}`);
        if(!usBlock || !foreignSection) return;
        
        if(val !== 'None') {
            // Activar Extranjero
            usBlock.classList.add('disabled'); // Marca visual para saber que está inactivo
            foreignSection.classList.remove('hidden-anim');
            foreignSection.style.display = 'block'; 
        } else {
            // Restaurar US
            usBlock.classList.remove('disabled');
            foreignSection.classList.add('hidden-anim');
            foreignSection.style.display = 'none';
        }
    };

    // 3. TOGGLE SECTIONS (SR22 / SUSP)
    window.toggleSection = function(sectionId, action) {
        const div = document.getElementById(sectionId);
        if(!div) return;

        if(action === 'yes') {
            div.classList.remove('hidden-anim');
            div.style.display = 'block'; 
            setTimeout(() => div.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        } else {
            div.classList.add('hidden-anim');
            div.style.display = 'none'; 
            div.querySelectorAll('input, select').forEach(el => {
                el.value = '';
                el.closest('.input-rich-wrapper')?.classList.remove('input-error');
            });
        }
    };

    // 4. VALIDACIÓN INTELIGENTE
    btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let isValid = true;
        let firstError = null;

        const activePanel = step7Container.querySelector('.car-panel.active') || step7Container.querySelector('.car-panel');
        const driverId = activePanel.getAttribute('data-id') || 'd1';

        // --- VALIDACIÓN SR-22 (Lógica) ---
        const sr22Radio = activePanel.querySelector(`input[name="sr22_${driverId}"]:checked`);
        if (sr22Radio && sr22Radio.value === 'yes') {
            const container = document.getElementById(`sr22-${driverId}`);
            const select = container.querySelector('select');
            if (select) {
                const wrapper = select.closest('.input-rich-wrapper');
                wrapper.classList.remove('input-error');
                if (!select.value || select.value === "") {
                    isValid = false;
                    void wrapper.offsetWidth; wrapper.classList.add('input-error');
                    if (!firstError) firstError = select;
                }
            }
        }

        // --- VALIDACIÓN SUSPENSION (Lógica) ---
        const suspRadio = activePanel.querySelector(`input[name="susp_${driverId}"]:checked`);
        if (suspRadio && suspRadio.value === 'yes') {
            const container = document.getElementById(`susp-${driverId}`);
            const dateInput = container.querySelector('input.date-picker');
            if (dateInput) {
                const wrapper = dateInput.closest('.input-rich-wrapper');
                wrapper.classList.remove('input-error');
                if (!dateInput.value || dateInput.value === "") {
                    isValid = false;
                    void wrapper.offsetWidth; wrapper.classList.add('input-error');
                    if (!firstError) firstError = dateInput;
                }
            }
        }

        // --- VALIDACIÓN DE LICENCIA (US vs FOREIGN) ---
        // Revisamos qué eligió en el Select "Do you have a foreign license?"
        const foreignSelect = activePanel.querySelector('.foreign-select');
        const isForeign = foreignSelect && foreignSelect.value !== 'None';

        // Recorremos TODOS los inputs requeridos del panel activo
        const inputs = activePanel.querySelectorAll('.validate-req');
        
        inputs.forEach(input => {
            // 1. Filtro: ¿Es un input de SR22/Suspension? (Ya validados arriba, ignorar)
            const isInOptional = input.closest(`div[id^="sr22-"], div[id^="susp-"]`);
            if (isInOptional) return;

            // 2. Filtro: LICENCIAS (Aquí está la corrección clave)
            const foreignBlock = input.closest('div[id^="foreign-section-"]');
            const usBlock = input.closest('div[id^="us-block-"]');

            // CASO A: Eligió Extranjera -> Ignorar inputs de US Block
            if (isForeign && usBlock) return;

            // CASO B: Eligió US (None) -> Ignorar inputs de Foreign Block
            if (!isForeign && foreignBlock) return;

            // Si pasa los filtros, VALIDAMOS
            const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
            wrapper.classList.remove('input-error');

            if (!input.value || input.value.trim() === "") {
                console.log("❌ Campo vacío:", input);
                isValid = false;
                void wrapper.offsetWidth;
                wrapper.classList.add('input-error');
                if (!firstError) firstError = input;
            }
        });

        if (isValid) {
            btnNext.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            setTimeout(() => {
                window.location.href = "quote-8.html";
            }, 800);
        } else {
            if(typeof window.showToast === 'function') window.showToast("Please complete the required fields.", "warning");
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus({preventScroll:true});
            }
        }
    });
});

/* =========================================
   LOGIC FOR STEP 6 (HISTORY)
   ========================================= */
/* =========================================
   LOGIC FOR STEP 6 (History) - VALIDACIÓN LÓGICA (INFALIBLE)
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    
    const step6Container = document.getElementById('quoteFormStep6');
    const btnNext = document.getElementById('btnNext');

    if (!step6Container || !btnNext) return;

    // 1. INICIALIZAR DATEPICKERS (Si existen)
    if(typeof flatpickr !== 'undefined') {
        flatpickr(".date-picker-past", { dateFormat: "m/d/Y", maxDate: "today", disableMobile: "true" });
        flatpickr(".date-picker-future", { dateFormat: "m/d/Y", minDate: "today", disableMobile: "true" });
    }

    // 2. FUNCIÓN TOGGLE (Para mostrar/ocultar visualmente)
    window.toggleHistory = function(driverId, action) {
        const wrapper = document.getElementById(`history-wrapper-${driverId}`);
        if(!wrapper) return;

        if(action === 'yes') {
            wrapper.classList.remove('hidden-anim');
            wrapper.style.display = 'block'; 
            setTimeout(() => wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        } else {
            wrapper.classList.add('hidden-anim');
            wrapper.style.display = 'none';
            // Limpiar errores visuales
            wrapper.querySelectorAll('.input-rich-wrapper').forEach(el => el.classList.remove('input-error'));
        }
    };

    // 3. VALIDACIÓN SEGURA AL DAR CLICK
    btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let isValid = true;
        let firstError = null;

        // A. Identificar Panel Activo (Driver 1, Driver 2...)
        const activePanel = step6Container.querySelector('.car-panel.active') || step6Container.querySelector('.car-panel');
        // Obtenemos el ID del conductor (ej: 'd1') desde el atributo data-id del HTML
        const driverId = activePanel.getAttribute('data-id') || 'd1';

        // B. VERIFICAR LA PREGUNTA PRINCIPAL (¿Tiene seguro?)
        // Buscamos el radio button que está "checked" para este conductor
        const radioName = `hasIns_${driverId}`;
        const selectedOption = activePanel.querySelector(`input[name="${radioName}"]:checked`);
        const userHasInsurance = selectedOption ? selectedOption.value === 'yes' : false;

        console.log(`Driver: ${driverId} | Tiene Seguro: ${userHasInsurance}`);

        // C. VALIDAR SOLO SI DIJO "YES"
        if (userHasInsurance) {
            // Buscar el contenedor de los campos
            const wrapper = document.getElementById(`history-wrapper-${driverId}`);
            
            // Buscar TODOS los inputs que deberían tener datos (Selects e Inputs)
            // IMPORTANTE: Asegúrate de que tus fechas tengan la clase 'validate-req' en el HTML
            const inputs = wrapper.querySelectorAll('.validate-req');

            if (inputs.length === 0) {
                console.warn("⚠️ OJO: No se encontraron inputs con la clase .validate-req");
            }

            inputs.forEach(input => {
                const parent = input.closest('.input-rich-wrapper') || input.parentElement;
                parent.classList.remove('input-error');

                // Validar si está vacío
                if (!input.value || input.value.trim() === "") {
                    isValid = false;
                    
                    // Marcar error
                    void parent.offsetWidth; // Reset animación
                    parent.classList.add('input-error');
                    
                    if (!firstError) firstError = input;
                }
            });
        }

        // D. RESULTADO
        if (isValid) {
            btnNext.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            setTimeout(() => {
                window.location.href = "quote-7.html";
            }, 800);
        } else {
            if(typeof window.showToast === 'function') window.showToast("Please complete the insurance details.", "warning");
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus({preventScroll: true});
        }
    });
});

/* =========================================
   LOGIC FOR STEP 5 (VIOLATIONS) - FIXED TABS
   ========================================= */
if(document.getElementById('quoteFormStep5')) {

    // 1. TOGGLE PER DRIVER
    window.toggleDriverViolations = function(driverId, val) {
        const wrapper = document.getElementById(`viol-wrapper-${driverId}`);
        const container = document.getElementById(`cards-container-${driverId}`);
        
        if(val === 'yes') {
            // Mostrar contenedor (clase .visible fuerza display block opacity 1)
            wrapper.classList.add('visible'); 
            
            // Si no hay tarjetas, agregar una automáticamente
            if(container && container.children.length === 0) {
                addViolationCard(driverId);
            }
        } else {
            // Ocultar
            wrapper.classList.remove('visible');
            
            // Limpiar errores dentro de este panel
            wrapper.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        }
    };

    // 2. SWITCH TABS (MOTOR GLOBAL)
    window.switchDriverTab = function(driverId, btnElement) {
        // Tabs Visuales
        document.querySelectorAll('.tab-int').forEach(t => t.classList.remove('active'));
        if(btnElement) btnElement.classList.add('active');
        else {
            const idx = driverId === 'd1' ? 0 : 1;
            const tabs = document.querySelectorAll('.tab-int');
            if(tabs[idx]) tabs[idx].classList.add('active');
        }

        // Paneles y Animación
        const currentPanel = document.querySelector('.car-panel.active');
        const targetPanel = document.getElementById(`panel-${driverId}`);
        const currentId = currentPanel ? currentPanel.getAttribute('data-id') : 'd1';
        const direction = (driverId > currentId) ? 'next' : 'prev';

        if (typeof window.auroraTransition === 'function') {
            window.auroraTransition(currentPanel, targetPanel, direction);
        } else {
            if(currentPanel) { currentPanel.style.display = 'none'; currentPanel.classList.remove('active'); }
            if(targetPanel) { targetPanel.style.display = 'block'; targetPanel.classList.add('active'); }
        }
    };

// 3. GENERAR TARJETA DE VIOLACIÓN (HTML DINÁMICO MEJORADO)
    window.addViolationCard = function(driverId) {
        const container = document.getElementById(`cards-container-${driverId}`);
        const cardId = `viol-${Date.now()}`;

        const cardHTML = `
            <div class="violation-card-wrapper anim-entry" id="${cardId}">
                <button type="button" class="btn-remove-card" onclick="removeViolation('${cardId}')" title="Remove">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <div class="grid-2-tight">
                    <div class="inp-rich-group" style="grid-column: 1 / -1;">
                        <label class="cov-label">Violation Type 
                            <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('violation-type')"></i>
                        </label>
                        <div class="input-rich-wrapper compact-premium theme-blue">
                                            <div class="icon-slot"><i class="fa-solid fa-triangle-exclamation"></i></div>
                            <select class="rich-input validate-req">
                                <option value="" disabled selected>Select Type...</option>
                                <optgroup label="Accidents">
                                    <option>Accident, At-Fault</option>
                                    <option>Accident, Not At-Fault</option>
                                </optgroup>
                                <optgroup label="Tickets">
                                    <option>Speeding</option>
                                    <option>Failure to Stop</option>
                                    <option>DUI / DWI</option>
                                    <option>Reckless Driving</option>
                                </optgroup>
                                <optgroup label="Claims">
                                    <option>Comprehensive Claim</option>
                                    <option>Towing / Roadside</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <div class="inp-rich-group">
                        <label>Date</label>
                        <div class="input-rich-wrapper compact-premium theme-blue">
                            <div class="icon-slot"><i class="fa-solid fa-calendar"></i></div>
                            <input type="text" class="rich-input date-picker calc-elapsed validate-req" placeholder="MM/DD/YYYY">
                        </div>
                    </div>

                    <div class="inp-rich-group">
                        <label>Time Since</label>
                        <div style="display: flex; gap: 10px;">
                            <div class="input-rich-wrapper locked" style="flex: 1; padding-left: 10px;">
                                <input type="text" class="rich-input years-since" placeholder="0" readonly style="text-align:center; font-weight:700; color:#64748B;">
                                <span style="font-size: 0.75rem; color: #94A3B8; padding-right: 10px;">Yrs</span>
                            </div>
                            <div class="input-rich-wrapper locked" style="flex: 1; padding-left: 10px;">
                                <input type="text" class="rich-input months-since" placeholder="0" readonly style="text-align:center; font-weight:700; color:#64748B;">
                                <span style="font-size: 0.75rem; color: #94A3B8; padding-right: 10px;">Mos</span>
                            </div>
                        </div>
                    </div>

                    <div class="inp-rich-group">
                        <label class="cov-label")>Payout (BI/PD)
                            <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('payout-bipd')"></i>                        
                        </label>
                        <div class="input-rich-wrapper compact-premium theme-blue">
                            <div class="icon-slot"><i class="fa-solid fa-dollar-sign"></i></div>
                            <input type="number" class="rich-input validate-req" placeholder="0">
                        </div>
                    </div>

                    <div class="inp-rich-group">
                        <label class="cov-label">Payout (Coll)
                            <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('payout-coll')"></i>
                        </label>
                        <div class="input-rich-wrapper compact-premium theme-blue">
                            <div class="icon-slot"><i class="fa-solid fa-dollar-sign"></i></div>
                            <input type="number" class="rich-input validate-req" placeholder="0">
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insertar HTML
        container.insertAdjacentHTML('beforeend', cardHTML);

        // Inicializar Flatpickr
        const newCard = document.getElementById(cardId);
        const dateInput = newCard.querySelector('.date-picker');
        
        if(typeof flatpickr !== 'undefined') {
            flatpickr(dateInput, {
                dateFormat: "m/d/Y", maxDate: "today", disableMobile: "true",
                onChange: function(selectedDates) {
                    if(selectedDates[0]) {
                        // Calcular tiempo transcurrido
                        const now = new Date();
                        let months = (now.getFullYear() - selectedDates[0].getFullYear()) * 12;
                        months -= selectedDates[0].getMonth();
                        months += now.getMonth();
                        if (now.getDate() < selectedDates[0].getDate()) months--;
                        months = Math.max(0, months);

                        const y = Math.floor(months / 12);
                        const m = months % 12;

                        // Actualizar Inputs Separados
                        const yearsInput = newCard.querySelector('.years-since');
                        const monthsInput = newCard.querySelector('.months-since');
                        
                        yearsInput.value = y;
                        monthsInput.value = m;
                        
                        // Efecto visual de "éxito"
                        yearsInput.style.color = '#10B981';
                        monthsInput.style.color = '#10B981';
                    }
                }
            });
        }
    };

    // 4. REMOVE CARD
    window.removeViolation = function(cardId) {
        const card = document.getElementById(cardId);
        if(card) {
            card.style.opacity = '0';
            setTimeout(() => card.remove(), 200);
        }
    };

    // 5. VALIDATION GLOBAL
    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.preventDefault();
            
            let isValid = true;
            let firstError = null;

            // Validar AMBOS conductores (D1 y D2)
            ['d1', 'd2'].forEach(driverId => {
                const hasViol = document.querySelector(`input[name="viol_${driverId}"]:checked`).value;
                
                if(hasViol === 'yes') {
                    const wrapper = document.getElementById(`viol-wrapper-${driverId}`);
                    
                    // 1. Validar que haya al menos una tarjeta
                    const cards = wrapper.querySelectorAll('.violation-card-wrapper');
                    if(cards.length === 0) {
                        isValid = false;
                        window.showToast(`Please add a violation for Driver ${driverId === 'd1' ? '1' : '2'} or select 'No'.`, "warning");
                        // Cambiar al tab del error
                        switchDriverTab(driverId);
                        return; 
                    }

                    // 2. Validar inputs dentro de las tarjetas
                    const inputs = wrapper.querySelectorAll('.validate-req');
                    inputs.forEach(input => {
                        const group = input.closest('.input-rich-wrapper');
                        group.classList.remove('input-error');
                        
                        if(!input.value.trim()) {
                            isValid = false;
                            group.classList.add('input-error');
                            if(!firstError) {
                                firstError = group;
                                // Cambiar al tab donde está el error
                                switchDriverTab(driverId); 
                            }
                        }
                    });
                }
            });

            if(isValid) {
                const btn = document.getElementById('btnNext');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
                setTimeout(() => { window.location.href = "quote-6.html"; }, 800);
            } else if (firstError) {
                window.showToast("Please fill in missing violation details.", "warning");
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
}

/* =========================================
   LOGIC FOR STEP 4 (DRIVERS) - FINAL ANIMATED
   ========================================= */

// --- 0. GLOBAL PAGE ANIMATION HANDLER (Ejecutar al inicio) ---
document.addEventListener('DOMContentLoaded', () => {
    // Animación de Entrada
    const wrapper = document.querySelector('.page-wrapper') || document.body;
    wrapper.classList.add('page-enter-active');
});

// Función para navegar con animación de salida
window.navigateToNextStep = function(url) {
    const wrapper = document.querySelector('.page-wrapper') || document.body;
    wrapper.classList.remove('page-enter-active');
    wrapper.classList.add('page-exit-active');
    
    // Esperar 300ms (duración de la animación) antes de cambiar
    setTimeout(() => {
        window.location.href = url;
    }, 300);
};


if(document.getElementById('quoteFormStep4')) {

    const tabsContainer = document.getElementById('driverTabs');
    const container = document.getElementById('driverFormsContainer');
    const maxDrivers = 6;

    // --- 1. TOAST HELPER ---
    window.showLocalToast = function(message, type = 'success') {
        if(typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }
        // Fallback básico
        alert(message);
    };

    // --- 2. AURORA TRANSITION (Tabs) ---
    window.auroraTransition = function(currentPanel, nextPanel) {
        if (!currentPanel || !nextPanel || currentPanel === nextPanel) return;
        nextPanel.style.pointerEvents = 'none'; 
        currentPanel.classList.remove('active', 'anim-in');
        currentPanel.classList.add('anim-out');
        setTimeout(() => {
            currentPanel.style.display = 'none';
            currentPanel.classList.remove('anim-out');
            nextPanel.style.display = 'block';
            nextPanel.classList.add('active');
            nextPanel.classList.add('anim-in');
            setTimeout(() => {
                nextPanel.classList.remove('anim-in');
                nextPanel.style.pointerEvents = 'auto';
            }, 350);
        }, 150);
    };

    // --- 3. SWITCH TABS ---
    window.switchDriverTab = function(driverId, btnElement) {
        const targetPanel = document.getElementById(`panel-${driverId}`);
        if (!targetPanel) return;

        // Visual Tabs
        document.querySelectorAll('.tab-int').forEach(t => t.classList.remove('active'));
        if(btnElement && btnElement.classList.contains('tab-int')) {
            btnElement.classList.add('active');
        } else {
            const tab = document.getElementById(`tab-${driverId}`);
            if(tab) tab.classList.add('active');
        }

        // Panels
        const currentPanel = document.querySelector('.car-panel.active');
        if (!currentPanel) {
            document.querySelectorAll('.car-panel').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
            targetPanel.style.display = 'block';
            setTimeout(() => targetPanel.classList.add('active'), 10);
            return;
        }
        window.auroraTransition(currentPanel, targetPanel);
    };

    // --- 4. EXCLUDE DRIVER (REFINADO: ORANGE TAB & ZONAL BLOCK) ---
    window.toggleExclude = function(id, action) {
        const panel = document.getElementById(`panel-d${id}`);
        const tab = document.getElementById(`tab-d${id}`);
        
        // Buscamos la zona específica dentro del panel
        const zone = panel.querySelector('.exclusion-zone');
        // Y los campos a bloquear (que están dentro de la zona)
        const fieldsToLock = panel.querySelectorAll('.field-lock-target'); 
        
        if(action === 'yes') {
            // 1. Activar Zona Visual (Solo abajo)
            if(zone) zone.classList.add('active');
            
            // 2. Modificar Tab (Naranja + Texto)
            if(tab) {
                tab.classList.add('tab-excluded');
                const span = tab.querySelector('.tab-txt');
                // Evitar duplicar texto si ya existe
                if(span && !span.innerHTML.includes('Excluded')) {
                    span.setAttribute('data-original-text', span.innerHTML); // Guardar original
                    span.innerHTML += ' <span style="font-size:0.75rem; opacity:0.8;">(Excluded)</span>';
                }
                const icon = tab.querySelector('i');
                if(icon) icon.className = 'fa-solid fa-user-slash';
            }
            
            // 3. Bloquear Inputs
            fieldsToLock.forEach(wrapper => {
                wrapper.classList.add('is-locked-excluded');
                const input = wrapper.querySelector('input, select');
                if(input) {
                    input.classList.remove('validate-req'); 
                    input.disabled = true;
                    if(input.tagName === 'SELECT') input.selectedIndex = 0;
                    else input.value = ''; 
                }
            });
            window.showLocalToast(`Driver ${id} Excluded.`, "warning");

        } else {
            // RESTAURAR
            if(zone) zone.classList.remove('active');
            
            if(tab) {
                tab.classList.remove('tab-excluded');
                const span = tab.querySelector('.tab-txt');
                // Restaurar texto original (sin "(Excluded)")
                if(span && span.hasAttribute('data-original-text')) {
                    span.innerHTML = span.getAttribute('data-original-text');
                }
                const icon = tab.querySelector('i');
                if(icon) icon.className = 'fa-solid fa-user';
            }
            
            fieldsToLock.forEach(wrapper => {
                wrapper.classList.remove('is-locked-excluded');
                const input = wrapper.querySelector('input, select');
                if(input) {
                    input.classList.add('validate-req'); 
                    input.disabled = false; 
                }
            });
            window.showLocalToast(`Driver ${id} Included.`, "success");
        }
    };

    // --- 5. TEMPLATE GENERATOR (CON ZONA DE EXCLUSIÓN) ---
    window.getDriverTemplate = function(id) {
        const isPrimary = (id === 1);
        
        const prevButtonHTML = id > 1 ? 
            `<button type="button" class="btn-nav-outline btn-prev-driver" onclick="window.switchDriverTab('d${id-1}')"><i class="fa-solid fa-chevron-left"></i> Prev Driver</button>` 
            : `<div></div>`;

        // Switch de exclusión (Solo para D2+)
        const excludeToggleHTML = isPrimary ? '' : `
            <div class="row-switch-container compact" style="margin:0; padding:5px 15px; border:none; background:transparent;">
                <span style="font-size:0.85rem; font-weight:600; color:#64748B; margin-right:10px;">Exclude?</span>
                <div class="aurora-toggle-segment small">
                    <input type="radio" name="exclude_d${id}" id="ex_d${id}_yes" value="yes" onchange="window.toggleExclude(${id}, 'yes')"><label for="ex_d${id}_yes">Yes</label>
                    <input type="radio" name="exclude_d${id}" id="ex_d${id}_no" value="no" checked onchange="window.toggleExclude(${id}, 'no')"><label for="ex_d${id}_no">No</label>
                    <div class="segment-highlight"></div>
                </div>
            </div>`;

        const removeBtnHTML = isPrimary ? '' : `
            <button type="button" class="delete-pill-btn" onclick="window.deleteDriver(${id})"><i class="fa-solid fa-trash-can"></i> Remove</button>`;

        let relationshipHTML = isPrimary ? 
            `<div class="input-rich-wrapper locked field-lock-target"><div class="icon-slot"><i class="fa-solid fa-link"></i></div><select class="rich-input" disabled><option selected>Insured (Self)</option></select></div>` :
            `<div class="input-rich-wrapper compact-premium theme-teal"><div class="icon-slot"><i class="fa-solid fa-link"></i></div><select class="rich-input validate-req"><option value="" disabled selected>Select Relation</option><option>Spouse</option><option>Child</option><option>Other</option></select></div>`;

        const bannerHTML = isPrimary 
            ? `<div class="info-banner-blue mb-4"><div class="banner-icon"><i class="fa-solid fa-circle-info"></i></div><div><strong>Primary Driver:</strong> Main applicant. Cannot be excluded.</div></div>`
            : `<div class="info-banner-blue mb-4" style="background:#F0FDF4; border-color:#BBF7D0; color:#15803D;"><div class="banner-icon" style="color:#15803D;"><i class="fa-solid fa-user-plus"></i></div><div><strong>Additional Driver:</strong> Household member.</div></div>`;

        return `
            <div class="panel-header-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                ${excludeToggleHTML}
                ${removeBtnHTML}
            </div>
            
            ${bannerHTML}

            <div class="premium-group">


                <div class="pg-header">
                    <div class="pg-header-badge blue">
                        <i class="fa-solid fa-id-card"></i> PERSONAL DETAILS
                    </div>
                    <div class="pg-header-line"></div>
                </div>
                
                <div class="grid-3-tight mb-4">
                    <div class="inp-rich-group"><label>First Name</label><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-user"></i></div><input type="text" class="rich-input validate-req" placeholder="Name" oninput="window.updateTabName(${id}, this.value)"></div></div>
                    <div class="inp-rich-group"><label>Middle</label><div class="input-rich-wrapper"><input type="text" class="rich-input" placeholder="M.I." style="text-align:center;"></div></div>
                    <div class="inp-rich-group"><label>Last Name</label><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-font"></i></div><input type="text" class="rich-input validate-req" placeholder="Last Name"></div></div>
                </div>

                <div class="grid-3-tight">
                    <div class="inp-rich-group"><label>Date of Birth</label><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-calendar"></i></div><input type="text" class="rich-input date-picker-dob validate-req" placeholder="MM/DD/YYYY"></div></div>
                    <div class="inp-rich-group"><label>Age</label><div class="input-rich-wrapper locked"><input type="text" class="rich-input age-display" placeholder="--" readonly style="text-align:center;"></div></div>
                    <div class="inp-rich-group"><label>Gender</label><div class="input-rich-wrapper compact-premium theme-blue"><div class="icon-slot"><i class="fa-solid fa-venus-mars"></i></div><select class="rich-input validate-req"><option value="" disabled selected>Select</option><option>Male</option><option>Female</option></select></div></div>
                </div>

            </div>

            <div class="exclusion-zone">

                <div class="premium-group">

                    <div class="watermark-excluded">EXCLUDED</div> 
                    <div class="pg-header">
                        <div class="pg-header-badge teal">
                            <i class="fa-solid fa-users"></i> RELATIONSHIP & LICENSE
                        </div>
                        <div class="pg-header-line"></div>
                    </div>

                    <div class="grid-2-tight">
                        <div class="inp-rich-group">
                            <label>Marital Status</label>
                            <div class="input-rich-wrapper compact-premium theme-teal">
                                 <div class="icon-slot"><i class="fa-solid fa-ring"></i></div><select class="rich-input validate-req"><option value="" disabled selected>Select</option><option>Single</option><option>Married</option><option>Divorced</option></select></div>
                        </div>
                        <div class="inp-rich-group">
                            <label>Relationship</label>
                            ${relationshipHTML}
                        </div>
                    </div>

                    <div class="inp-rich-group mt-3">
                        <label class="cov-label">Driver License / ID / Passport Number
                            <i class="fa-solid fa-circle-info tooltip-icon" onclick="showRichInfo('document-requirements')"></i>
                        </label>
                        <div class="input-rich-wrapper compact-premium theme-teal">
                            <div class="icon-slot"><i class="fa-solid fa-id-card"></i></div><input type="text" class="rich-input validate-req" placeholder="Enter DL Number"></div>
                    </div>
                </div>    
            </div>
            <div class="nav-row-right" style="justify-content: space-between;">
                ${prevButtonHTML}
                <button type="button" class="btn-nav-outline btn-next-driver" onclick="window.switchDriverTab('d${id+1}')">Next Driver <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;
    };

    // --- 6. ADD DRIVER ---
    window.addNewDriverGlobal = function() {
        const currentTabs = document.querySelectorAll('.tab-int:not(.add-btn)');
        const count = currentTabs.length;
        if(count >= maxDrivers) { window.showLocalToast("Maximum drivers reached.", "warning"); return; }
        
        const newId = count + 1;
        const newTab = document.createElement('button');
        newTab.type = 'button'; newTab.className = 'tab-int'; newTab.id = `tab-d${newId}`;
        newTab.innerHTML = `<span class="tab-txt"><i class="fa-solid fa-user"></i> Driver ${newId}</span>`;
        newTab.setAttribute('onclick', `window.switchDriverTab('d${newId}', this)`);
        
        const btnTop = document.getElementById('btnAddDriverTop');
        if(btnTop) tabsContainer.insertBefore(newTab, btnTop); else tabsContainer.appendChild(newTab);

        const newPanel = document.createElement('div');
        newPanel.className = 'car-panel'; newPanel.id = `panel-d${newId}`; newPanel.setAttribute('data-id', newId);
        newPanel.innerHTML = window.getDriverTemplate(newId);
        container.appendChild(newPanel);

        window.initDriverDatePickers(newPanel);
        window.updateNavButtons();
        window.switchDriverTab(`d${newId}`, newTab);
        window.showLocalToast(`Driver ${newId} added successfully.`, "success");
    };

    // Conectar botones
    const btnTop = document.getElementById('btnAddDriverTop');
    const btnBottom = document.getElementById('btnAddDriverBottom');
    if(btnTop) btnTop.onclick = window.addNewDriverGlobal;
    if(btnBottom) btnBottom.onclick = window.addNewDriverGlobal;

    // --- 7. DELETE DRIVER ---
    window.deleteDriver = function(id) {
        if(id == 1) { window.showLocalToast("Cannot remove primary driver.", "warning"); return; }
        document.getElementById(`tab-d${id}`).remove();
        document.getElementById(`panel-d${id}`).remove();

        const tabs = document.querySelectorAll('.tab-int:not(.add-btn)');
        const panels = container.querySelectorAll('.car-panel');
        
        tabs.forEach((t, i) => {
            if(i === 0) return; // Skip D1
            const num = i + 1;
            t.id = `tab-d${num}`;
            t.setAttribute('onclick', `window.switchDriverTab('d${num}', this)`);
            
            // IMPORTANTE: Restaurar nombre limpio al reindexar, o mantener el (Excluded) si lo estaba
            // Aquí simplificamos regenerando el nombre base, la lógica de estado se perdería al reindexar 
            // a menos que guardemos estado. Para simplicidad UI, reseteamos el visual.
            t.querySelector('.tab-txt').innerHTML = `<i class="fa-solid fa-user"></i> Driver ${num}`;
            t.classList.remove('tab-excluded');
            t.querySelector('.status-dot').className = 'status-dot success';

            const p = panels[i];
            p.id = `panel-d${num}`; p.setAttribute('data-id', num);
            
            // Limpiar estado visual de exclusión al mover paneles (se complica si no)
            // Una solución ideal regeneraría el HTML, pero aquí solo movemos IDs.
            // Aseguramos que los botones internos apunten al nuevo ID.
            const exYes = p.querySelector(`input[value="yes"]`);
            if(exYes) { 
                exYes.name = `exclude_d${num}`; exYes.setAttribute('onchange', `window.toggleExclude(${num}, 'yes')`);
            }
            const exNo = p.querySelector(`input[value="no"]`);
            if(exNo) {
                exNo.name = `exclude_d${num}`; exNo.setAttribute('onchange', `window.toggleExclude(${num}, 'no')`);
            }
            
            const btnDel = p.querySelector('.delete-pill-btn');
            if(btnDel) btnDel.setAttribute('onclick', `window.deleteDriver(${num})`);
        });

        window.updateNavButtons();
        window.switchDriverTab('d1');
        window.showLocalToast("Driver removed.", "warning");
    };

    // --- 8. UTILS ---
    window.updateNavButtons = function() {
        const panels = document.querySelectorAll('.car-panel');
        panels.forEach((p, i) => {
            const btn = p.querySelector('.btn-next-driver');
            if(btn) {
                if(i < panels.length - 1) {
                    btn.style.display = 'inline-flex';
                    btn.setAttribute('onclick', `window.switchDriverTab('d${i+2}')`);
                } else btn.style.display = 'none';
            }
        });
    };

    window.updateTabName = function(id, name) {
        const t = document.getElementById(`tab-d${id}`);
        if(t) {
            // Mantener estado visual de exclusión si existe
            const isExcluded = t.classList.contains('tab-excluded');
            const suffix = isExcluded ? ' <span style="font-size:0.75rem; opacity:0.8;">(Excluded)</span>' : '';
            const icon = isExcluded ? '<i class="fa-solid fa-user-slash"></i>' : '<i class="fa-solid fa-user"></i>';
            
            t.querySelector('.tab-txt').innerHTML = name.trim() ? `${icon} ${name}${suffix}` : `${icon} Driver ${id}${suffix}`;
        }
    };

    window.initDriverDatePickers = function(scope) {
        const t = scope || document;
        if(typeof flatpickr !== 'undefined') {
            flatpickr(t.querySelectorAll(".date-picker-dob"), {
                dateFormat: "m/d/Y", maxDate: "today", disableMobile: "true",
                onChange: function(dates, str, inst) {
                    if(dates[0]) {
                        const age = new Date().getFullYear() - dates[0].getFullYear();
                        inst.element.closest('.grid-3-tight').querySelector('.age-display').value = age;
                    }
                }
            });
        }
    };
    initDriverDatePickers();

    // --- 9. SUBMIT ---
    if (document.getElementById('btnNext')) {
        document.getElementById('btnNext').addEventListener('click', (e) => {
            e.preventDefault();
            let isValid = true;
            const activePanel = document.querySelector('.car-panel.active');
            
            activePanel.querySelectorAll('.validate-req').forEach(inp => {
                if(!inp.disabled && !inp.value.trim()) {
                    isValid = false;
                    inp.closest('.input-rich-wrapper').classList.add('input-error');
                } else {
                    inp.closest('.input-rich-wrapper').classList.remove('input-error');
                }
            });

            if(isValid) {
                const btn = document.getElementById('btnNext');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                if(window.animateAndNavigate) {
                    window.animateAndNavigate("quote-5.html");
                } else {
                    window.location.href = "quote-5.html";
                }
            } else {
                window.showLocalToast("Please complete required fields.", "warning");
            }
        });
    }

    // Inicializar
    window.updateNavButtons();
}

/* =========================================
   LOGIC FOR STEP 3 (Quote 3) - WITH WAIVER MODAL
   ========================================= */
/* ===============================================================
   LÓGICA PASO 3: CALENDARIO + VALIDACIÓN + WAIVER VISUAL
   =============================================================== */
document.addEventListener('DOMContentLoaded', function() {

    const step3Container = document.getElementById('quoteFormStep3');
    const btnNext = document.getElementById('btnNext');

    if (!step3Container || !btnNext) return;

    // -----------------------------------------------------------
    // 1. INICIALIZAR CALENDARIO (Flatpickr)
    // -----------------------------------------------------------
    const dateInput = step3Container.querySelector('.date-picker');
    if (dateInput && typeof flatpickr !== 'undefined') {
        if (dateInput._flatpickr) dateInput._flatpickr.destroy();

        flatpickr(dateInput, {
            dateFormat: "m/d/Y",
            minDate: "today",
            defaultDate: "today",
            disableMobile: "true",
            onChange: function(selectedDates, dateStr, instance) {
                const wrapper = instance.element.closest('.input-rich-wrapper');
                if(wrapper) wrapper.classList.remove('input-error', 'shake-anim');
            }
        });
    }

    // -----------------------------------------------------------
    // 2. FUNCIÓN DE NAVEGACIÓN
    // -----------------------------------------------------------
    const irAlSiguientePaso = () => {
        btnNext.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
        btnNext.style.pointerEvents = 'none';
        setTimeout(() => {
            window.location.href = "quote-4.html";
        }, 500);
    };

    // -----------------------------------------------------------
    // 3. VALIDACIÓN AL HACER CLICK
    // -----------------------------------------------------------
    btnNext.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation(); 

        // A) Limpiar errores visuales previos
        step3Container.querySelectorAll('.input-rich-wrapper').forEach(w => {
            w.classList.remove('input-error', 'shake-anim');
        });

        // B) Validar CAMPOS VACÍOS (Obligatorios)
        const inputs = step3Container.querySelectorAll('.validate-req');
        let hayErrores = false;
        let primerError = null;

        inputs.forEach(input => {
            const valor = input.value;
            // Si está vacío
            if (!valor || valor.trim() === "") {
                hayErrores = true;
                const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                
                if (wrapper) {
                    void wrapper.offsetWidth; // Reset animación
                    wrapper.classList.add('input-error', 'shake-anim');
                }
                if (!primerError) primerError = input;
            }
        });

        if (hayErrores) {
            if (primerError) primerError.focus({preventScroll: true});
            if (typeof window.showToast === 'function') window.showToast("Please select all required fields.", "warning");
            return; 
        }

        // C) Validar WAIVER (UM / UIM) con EFECTO VISUAL
        const inputUM = document.getElementById('inputUM');
        const inputUIM = document.getElementById('inputUIM');
        const modal = document.getElementById('waiverModal');
        let waiverActivado = false;

        // Función auxiliar para marcar error
        const marcarError = (elemento) => {
            const wrapper = elemento.closest('.input-rich-wrapper');
            if (wrapper) {
                void wrapper.offsetWidth;
                wrapper.classList.add('input-error', 'shake-anim');
            }
        };

        // Verificamos UM
        if (inputUM && inputUM.value === "No Coverage") {
            waiverActivado = true;
            marcarError(inputUM); // <--- ESTO AÑADE EL ROJO Y EL SHAKE
        }

        // Verificamos UIM
        if (inputUIM && inputUIM.value === "No Coverage") {
            waiverActivado = true;
            marcarError(inputUIM); // <--- ESTO AÑADE EL ROJO Y EL SHAKE
        }

        if (waiverActivado && modal) {
            // Abrir Modal
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('is-visible'), 10);
        } else {
            // Todo correcto -> Avanzar
            irAlSiguientePaso();
        }
    });

    // -----------------------------------------------------------
    // 4. BOTONES DEL MODAL
    // -----------------------------------------------------------
    const btnConfirm = document.getElementById('btnConfirmWaiver');
    const btnReturn = document.getElementById('btnReturnToCoverages');
    const modal = document.getElementById('waiverModal');

    if (modal) {
        if(btnConfirm) {
            btnConfirm.onclick = function() {
                modal.classList.remove('is-visible');
                setTimeout(() => { 
                    modal.style.display = 'none';
                    irAlSiguientePaso(); // Avanzar tras confirmar
                }, 300);
            };
        }
        if(btnReturn) {
            btnReturn.onclick = function() {
                modal.classList.remove('is-visible');
                setTimeout(() => { modal.style.display = 'none'; }, 300);
            };
        }
    }
});

/* =========================================
   LOGIC FOR STEP 2 (Address) - UPDATED
   ========================================= */
window.initStep2Logic = function() {
    const stepContainer = document.getElementById('quoteFormStep2');
    const btnNext = document.getElementById('btnNext');

    if (!stepContainer || !btnNext) return;

    // 1. CALENDARIO DE MUDANZA (Fechas Pasadas)
    if (typeof flatpickr !== 'undefined') {
        const pastDateInput = stepContainer.querySelector('.date-picker-past');
        if (pastDateInput) {
            flatpickr(pastDateInput, {
                dateFormat: "m/d/Y",
                maxDate: "today", // Importante: Solo permite hoy o antes
                disableMobile: "true",
                onChange: function(selectedDates, dateStr, instance) {
                    const wrapper = instance.element.closest('.input-rich-wrapper');
                    if(wrapper) wrapper.classList.remove('input-error');
                }
            });
        }
    }

    // 2. VALIDACIÓN Y AVANCE
    btnNext.onclick = function(e) {
        e.preventDefault();
        
        let isValid = true;
        let firstError = null;
        
        const requiredFields = stepContainer.querySelectorAll('.validate-req');

        requiredFields.forEach(field => {
            const wrapper = field.closest('.input-rich-wrapper') || field.parentElement;
            if(wrapper) wrapper.classList.remove('input-error');

            if (!field.value || field.value.trim() === "") {
                isValid = false;
                if(wrapper) {
                    void wrapper.offsetWidth; // Reflow para reiniciar animación
                    wrapper.classList.add('input-error');
                }
                if(!firstError) firstError = field;
            }
        });

        if (!isValid) {
            if(typeof window.showToast === 'function') window.showToast("Please complete your address details.", "warning");
            else alert("Please complete your address details.");

            if(firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Abrir calendario si es fecha
                if(firstError.classList.contains('date-picker-past') && firstError._flatpickr) {
                    firstError._flatpickr.open();
                } else {
                    firstError.focus({preventScroll: true});
                }
            }
        } else {
            // Éxito
            btnNext.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...';
            btnNext.style.pointerEvents = 'none';
            
            setTimeout(() => {
                window.location.href = "quote-3.html";
            }, 800);
        }
    };

    // 3. Limpieza visual de errores
    const allInputs = stepContainer.querySelectorAll('input, select');
    allInputs.forEach(input => {
        input.addEventListener('change', function() {
            if(this.value.trim()) {
                const wrapper = this.closest('.input-rich-wrapper');
                if(wrapper) wrapper.classList.remove('input-error');
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Script Loaded: Step 1 Logic & Global");

    // ============================================================
    // 1. DEFINICIÓN DE VARIABLES GLOBALES (Seguras)
    // ============================================================
    // Elementos del Paso 1
    const btnNext = document.getElementById('btnNext');
    const emailInput = document.getElementById('email');
    const emailSpan = document.getElementById('userEmailSpan');
    const modalQuotes = document.getElementById('quotesModal'); // El modal de "Welcome Back"
    
    // Botones dentro del Modal Welcome Back
    const btnStartNew = document.querySelector('.js-start-new');
    const closeButtons = document.querySelectorAll('.js-close-modal');

    // Elementos Globales (Newsletter)
    const vipForm = document.getElementById('vip-form');
    const vipInput = document.getElementById('vip-email');


    // ============================================================
    // 2. LÓGICA PASO 1: EMAIL & MODAL "WELCOME BACK"
    // ============================================================
    // Esta condición BLINDA el código. Si no hay botón next o no hay input email,
    // JS ignora este bloque y no tira error en otras páginas.
    if (btnNext && emailInput) {
        
        btnNext.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            // A. VALIDACIÓN
            const requiredFields = document.querySelectorAll('.validate-req');
            let isValid = true;
            let firstError = null;

            requiredFields.forEach(field => {
                // Limpiar errores previos
                const wrapper = field.closest('.input-rich-wrapper') || field.parentElement;
                if(wrapper) wrapper.classList.remove('input-error', 'shake-anim');
                
                let isEmpty = false;
                if(field.type === 'checkbox') {
                    isEmpty = !field.checked;
                } else {
                    isEmpty = !field.value.trim();
                }

                if (isEmpty) {
                    isValid = false;
                    const target = field.closest('.input-rich-wrapper') || field;
                    
                    void target.offsetWidth; // Reiniciar animación
                    target.classList.add('input-error', 'shake-anim');
                    
                    if(field.type === 'checkbox') {
                        const checkWrapper = field.closest('.custom-check-wrapper') || field;
                        if(checkWrapper) checkWrapper.classList.add('input-error'); 
                    }

                    if(!firstError) firstError = field;
                }
            });

            // Si hay error, detener
            if (!isValid) {
                if(firstError) firstError.focus();
                return;
            }

            // B. ÉXITO -> PROCESAR Y ABRIR MODAL
            const originalText = btnNext.innerHTML;
            btnNext.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking Account...';
            btnNext.style.pointerEvents = 'none';
            
            setTimeout(() => {
                // Restaurar botón
                btnNext.innerHTML = originalText;
                btnNext.style.pointerEvents = 'auto';
                
                // Poner correo en el modal (BLINDADO)
                if(emailSpan && emailInput.value) {
                    emailSpan.textContent = emailInput.value;
                }
                
                // ABRIR MODAL (Usando clase is-visible)
                if(modalQuotes) {
                    modalQuotes.style.display = 'flex'; // Asegurar display flex
                    setTimeout(() => modalQuotes.classList.add('is-visible'), 10);
                } 
            }, 800);
        });

        // C. LÓGICA DE BOTONES DENTRO DEL MODAL (Solo si estamos en este paso)
        
        // Función cerrar modal
        const closeModal = () => {
            if(modalQuotes) {
                modalQuotes.classList.remove('is-visible');
                setTimeout(() => modalQuotes.style.display = 'none', 300);
            }
        };

        // Asignar cierre a todos los botones correspondientes
        if(closeButtons) {
            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
        }

        // Botón Start New Quote
        if(btnStartNew) {
            btnStartNew.addEventListener('click', () => {
                btnStartNew.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
                setTimeout(() => {
                    window.location.href = "quote-2.html"; 
                }, 800);
            });
        }
    }


    // ============================================================
    // 3. UTILIDADES GLOBALES (Funcionan en todos los pasos)
    // ============================================================
    
    // Limpiar errores al escribir (Input Listener)
    const allInputs = document.querySelectorAll('.validate-req');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            const wrapper = this.closest('.input-rich-wrapper');
            if(wrapper) wrapper.classList.remove('input-error', 'shake-anim');
        });
        if(input.type === 'checkbox') {
            input.addEventListener('change', function() {
                const checkWrapper = this.closest('.custom-check-wrapper') || this;
                if(checkWrapper) checkWrapper.classList.remove('input-error');
            });
        }
    });

    // ============================================================
    // 4. LÓGICA NEWSLETTER (VIP FORM - GLOBAL)
    // ============================================================
    if (vipForm && vipInput) {
        vipForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailValue = vipInput.value.trim();

            if (!emailValue) {
                if (typeof showToast === 'function') showToast("Please enter your email address first.", "warning");
                vipInput.focus();
                return;
            }

            if (!emailValue.includes('@') || !emailValue.includes('.')) {
                if (typeof showToast === 'function') showToast("Please enter a valid email address.", "warning");
                return;
            }

            // Simular envío
            const btn = vipForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Joining...";
            
            setTimeout(() => {
                btn.innerText = originalText;
                vipInput.value = "";
                if (typeof showToast === 'function') {
                    showToast("Welcome to the club! Subscription active.", "success");
                }
            }, 1000);
        });
    }

// --- NEWSLETTER SUBSCRIPTION (VIP Subscriber) - ADAPTADO A TU HTML ACTUAL ---
// 1. Seleccionamos los elementos por su CLASE
    const nlForm = document.querySelector('.nl-form');
    // Buscamos el input dentro del formulario para ser más específicos
    const nlInput = nlForm ? nlForm.querySelector('.nl-input') : null;

    // 2. Verificamos que existan para evitar errores
    if (nlForm && nlInput) {
        
        nlForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita la recarga de la página
            
            const emailValue = nlInput.value.trim();

            // Validación 1: Campo vacío
            if (!emailValue) {
                if (typeof showToast === 'function') {
                    showToast("Please enter your email address first.", "warning");
                }
                nlInput.focus();
                return;
            }

            // Validación 2: Formato de email simple
            if (!emailValue.includes('@') || !emailValue.includes('.')) {
                if (typeof showToast === 'function') {
                    showToast("Please enter a valid email address.", "warning");
                }
                return;
            }

            // 3. Simulación de envío (Loading state)
            const btn = nlForm.querySelector('.btn-nl-submit'); // Seleccionamos el botón
            const originalText = btn.innerText;
            
            btn.innerText = "Subscribing..."; // Cambiamos texto temporalmente
            btn.disabled = true; // Opcional: Deshabilitar botón para evitar doble click
            
            setTimeout(() => {
                // Restaurar estado original
                btn.innerText = originalText;
                btn.disabled = false; 
                nlInput.value = ""; // Limpiar el input
                
                // Mensaje de éxito
                if (typeof showToast === 'function') {
                    showToast("Thanks for subscribing! You are on the list.", "success");
                }
            }, 1000);
        });
    }

});
/* =========================================
   CONTACT FORM LOGIC
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById('main-contact-form');
    if (!contactForm) return;

    // Seleccionar inputs requeridos
    const inputs = contactForm.querySelectorAll('[required]');

    // Limpieza de errores al interactuar
    inputs.forEach(input => {
        const clearError = () => {
            const wrapper = input.parentElement; // El contenedor .float-group
            wrapper.classList.remove('input-error');
            wrapper.classList.remove('shake-anim');
        };

        // Limpiar al escribir o cambiar
        input.addEventListener('input', clearError);
        input.addEventListener('change', clearError);
    });

    // Manejo del envío
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        let firstError = null;

        inputs.forEach(input => {
            const val = input.value.trim();
            const wrapper = input.parentElement; // Seleccionamos el PADRE

            if (!val) {
                isValid = false;
                
                // 1. Aseguramos limpieza previa para reiniciar animación
                wrapper.classList.remove('shake-anim');
                
                // 2. Forzar "Reflow" (necesario para reiniciar animaciones CSS)
                void wrapper.offsetWidth; 
                
                // 3. Aplicar clases al CONTENEDOR (Todo el bloque se mueve y se pinta)
                wrapper.classList.add('input-error');
                wrapper.classList.add('shake-anim');
                
                // 4. Quitar solo el movimiento tras 0.5s (el rojo se queda)
                setTimeout(() => wrapper.classList.remove('shake-anim'), 500);

                if (!firstError) firstError = input;
            }
        });

        // Caso especial: Validación de Email
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.value && !emailInput.value.includes('@')) {
            const wrapper = emailInput.parentElement;
            
            isValid = false;
            if (typeof showToast === 'function') {
                showToast("Please enter a valid email address.", "warning");
            }

            wrapper.classList.remove('shake-anim');
            void wrapper.offsetWidth;
            wrapper.classList.add('input-error');
            wrapper.classList.add('shake-anim');
            setTimeout(() => wrapper.classList.remove('shake-anim'), 500);
            
            if (!firstError) firstError = emailInput;
        }

        if (!isValid) {
            if (typeof showToast === 'function') {
                showToast("Please check the highlighted fields.", "warning");
            }
            if (firstError) firstError.focus();
            return; // Detener aquí si hay errores
        }

        // --- SI TODO ESTÁ BIEN: ENVIAR ---
        
        // Simulación Envío (Tu botón premium)
        const btn = contactForm.querySelector('button[type="submit"]');
        const contentWrapper = btn.querySelector('.btn-content-wrapper'); // Contenedor del texto
        const originalContent = contentWrapper.innerHTML;
        
        btn.disabled = true;
        // Spinner de carga
        contentWrapper.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.2rem;"></i><span style="margin-left:8px;">Sending...</span>`;

        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast("Message sent successfully!", "success");
            }
            contactForm.reset();
            
            // Estado de éxito visual en el botón
            btn.classList.add('success-state');
            contentWrapper.innerHTML = `<i class="fa-solid fa-check-circle" style="font-size: 1.3rem;"></i><span style="margin-left:8px;">Sent!</span>`;
            
            // Restaurar botón original
            setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove('success-state');
                
                // Transición suave de opacidad para cambiar el texto
                contentWrapper.style.opacity = '0';
                setTimeout(() => {
                    contentWrapper.innerHTML = originalContent;
                    contentWrapper.style.opacity = '1';
                }, 200);
            }, 3000);
        }, 1500);
    });
}

/**
 * UTILITY: Toast Notification System
 * Asegura que funcione aunque falte el contenedor en HTML
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    
    // Auto-crear contenedor si no existe
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    
    // Iconos y colores
    let iconClass = 'fa-circle-check';
    let cssClass = 'alex-toast'; // Clase base

    if (type === 'success') {
        cssClass += ' success';
        iconClass = 'fa-circle-check';
    } else if (type === 'warning') {
        cssClass += ' warning';
        iconClass = 'fa-triangle-exclamation';
    } else if (type === 'error') {
        cssClass += ' danger';
        iconClass = 'fa-circle-xmark';
    }

    toast.className = cssClass;
    toast.innerHTML = `
        <div class="toast-icon-box"><i class="fa-solid ${iconClass}"></i></div>
        <div class="toast-content">
            <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="toast-sub">${message}</span>
        </div>
    `;
    
    container.appendChild(toast);

    // Animación Entrada
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    // Auto eliminar
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Selectores
    const bindBtn = document.querySelector('.btn-bind-aurora'); 
    const modal = document.getElementById('bindSuccessModal');
    const btnHome = document.getElementById('btnGoHome');
    const btnQuotes = document.getElementById('btnBackToQuotes');

    if (bindBtn && modal) {
        
        // Clonar para limpiar eventos
        const newBindBtn = bindBtn.cloneNode(true);
        bindBtn.parentNode.replaceChild(newBindBtn, bindBtn);

        newBindBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // 1. Estado de carga en el botón
            const originalHTML = newBindBtn.innerHTML;
            newBindBtn.style.pointerEvents = 'none';
            newBindBtn.innerHTML = `
                <div class="btn-content" style="align-items:center; width:100%; justify-content:center; flex-direction:row; gap:10px;">
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                    <span class="btn-title">Binding Policy...</span>
                </div>
            `;

            // 2. Simular envío (1.5s)
            setTimeout(() => {
                newBindBtn.innerHTML = originalHTML;
                newBindBtn.style.pointerEvents = 'auto';

                // 3. Abrir Modal
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('active'), 10);
            }, 1500);
        });
    }

    // Acción: Home
    if(btnHome) {
        btnHome.addEventListener('click', function() {
            btnHome.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redirecting...';
            setTimeout(() => {
                window.location.href = "https://alexai.cloud"; // Ajusta tu URL
            }, 500);
        });
    }

    // Acción: Volver a Ofertas
    if(btnQuotes) {
        btnQuotes.addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                window.location.href = "quote-14.html"; // Si necesitas redirección
            }, 300);
        });
    }
});

    /* =========================================
    LOGICA DEL MODAL COMPARADOR & TABS
    ========================================= */

/* --- MODAL COMPARADOR LOGIC --- */

// 1. ABRIR (Llamar con onclick="openCompareModal()")
function openCompareModal() {
    const modal = document.getElementById('compareModal');
    if(modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// 2. CERRAR
function closeCompareModal() {
    const modal = document.getElementById('compareModal');
    if(modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// 3. CAMBIAR TABS (Nissan vs GMC)
function switchCompTab(tabId, btn) {
    // a. Desactivar todos
    document.querySelectorAll('.veh-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.comp-tab-content').forEach(c => c.classList.remove('active'));
    
    // b. Activar seleccionado
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 4. CERRAR CON ESCAPE
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCompareModal();
});

/* =========================================
   RICH MEDIA TOOLTIP SYSTEM
   ========================================= */

// BASE DE DATOS DE TOOLTIPS
const RICH_TOOLTIPS = {
    
    'bodily-injury': {
        title: "Bodily Injury Liability",
        type: 'icon', 
        src: 'fa-user-injured', // Icono de persona lastimada
        theme: 'purple',        // Gradiente morado elegante
        desc: "This is your financial shield. It pays for the medical expenses and lost wages of other people if you are at fault in an accident.",
        example: "You accidentally rear-end a car at a stoplight. The other driver suffers whiplash. This coverage pays for their ambulance, ER visit, and physical therapy."
    },

    'property-damage': {
        title: "Property Damage Liability",
        type: 'icon',
        src: 'fa-car-burst', // Icono de choque/daño
        theme: 'teal',       // Gradiente Turquesa (Fresco y Financiero)
        desc: "Pays for damage you cause to another person's property with your vehicle. It covers other cars, fences, lamp posts, or buildings.",
        example: "You slide on a wet road and hit a parked car and a neighbor's mailbox. This coverage pays to repair both the other car and the mailbox."
    },

    'uninsured-motorist': {
        title: "Uninsured Motorist (UM)",
        type: 'icon',
        src: 'fa-user-shield', // Escudo protegiendo al usuario
        theme: 'orange',       // Naranja (Alerta)
        desc: "Pays for your medical bills if you are hit by a driver who has NO insurance or in a hit-and-run scenario.",
        example: "A driver runs a red light, hits your car, and flees the scene (hit-and-run). UM covers your injuries since the other driver can't be found."
    },

    // 4. UNDERINSURED MOTORIST (UIM)
    'underinsured-motorist': {
        title: "Underinsured Motorist (UIM)",
        type: 'icon',
        src: 'fa-scale-unbalanced', // Balanza desequilibrada
        theme: 'orange',            // Naranja (Alerta)
        desc: "Kicks in when the at-fault driver has insurance, but their limits are too low to pay for all your medical bills.",
        example: "The other driver's policy limit is $25k, but your medical bills are $50k. UIM pays the remaining $25k difference."
    },

    // 5. MEDICAL PAYMENTS
    'medical-payments': {
        title: "Medical Payments (MedPay)",
        type: 'icon',
        src: 'fa-briefcase-medical', // Maletín médico
        theme: 'red',                // Rojo (Salud)
        desc: "Pays for immediate medical/funeral expenses for you or your passengers, regardless of who was at fault.",
        example: "You slam on the brakes and your passenger hits their head on the dashboard. MedPay covers their ambulance and X-rays instantly, with no deductible."
    },

    // 6. ACCIDENTAL DEATH
    'accidental-death': {
        title: "Accidental Death Indemnity",
        type: 'icon',
        src: 'fa-ribbon', // Lazo conmemorativo
        theme: 'blue',    // Azul oscuro (Seriedad/Luto)
        desc: "Provides a lump-sum cash payment to your beneficiaries if a covered person passes away due to injuries from a car accident.",
        example: "Provides financial support for funeral costs or lost income to the family in the worst-case scenario."
    },

    // 7. EFFECTIVE DATE
    'effective-date': {
        title: "Policy Effective Date",
        type: 'icon',
        src: 'fa-calendar-check', // Calendario activado
        theme: 'green',           // Verde (Inicio/Go)
        desc: "The exact moment your coverage begins. Accidents happening *before* this date/time are NOT covered.",
        example: "If you select tomorrow as your start date, you are not insured for your drive home tonight."
    },

    // 8. DOCUMENT REQUIREMENTS
    'document-requirements': {
        title: "Accepted Documents",
        type: 'icon',
        src: 'fa-passport', // Icono de pasaporte/ID
        theme: 'blue',      // Azul (Identidad)
        desc: "We accept various forms of government-issued ID to verify your identity and driving history.",
        example: "You can use a US Driver's License, State ID, Foreign License, Matricula Consular, or an International Passport."
    },

    // 9. VIOLATION TYPE (General)
    'violation-type': {
        title: "Traffic Violations & Claims",
        type: 'icon',
        src: 'fa-triangle-exclamation', // Triángulo de alerta
        theme: 'orange',                 // Naranja (Precaución)
        desc: "Any tickets, accidents, or claims in the last 3-5 years. These impact your driving score.",
        example: "Includes Speeding, At-Fault Accidents, DUIs, or even Roadside Assistance claims depending on the carrier."
    },

    // 10. PAYOUT BI/PD (Bodily Injury / Property Damage)
    'payout-bipd': {
        title: "Payout: Injury & Property",
        type: 'icon',
        src: 'fa-hand-holding-dollar', // Mano entregando dinero
        theme: 'teal',                  // Turquesa (Dinero saliente)
        desc: "The total amount the insurance company paid to *other people* for their injuries or damage to their car/property in an accident you caused.",
        example: "You hit a fence. The insurance paid the neighbor $2,000 to fix it. Enter $2,000 here."
    },

    // 11. PAYOUT COLLISION
    'payout-coll': {
        title: "Payout: Collision",
        type: 'icon',
        src: 'fa-car-crash', // Auto dañado
        theme: 'blue',       // Azul (Tu activo)
        desc: "The amount the insurance company paid to repair *your own vehicle* after an accident.",
        example: "You backed into a pole. The body shop charged $1,500 to fix your bumper, paid by insurance. Enter $1,500 here."
    },
    // 12. PRIOR CARRIER
    'prior-carrier': {
        title: "Prior Insurance Carrier",
        type: 'icon',
        src: 'fa-building-shield', // Edificio con escudo
        theme: 'blue',             // Corporativo
        desc: "The company that currently insures you. Proof of prior insurance (continuous coverage) unlocks the biggest discounts.",
        example: "Select 'None' only if you are currently uninsured. Otherwise, choose your current provider (e.g., Geico, Progressive)."
    },

    // 13. PRIOR LIABILITY LIMITS
    'prior-limits': {
        title: "Prior Liability Limits",
        type: 'icon',
        src: 'fa-arrow-up-right-dots', // Gráfica subiendo / Niveles
        theme: 'purple',               // Estatus/Nivel
        desc: "Your current coverage amounts for Bodily Injury. Higher prior limits show financial responsibility and often result in a cheaper quote now.",
        example: "Check your current policy DEC page. Common limits are 25/50 (State Min), 50/100, or 100/300 (High)."
    },

    // 14. PRIOR TRANSFER LEVEL
    'transfer-level': {
        title: "Transfer Discount Level",
        type: 'icon',
        src: 'fa-medal',   // Medalla de premio
        theme: 'orange',   // Dorado/Naranja (Recompensa)
        desc: "This rating rewards your history of continuous coverage. Higher levels unlock deeper 'Welcome Discounts' on your new policy.",
        example: "• No Prior: Currently uninsured.\n• Level 1: Standard (6+ months insured).\n• Level 2: Preferred (1+ years).\n• Level 3: Elite (3+ years w/ high limits)."
    },

    // 15. US DRIVING EXPERIENCE
    'us-experience': {
        title: "US Driving History",
        type: 'icon',
        src: 'fa-road',     // Carretera
        theme: 'blue',      // Azul (Historial)
        desc: "The total time you have held a valid driver's license in the United States. This is a key factor in calculating your rate.",
        example: "New drivers (less than 3 years) typically see higher rates. 3+ years of continuous history unlocks standard pricing."
    },

    // 16. FOREIGN LICENSE
    'foreign-license': {
        title: "International / Foreign License",
        type: 'icon',
        src: 'fa-globe-americas', // Mundo/Global
        theme: 'purple',          // Morado (Identidad)
        desc: "We insure drivers with non-US licenses! Select the type of permit or license you currently hold.",
        example: "Valid for: Mexico License, Canadian License, International Permits, or Matricula Consular identification."
    },

    // 17. SR-22 FILING
    'sr22-filing': {
        title: "SR-22 Filing Certificate",
        type: 'icon',
        src: 'fa-file-signature', // Documento con firma
        theme: 'orange',          // Naranja (Trámite)
        desc: "A form we file with the state DMV to prove you have active liability insurance. Required often after a DUI or driving without insurance.",
        example: "If the DMV told you that you need an 'SR-22' to reinstate your license, select 'Yes' here."
    },

    // 18. LICENSE SUSPENDED
    'license-suspended': {
        title: "License Status",
        type: 'icon',
        src: 'fa-ban',      // Prohibido / Semáforo rojo
        theme: 'red',       // Rojo (Alerta)
        desc: "Indicates if your driving privilege is currently revoked or suspended. We may still be able to insure you with a 'Non-Owner' policy or SR-22.",
        example: "Be honest here. We run MVR reports, and accurate info now prevents rate changes later."
    },

    // 19. EMPLOYMENT INFO (Industry / Occupation)
    'employment-details': {
        title: "Employment & Occupation",
        type: 'icon',
        src: 'fa-briefcase',  // Maletín
        theme: 'blue',        // Azul (Profesional)
        desc: "Insurers use occupation data to predict risk. Certain professions (like engineers, teachers, or scientists) often qualify for 'Affinity Discounts'.",
        example: "Select the industry that best fits your current job. If retired or a student, select those specific options for accurate rating."
    },

    // 20. EDUCATION LEVEL
    'education-level': {
        title: "Education Level",
        type: 'icon',
        src: 'fa-graduation-cap', // Gorro de graduación
        theme: 'purple',          // Morado (Logro)
        desc: "Statistically, drivers with higher education levels tend to have fewer accidents. This can unlock the 'Professional' or 'Good Student' discount.",
        example: "Select your highest degree completed (e.g., High School, Bachelors, Masters, PhD)."
    },

    // 21. RESIDENCE TYPE
    'residence-type': {
        title: "Residence Type",
        type: 'icon',
        src: 'fa-city',       // Edificios/Ciudad
        theme: 'teal',        // Turquesa (Entorno)
        desc: "Where you live determines parking risks (street vs. garage) and density. A Mobile Home is rated differently than a high-rise Condo.",
        example: "• Home: Single family detached.\n• Apt/Condo: Shared walls/parking.\n• Mobile Home: Manufactured housing."
    },

    // 22. OWNERSHIP STATUS
    'ownership-status': {
        title: "Home Ownership",
        type: 'icon',
        src: 'fa-house-user', // Persona en casa
        theme: 'orange',      // Naranja (Activo/Dueño)
        desc: "Homeowners often get significant discounts (up to 15%) on auto insurance due to stability factors, even if they don't bundle policies.",
        example: "Select 'Own' if you pay a mortgage or own it outright. Select 'Rent' if you have a landlord."
    },

    // 23. VIN
    'vehicle-vin': {
        title: "Vehicle Identification Number (VIN)",
        type: 'icon',
        src: 'fa-barcode',   // Código de barras
        theme: 'blue',       // Azul (Identidad)
        desc: "The unique 17-character serial number. It tells us the exact trim, engine, and factory safety features of your car.",
        example: "Found on your dashboard (driver's side), inside the driver's door jamb, or on your registration card."
    },

    // 24. COMPREHENSIVE (Other-than-Collision)
    'comp-coverage': {
        title: "Comprehensive Coverage",
        type: 'icon',
        src: 'fa-cloud-bolt', // Rayo/Naturaleza
        theme: 'teal',        // Turquesa (Eventos externos)
        desc: "Pays for damage NOT caused by a crash. This includes theft, vandalism, fire, weather (hail/flood), and hitting animals.",
        example: "If a tree falls on your car or you hit a deer, Comprehensive pays the repairs minus your deductible."
    },

    // 25. COLLISION
    'coll-coverage': {
        title: "Collision Coverage",
        type: 'icon',
        src: 'fa-car-crash',  // Choque
        theme: 'orange',      // Naranja (Impacto)
        desc: "Pays to repair YOUR car if you hit another vehicle or object (pole, wall), regardless of who was at fault.",
        example: "Required if you have a loan/lease. If you select 'No Coverage', you pay 100% of your own repairs."
    },

    // 26. TOWING / RENTAL
    'roadside-assistance': {
        title: "Roadside Assistance",
        type: 'icon',
        src: 'fa-truck-pickup', // Grúa
        theme: 'purple',        // Morado (Servicio)
        desc: "Emergency help if your car breaks down, you get a flat tire, run out of gas, or lock your keys inside.",
        example: "Your car dies on the freeway. This covers the cost of the tow truck to the nearest repair shop."
    },

    // 27. RENTAL REIMBURSEMENT
    'rental-reimbursement': {
        title: "Rental Reimbursement",
        type: 'icon',
        src: 'fa-car-side',     // Coche lateral
        theme: 'purple',        // Morado (Servicio)
        desc: "Pays for a rental car while yours is being repaired as part of a *covered insurance claim* (e.g., after an accident).",
        example: "A crash puts your car in the shop for 10 days. This coverage pays $30-$50 per day for a rental so you can still get to work."
    },

    // 28. GAP COVERAGE
    'gap-coverage': {
        title: "Gap Insurance",
        type: 'icon',
        src: 'fa-bridge',     // Puente (Gap)
        theme: 'green',       // Verde (Dinero)
        desc: "Pays the difference (the gap) between what you owe on your loan and the car's actual cash value if it's totaled.",
        example: "Loan balance: $25k. Car value: $20k. Without Gap, you still owe the bank $5k after a total loss."
    },

    // 29. CUSTOM EQUIPMENT
    'custom-equipment': {
        title: "Custom Equipment (CPE)",
        type: 'icon',
        src: 'fa-screwdriver-wrench', // Herramientas
        theme: 'blue',
        desc: "Coverage for aftermarket parts NOT installed by the factory (e.g., custom rims, stereo, lift kits, wraps).",
        example: "Standard policies only cover stock parts. Enter the value of your upgrades here to insure them."
    },
    
    // 30. SAFETY FEATURES
    'safety-features': {
        title: "Vehicle Safety Features",
        type: 'icon',
        src: 'fa-shield-cat', // Escudo con agilidad / Protección
        theme: 'green',       // Verde (Seguridad = Descuento)
        desc: "Modern safety tech reduces accident risk and theft. Checking these boxes can unlock the 'Passive Restraint' and 'Anti-Theft' discounts.",
        example: "• Anti-Theft: Alarm or GPS tracker.\n• Blind Spot: Lights on mirror when changing lanes.\n• Lane Assist: Beeps if you drift."
    },

    // 31. LIENHOLDER / OWNERSHIP
    'lienholder-info': {
        title: "Financial Interest (Lienholder)",
        type: 'icon',
        src: 'fa-file-invoice-dollar', // Factura/Dólar
        theme: 'blue',                 // Azul (Corporativo)
        desc: "If you have a loan or lease, the bank owns part of the car. We must list them as a 'Loss Payee' to protect their asset.",
        example: "• Owned: No bank involved.\n• Financed: You pay a loan (e.g., Toyota Financial).\n• Leased: You return the car later."
    },

    // 32. ODOMETER
    'vehicle-odometer': {
        title: "Current Odometer",
        type: 'icon',
        src: 'fa-gauge-high', // Tacómetro
        theme: 'blue',
        desc: "The current total mileage on the vehicle. This helps verify the car's condition and annual usage.",
        example: "Read the dashboard directly. Do not estimate. Example: 45,200 miles."
    },

    // 33. VEHICLE VALUES (MSRP & ACV)
    'vehicle-values': {
        title: "MSRP vs. ACV",
        type: 'icon',
        src: 'fa-tag',        // Etiqueta de precio
        theme: 'teal',        // Turquesa (Valor)
        desc: "MSRP is the original 'Sticker Price' when new. ACV (Actual Cash Value) is what the car is worth TODAY (depreciated).",
        example: "• MSRP: $30,000 (New 2020).\n• ACV: $18,500 (Used value now).\nGAP coverage covers the difference if you owe more than ACV."
    },

    // 34. ANTI-THEFT LEVELS
    'anti-theft-levels': {
        title: "Anti-Theft System Type",
        type: 'icon',
        src: 'fa-lock',       // Candado
        theme: 'green',       // Verde (Seguridad)
        desc: "The type of security system installed. Higher levels (Passive/GPS) get bigger discounts.",
        example: "• Level 4 (Passive): Disables engine without the chipped key (Standard on most modern cars).\n• Level 5 (GPS): LoJack or OnStar tracking."
    },

    // 35. VEHICLE STATUS FLAGS
    'vehicle-status-flags': {
        title: "Special Vehicle Status",
        type: 'icon',
        src: 'fa-circle-exclamation', // Alerta
        theme: 'orange',              // Naranja (Atención)
        desc: "Check these boxes ONLY if they apply. These special conditions affect eligibility and valuation.",
        example: "• Salvage: Previously totaled/rebuilt title.\n• Grey Market: Imported non-US spec.\n• Monitoring: Usage-based device (Snapshot/DriveSafe)."
    },

    // 36. GENERAL COVERAGE GUIDE (Master Tooltip)
    'general-coverages': {
        title: "How Auto Insurance Works",
        type: 'icon',
        src: 'fa-layer-group',  // Capas / Paquete
        theme: 'blue',          // Azul (Educativo)
        desc: "Your policy is a custom bundle of protections. You can mix and match limits to find the perfect balance of price and safety.",
        example: "• Liability: Pays *others* (Required).\n• Vehicle: Fixes *your car* (Comp & Collision).\n• Medical: Pays *your injuries* (MedPay)."
    }
};

// FUNCIÓN PARA ABRIR
window.showRichInfo = function(key) {
    const data = RICH_TOOLTIPS[key];
    const modal = document.getElementById('richInfoModal');
    
    if (!data || !modal) return;

    // 1. Textos
    document.getElementById('richTitle').innerText = data.title;
    document.getElementById('richDesc').innerText = data.desc;
    document.getElementById('richExample').innerText = data.example;

    // 2. Configurar Header (Color y Media)
    const header = document.getElementById('richHeaderColor');
    const container = document.getElementById('richMediaContainer');
    
    // Resetear clases de color
    header.className = 'rich-media-header'; 
    // Aplicar gradientes según el tema
    if(data.theme === 'blue') header.style.background = 'linear-gradient(135deg, #EFF6FF 0%, #009CFF 100%)';
    if(data.theme === 'orange') header.style.background = 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)';
    if(data.theme === 'purple') header.style.background = 'linear-gradient(135deg, #F5F3FF 0%, #514690 100%)';
    if(data.theme === 'teal') header.style.background = 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)';
    if(data.theme === 'red')    header.style.background = 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)';
    if(data.theme === 'green')  header.style.background = 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';

    // 3. Inyectar Visual (Icono o Imagen)
    if(data.type === 'icon') {
        // Color del icono según tema
        let color = '#009CFF';
        if(data.theme === 'orange') color = '#F59E0B';
        if(data.theme === 'purple') color = '#514690';
        if(data.theme === 'teal') color = '#14B8A6';
        if(data.theme === 'red')    color = '#EF4444';
        if(data.theme === 'green')  color = '#10B981';

        container.innerHTML = `<i class="fa-solid ${data.src} rich-img-icon" style="color:${color}"></i>`;
    } else if (data.type === 'image') {
        container.innerHTML = `<img src="${data.src}" class="rich-img-real" alt="Illustration">`;
    }

    // 4. Mostrar
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
};

// FUNCIÓN CERRAR
window.closeRichInfo = function() {
    const modal = document.getElementById('richInfoModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
};

// Cerrar con click fuera
document.getElementById('richInfoModal')?.addEventListener('click', (e) => {
    if(e.target.id === 'richInfoModal') closeRichInfo();
});