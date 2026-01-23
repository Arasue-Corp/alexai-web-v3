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
        // Tabs Styling
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
        // Tabs Styling
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
   LOGIC FOR STEP 10 (VEHICLES) - FINAL PREMIUM
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

    // 2. SWITCH TABS
    window.switchTab = function(carId, btnElement) {
        const targetPanel = document.getElementById(`panel-${carId}`);
        if (!targetPanel) {
            const num = carId.replace('car-', '');
            window.showToast(`Please add Vehicle ${num} using the "+ Add" button first.`, "warning");
            return;
        }
        document.querySelectorAll('.tab-int').forEach(t => t.classList.remove('active'));
        if(btnElement) btnElement.classList.add('active');
        else { const t = document.getElementById(`tab-${carId}`); if(t) t.classList.add('active'); }

        document.querySelectorAll('.car-panel').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
        targetPanel.style.display = 'block';
        setTimeout(() => targetPanel.classList.add('active'), 10);
    };

    // 3. SMART TAB NAME
    window.updateTabName = function(id, makeName) {
        const tab = document.getElementById(`tab-car-${id}`);
        if(tab) {
            const span = tab.querySelector('.tab-txt'); 
            if(span) span.textContent = makeName;
        }
    };

    // 4. TOGGLE GARAGE (Lógica Invertida para UI: Yes = Mismo, No = Alterno)
    window.toggleGarage = function(id, action) {
        // En UI: "Same as Home?" -> Yes (oculta alterno), No (muestra alterno)
        // action 'yes' aqui significa "Mostrar input alterno" (o sea, seleccionó NO es la misma casa)
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

    // 5. ADD CAR
    btnAdd.addEventListener('click', () => {
        const currentTabs = document.querySelectorAll('.tab-int:not(.add-btn)');
        const carCount = currentTabs.length;
        if(carCount >= maxCars) { window.showToast("Maximum 6 cars reached.", "warning"); return; }
        
        const newId = carCount + 1;
        const newTab = document.createElement('button');
        newTab.type = 'button'; newTab.className = 'tab-int'; newTab.id = `tab-car-${newId}`;
        newTab.innerHTML = `<span class="tab-txt">Car ${newId}</span>`;
        newTab.onclick = function() { switchTab(`car-${newId}`, this); };
        tabsContainer.insertBefore(newTab, btnAdd);

        const newPanel = document.createElement('div');
        newPanel.className = 'car-panel'; newPanel.id = `panel-car-${newId}`; newPanel.setAttribute('data-id', newId);
        newPanel.innerHTML = getCarTemplate(newId);
        container.appendChild(newPanel);

        populateLists(newId);
        switchTab(`car-${newId}`, newTab);
        window.showToast(`Vehicle ${newId} added successfully.`, "success");
    });

    // 6. DELETE & REINDEX
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
            
            // Update Select IDs
            const makeSel = panel.querySelector('[id^="make-"]'); if(makeSel) { makeSel.id = `make-${newNum}`; makeSel.setAttribute('onchange', `updateTabName(${newNum}, this.value)`); }
            const yearSel = panel.querySelector('[id^="year-"]'); if(yearSel) yearSel.id = `year-${newNum}`;

            // Update Toggles Names & IDs (CRUCIAL para los labels)
            // Garage
            const radioGYes = panel.querySelector('input[value="yes"][name^="garage_"]');
            const radioGNo = panel.querySelector('input[value="no"][name^="garage_"]');
            if(radioGYes && radioGNo) {
                radioGYes.name = `garage_${newNum}`; radioGYes.id = `g${newNum}_yes`; radioGYes.nextElementSibling.setAttribute('for', `g${newNum}_yes`);
                radioGYes.setAttribute('onchange', `toggleGarage(${newNum}, 'no')`); // Yes = Hide
                
                radioGNo.name = `garage_${newNum}`; radioGNo.id = `g${newNum}_no`; radioGNo.nextElementSibling.setAttribute('for', `g${newNum}_no`);
                radioGNo.setAttribute('onchange', `toggleGarage(${newNum}, 'yes')`); // No = Show
            }
            // Div Oculto
            const divG = panel.querySelector('[id^="garage-addr-"]'); if(divG) divG.id = `garage-addr-${newNum}`;

            // Update Delete Btn
            const btnDel = panel.querySelector('.btn-delete-link');
            if(btnDel) {
                btnDel.innerHTML = `<i class="fa-solid fa-trash-can"></i> Delete Vehicle ${newNum}`;
                btnDel.setAttribute('onclick', `deleteCar(${newNum})`);
            }
            // Nav
            const btnPrev = panel.querySelector('.btn-nav-outline'); if(btnPrev) btnPrev.setAttribute('onclick', `switchTab('car-${newNum-1}')`);
        }
        switchTab('car-1');
        window.showToast("Vehicle removed.", "info");
    };

    // TEMPLATE PREMIUM
    function getCarTemplate(id) {
        return `
            <div style="display:flex; justify-content:flex-end; margin-bottom:20px; border-bottom:1px dashed #E2E8F0; padding-bottom:15px;">
                <button type="button" class="btn-delete-link" onclick="deleteCar(${id})">
                    <i class="fa-solid fa-trash-can"></i> Delete Vehicle ${id}
                </button>
            </div>

            <div class="sec-label"><i class="fa-solid fa-fingerprint"></i> Identification</div>
            <div class="inp-rich-group mb-4">
                <label>Vehicle Identification Number (VIN)</label>
                <div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-solid fa-barcode"></i></div><input type="text" class="rich-input validate-req" placeholder="17 Characters"></div>
            </div>
            <div class="grid-3-tight">
                <div class="inp-rich-group"><label>Model Year</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-regular fa-calendar"></i></div><select class="rich-input validate-req" id="year-${id}"></select></div></div>
                <div class="inp-rich-group"><label>Make</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-solid fa-tag"></i></div><select class="rich-input validate-req" id="make-${id}" onchange="updateTabName(${id}, this.value)"></select></div></div>
                <div class="inp-rich-group"><label>Model</label><div class="input-rich-wrapper"><div class="icon-slot"><i class="fa-solid fa-car-side"></i></div><select class="rich-input validate-req"><option value="" disabled selected>Select</option><option>Model A</option><option>Model B</option></select></div></div>
            </div>

            <div class="divider-hairline"></div>

            <div class="row-switch-container">
                <div class="switch-label-group">
                    <div class="sl-icon"><i class="fa-solid fa-location-dot"></i></div>
                    <div class="sl-text"><span class="sl-title">Garaging Address</span><span class="sl-sub">Same as home?</span></div>
                </div>
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
                    <div class="aurora-toggle-segment small">
                        <input type="radio" name="gap_${id}" id="gap${id}_yes" value="yes"><label for="gap${id}_yes">Yes</label>
                        <input type="radio" name="gap_${id}" id="gap${id}_no" value="no" checked><label for="gap${id}_no">No</label>
                        <div class="segment-highlight"></div>
                    </div>
                </div>
                <div class="row-switch-container compact">
                    <div class="switch-label-group"><div class="sl-text"><span class="sl-title">Safety Features</span></div></div>
                    <div class="aurora-toggle-segment small">
                        <input type="radio" name="safe_${id}" id="safe${id}_yes" value="yes"><label for="safe${id}_yes">Yes</label>
                        <input type="radio" name="safe_${id}" id="safe${id}_no" value="no" checked><label for="safe${id}_no">No</label>
                        <div class="segment-highlight"></div>
                    </div>
                </div>
            </div>

            <div class="nav-internal-row" style="margin-top:25px;">
                <button type="button" class="btn-nav-outline" onclick="switchTab('car-${id-1}')"><i class="fa-solid fa-chevron-left"></i> Prev Car</button>
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
}