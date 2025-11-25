/**
 * Archivo principal de la aplicación
 * Integra todos los módulos y componentes
 */

// Importar todos los componentes
import { cart } from './components/Cart.js';
import { cartUI } from './components/CartUI.js';
import { productManager } from './components/ProductManager.js';
import { productDetailModal } from './components/ProductDetailModal.js';
import { navigation } from './components/Navigation.js';
import { swiperManager } from './components/SwiperManager.js';

// Importar utilidades
import { delay } from './utils/helpers.js';

class App {
    constructor() {
        this.isInitialized = false;
        this.components = {
            cart,
            cartUI,
            productManager,
            productDetailModal,
            navigation,
            swiperManager
        };
        
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.startApp();
            });
        } else {
            this.startApp();
        }
    }

    /**
     * Inicia todos los componentes de la aplicación
     */
    startApp() {
        console.log('🚀 Iniciando aplicación Agallas...');
        
        try {
            // Los componentes ya se inicializan automáticamente al importarse
            // Aquí podemos añadir lógica adicional de inicialización si es necesaria
            
            this.setupGlobalEventListeners();
            this.setupErrorHandling();
            
            // Marcar como inicializada
            this.isInitialized = true;
            
            console.log('✅ Aplicación Agallas inicializada correctamente');
            
            // Disparar evento personalizado para notificar que la app está lista
            this.dispatchReadyEvent();
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Configura event listeners globales
     */
    setupGlobalEventListeners() {
        // Listener para cambios de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            }
        });

        // Listener para resize de ventana
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Listener para beforeunload
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });
    }

    /**
     * Configura el manejo global de errores
     */
    setupErrorHandling() {
        // Capturar errores no manejados
        window.addEventListener('error', (event) => {
            console.error('Error no manejado:', event.error);
            this.logError('window_error', event.error);
        });

        // Capturar promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesa rechazada no manejada:', event.reason);
            this.logError('unhandled_rejection', event.reason);
        });
    }

    /**
     * Maneja cuando la página se vuelve visible
     */
    handlePageVisible() {
        console.log('🔄 Página visible, sincronizando datos...');
        
        // Sincronizar carrito desde localStorage
        if (this.components.cart) {
            this.components.cart.loadFromStorage();
        }
        
        // Actualizar UI
        if (this.components.cartUI) {
            this.components.cartUI.forceUpdate();
        }
    }

    /**
     * Maneja el resize de la ventana
     */
    handleWindowResize() {
        // Actualizar swipers si es necesario
        delay(() => {
            if (this.components.swiperManager) {
                this.components.swiperManager.updateAll();
            }
        }, 250);
    }

    /**
     * Maneja eventos antes de cerrar la página
     */
    handleBeforeUnload() {
        // Guardar cualquier estado pendiente
        console.log('📱 Guardando estado antes de cerrar...');
    }

    /**
     * Maneja errores de inicialización
     */
    handleInitializationError(error) {
        // En un entorno de producción, aquí se podría enviar el error a un servicio de logging
        console.error('Error de inicialización detallado:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Registra errores para debugging
     */
    logError(type, error) {
        const errorInfo = {
            type,
            message: error?.message || 'Error desconocido',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error('Error registrado:', errorInfo);
        
        // En producción, aquí se enviaría a un servicio de logging
    }

    /**
     * Dispara evento personalizado cuando la app está lista
     */
    dispatchReadyEvent() {
        const readyEvent = new CustomEvent('agallasAppReady', {
            detail: {
                timestamp: new Date().toISOString(),
                components: Object.keys(this.components)
            }
        });
        
        document.dispatchEvent(readyEvent);
    }

    /**
     * Método público para obtener el estado de la aplicación
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            cartItemsCount: this.components.cart?.getTotalItemsCount() || 0,
            cartTotal: this.components.cart?.totalPrice || 0
        };
    }

    /**
     * Método público para reinicializar componentes
     */
    reinitialize() {
        console.log('🔄 Reinicializando aplicación...');
        
        try {
            // Reinicializar swipers
            if (this.components.swiperManager) {
                this.components.swiperManager.reinitialize();
            }
            
            // Forzar actualización de UI
            if (this.components.cartUI) {
                this.components.cartUI.forceUpdate();
            }
            
            if (this.components.navigation) {
                this.components.navigation.forceUpdate();
            }
            
            console.log('✅ Reinicialización completada');
        } catch (error) {
            console.error('❌ Error en reinicialización:', error);
        }
    }

    /**
     * Método de limpieza para destruir la aplicación
     */
    destroy() {
        console.log('🧹 Destruyendo aplicación...');
        
        try {
            // Destruir swipers
            if (this.components.swiperManager) {
                this.components.swiperManager.destroyAll();
            }
            
            this.isInitialized = false;
            console.log('✅ Aplicación destruida correctamente');
        } catch (error) {
            console.error('❌ Error al destruir aplicación:', error);
        }
    }
}

// Crear instancia global de la aplicación
const app = new App();

// Exportar instancia y clase para uso externo
export { app, App };

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
    window.AgallasApp = app;
}
