/**
 * Módulo de interfaz de usuario del carrito
 */

import { cart } from './Cart.js';
import { DOM_SELECTORS, CSS_CLASSES, ANIMATION_DURATIONS } from '../utils/constants.js';
import { 
    safeQuerySelector, 
    safeQuerySelectorAll, 
    safeAddEventListener,
    formatPrice 
} from '../utils/helpers.js';

class CartUI {
    constructor() {
        this.elements = {};
        this.isModalOpen = false;
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupCartListener();
        this.updateUI();
    }

    /**
     * Cachea todas las referencias a elementos del DOM
     */
    cacheElements() {
        this.elements = {
            // Modal elements
            cartModalOverlay: safeQuerySelector(DOM_SELECTORS.cartModalOverlay),
            cartModal: safeQuerySelector(DOM_SELECTORS.cartModal),
            closeCartBtn: safeQuerySelector(DOM_SELECTORS.closeCartBtn),
            cartItemsList: safeQuerySelector(DOM_SELECTORS.cartItemsList),
            cartItemCount: safeQuerySelector(DOM_SELECTORS.cartItemCount),
            cartSubtotalValue: safeQuerySelector(DOM_SELECTORS.cartSubtotalValue),
            cartContinueBtn: safeQuerySelector(DOM_SELECTORS.cartContinueBtn),
            
            // Cart triggers
            cartIconContainer: safeQuerySelector(DOM_SELECTORS.cartIconContainer),
            mobileCartContainer: safeQuerySelector(DOM_SELECTORS.mobileCartContainer),
            
            // Price displays
            cartPriceElements: safeQuerySelectorAll(DOM_SELECTORS.cartPrice)
        };
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Modal triggers
        safeAddEventListener(this.elements.cartIconContainer, 'click', (e) => {
            e.preventDefault();
            this.toggleModal();
        });

        safeAddEventListener(this.elements.mobileCartContainer, 'click', (e) => {
            e.preventDefault();
            this.toggleModal();
        });

        // Modal close
        safeAddEventListener(this.elements.closeCartBtn, 'click', () => {
            this.toggleModal();
        });

        safeAddEventListener(this.elements.cartModalOverlay, 'click', (e) => {
            if (e.target === this.elements.cartModalOverlay) {
                this.toggleModal();
            }
        });

        // Continue button
        safeAddEventListener(this.elements.cartContinueBtn, 'click', () => {
            if (!cart.isEmpty()) {
                this.sendToWhatsApp();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.toggleModal();
            }
        });
    }

    /**
     * Configura el listener para cambios en el carrito
     */
    setupCartListener() {
        cart.addListener((eventType, data) => {
            this.updateUI();
            
            if (eventType === 'itemAdded' || eventType === 'itemUpdated') {
                this.animateCartIcon();
            }
            
            if (this.isModalOpen) {
                this.renderCartItems();
            }
        });
    }

    /**
     * Actualiza toda la interfaz del carrito
     */
    updateUI() {
        this.updatePriceDisplays();
        this.updateItemCount();
        this.updateContinueButton();
    }

    /**
     * Actualiza los elementos que muestran el precio
     */
    updatePriceDisplays() {
        const formattedPrice = formatPrice(cart.totalPrice);
        
        this.elements.cartPriceElements.forEach(element => {
            if (element) {
                element.textContent = formattedPrice;
            }
        });

        if (this.elements.cartSubtotalValue) {
            this.elements.cartSubtotalValue.textContent = formattedPrice;
        }
    }

    /**
     * Actualiza el contador de productos
     */
    updateItemCount() {
        if (this.elements.cartItemCount) {
            this.elements.cartItemCount.textContent = cart.getTotalItemsCount();
        }
    }

    /**
     * Actualiza el botón de continuar
     */
    updateContinueButton() {
        if (this.elements.cartContinueBtn) {
            if (cart.isEmpty()) {
                this.elements.cartContinueBtn.classList.remove(CSS_CLASSES.active);
            } else {
                this.elements.cartContinueBtn.classList.add(CSS_CLASSES.active);
            }
        }
    }

    /**
     * Anima el icono del carrito
     */
    animateCartIcon() {
        // Animar icono del header (desktop/tablet)
        if (this.elements.cartIconContainer) {
            this.elements.cartIconContainer.classList.add(CSS_CLASSES.cartPulse);
            setTimeout(() => {
                this.elements.cartIconContainer.classList.remove(CSS_CLASSES.cartPulse);
            }, ANIMATION_DURATIONS.cartPulse);
        }

        // Animar carrito móvil flotante
        if (this.elements.mobileCartContainer) {
            this.elements.mobileCartContainer.classList.add(CSS_CLASSES.cartPulse);
            setTimeout(() => {
                this.elements.mobileCartContainer.classList.remove(CSS_CLASSES.cartPulse);
            }, ANIMATION_DURATIONS.cartPulse);
        }
    }

    /**
     * Muestra/oculta el modal del carrito
     */
    toggleModal() {
        if (!this.elements.cartModal || !this.elements.cartModalOverlay) return;

        this.isModalOpen = !this.isModalOpen;

        if (this.isModalOpen) {
            this.elements.cartModalOverlay.classList.add(CSS_CLASSES.show);
            this.elements.cartModal.classList.add(CSS_CLASSES.show);
            document.body.style.overflow = 'hidden';
            this.renderCartItems();
        } else {
            this.elements.cartModalOverlay.classList.remove(CSS_CLASSES.show);
            this.elements.cartModal.classList.remove(CSS_CLASSES.show);
            document.body.style.overflow = '';
        }
    }

    /**
     * Renderiza los items del carrito en el modal
     */
    renderCartItems() {
        if (!this.elements.cartItemsList) return;

        this.elements.cartItemsList.innerHTML = '';

        if (cart.isEmpty()) {
            this.elements.cartItemsList.innerHTML = 
                '<p class="text-center text-muted my-5">Tu carrito está vacío</p>';
            return;
        }

        cart.items.forEach(item => {
            const cartItemElement = this.createCartItemElement(item);
            this.elements.cartItemsList.appendChild(cartItemElement);
        });
    }

    /**
     * Crea un elemento de item del carrito
     */
    createCartItemElement(item) {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        
        const itemTotal = item.price * item.quantity;
        const isMinQuantity = item.quantity === 1;
        
        cartItemElement.innerHTML = `
            <img src="${item.imageUrl || 'img/product-default.png'}" 
                 alt="${item.name}" 
                 class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price">${formatPrice(itemTotal)}</div>
                <div class="cart-item-controls">
                    <div class="cart-item-quantity" data-product-id="${item.id}">
                        <button class="cart-quantity-btn minus-btn" 
                                ${isMinQuantity ? 'data-trash="true"' : ''}>
                            <i class="fas ${isMinQuantity ? 'fa-trash' : 'fa-minus'}"></i>
                        </button>
                        <span class="cart-item-quantity-value">${item.quantity}</span>
                        <button class="cart-quantity-btn plus-btn">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="cart-item-edit">Editar</button>
                </div>
            </div>
        `;

        this.setupCartItemListeners(cartItemElement, item);
        return cartItemElement;
    }

    /**
     * Configura los event listeners para un item del carrito
     */
    setupCartItemListeners(element, item) {
        const minusBtn = element.querySelector('.minus-btn');
        const plusBtn = element.querySelector('.plus-btn');

        safeAddEventListener(minusBtn, 'click', () => {
            if (item.quantity > 1) {
                cart.updateItemQuantity(item.id, item.quantity - 1);
            } else {
                cart.removeItem(item.id);
            }
            this.renderCartItems();
        });

        safeAddEventListener(plusBtn, 'click', () => {
            cart.updateItemQuantity(item.id, item.quantity + 1);
            this.renderCartItems();
        });
    }

    /**
     * Envía el carrito a WhatsApp
     */
    sendToWhatsApp() {
        const phoneNumber = "51929716729";
        let message = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";

        cart.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            message += `• ${item.quantity}x ${item.name} - ${formatPrice(itemTotal)}\n`;
        });

        message += `\nTotal: ${formatPrice(cart.totalPrice)}\n\nGracias!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');
    }

    /**
     * Fuerza la actualización de la UI
     */
    forceUpdate() {
        this.updateUI();
        if (this.isModalOpen) {
            this.renderCartItems();
        }
    }
}

// Instancia singleton de la UI del carrito
export const cartUI = new CartUI();

// Exportar también la clase
export { CartUI };
