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