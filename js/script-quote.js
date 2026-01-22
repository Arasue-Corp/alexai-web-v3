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
    function showToast(msg) {
        const container = document.getElementById('toast-container');
        container.innerHTML = ''; // Limpiar para que no se apilen

        const toast = document.createElement('div');
        toast.className = 'alex-toast';
        
        toast.innerHTML = `
            <div class="toast-icon-box"><i class="fa-solid fa-check"></i></div>
            <div class="toast-content">
                <span class="toast-title">Plan Selected</span>
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
            showToast(`${carrierName} Added`);
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
        
        let iconHtml = '<i class="fa-solid fa-check"></i>';
        if(type === 'danger') iconHtml = '<i class="fa-solid fa-trash-can"></i>';
        if(type === 'warning') iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';

        toast.className = `alex-toast ${type}`;
        toast.innerHTML = `<div class="t-icon">${iconHtml}</div><div class="t-msg">${msg}</div>`;
        
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

    window.addEntity = (type) => showToast(`New ${type} Added, Quote will be recalculated`, 'success');
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

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Inicializar Date Picker
    if(typeof flatpickr !== 'undefined') {
        flatpickr(".date-picker", { dateFormat: "m/d/Y", maxDate: "today", disableMobile: "true" });
    }

    // 2. Cálculo de Millas (Editable)
    const workMiles = document.getElementById('milesWork-1');
    const annualMiles = document.getElementById('annualMiles-1');
    
    if(workMiles && annualMiles) {
        workMiles.addEventListener('input', function() {
            const val = parseInt(this.value);
            // Solo auto-calcular si el campo anual está vacío o el usuario no lo ha tocado manualmente aun
            // (Para simplificar, recalculamos siempre que cambie work miles, el usuario puede editar despues)
            if(!isNaN(val)) {
                annualMiles.value = val * 260; // 260 días laborables
                // Trigger visual change
                annualMiles.classList.add('flash-update');
                setTimeout(() => annualMiles.classList.remove('flash-update'), 500);
            }
        });
    }

    // 3. Validación y Shake en Botón Principal
    const btnNext = document.getElementById('btnNextStep');
    if(btnNext) {
        btnNext.addEventListener('click', function(e) {
            e.preventDefault();
            let isValid = true;
            let firstError = null;

            // Seleccionar campos requeridos visibles
            const activePanel = document.querySelector('.car-panel.active');
            const requiredFields = activePanel.querySelectorAll('.validate-req');

            requiredFields.forEach(field => {
                // Reset estado
                field.classList.remove('input-error');
                
                if(!field.value.trim()) {
                    isValid = false;
                    field.classList.add('input-error'); // Activa animación CSS Shake
                    if(!firstError) firstError = field;
                    
                    // Remover clase error al escribir
                    field.addEventListener('input', function() {
                        this.classList.remove('input-error');
                    }, {once: true});
                }
            });

            if(isValid) {
                // Éxito: Simular guardado o ir al siguiente paso
                if(window.showToast) window.showToast("Analysis Complete. Generating Quotes...", "success");
                setTimeout(() => window.location.href = "quote-14.html", 1500);
            } else {
                // Error
                if(window.showToast) window.showToast("Please fill in the required fields highlighted in red.", "error");
                if(firstError) firstError.focus();
            }
        });
    }
});

// Lógica de Tabs y Navegación Interna
window.switchTab = function(carId, btnElement) {
    // 1. Mover Indicador
    const indicator = document.getElementById('tabIndicator');
    if(indicator && btnElement) {
        if(carId === 'car-1') indicator.style.transform = 'translateX(0%)';
        else indicator.style.transform = 'translateX(100%)';
    }

    // 2. Activar Botón Tab
    document.querySelectorAll('.car-tab').forEach(b => b.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    else {
        // Si se llama desde botones internos, buscar el tab correspondiente
        const index = carId === 'car-1' ? 0 : 1;
        document.querySelectorAll('.car-tab')[index].classList.add('active');
    }

    // 3. Mostrar Panel
    document.querySelectorAll('.car-panel').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.car-panel').forEach(p => p.classList.remove('active'));
    
    const target = document.getElementById(`panel-${carId}`);
    if(target) {
        target.style.display = 'block';
        target.classList.add('active');
    }
    
    // Scroll top suave si se cambia de auto
    document.querySelector('.form-panel-clean').scrollIntoView({behavior: 'smooth', block: 'start'});
};