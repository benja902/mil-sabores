/**
 * Módulo de navegación y elementos de UI
 */

import { DOM_SELECTORS, CSS_CLASSES, ANIMATION_DURATIONS } from '../utils/constants.js';
import { 
    safeQuerySelector,
    safeQuerySelectorAll,
    safeAddEventListener,
    debounce
} from '../utils/helpers.js';

class Navigation {
    constructor() {
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupCategoryNavigation();
        this.setupScrollEffects();
        this.setupBackToTop();
        this.setupAccordion();
        this.setupFavorites();
        this.setupActiveNavigation(); // Agregar navegación activa
    }

    /**
     * Cachea las referencias a elementos del DOM
     */
    cacheElements() {
        this.elements = {
            categoryLinks: safeQuerySelectorAll(DOM_SELECTORS.categoryLinks),
            navbar: safeQuerySelector(DOM_SELECTORS.navbar),
            backToTop: safeQuerySelector(DOM_SELECTORS.backToTop),
            accordionItems: safeQuerySelectorAll(DOM_SELECTORS.accordionItems),
            favoriteButtons: safeQuerySelectorAll(DOM_SELECTORS.favoriteButtons)
        };
    }    /**
     * Configura la navegación por categorías
     */
    setupCategoryNavigation() {
        this.elements.categoryLinks.forEach(link => {
            safeAddEventListener(link, 'click', (e) => {
                this.handleCategoryClick(e);
            });
        });
        // Detección de sección visible al hacer scroll
        window.addEventListener('scroll', () => {
            this.updateActiveCategory();
        });
    }

    /**
     * Maneja el clic en elementos del menú de categorías
     */
    handleCategoryClick(e) {
        e.preventDefault();
        
        // Eliminar clase active de todos los elementos
        this.elements.categoryLinks.forEach(link => {
            link.classList.remove(CSS_CLASSES.active);
        });
        
        // Añadir clase active al elemento clicado
        e.currentTarget.classList.add(CSS_CLASSES.active);
        
        // Obtener el ID de la sección a la que apunta
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId === '#') return;
        
        // Desplazamiento suave a la sección
        const targetElement = safeQuerySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 130,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Actualiza la categoría activa según la sección visible
     */
    updateActiveCategory() {
        const sections = safeQuerySelectorAll('section[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        // Actualizar la clase active según la sección visible
        if (current) {
            this.elements.categoryLinks.forEach(link => {
                link.classList.remove(CSS_CLASSES.active);
                
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add(CSS_CLASSES.active);
                    
                    // Scroll automático del menú de categorías en móvil
                    if (window.innerWidth) {
                        this.scrollCategoryIntoView(link);
                    }
                }
            });
        }
    }    /**
     * Hace scroll automático para mostrar la categoría activa en móvil
     */
    scrollCategoryIntoView(activeLink) {
        const categoriesMenu = safeQuerySelector('.categories-menu');
        if (!categoriesMenu) return;
        
        const menuRect = categoriesMenu.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        
        // Calcular la posición deseada para que el elemento esté centrado
        const desiredScrollLeft = linkRect.left - menuRect.left - (menuRect.width / 2) + (linkRect.width / 2);
        
        // Aplicar scroll suave
        categoriesMenu.scrollTo({
            left: categoriesMenu.scrollLeft + desiredScrollLeft,
            behavior: 'smooth'
        });
    }/**
     * Configura los efectos de scroll
     */
    setupScrollEffects() {
        if (!this.elements.navbar) return;

        // Solo aplicar efecto de transparencia en index.html
        if (this.isIndexPage()) {
            // Aplicar transparencia inicial
            this.elements.navbar.classList.add(CSS_CLASSES.navbarTransparent);
            
            window.addEventListener('scroll', () => {
                this.handleNavbarTransparency();
            });
        }
    }/**
     * Maneja la transparencia del navbar según el scroll
     */
    handleNavbarTransparency() {
        if (!this.elements.navbar) return;

        if (window.scrollY < 50) {
            this.elements.navbar.classList.add(CSS_CLASSES.navbarTransparent);
        } else {
            this.elements.navbar.classList.remove(CSS_CLASSES.navbarTransparent);
        }
    }

    /**
     * Verifica si estamos en la página index
     */
    isIndexPage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Considera index.html, index.htm, o la raíz como página index
        return currentPage === 'index.html' || 
               currentPage === 'index.htm' || 
               currentPage === '' || 
               currentPath === '/' ||
               currentPath.endsWith('/');
    }

    /**
     * Configura el botón "Volver arriba"
     */
    setupBackToTop() {
        if (!this.elements.backToTop) return;

        const debouncedScrollHandler = debounce(() => {
            if (window.scrollY > ANIMATION_DURATIONS.scroll) {
                this.elements.backToTop.classList.add(CSS_CLASSES.visible);
            } else {
                this.elements.backToTop.classList.remove(CSS_CLASSES.visible);
            }
        }, 100);

        window.addEventListener('scroll', debouncedScrollHandler);

        safeAddEventListener(this.elements.backToTop, 'click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Configura el acordeón del footer
     */
    setupAccordion() {
        this.elements.accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            
            safeAddEventListener(header, 'click', () => {
                item.classList.toggle(CSS_CLASSES.isOpen);
            });
        });
    }

    /**
     * Configura los botones de favoritos
     */
    setupFavorites() {
        this.elements.favoriteButtons.forEach(button => {
            safeAddEventListener(button, 'click', (e) => {
                e.preventDefault();
                this.toggleFavorite(button);
            });
        });
    }

    /**
     * Alterna el estado de favorito
     */
    toggleFavorite(button) {
        const icon = button.querySelector('i');
        if (!icon) return;

        icon.classList.toggle('far'); // Corazón vacío
        icon.classList.toggle('fas'); // Corazón lleno
    }

    /**
     * Configura la navegación activa según la página actual
     */
    setupActiveNavigation() {
        const currentPagePath = window.location.pathname;
        const navLinks = safeQuerySelectorAll('.navbar-nav .nav-link');

        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (currentPagePath === linkPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }    /**
     * Fuerza la actualización de la navegación
     */
    forceUpdate() {
        this.updateActiveCategory();
        
        // Solo manejar transparencia en página index
        if (this.isIndexPage()) {
            this.handleNavbarTransparency();
        }
    }
}

// Instancia singleton de la navegación
export const navigation = new Navigation();

// Exportar también la clase
export { Navigation };
