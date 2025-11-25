// HeladeriaStatus.js - Sistema de estado y horarios para Mil Sabores
class HeladeriaStatus {
    constructor() {
        this.horarios = {
            // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
            diasAbierto: [3, 4, 5, 6], // Miércoles a Sábado
            horaApertura: 11, // 11:00 AM
            horaCierre: 15, // 3:00 PM
            minutoApertura: 0,
            minutoCierre: 0
        };
        
        this.info = {
            nombre: 'Mil Sabores',
            direccion: 'Jirón Crespo Castillo con Independencia, Huánuco',
            telefono: '+51 974 156 551',
            whatsapp: '51929716729',
            horarioTexto: 'Miércoles - Sábado: 11:00 AM - 3:00 PM'
        };
    }

    init() {
        this.actualizarEstado();
        // Actualizar cada minuto
        setInterval(() => this.actualizarEstado(), 60000);
    }

    estaAbierto() {
        const ahora = new Date();
        const diaSemana = ahora.getDay();
        const horaActual = ahora.getHours();
        const minutoActual = ahora.getMinutes();

        // Verificar si es un día de apertura
        if (!this.horarios.diasAbierto.includes(diaSemana)) {
            return false;
        }

        // Crear tiempo actual en minutos desde medianoche
        const tiempoActual = horaActual * 60 + minutoActual;
        const tiempoApertura = this.horarios.horaApertura * 60 + this.horarios.minutoApertura;
        const tiempoCierre = this.horarios.horaCierre * 60 + this.horarios.minutoCierre;

        return tiempoActual >= tiempoApertura && tiempoActual < tiempoCierre;
    }

    obtenerProximaApertura() {
        const ahora = new Date();
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        // Buscar el próximo día de apertura
        for (let i = 1; i <= 7; i++) {
            const fechaFutura = new Date(ahora);
            fechaFutura.setDate(ahora.getDate() + i);
            
            const diaFuturo = fechaFutura.getDay();
            
            if (this.horarios.diasAbierto.includes(diaFuturo)) {
                const nombreDia = diasSemana[diaFuturo];
                
                if (i === 1) {
                    return `Abrimos mañana (${nombreDia}) a las 11:00 AM`;
                } else if (i === 2) {
                    return `Abrimos pasado mañana (${nombreDia}) a las 11:00 AM`;
                } else {
                    return `Abrimos el ${nombreDia} a las 11:00 AM`;
                }
            }
        }
        
        return 'Abrimos el miércoles a las 11:00 AM';
    }

    obtenerTiempoRestante() {
        const ahora = new Date();
        const horaActual = ahora.getHours();
        const minutoActual = ahora.getMinutes();
        
        const minutosHastaCierre = (this.horarios.horaCierre * 60 + this.horarios.minutoCierre) - (horaActual * 60 + minutoActual);
        
        if (minutosHastaCierre > 60) {
            const horas = Math.floor(minutosHastaCierre / 60);
            return `Cerramos en ${horas} hora${horas > 1 ? 's' : ''}`;
        } else if (minutosHastaCierre > 0) {
            return `Cerramos en ${minutosHastaCierre} minutos`;
        }
        
        return 'Cerrando pronto';
    }

    actualizarEstado() {
        const statusBadge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');
        const proximaApertura = document.getElementById('proximaApertura');
        
        if (!statusBadge || !statusText) return;

        const estaAbierto = this.estaAbierto();
        
        // Limpiar clases anteriores
        statusBadge.className = 'status-badge';
        
        if (estaAbierto) {
            statusBadge.classList.add('abierto');
            statusText.innerHTML = `
                <span class="estado-principal">¡ABIERTO AHORA!</span>
                <span class="tiempo-restante">${this.obtenerTiempoRestante()}</span>
            `;
        } else {
            statusBadge.classList.add('cerrado');
            statusText.innerHTML = `
                <span class="estado-principal">CERRADO</span>
            `;
            
            if (proximaApertura) {
                proximaApertura.textContent = this.obtenerProximaApertura();
            }
        }
    }

    // Función para agregar animaciones y efectos especiales
    agregarEfectosVisuales() {
        const card = document.querySelector('.heladeria-info-card');
        if (!card) return;

        if (this.estaAbierto()) {
            card.classList.add('heladeria-abierta');
        } else {
            card.classList.remove('heladeria-abierta');
        }
    }

    // Generar mensaje personalizado para WhatsApp
    generarMensajeWhatsApp() {
        const estaAbierto = this.estaAbierto();
        if (estaAbierto) {
            return "¡Hola! Vi que están abiertos. Me gustaría saber más sobre sus helados disponibles.";
        } else {
            return "¡Hola! Me gustaría saber más sobre sus horarios y helados disponibles.";
        }
    }

    // Actualizar enlaces con mensajes personalizados
    actualizarEnlaces() {
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => {
            const mensaje = encodeURIComponent(this.generarMensajeWhatsApp());
            link.href = `https://wa.me/${this.info.whatsapp}?text=${mensaje}`;
        });
    }
}

// Inicializar el sistema de estado
const heladeriaStatus = new HeladeriaStatus();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    heladeriaStatus.init();
    heladeriaStatus.actualizarEnlaces();
    
    // Agregar efectos cada minuto
    setInterval(() => {
        heladeriaStatus.agregarEfectosVisuales();
        heladeriaStatus.actualizarEnlaces();
    }, 60000);
});