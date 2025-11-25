/**
 * Utilidades generales de la aplicación
 */

/**
 * Genera un ID único para un producto basado en su nombre
 * @param {string} name - Nombre del producto
 * @returns {string} ID único del producto
 */
export function generateProductId(name) {
    return name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Formatea un precio para mostrar
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
export function formatPrice(price) {
    return `S/ ${parseFloat(price).toFixed(2)}`;
}

/**
 * Extrae el valor numérico de un precio con formato "S/ XX.XX"
 * @param {string} priceString - String del precio
 * @returns {number} Valor numérico del precio
 */
export function extractPriceValue(priceString) {
    return parseFloat(priceString.replace('S/', '').trim());
}

/**
 * Obtiene un elemento del DOM de forma segura
 * @param {string} selector - Selector CSS
 * @param {Element} parent - Elemento padre (opcional)
 * @returns {Element|null} Elemento encontrado o null
 */
export function safeQuerySelector(selector, parent = document) {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        console.warn(`Error al buscar selector: ${selector}`, error);
        return null;
    }
}

/**
 * Obtiene múltiples elementos del DOM de forma segura
 * @param {string} selector - Selector CSS
 * @param {Element} parent - Elemento padre (opcional)
 * @returns {NodeList} Lista de elementos encontrados
 */
export function safeQuerySelectorAll(selector, parent = document) {
    try {
        return parent.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Error al buscar selector: ${selector}`, error);
        return [];
    }
}

/**
 * Añade un event listener de forma segura
 * @param {Element} element - Elemento al que añadir el listener
 * @param {string} event - Tipo de evento
 * @param {Function} handler - Función manejadora
 * @param {Object} options - Opciones del listener
 */
export function safeAddEventListener(element, event, handler, options = {}) {
    if (element && typeof handler === 'function') {
        element.addEventListener(event, handler, options);
    } else {
        console.warn(`No se pudo añadir event listener a elemento:`, element);
    }
}

/**
 * Retrasa la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos
 * @returns {number} ID del timeout
 */
export function delay(func, delay = 100) {
    return setTimeout(func, delay);
}

/**
 * Valida si un objeto tiene la estructura de carrito válida
 * @param {Object} cart - Objeto carrito a validar
 * @returns {boolean} True si es válido
 */
export function isValidCartStructure(cart) {
    return cart && 
           typeof cart === 'object' && 
           Array.isArray(cart.items) && 
           typeof cart.totalPrice === 'number';
}

/**
 * Limpia y normaliza el precio total del carrito
 * @param {number} price - Precio a normalizar
 * @returns {number} Precio normalizado
 */
export function normalizeTotalPrice(price) {
    return Math.max(0, parseFloat(price.toFixed(2)));
}

/**
 * Debounce function para optimizar eventos
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera
 * @param {boolean} immediate - Ejecutar inmediatamente
 * @returns {Function} Función debounced
 */
export function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}
