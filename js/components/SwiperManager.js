/**
 * Módulo de gestión de carruseles Swiper
 */

import { safeQuerySelector, delay } from '../utils/helpers.js';

class SwiperManager {
    constructor() {
        this.swipers = new Map();
        this.init();
    }

    init() {
        // Esperar a que Swiper esté disponible
        delay(() => {
            this.initializeHeroSwiper();
            this.initializeProductSwipers();
        }, 100);
    }

    /**
     * Inicializa el swiper principal del hero
     */
    initializeHeroSwiper() {
        const heroSwiperElement = safeQuerySelector('.hero-swiper');
        if (!heroSwiperElement || typeof Swiper === 'undefined') return;

        try {
            const heroSwiper = new Swiper('.hero-swiper', {
                loop: true,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });

            this.swipers.set('hero', heroSwiper);
            console.log("Hero Swiper inicializado correctamente");
        } catch (error) {
            console.error("Error al inicializar Hero Swiper:", error);
        }
    }

    /**
     * Inicializa los swipers de productos
     */
    initializeProductSwipers() {
        const productSections = ['#recomendados-section', '#promociones-section'];
        
        productSections.forEach(sectionId => {
            this.initProductSwiper(sectionId);
        });
    }

    /**
     * Inicializa un swiper de productos específico
     */
    initProductSwiper(sectionId) {
        const section = safeQuerySelector(sectionId);
        if (!section || typeof Swiper === 'undefined') return;

        const swiperElement = section.querySelector('.product-swiper');
        if (!swiperElement) return;

        try {
            const productSwiper = new Swiper(`${sectionId} .product-swiper`, {
                spaceBetween: 20, // Espacio entre slides similar al gap del grid
                loop: true, // Sin loop para mejor experiencia
                freeMode: false,
                centeredSlides: false,
                slidesPerGroup: 1, // Deslizar de uno en uno
                navigation: {
                    nextEl: `${sectionId} .next`,
                    prevEl: `${sectionId} .prev`,
                },
                pagination: {
                    el: `${sectionId} .swiper-pagination`,
                    clickable: true,
                },
                // Responsive Breakpoints que imitan el grid
                breakpoints: {
                    320: { 
                        slidesPerView: 1, 
                        spaceBetween: 15
                    },
                    768: { 
                        slidesPerView: 2, 
                        spaceBetween: 15
                    },
                    992: { 
                        slidesPerView: 3, 
                        spaceBetween: 20
                    }
                }
            });

            this.swipers.set(sectionId, productSwiper);
            console.log(`Product Swiper inicializado para ${sectionId}`);
        } catch (error) {
            console.error(`Error al inicializar Product Swiper para ${sectionId}:`, error);
        }
    }

    /**
     * Actualiza todos los swipers
     */
    updateAll() {
        this.swipers.forEach((swiper, key) => {
            try {
                swiper.update();
            } catch (error) {
                console.warn(`Error al actualizar swiper ${key}:`, error);
            }
        });
    }

    /**
     * Destruye todos los swipers
     */
    destroyAll() {
        this.swipers.forEach((swiper, key) => {
            try {
                swiper.destroy(true, true);
            } catch (error) {
                console.warn(`Error al destruir swiper ${key}:`, error);
            }
        });
        this.swipers.clear();
    }

    /**
     * Obtiene un swiper específico
     */
    getSwiper(key) {
        return this.swipers.get(key);
    }

    /**
     * Reinicializa todos los swipers
     */
    reinitialize() {
        this.destroyAll();
        delay(() => {
            this.init();
        }, 100);
    }
}

// Instancia singleton del manejador de swipers
export const swiperManager = new SwiperManager();

// Exportar también la clase
export { SwiperManager };
