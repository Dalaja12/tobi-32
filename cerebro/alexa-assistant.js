// CyberPet Voice Final - Asistente por voz con imágenes
class CyberPetVoice {
    constructor() {
        this.isActive = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.wakeWord = "cyberpet"; // CAMBIADO DE "alexa" A "cyberpet"
        this.button = document.getElementById('alexaBtn'); // El botón sigue llamándose alexaBtn por compatibilidad
        
        // Imágenes para los estados del botón
        this.buttonImages = {
            inactive: 'img/robot.png',    // 🤖 (desactivado)
            listening: 'img/microfono.png',    // 🎤 (escuchando)
            speaking: 'img/globo-de-chat.png',  // 🗣️ (hablando)
            thinking: 'img/idea.png'   // 🤔 (pensando)
        };
        
        // Inicializar
        this.initialize();
    }
    
    initialize() {
        console.log('🎯 CyberPet Voice inicializando...');
        
        // Actualizar título del botón
        if (this.button) {
            this.button.title = 'Modo CyberPet - Asistente por voz';
        }
        
        // Configurar el botón con imagen inicial
        if (this.button) {
            // Reemplazar emoji por imagen
            this.button.innerHTML = '';
            const img = document.createElement('img');
            img.src = this.buttonImages.inactive;
            img.alt = 'CyberPet';
            img.style.width = '32px';
            img.style.height = '32px';
            this.button.appendChild(img);
            
            this.button.addEventListener('click', () => this.toggleMicrophone());
            console.log('✅ Botón CyberPet configurado');
        } else {
            console.error('❌ Botón CyberPet no encontrado');
            return;
        }
        
        // Configurar reconocimiento de voz
        this.setupVoiceRecognition();
        
        // Botón comienza con animación suave
        this.button.style.animation = 'pulse 2s infinite';
    }
    
    setupVoiceRecognition() {
        // Verificar si el navegador soporta reconocimiento de voz
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('⚠️ Navegador no soporta voz');
            this.button.onclick = () => {
                alert('Tu navegador no soporta reconocimiento de voz.\nUsa Chrome o Edge en tu móvil.');
            };
            return;
        }
        
        // Crear reconocimiento
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'es-MX'; // VOZ MEXICANA
        this.recognition.continuous = false; // Solo una vez por comando
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        // Cuando empieza a escuchar
        this.recognition.onstart = () => {
            console.log('🎤 Micrófono ACTIVADO');
            this.animateMouth('listening');
        };
        
        // Cuando recibe resultado
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log('👂 Escuché:', transcript);
            
            // Buscar "cyberpet" en lo que dijo (ACEPTA VARIACIONES)
            const hasWakeWord = transcript.includes('cyberpet') || 
                               transcript.includes('cyber pet') ||
                               transcript.includes('saíberpet') || // Para acento español
                               transcript.includes('saiberpet');
            
            if (hasWakeWord) {
                console.log('✅ "CyberPet" detectado');
                this.processCommand(transcript);
            } else {
                // Si no dijo "cyberpet", ignorar
                console.log('❌ No dijo "CyberPet"');
                this.resetToListening();
            }
        };
        
        // Si hay error
        this.recognition.onerror = (event) => {
            console.log('⚠️ Error micrófono:', event.error);
            
            if (event.error === 'not-allowed') {
                this.showMessage('🎤 Permitir micrófono');
                setTimeout(() => {
                    alert('Por favor, permite el acceso al micrófono para usar CyberPet.');
                }, 500);
            }
            
            this.resetButton();
        };
        
        // Cuando termina de escuchar
        this.recognition.onend = () => {
            console.log('🔇 Micrófono DESACTIVADO');
            
            // Solo reiniciar si sigue activo y no está hablando
            if (this.isActive && !this.isSpeaking) {
                setTimeout(() => {
                    if (this.isActive && !this.isSpeaking) {
                        this.startListening();
                    }
                }, 1000);
            }
        };
        
        console.log('✅ Reconocimiento de voz listo para CyberPet (es-MX)');
    }
    
    toggleMicrophone() {
        console.log('🔄 Botón presionado - Estado actual:', this.isActive);
        
        if (this.isSpeaking) {
            // Si está hablando, detenerlo
            this.stopSpeaking();
            return;
        }
        
        if (!this.isActive) {
            // ACTIVAR micrófono
            this.activateMicrophone();
        } else {
            // DESACTIVAR micrófono
            this.deactivateMicrophone();
        }
    }
    
    changeButtonImage(state) {
        const img = this.button.querySelector('img');
        if (img) {
            img.src = this.buttonImages[state] || this.buttonImages.inactive;
            img.alt = state;
        }
    }
    
    activateMicrophone() {
        this.isActive = true;
        
        // Cambiar botón a modo escucha (IMAGEN)
        this.changeButtonImage('listening');
        this.button.classList.add('active');
        this.button.style.animation = 'pulse 0.5s infinite';
        this.button.title = 'CyberPet escuchando - Toca para desactivar';
        
        // Mostrar indicador
        this.showStatusIndicator('Di "CyberPet"', false);
        
        console.log('🚀 CyberPet ACTIVADO');
        
        // Iniciar escucha
        setTimeout(() => {
            this.startListening();
        }, 300);
    }
    
    deactivateMicrophone() {
        this.isActive = false;
        
        // Cambiar botón a modo inactivo (IMAGEN)
        this.changeButtonImage('inactive');
        this.button.classList.remove('active');
        this.button.style.animation = 'pulse 2s infinite';
        this.button.title = 'Modo CyberPet - Asistente por voz';
        
        // Detener reconocimiento
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('Error deteniendo:', e);
            }
        }
        
        // Ocultar indicador
        this.hideStatusIndicator();
        
        console.log('⏸️ CyberPet DESACTIVADO');
        
        // Restaurar boca
        this.animateMouth('normal');
    }
    
    startListening() {
        if (!this.recognition || !this.isActive || this.isSpeaking) {
            return;
        }
        
        try {
            console.log('▶️ CyberPet escuchando...');
            this.recognition.start();
        } catch (error) {
            console.error('❌ Error al iniciar:', error);
            
            // Reintentar en 2 segundos
            if (this.isActive) {
                setTimeout(() => this.startListening(), 2000);
            }
        }
    }
    
    extractCommand(transcript) {
        // Buscar la palabra "cyberpet" o variantes
        const wakeWordPattern = /(cyberpet|cyber pet|sa[iíí]berpet)/i;
        const match = transcript.match(wakeWordPattern);
        
        if (match) {
            // Extraer todo después de la palabra de activación
            const startIndex = transcript.indexOf(match[0].toLowerCase());
            const command = transcript.substring(startIndex + match[0].length).trim();
            return command.replace(/[.,!?]/g, '').trim();
        }
        
        return '';
    }
    
    processCommand(transcript) {
        // Extraer comando después de "cyberpet"
        const command = this.extractCommand(transcript);
        
        console.log('📝 Comando CyberPet:', command);
        
        // Comandos para detener
        if (this.isStopCommand(command)) {
            console.log('🛑 Comando DETENER');
            this.stopSpeaking();
            this.resetToListening();
            return;
        }
        
        // Si solo dijo "cyberpet"
        if (!command) {
            this.speak("¿Sí? ¿En qué puedo ayudarte?");
            return;
        }
        
        // Buscar respuesta
        this.findResponse(command);
    }
    
    isStopCommand(command) {
        const stopWords = ['para', 'detente', 'cállate', 'callate', 'silencio', 'basta', 'alto', 'detente'];
        return stopWords.some(word => command.includes(word));
    }
    
    findResponse(query) {
        console.log('🔍 CyberPet buscando respuesta para:', query);
        
        // Cambiar botón a modo pensando (IMAGEN)
        this.changeButtonImage('thinking');
        this.button.style.animation = 'none';
        
        // Mostrar que está procesando
        this.showStatusIndicator('🤔 Procesando...', false);
        
        // 1. Buscar en respuestas predefinidas (si existen)
        if (typeof getPredefinedResponse === 'function') {
            const response = getPredefinedResponse(query);
            if (response) {
                console.log('✅ Respuesta predefinida encontrada');
                const responseText = typeof response === 'object' ? response.text : response;
                this.speak(responseText);
                return;
            }
        }
        
        // 2. Buscar en Wikipedia (si existe la función)
        if (typeof searchWeb === 'function') {
            console.log('🌐 CyberPet buscando en web...');
            this.searchWebAndSpeak(query);
            return;
        }
        
        // 3. Respuesta por defecto
        this.speak(`Entendí "${query}", pero aún estoy aprendiendo. Pregúntame algo más.`);
    }
    
    searchWebAndSpeak(query) {
        // Guardar función original
        const originalAddMessage = window.addMessage;
        let responseCaptured = false;
        
        // Interceptar mensajes
        window.addMessage = (text, sender) => {
            if (sender === 'bot' && !responseCaptured) {
                // LIMPIAR EMOJIS - NO LEER EMOJIS
                const cleanText = this.removeEmojis(text);
                
                // Filtrar mensajes del sistema
                if (cleanText.length > 20 && 
                    !cleanText.includes('Buscando') && 
                    !cleanText.includes('Cargando') &&
                    !cleanText.includes('Hola! Soy CyberPet')) {
                    
                    responseCaptured = true;
                    console.log('✅ Respuesta web encontrada');
                    
                    // Hablar la respuesta SIN EMOJIS
                    this.speak(cleanText);
                    
                    // Restaurar función original
                    window.addMessage = originalAddMessage;
                }
            }
            
            // Pasar a original si existe
            if (originalAddMessage && !responseCaptured) {
                originalAddMessage(text, sender);
            }
        };
        
        // Ejecutar búsqueda
        try {
            searchWeb(query);
            
            // Timeout por si no responde
            setTimeout(() => {
                if (!responseCaptured) {
                    window.addMessage = originalAddMessage;
                    this.speak("No encontré información sobre eso.");
                }
            }, 7000);
            
        } catch (error) {
            window.addMessage = originalAddMessage;
            this.speak("Hubo un error al buscar. Intenta de nuevo.");
        }
    }
    
    removeEmojis(str) {
        // REMOVER TODOS LOS EMOJIS
        return str.replace(/[\p{Emoji}]/gu, '').replace(/\s+/g, ' ').trim();
    }
    
    speak(text) {
        console.log('🗣️ CyberPet hablando:', text.substring(0, 50) + '...');
        
        if (!window.speechSynthesis) {
            console.error('❌ No puede hablar');
            this.resetToListening();
            return;
        }
        
        // Cambiar estados
        this.isSpeaking = true;
        this.changeButtonImage('speaking');
        this.button.classList.add('speaking');
        this.button.style.animation = 'pulse 0.3s infinite';
        
        // Mostrar que está hablando
        this.showStatusIndicator('🗣️ Hablando...', false);
        
        // Animar boca
        this.animateMouth('speaking');
        this.startMouthAnimation();
        
        // Detener micrófono mientras habla
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
        
        // Asegurar que el texto NO tenga emojis
        const cleanText = this.removeEmojis(text);
        
        // Crear habla con voz mexicana
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'es-MX'; // VOZ MEXICANA
        utterance.rate = 0.85;
        utterance.pitch = 0.9;
        utterance.volume = 1.0;
        
        // Intentar seleccionar voz mexicana si está disponible
        setTimeout(() => {
            const voices = window.speechSynthesis.getVoices();
            const mexicanVoice = voices.find(voice => 
                voice.lang === 'es-MX' || voice.lang.startsWith('es-MX')
            );
            
            if (mexicanVoice) {
                utterance.voice = mexicanVoice;
                console.log('✅ CyberPet usando voz mexicana:', mexicanVoice.name);
            }
        }, 100);
        
        // Cuando empieza a hablar
        utterance.onstart = () => {
            console.log('▶️ CyberPet empezó a hablar');
        };
        
        // Cuando termina de hablar
        utterance.onend = () => {
            console.log('✅ CyberPet terminó de hablar');
            this.finishSpeaking();
        };
        
        // Si hay error
        utterance.onerror = (event) => {
            console.error('❌ Error al hablar:', event);
            this.finishSpeaking();
        };
        
        // Hablar con pequeño delay
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 200);
    }
    
    finishSpeaking() {
        // Terminar habla
        this.isSpeaking = false;
        this.stopMouthAnimation();
        
        // Si CyberPet sigue activo, volver a escuchar
        if (this.isActive) {
            this.resetToListening();
        } else {
            // Si no está activa, resetear botón
            this.resetButton();
        }
    }
    
    stopSpeaking() {
        // Detener habla si está hablando
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        this.isSpeaking = false;
        this.stopMouthAnimation();
        
        console.log('⏹️ CyberPet detuvo habla');
        
        // Mostrar mensaje de detenido
        this.showStatusIndicator('🛑 Detenido', false, true);
        
        setTimeout(() => {
            // Si CyberPet sigue activo, volver a escuchar
            if (this.isActive) {
                this.resetToListening();
            } else {
                this.resetButton();
            }
        }, 1500);
    }
    
    resetToListening() {
        // Volver a modo escucha (IMAGEN)
        this.changeButtonImage('listening');
        this.button.classList.remove('speaking');
        this.button.classList.add('active');
        this.button.style.animation = 'pulse 0.5s infinite';
        
        // Mostrar indicador
        this.showStatusIndicator('Di "CyberPet"', false);
        
        this.animateMouth('listening');
        
        // Reiniciar escucha después de un momento
        setTimeout(() => {
            if (this.isActive && !this.isSpeaking) {
                this.startListening();
            }
        }, 1000);
    }
    
    resetButton() {
        // Botón a estado normal (IMAGEN)
        this.changeButtonImage('inactive');
        this.button.classList.remove('active', 'speaking');
        this.button.style.animation = 'pulse 2s infinite';
        this.button.title = 'Modo CyberPet - Asistente por voz';
        
        // Ocultar indicador
        this.hideStatusIndicator();
        
        this.animateMouth('normal');
    }
    
    animateMouth(state) {
        const mouth = document.getElementById('mouth');
        if (!mouth) return;
        
        // Remover todas las clases de animación
        mouth.classList.remove('listening', 'speaking', 'happy', 'surprised');
        
        // Añadir clase según estado
        if (state === 'listening') {
            mouth.classList.add('surprised'); // Boca abierta para escuchar
        } else if (state === 'speaking') {
            mouth.classList.add('happy'); // Boca normal para hablar
        } else {
            mouth.classList.add('happy'); // Boca normal
        }
    }
    
    startMouthAnimation() {
        const mouth = document.getElementById('mouth');
        if (!mouth) return;
        
        // Animación de boca hablando
        this.mouthInterval = setInterval(() => {
            mouth.classList.toggle('surprised');
        }, 200);
    }
    
    stopMouthAnimation() {
        const mouth = document.getElementById('mouth');
        if (mouth) {
            mouth.classList.remove('surprised');
            mouth.classList.add('happy');
        }
        
        if (this.mouthInterval) {
            clearInterval(this.mouthInterval);
        }
    }
    
    showStatusIndicator(text, isListening = false, isError = false) {
        // Usar el contenedor existente o crear uno nuevo
        let container = document.getElementById('alexaStatusContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'alexaStatusContainer';
            container.style.cssText = `
                margin: 10px 0;
                padding: 8px;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid var(--main-color, #0ff);
            `;
            
            const statsPanel = document.getElementById('statsPanel');
            if (statsPanel) {
                statsPanel.appendChild(container);
            }
        }
        
        let indicator = document.getElementById('cyberpetStatus');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'cyberpetStatus';
            indicator.className = 'cyberpet-status';
            indicator.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Orbitron', sans-serif;
                font-size: 14px;
            `;
            container.appendChild(indicator);
        }
        
        // Crear pulso visual
        let pulse = '';
        if (isListening) {
            pulse = `<div style="width: 10px; height: 10px; background: #0ff; border-radius: 50%; animation: pulse 1s infinite;"></div>`;
        } else if (isError) {
            pulse = `<div style="width: 10px; height: 10px; background: #f00; border-radius: 50%;"></div>`;
        } else {
            pulse = `<div style="width: 10px; height: 10px; background: #0f0; border-radius: 50%;"></div>`;
        }
        
        indicator.innerHTML = pulse + `<span style="color: ${isError ? '#f00' : '#fff'}">${text}</span>`;
        container.style.display = 'block';
    }
    
    hideStatusIndicator() {
        const container = document.getElementById('alexaStatusContainer');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    showMessage(text) {
        // Mostrar mensaje temporal
        const container = document.getElementById('alexaStatusContainer');
        if (container) {
            container.innerHTML = `<div style="color: #0ff">${text}</div>`;
            container.style.display = 'block';
            
            setTimeout(() => {
                container.style.display = 'none';
            }, 3000);
        }
    }
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Página cargada - Iniciando CyberPet Voice');
    
    // Esperar a que carguen todas las imágenes
    setTimeout(() => {
        try {
            window.cyberPetVoice = new CyberPetVoice();
            console.log('✅ CyberPet Voice listo para usar');
            
            // Verificar que las imágenes existan
            const img = document.querySelector('#alexaBtn img');
            if (img && img.naturalWidth === 0) {
                console.warn('⚠️ Imagen no cargada, usando emoji de respaldo');
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><text y="20" font-size="20">🤖</text></svg>';
            }
        } catch (error) {
            console.error('❌ Error iniciando CyberPet:', error);
            
            // Fallback simple con emoji
            const btn = document.getElementById('alexaBtn');
            if (btn) {
                btn.innerHTML = '🤖';
                btn.title = 'CyberPet - Asistente por voz';
                btn.onclick = () => {
                    alert('CyberPet no está disponible.\nPrueba actualizando tu navegador.');
                };
            }
        }
    }, 1500);
});

// Estilos para el botón con imágenes
if (!document.querySelector('#cyberpet-voice-styles')) {
    const style = document.createElement('style');
    style.id = 'cyberpet-voice-styles';
    style.textContent = `
        /* Animaciones básicas */
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse-fast {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        @keyframes glow-red {
            0% { box-shadow: 0 0 5px #ff3366; }
            50% { box-shadow: 0 0 20px #ff3366; }
            100% { box-shadow: 0 0 5px #ff3366; }
        }
        
        @keyframes glow-green {
            0% { box-shadow: 0 0 5px #00cc66; }
            50% { box-shadow: 0 0 20px #00cc66; }
            100% { box-shadow: 0 0 5px #00cc66; }
        }
        
        @keyframes glow-blue {
            0% { box-shadow: 0 0 5px #0ff; }
            50% { box-shadow: 0 0 15px #0ff; }
            100% { box-shadow: 0 0 5px #0ff; }
        }
        
        /* Estados del botón CON IMÁGENES */
        #alexaBtn {
            transition: all 0.3s;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid var(--main-color, #0ff);
        }
        
        #alexaBtn img {
            display: block;
            transition: transform 0.3s;
            filter: drop-shadow(0 0 3px rgba(0, 255, 255, 0.5));
        }
        
        #alexaBtn.active {
            background: rgba(255, 51, 102, 0.2) !important;
            border-color: #ff3366 !important;
            animation: pulse-fast 0.5s infinite, glow-red 1.5s infinite !important;
        }
        
        #alexaBtn.speaking {
            background: rgba(0, 204, 102, 0.2) !important;
            border-color: #00cc66 !important;
            animation: pulse-fast 0.3s infinite, glow-green 1.5s infinite !important;
        }
        
        #alexaBtn:hover {
            animation: glow-blue 2s infinite !important;
        }
        
        #alexaBtn:hover img {
            transform: scale(1.1);
        }
        
        #alexaBtn:active {
            transform: scale(0.95);
        }
        
        /* Indicador de estado */
        #alexaStatusContainer {
            transition: all 0.3s;
        }
        
        /* Para móviles */
        @media (max-width: 768px) {
            #alexaBtn {
                min-width: 60px !important;
                min-height: 60px !important;
                padding: 10px;
            }
            
            #alexaBtn img {
                width: 36px !important;
                height: 36px !important;
            }
            
            #alexaStatusContainer {
                font-size: 12px !important;
                padding: 6px !important;
                margin: 5px 0 !important;
            }
        }
        
        /* Para pantallas muy pequeñas */
        @media (max-width: 480px) {
            #alexaBtn {
                min-width: 50px !important;
                min-height: 50px !important;
                padding: 6px;
            }
            
            #alexaBtn img {
                width: 30px !important;
                height: 30px !important;
            }
            
            #alexaStatusContainer {
                font-size: 11px !important;
                padding: 4px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Script para precargar imágenes
function preloadCyberPetImages() {
    const images = [
        'img/robot.png',
        'img/microfono.png', 
        'img/globo-de-chat.png',
        'img/idea.png'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onerror = () => {
            console.warn(`⚠️ No se pudo cargar imagen: ${src}`);
        };
    });
}

// Precargar imágenes cuando sea posible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCyberPetImages);
} else {
    preloadCyberPetImages();
}

// Actualizar cualquier texto que diga "Alexa" a "CyberPet" en la UI
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Actualizar textos en el botón
        const alexaBtn = document.getElementById('alexaBtn');
        if (alexaBtn && !alexaBtn.querySelector('img')) {
            alexaBtn.title = 'Modo CyberPet - Asistente por voz';
        }
        
        // Actualizar título de la página si es necesario
        if (document.title.includes('Alexa')) {
            document.title = document.title.replace('Alexa', 'CyberPet');
        }
    }, 2000);
});