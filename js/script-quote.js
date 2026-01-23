/**
 * AURORA TRANSITION ENGINE
 * Maneja la transición suave entre cualquier tipo de paneles.
 * @param {HTMLElement} currentPanel - El panel que se va.
 * @param {HTMLElement} nextPanel - El panel que entra.
 * @param {string} direction - 'next' (entra derecha) o 'prev' (entra izquierda).
 */
window.auroraTransition = function(currentPanel, nextPanel, direction = 'next') {
    if (!currentPanel || !nextPanel || currentPanel === nextPanel) return;

    // 1. Bloquear interacción rápida (opcional, previene doble clic)
    nextPanel.style.pointerEvents = 'none';

    // 2. Definir clases según dirección
    // Si voy a 'next', el actual sale a la izquierda (exit-left) y el nuevo entra por la derecha (enter-right)
    const exitClass = direction === 'next' ? 'anim-exit-left' : 'anim-exit-right';
    const enterClass = direction === 'next' ? 'anim-enter-right' : 'anim-enter-left';

    // 3. Ejecutar Salida
    currentPanel.classList.remove('active');
    currentPanel.classList.add(exitClass);

    // 4. Ejecutar Entrada (Con ligero delay para solapamiento elegante)
    setTimeout(() => {
        // Limpiar panel anterior
        currentPanel.style.display = 'none';
        currentPanel.classList.remove(exitClass);

        // Preparar panel nuevo
        nextPanel.style.display = 'block';
        nextPanel.classList.add(enterClass);
        nextPanel.classList.add('active');

        // Limpieza final
        setTimeout(() => {
            nextPanel.classList.remove(enterClass);
            nextPanel.style.pointerEvents = 'auto'; // Reactivar interacción
        }, 400); // Debe coincidir con la duración CSS

    }, 250); // Tiempo de espera antes de que entre el nuevo (aprox 80% de la animación de salida)
};

document.addEventListener('DOMContentLoaded', function() {
    
    // --- DATOS DE EJEMPLO ---
    const offers = [
        { id: 1, logo: '../assets/img/Carrier-covercube-2.jpg', carrier: 'CoverCube', plan: 'Full Covercube', down: '3,920.22', monthly: '0.00' },
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
            div.innerHTML = `
                ${choiceTagHTML}<div class="stamp-mark"><i class="fa-solid fa-check"></i> SELECTED</div>
                
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
        btn.addEventListener('click', () => { 
            if(btn.classList.contains('active')) {
                const modal = document.getElementById('compareModal');
                if(modal) modal.classList.add('active'); 
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
    document.getElementById('btnNext').addEventListener('click', (e) => {
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
    document.getElementById('btnNext').addEventListener('click', (e) => {
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
    document.getElementById('btnNext').addEventListener('click', (e) => {
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
        window.showToast("Vehicle list updated.", "info");
    };

    // TEMPLATE PREMIUM (CON BOTONES PREV Y NEXT)
    function getCarTemplate(id) {
        return `
            <div style="display:flex; justify-content:flex-end; margin-bottom:20px; border-bottom:1px dashed #E2E8F0; padding-bottom:15px;">
                <button type="button" class="btn-delete-link" onclick="deleteCar(${id})"><i class="fa-solid fa-trash-can"></i> Delete Vehicle ${id}</button>
            </div>

            <div class="sec-label"><i class="fa-solid fa-fingerprint"></i> Identification</div>
            <div class="inp-rich-group mb-4"><label>Vehicle Identification Number (VIN)</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-solid fa-barcode"></i></div><input type="text" class="rich-input validate-req" placeholder="17 Characters"></div></div>
            <div class="grid-3-tight">
                <div class="inp-rich-group"><label>Model Year</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-regular fa-calendar"></i></div><select class="rich-input validate-req" id="year-${id}"></select></div></div>
                <div class="inp-rich-group"><label>Make</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-solid fa-tag"></i></div><select class="rich-input validate-req" id="make-${id}" onchange="updateTabName(${id}, this.value)"></select></div></div>
                <div class="inp-rich-group"><label>Model</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-solid fa-car-side"></i></div><select class="rich-input validate-req"><option value="" disabled selected>Select</option><option>Model A</option><option>Model B</option></select></div></div>
            </div>

            <div class="divider-hairline"></div>

            <div class="row-switch-container">
                <div class="switch-label-group"><div class="sl-icon"><i class="fa-solid fa-location-dot"></i></div><div class="sl-text"><span class="sl-title">Garaging Address</span><span class="sl-sub">Same as home?</span></div></div>
                <div class="aurora-toggle-segment">
                    <input type="radio" name="garage_${id}" id="g${id}_yes" value="yes" checked onchange="toggleGarage(${id}, 'no')"><label for="g${id}_yes">Yes</label>
                    <input type="radio" name="garage_${id}" id="g${id}_no" value="no" onchange="toggleGarage(${id}, 'yes')"><label for="g${id}_no">No</label>
                    <div class="segment-highlight"></div>
                </div>
            </div>
            <div id="garage-addr-${id}" class="hidden-anim mt-3 w-100"><div class="inp-rich-group"><label>Alternate Address</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-solid fa-map-location-dot"></i></div><input type="text" class="rich-input" placeholder="Enter Address"></div></div></div>

            <div class="divider-hairline"></div>
            <div class="sec-label"><i class="fa-solid fa-shield-halved"></i> Coverage Configuration</div>
            <div class="grid-2-tight">
                <div class="inp-rich-group"><label>Comprehensive</label><div class="input-rich-wrapper"><select class="rich-input"><option>$500 ded</option><option>$1000 ded</option><option>No Cov</option></select></div></div>
                <div class="inp-rich-group"><label>Collision</label><div class="input-rich-wrapper"><select class="rich-input"><option>$500 ded</option><option>$1000 ded</option><option>No Cov</option></select></div></div>
            </div>
            <div class="grid-2-tight mt-3">
                <div class="inp-rich-group"><label>Towing</label><div class="input-rich-wrapper"><select class="rich-input"><option>No Cov</option><option>$50</option></select></div></div>
                <div class="inp-rich-group"><label>Rental</label><div class="input-rich-wrapper"><select class="rich-input"><option>No Cov</option><option>$30/day</option></select></div></div>
            </div>

            <div class="extras-list-container mt-4">
                <div class="row-switch-container compact">
                    <div class="switch-label-group"><div class="sl-text"><span class="sl-title">Gap Coverage</span></div></div>
                    <div class="aurora-toggle-segment small"><input type="radio" name="gap_${id}" id="gap${id}_yes" value="yes"><label for="gap${id}_yes">Yes</label><input type="radio" name="gap_${id}" id="gap${id}_no" value="no" checked><label for="gap${id}_no">No</label><div class="segment-highlight"></div></div>
                </div>
                <div class="row-switch-container compact">
                    <div class="switch-label-group"><div class="sl-text"><span class="sl-title">Safety Features</span></div></div>
                    <div class="aurora-toggle-segment small"><input type="radio" name="safe_${id}" id="safe${id}_yes" value="yes"><label for="safe${id}_yes">Yes</label><input type="radio" name="safe_${id}" id="safe${id}_no" value="no" checked><label for="safe${id}_no">No</label><div class="segment-highlight"></div></div>
                </div>
                <div class="row-switch-container compact">
                    <div class="switch-label-group"><div class="sl-text"><span class="sl-title">Custom Equipment</span></div></div>
                    <div class="input-rich-wrapper compact-input"><span class="currency">$</span><input type="number" class="rich-input" placeholder="0"></div>
                </div>
            </div>

            <div class="nav-internal-row" style="margin-top:25px; display:flex; justify-content:space-between;">
                <button type="button" class="btn-nav-outline" onclick="switchTab('car-${id-1}')"><i class="fa-solid fa-chevron-left"></i> Prev Car</button>
                
                <button type="button" class="btn-nav-outline btn-next-car" onclick="switchTab('car-${id+1}')">Next Car <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        `;
    }

    // VALIDATION
    document.getElementById('btnNext').addEventListener('click', (e) => {
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
    document.getElementById('btnNext').addEventListener('click', (e) => {
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
    document.getElementById('btnNext').addEventListener('click', (e) => {
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

/* =========================================
   LOGIC FOR STEP 7 (LICENSING) - FIXED
   ========================================= */
if(document.getElementById('quoteFormStep7')) {

    // 1. DATEPICKER & CALCULATIONS
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

                // A) ANTIGÜEDAD DE LICENCIA (US / AZ / EXP)
                if(input.classList.contains('calc-years')) {
                    let years = now.getFullYear() - dateObj.getFullYear();
                    // Ajuste preciso de mes/día
                    if (now.getMonth() < dateObj.getMonth() || 
                       (now.getMonth() === dateObj.getMonth() && now.getDate() < dateObj.getDate())) {
                        years--;
                    }
                    years = Math.max(0, years);

                    // Buscar input "Years" hermano
                    const wrapper = input.closest('.inp-rich-group');
                    const nextGroup = wrapper.nextElementSibling;
                    if(nextGroup) {
                        const yearInput = nextGroup.querySelector('.years-calc');
                        if(yearInput) yearInput.value = `${years} Years`;
                    }

                    // Sincronizar Master -> Slave (US Date -> AZ Date)
                    if(input.classList.contains('master-date')) {
                        const panel = input.closest('.car-panel');
                        // Solo si no es extranjera (sin sello)
                        if(!panel.querySelector('.license-block-wrapper').classList.contains('disabled')) {
                            panel.querySelectorAll('.slave-date').forEach(slave => {
                                if(!slave.value) slave._flatpickr.setDate(dateObj, true); 
                            });
                        }
                    }
                }

                // B) CÁLCULO SUSPENSIÓN (TIEMPO TRANSCURRIDO)
                if(input.classList.contains('calc-elapsed')) {
                    // Diferencia total en meses
                    let monthsDiff = (now.getFullYear() - dateObj.getFullYear()) * 12;
                    monthsDiff -= dateObj.getMonth();
                    monthsDiff += now.getMonth();
                    
                    // Ajuste por día del mes
                    if (now.getDate() < dateObj.getDate()) {
                        monthsDiff--;
                    }
                    monthsDiff = Math.max(0, monthsDiff);

                    const y = Math.floor(monthsDiff / 12);
                    const m = monthsDiff % 12;

                    // CORRECCIÓN: Buscamos por ID parcial porque la clase puede variar
                    // input -> wrapper -> group -> parent (hidden div)
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

    // 2. TOGGLE FOREIGN LICENSE (STAMP)
    window.toggleForeign = function(driverId, val) {
        const usBlock = document.getElementById(`us-block-${driverId}`);
        const foreignSection = document.getElementById(`foreign-section-${driverId}`);
        
        if(val !== 'None') {
            // Activar Sello
            usBlock.classList.add('disabled');
            foreignSection.classList.add('visible');
            
            // Quitar 'validate-req' de los inputs tapados para que no bloqueen
            usBlock.querySelectorAll('.validate-req').forEach(el => {
                el.classList.remove('validate-req');
                el.classList.remove('input-error'); // Limpiar errores previos
            });
            // Hacer requeridos los inputs extranjeros
            foreignSection.querySelectorAll('input').forEach(el => el.classList.add('validate-req'));

        } else {
            // Restaurar Normal
            usBlock.classList.remove('disabled');
            foreignSection.classList.remove('visible');
            
            // Restaurar requeridos US
            usBlock.querySelectorAll('.rich-input').forEach(el => el.classList.add('validate-req'));
            // Quitar requeridos extranjeros
            foreignSection.querySelectorAll('input').forEach(el => el.classList.remove('validate-req'));
        }
    };

    // 3. TOGGLE SECTIONS (SR22 / SUSP)
    window.toggleSection = function(sectionId, action) {
        const div = document.getElementById(sectionId);
        if(action === 'yes') {
            div.classList.add('visible');
            // Activar validación en los campos que aparecieron
            div.querySelectorAll('input, select').forEach(el => {
                if(!el.readOnly) el.classList.add('validate-req');
            });
        } else {
            div.classList.remove('visible');
            // Desactivar validación y limpiar errores
            div.querySelectorAll('input, select').forEach(el => {
                el.classList.remove('validate-req');
                el.value = ''; // Limpiar valor
                el.closest('.input-rich-wrapper')?.classList.remove('input-error');
            });
        }
    };

    // 4. SWITCH TABS
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

    // 5. VALIDATION
    document.getElementById('btnNext').addEventListener('click', (e) => {
        e.preventDefault();
        let isValid = true;
        let firstError = null;
        
        const activePanel = document.querySelector('.car-panel.active');
        // Seleccionamos solo los inputs marcados como requeridos
        const inputs = activePanel.querySelectorAll('.validate-req');
        
        inputs.forEach(input => {
            // TRUCO: offsetParent es null si el elemento (o su padre) tiene display: none
            // Esto asegura que NO validemos campos ocultos
            if(input.offsetParent !== null) { 
                const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                wrapper.classList.remove('input-error');
                
                // Validar si está vacío o si es un select sin valor
                if(!input.value.trim() || input.value === "") {
                    isValid = false;
                    void wrapper.offsetWidth; // Shake animation reset
                    wrapper.classList.add('input-error');
                    if (firstError === null) firstError = wrapper;
                }
            }
        });

        if(isValid) {
            const btn = document.getElementById('btnNext');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            setTimeout(() => {
                window.location.href = "quote-8.html";
            }, 800);
        } else {
            window.showToast("Please fill in all required fields.", "warning");
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

/* =========================================
   LOGIC FOR STEP 6 (HISTORY)
   ========================================= */
if(document.getElementById('quoteFormStep6')) {

    // 1. DATEPICKERS
    if(typeof flatpickr !== 'undefined') {
        flatpickr(".date-picker-past", { dateFormat: "m/d/Y", maxDate: "today", disableMobile: "true" });
        flatpickr(".date-picker-future", { dateFormat: "m/d/Y", minDate: "today", disableMobile: "true" });
    }

    // 2. TOGGLE HISTORY (SHOW/HIDE)
    window.toggleHistory = function(driverId, action) {
        const wrapper = document.getElementById(`history-wrapper-${driverId}`);
        if(action === 'yes') {
            wrapper.classList.add('visible');
            // Hacer requeridos los inputs
            wrapper.querySelectorAll('input, select').forEach(el => el.classList.add('validate-req'));
        } else {
            wrapper.classList.remove('visible');
            // Limpiar requeridos y errores
            wrapper.querySelectorAll('input, select').forEach(el => {
                el.classList.remove('validate-req');
                el.closest('.input-rich-wrapper')?.classList.remove('input-error');
            });
        }
    };

// 3. SWITCH TABS CON ANIMACIÓN
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

    // 4. VALIDATION
    document.getElementById('btnNext').addEventListener('click', (e) => {
        e.preventDefault();
        let isValid = true;
        let firstError = null;
        
        const activePanel = document.querySelector('.car-panel.active');
        // Validar solo inputs visibles con la clase validate-req
        const inputs = activePanel.querySelectorAll('.validate-req');
        
        inputs.forEach(input => {
            if(input.offsetParent !== null) { // Check visibility
                const wrapper = input.closest('.input-rich-wrapper') || input.parentElement;
                wrapper.classList.remove('input-error');
                
                if(!input.value.trim() || input.value === "") {
                    isValid = false;
                    void wrapper.offsetWidth;
                    wrapper.classList.add('input-error');
                    if (firstError === null) firstError = wrapper;
                }
            }
        });

        if(isValid) {
            const btn = document.getElementById('btnNext');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            setTimeout(() => {
                window.location.href = "quote-7.html";
            }, 800);
        } else {
            window.showToast("Please fill in insurance history.", "warning");
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

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
                        <label>Violation Type</label>
                        <div class="input-rich-wrapper">
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
                        <div class="input-rich-wrapper">
                            <div class="icon-slot"><i class="fa-regular fa-calendar"></i></div>
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
                        <label>Payout (BI/PD)</label>
                        <div class="input-rich-wrapper">
                            <div class="icon-slot"><i class="fa-solid fa-dollar-sign"></i></div>
                            <input type="number" class="rich-input validate-req" placeholder="0">
                        </div>
                    </div>

                    <div class="inp-rich-group">
                        <label>Payout (Coll)</label>
                        <div class="input-rich-wrapper">
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
    document.getElementById('btnNext').addEventListener('click', (e) => {
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