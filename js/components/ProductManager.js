/**
 * Módulo de gestión de productos
 */

import { cart } from './Cart.js';
import { DOM_SELECTORS, CSS_CLASSES } from '../utils/constants.js';
import { 
    generateProductId, 
    extractPriceValue,
    safeQuerySelector,
    safeQuerySelectorAll,
    safeAddEventListener,
    delay
} from '../utils/helpers.js';

class ProductManager {
    constructor() {
        this.quantityControls = new Map();
        this.init();
    }

    init() {
        this.setupAddToCartButtons();
        this.setupCartListener();
        delay(() => this.restoreQuantityControls(), 100);
    }

    /**
     * Configura los botones "Agregar al carrito"
     */
    setupAddToCartButtons() {
        const addButtons = safeQuerySelectorAll(DOM_SELECTORS.addToCartButtons);
        
        addButtons.forEach(button => {
            safeAddEventListener(button, 'click', (e) => {
                e.preventDefault();
                this.handleAddToCart(button);
            });
        });
    }

    /**
     * Maneja el clic en "Agregar al carrito"
     */
    handleAddToCart(button) {
        // Si ya está en modo cantidad, no hacer nada
        if (button.classList.contains(CSS_CLASSES.quantityControl)) return;

        const productData = this.extractProductData(button);
        if (!productData) return;

        // Añadir al carrito
        cart.addItem(
            productData.id,
            productData.name,
            productData.price,
            1,
            productData.imageUrl
        );

        // Mostrar control de cantidad
        this.showQuantityControl(button, productData.id, 1);
    }

    /**
     * Extrae los datos del producto desde el DOM
     */
    extractProductData(button) {
        try {
            const productCard = button.closest('.product-card');
            if (!productCard) return null;

            const nameElement = productCard.querySelector('h3');
            const priceElement = productCard.querySelector('.current-price');
            const imageElement = productCard.querySelector('.card-image-container img');

            if (!nameElement || !priceElement) return null;

            const name = nameElement.textContent.trim();
            const priceText = priceElement.textContent.trim();
            const price = extractPriceValue(priceText);
            const imageUrl = imageElement ? imageElement.src : null;
            const id = generateProductId(name);

            return { id, name, price, imageUrl };
        } catch (error) {
            console.error("Error al extraer datos del producto:", error);
            return null;
        }
    }

    /**
     * Muestra el control de cantidad en lugar del botón
     */
    showQuantityControl(button, productId, quantity) {
        if (!button) return;

        const isTrash = quantity === 1;
        
        button.classList.add(CSS_CLASSES.quantityControl);
        button.innerHTML = `
            <div class="quantity-wrapper">
                <button class="quantity-btn minus" ${isTrash ? 'data-trash="true"' : ''}>
                    <i class="fas ${isTrash ? 'fa-trash' : 'fa-minus'}"></i>
                </button>
                <span class="quantity-value" data-product-id="${productId}">${quantity}</span>
                <button class="quantity-btn plus">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;

        this.setupQuantityButtonListeners(button, productId);
        this.quantityControls.set(productId, button);
    }

    /**
     * Configura los listeners para los botones de cantidad
     */
    setupQuantityButtonListeners(button, productId) {
        const minusBtn = button.querySelector('.quantity-btn.minus');
        const plusBtn = button.querySelector('.quantity-btn.plus');
        const quantityDisplay = button.querySelector('.quantity-value');

        safeAddEventListener(minusBtn, 'click', (e) => {
            e.stopPropagation();
            
            const currentQuantity = parseInt(quantityDisplay.textContent);
            
            if (currentQuantity > 1) {
                const newQuantity = currentQuantity - 1;
                quantityDisplay.textContent = newQuantity;
                cart.updateItemQuantity(productId, newQuantity);
                
                // Actualizar icono si es necesario
                if (newQuantity === 1) {
                    minusBtn.setAttribute('data-trash', 'true');
                    minusBtn.innerHTML = '<i class="fas fa-trash"></i>';
                }
            } else {
                // Eliminar del carrito
                cart.removeItem(productId);
                this.restoreOriginalButton(button);
            }
        });

        safeAddEventListener(plusBtn, 'click', (e) => {
            e.stopPropagation();
            
            const currentQuantity = parseInt(quantityDisplay.textContent);
            const newQuantity = currentQuantity + 1;
            
            quantityDisplay.textContent = newQuantity;
            cart.updateItemQuantity(productId, newQuantity);
            
            // Actualizar icono si es necesario
            if (currentQuantity === 1) {
                minusBtn.removeAttribute('data-trash');
                minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
            }
        });
    }

    /**
     * Restaura el botón original "Agregar al carrito"
     */
    restoreOriginalButton(button) {
        if (!button) return;

        button.classList.remove(CSS_CLASSES.quantityControl);
        button.innerHTML = 'Agregar al pedido';
        
        // Limpiar del mapa
        this.quantityControls.forEach((value, key) => {
            if (value === button) {
                this.quantityControls.delete(key);
            }
        });
    }

    /**
     * Actualiza los controles de cantidad para un producto específico
     */
    updateQuantityControl(productId, newQuantity) {
        const button = this.quantityControls.get(productId);
        if (!button) return;

        const quantityDisplay = button.querySelector('.quantity-value');
        const minusBtn = button.querySelector('.quantity-btn.minus');

        if (quantityDisplay) {
            quantityDisplay.textContent = newQuantity;
        }

        if (minusBtn) {
            if (newQuantity === 1) {
                minusBtn.setAttribute('data-trash', 'true');
                minusBtn.innerHTML = '<i class="fas fa-trash"></i>';
            } else {
                minusBtn.removeAttribute('data-trash');
                minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
            }
        }
    }

    /**
     * Restaura todos los controles de cantidad para productos en el carrito
     */
    restoreQuantityControls() {
        cart.items.forEach(item => {
            this.restoreQuantityControlForProduct(item);
        });
    }

    /**
     * Restaura el control de cantidad para un producto específico
     */
    restoreQuantityControlForProduct(item) {
        const productCards = safeQuerySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const nameElement = card.querySelector('h3');
            if (!nameElement) return;

            const productName = nameElement.textContent.trim();
            if (item.name === productName) {
                const addButton = card.querySelector('.add-to-cart-btn');
                if (addButton && !addButton.classList.contains(CSS_CLASSES.quantityControl)) {
                    this.showQuantityControl(addButton, item.id, item.quantity);
                }
            }
        });
    }

    /**
     * Restaura el botón original para un producto por nombre
     */
    restoreOriginalButtonByName(productName) {
        const productCards = safeQuerySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const nameElement = card.querySelector('h3');
            if (!nameElement) return;

            const cardProductName = nameElement.textContent.trim();
            if (cardProductName === productName) {
                const button = card.querySelector('.add-to-cart-btn');
                if (button && button.classList.contains(CSS_CLASSES.quantityControl)) {
                    this.restoreOriginalButton(button);
                }
            }
        });
    }

    /**
     * Configura el listener para cambios en el carrito
     */
    setupCartListener() {
        cart.addListener((eventType, data) => {
            switch (eventType) {
                case 'itemUpdated':
                    this.updateQuantityControl(data.productId, data.newQuantity);
                    break;
                case 'itemRemoved':
                    this.restoreOriginalButtonByName(data.itemName);
                    break;
                case 'cartLoaded':
                    delay(() => this.restoreQuantityControls(), 100);
                    break;
            }
        });
    }

    /**
     * Limpia todos los controles
     */
    cleanup() {
        this.quantityControls.clear();
    }
}

// Instancia singleton del manejador de productos
export const productManager = new ProductManager();

// Exportar también la clase
export { ProductManager };
