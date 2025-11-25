/**
 * Módulo de gestión del carrito de compras
 */

import { STORAGE_KEYS, CSS_CLASSES, ANIMATION_DURATIONS } from '../utils/constants.js';
import { 
    normalizeTotalPrice, 
    isValidCartStructure, 
    safeQuerySelector,
    safeQuerySelectorAll,
    formatPrice 
} from '../utils/helpers.js';

class Cart {
    constructor() {
        this.items = [];
        this.totalPrice = 0;
        this.listeners = [];
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupStorageListener();
    }

    /**
     * Añade un producto al carrito
     */
    addItem(id, name, price, quantity = 1, imageUrl = null) {
        const existingItem = this.findItem(id);
        
        if (existingItem) {
            const oldQuantity = existingItem.quantity;
            existingItem.quantity = quantity;
            this.totalPrice += price * (quantity - oldQuantity);
        } else {
            this.items.push({
                id,
                name,
                price,
                quantity,
                imageUrl
            });
            this.totalPrice += price * quantity;
        }
        
        this.totalPrice = normalizeTotalPrice(this.totalPrice);
        this.saveToStorage();
        this.notifyListeners('itemAdded', { id, name, price, quantity, imageUrl });
        
        console.log("Producto añadido al carrito:", { id, name, price, quantity });
    }

    /**
     * Actualiza la cantidad de un producto
     */
    updateItemQuantity(productId, newQuantity) {
        const item = this.findItem(productId);
        
        if (item) {
            const priceDifference = item.price * (newQuantity - item.quantity);
            item.quantity = newQuantity;
            this.totalPrice += priceDifference;
            this.totalPrice = normalizeTotalPrice(this.totalPrice);
            
            this.saveToStorage();
            this.notifyListeners('itemUpdated', { productId, newQuantity });
        }
    }

    /**
     * Elimina un producto del carrito
     */
    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const item = this.items[itemIndex];
            this.totalPrice -= item.price * item.quantity;
            this.totalPrice = normalizeTotalPrice(this.totalPrice);
            
            this.items.splice(itemIndex, 1);
            
            this.saveToStorage();
            this.notifyListeners('itemRemoved', { productId, itemName: item.name });
            
            console.log("Producto eliminado del carrito:", productId);
        }
    }

    /**
     * Busca un producto en el carrito
     */
    findItem(productId) {
        return this.items.find(item => item.id === productId);
    }

    /**
     * Obtiene el total de productos en el carrito
     */
    getTotalItemsCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Verifica si el carrito está vacío
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Limpia el carrito completamente
     */
    clear() {
        this.items = [];
        this.totalPrice = 0;
        this.saveToStorage();
        this.notifyListeners('cartCleared');
    }

    /**
     * Obtiene los datos del carrito para exportar
     */
    getCartData() {
        return {
            items: [...this.items],
            totalPrice: this.totalPrice,
            totalItems: this.getTotalItemsCount()
        };
    }

    /**
     * Guarda el carrito en localStorage
     */
    saveToStorage() {
        try {
            const cartData = {
                items: this.items,
                totalPrice: this.totalPrice
            };
            localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cartData));
            console.log("Carrito guardado en localStorage");
        } catch (error) {
            console.error("Error al guardar carrito:", error);
        }
    }

    /**
     * Carga el carrito desde localStorage
     */
    loadFromStorage() {
        try {
            const savedCart = localStorage.getItem(STORAGE_KEYS.cart);
            
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                
                if (isValidCartStructure(parsedCart)) {
                    this.items = parsedCart.items;
                    this.totalPrice = normalizeTotalPrice(parsedCart.totalPrice);
                    
                    console.log("Carrito cargado desde localStorage:", this.getCartData());
                    this.notifyListeners('cartLoaded');
                } else {
                    console.warn("Estructura de carrito inválida en localStorage");
                    this.clear();
                }
            }
        } catch (error) {
            console.error("Error al cargar carrito:", error);
            this.clear();
        }
    }

    /**
     * Configura el listener para cambios en localStorage
     */
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.cart) {
                console.log("Detectado cambio en carrito desde otra pestaña");
                this.loadFromStorage();
            }
        });
    }

    /**
     * Añade un listener para eventos del carrito
     */
    addListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    /**
     * Elimina un listener
     */
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Notifica a todos los listeners sobre cambios
     */
    notifyListeners(eventType, data = {}) {
        this.listeners.forEach(callback => {
            try {
                callback(eventType, { ...data, cart: this.getCartData() });
            } catch (error) {
                console.error("Error en listener del carrito:", error);
            }
        });
    }
}

// Instancia singleton del carrito
export const cart = new Cart();

// Exportar también la clase para crear instancias adicionales si es necesario
export { Cart };
