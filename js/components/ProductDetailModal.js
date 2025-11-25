/**
 * Módulo de modal de detalles del producto
 */

import { cart } from './Cart.js';
import { DOM_SELECTORS, CSS_CLASSES } from '../utils/constants.js';
import { 
    generateProductId, 
    extractPriceValue,
    safeQuerySelector,
    safeQuerySelectorAll,
    safeAddEventListener
} from '../utils/helpers.js';

class ProductDetailModal {
    constructor() {
        this.elements = {};
        this.isOpen = false;
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupProductCardListeners();
    }

    /**
     * Cachea las referencias a elementos del DOM
     */
    cacheElements() {
        this.elements = {
            overlay: safeQuerySelector(DOM_SELECTORS.productDetailOverlay),
            modal: safeQuerySelector(DOM_SELECTORS.productDetailModal),
            content: safeQuerySelector(DOM_SELECTORS.productDetailContent),
            closeBtn: safeQuerySelector(DOM_SELECTORS.closeProductDetailBtn)
        };
    }

    /**
     * Configura los event listeners principales
     */
    setupEventListeners() {
        // Botón de cerrar
        safeAddEventListener(this.elements.closeBtn, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.close();
        });

        // Clic en overlay para cerrar
        safeAddEventListener(this.elements.overlay, 'click', (e) => {
            if (e.target === this.elements.overlay) {
                this.close();
            }
        });

        // Tecla ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Configura los listeners para las tarjetas de productos
     */
    setupProductCardListeners() {
        const productCards = safeQuerySelectorAll(DOM_SELECTORS.productCards);
        
        productCards.forEach(card => {
            card.style.cursor = 'pointer';
            
            safeAddEventListener(card, 'click', (event) => {
                // No abrir modal si se hace clic en botones
                if (this.isClickOnButton(event)) {
                    return;
                }
                
                event.preventDefault();
                this.openFromCard(card);
            });
        });
    }

    /**
     * Verifica si el clic fue en un botón o control
     */
    isClickOnButton(event) {
        return event.target.closest('.add-to-cart-btn') || 
               event.target.closest('.favorite-btn') || 
               event.target.closest('.quantity-btn') ||
               event.target.closest('.quantity-wrapper');
    }

    /**
     * Abre el modal desde una tarjeta de producto
     */
    openFromCard(card) {
        const productData = this.extractProductDataFromCard(card);
        if (!productData) return;

        this.show(productData);
    }

    /**
     * Extrae los datos del producto desde una tarjeta
     */
    extractProductDataFromCard(card) {
        try {
            const imageElement = card.querySelector('.card-image-container img');
            const titleElement = card.querySelector('h3');
            const descriptionElement = card.querySelector('p');
            const priceElement = card.querySelector('.current-price');

            if (!titleElement || !priceElement) return null;

            return {
                image: imageElement ? imageElement.src : '',
                title: titleElement.textContent.trim(),
                description: descriptionElement ? descriptionElement.textContent.trim() : '',
                price: priceElement.textContent.trim(),
                id: generateProductId(titleElement.textContent.trim())
            };
        } catch (error) {
            console.error("Error al extraer datos del producto:", error);
            return null;
        }
    }

    /**
     * Muestra el modal con los datos del producto
     */
    show(productData) {
        if (!this.elements.modal || !this.elements.overlay || !this.elements.content) return;

        const inCart = cart.findItem(productData.id);
        const addToCartHTML = this.generateAddToCartHTML(productData, inCart);

        this.elements.content.innerHTML = `
            <div class="product-detail-image" style="background-image: url('${productData.image}')"></div>
            <div class="product-detail-info">
                <h2 class="product-detail-title">${productData.title}</h2>
                <p class="product-detail-description">${productData.description}</p>
                <div class="product-detail-price">
                    <span class="product-detail-current-price">${productData.price}</span>
                </div>
                ${addToCartHTML}
            </div>
        `;

        // Configurar listeners según el estado del producto
        this.setupModalProductListeners(productData, inCart);

        // Mostrar modal
        this.elements.modal.classList.add(CSS_CLASSES.show);
        this.elements.overlay.classList.add(CSS_CLASSES.show);
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
    }

    /**
     * Genera el HTML para el botón/control de agregar al carrito
     */
    generateAddToCartHTML(productData, inCart) {
        if (inCart) {
            const isTrash = inCart.quantity === 1;
            return `
                <div class="add-to-cart-btn quantity-control">
                    <div class="quantity-wrapper">
                        <button class="quantity-btn minus" ${isTrash ? 'data-trash="true"' : ''}>
                            <i class="fas ${isTrash ? 'fa-trash' : 'fa-minus'}"></i>
                        </button>
                        <span class="quantity-value" data-product-id="${productData.id}">${inCart.quantity}</span>
                        <button class="quantity-btn plus">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <button class="product-detail-add-btn" data-product-id="${productData.id}">
                    Agregar al pedido
                </button>
            `;
        }
    }

    /**
     * Configura los listeners para el producto en el modal
     */
    setupModalProductListeners(productData, inCart) {
        if (!inCart) {
            this.setupAddToCartListener(productData);
        } else {
            this.setupQuantityControlListeners(productData);
        }
    }

    /**
     * Configura el listener para el botón "Agregar al carrito"
     */
    setupAddToCartListener(productData) {
        const addBtn = this.elements.content.querySelector('.product-detail-add-btn');
        
        safeAddEventListener(addBtn, 'click', () => {
            const priceValue = extractPriceValue(productData.price);
            
            // Añadir al carrito
            cart.addItem(productData.id, productData.title, priceValue, 1, productData.image);
            
            // Actualizar el HTML del modal para mostrar control de cantidad
            addBtn.outerHTML = this.generateAddToCartHTML(productData, { quantity: 1 });
            
            // Configurar nuevos listeners
            this.setupQuantityControlListeners(productData);
        });
    }

    /**
     * Configura los listeners para los controles de cantidad
     */
    setupQuantityControlListeners(productData) {
        const controlContainer = this.elements.content.querySelector('.quantity-control');
        if (!controlContainer) return;

        const minusBtn = controlContainer.querySelector('.quantity-btn.minus');
        const plusBtn = controlContainer.querySelector('.quantity-btn.plus');
        const quantityDisplay = controlContainer.querySelector('.quantity-value');

        safeAddEventListener(minusBtn, 'click', (e) => {
            e.stopPropagation();
            
            const currentQuantity = parseInt(quantityDisplay.textContent);
            
            if (currentQuantity > 1) {
                const newQuantity = currentQuantity - 1;
                quantityDisplay.textContent = newQuantity;
                cart.updateItemQuantity(productData.id, newQuantity);
                
                // Actualizar icono
                if (newQuantity === 1) {
                    minusBtn.setAttribute('data-trash', 'true');
                    minusBtn.innerHTML = '<i class="fas fa-trash"></i>';
                }
            } else {
                // Eliminar del carrito
                cart.removeItem(productData.id);
                
                // Restaurar botón de agregar
                controlContainer.outerHTML = `
                    <button class="product-detail-add-btn" data-product-id="${productData.id}">
                        Agregar al pedido
                    </button>
                `;
                
                // Configurar nuevo listener
                this.setupAddToCartListener(productData);
            }
        });

        safeAddEventListener(plusBtn, 'click', (e) => {
            e.stopPropagation();
            
            const currentQuantity = parseInt(quantityDisplay.textContent);
            const newQuantity = currentQuantity + 1;
            
            quantityDisplay.textContent = newQuantity;
            cart.updateItemQuantity(productData.id, newQuantity);
            
            // Actualizar icono
            if (currentQuantity === 1) {
                minusBtn.removeAttribute('data-trash');
                minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
            }
        });
    }

    /**
     * Cierra el modal
     */
    close() {
        if (!this.elements.modal || !this.elements.overlay) return;

        this.elements.modal.classList.remove(CSS_CLASSES.show);
        this.elements.overlay.classList.remove(CSS_CLASSES.show);
        document.body.style.overflow = '';
        this.isOpen = false;
    }

    /**
     * Verifica si el modal está abierto
     */
    isModalOpen() {
        return this.isOpen;
    }
}

// Instancia singleton del modal de detalles
export const productDetailModal = new ProductDetailModal();

// Exportar también la clase
export { ProductDetailModal };
