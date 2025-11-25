/**
 * Configuración de módulos y exportaciones
 * Este archivo facilita la importación de componentes
 */

// Exportar todos los componentes principales
export { cart, Cart } from './components/Cart.js';
export { cartUI, CartUI } from './components/CartUI.js';
export { productManager, ProductManager } from './components/ProductManager.js';
export { productDetailModal, ProductDetailModal } from './components/ProductDetailModal.js';
export { navigation, Navigation } from './components/Navigation.js';
export { swiperManager, SwiperManager } from './components/SwiperManager.js';

// Exportar utilidades
export * from './utils/constants.js';
export * from './utils/helpers.js';

// Exportar aplicación principal
export { app, App } from './main.js';

// Versión de la aplicación
export const VERSION = '2.0.0';

// Información de la aplicación
export const APP_INFO = {
    name: 'Agallas Restaurant',
    version: VERSION,
    description: 'Sistema modular de carrito de compras y menú',
    author: 'Agallas Team'
};
