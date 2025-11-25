/**
 * Constantes globales de la aplicación
 */

export const WHATSAPP_CONFIG = {
    phoneNumber: "51929716729"
};

export const STORAGE_KEYS = {
    cart: 'agallasCart'
};

export const DOM_SELECTORS = {
    // Cart Elements
    cartModalOverlay: '#cartModalOverlay',
    cartModal: '#cartModal',
    closeCartBtn: '#closeCartBtn',
    cartItemsList: '#cartItemsList',
    cartItemCount: '#cartItemCount',
    cartSubtotalValue: '.cart-subtotal-value',
    cartContinueBtn: '#cartContinueBtn',
    cartIconContainer: '.cart-icon-container',
    mobileCartContainer: '.mobile-cart-container',
    cartPrice: '.cart-price',
    
    // Product Detail Modal
    productDetailOverlay: '#productDetailOverlay',
    productDetailModal: '#productDetailModal',
    productDetailContent: '#productDetailContent',
    closeProductDetailBtn: '#closeProductDetailBtn',
    
    // Navigation
    categoryLinks: '.category-item',
    
    // UI Elements
    backToTop: '#back-to-top',
    navbar: '.navbar',
    accordionItems: '.footer-column.accordion-item',
    favoriteButtons: '.favorite-btn',
    addToCartButtons: '.add-to-cart-btn',
    productCards: '.product-card'
};

export const CSS_CLASSES = {
    active: 'active',
    show: 'show',
    visible: 'visible',
    cartPulse: 'cart-pulse',
    quantityControl: 'quantity-control',
    navbarTransparent: 'navbar-transparent',
    isOpen: 'is-open'
};

export const ANIMATION_DURATIONS = {
    cartPulse: 500,
    scroll: 300
};
