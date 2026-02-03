// Alexa Botón Final - Con imágenes y voz mexicana
class AlexaButton {
    constructor() {
        this.isActive = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.wakeWord = "alexa";
        this.button = document.getElementById('alexaBtn');
        
        // Imágenes para los estados del botón
        this.buttonImages = {
            inactive: 'img/alexa-off.png',    // 🤖 (desactivado)
            listening: 'img/alexa-on.png',    // 🎤 (escuchando)
            speaking: 'img/alexa-speak.png',  // 🗣️ (hablando)
            thinking: 'img/alexa-think.png'   // 🤔 (pensando)
        };
        
        // Inicializar
        this.initialize();
    }
    
    initialize() {
        console.log('🎯 Alexa Botón Final inicializando...');
        
        // Configurar el botón con imagen inicial
        if (this.button) {
            // Reemplazar emoji por imagen
            this.button.innerHTML = '';
            const img = document.createElement('img');
            img.src = this.buttonImages.inactive;
            img.alt = 'Alexa';
            img.style.width = '32px';
            img.style.height = '32px';
            this.button.appendChild(img);
            
            this.button.addEventListener('click', () => this.toggleMicrophone());
            console.log('✅ Botón configurado con imágenes');
        } else {
            console.error('❌ Botón Alexa no encontrado');
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
            
            // Buscar "alexa" en lo que dijo
            if (transcript.includes(this.wakeWord)) {
                console.log('✅ "Alexa" detectada');
                this.processCommand(transcript);
            } else {
                // Si no dijo "alexa", ignorar
                console.log('❌ No dijo "Alexa"');
                this.resetToListening();
            }
        };
        
        // Si hay error
        this.recognition.onerror = (event) => {
            console.log('⚠️ Error micrófono:', event.error);
            
            if (event.error === 'not-allowed') {
                this.showMessage('🎤 Permitir micrófono');
                setTimeout(() => {
                    alert('Por favor, permite el acceso al micrófono para usar Alexa.');
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
        
        console.log('✅ Reconocimiento de voz listo (es-MX)');
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
        this.button.title = 'Alexa escuchando - Toca para desactivar';
        
        console.log('🚀 Alexa ACTIVADA');
        
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
        this.button.title = 'Modo Alexa - Asistente por voz';
        
        // Detener reconocimiento
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('Error deteniendo:', e);
            }
        }
        
        console.log('⏸️ Alexa DESACTIVADA');
        
        // Restaurar boca
        this.animateMouth('normal');
    }
    
    startListening() {
        if (!this.recognition || !this.isActive || this.isSpeaking) {
            return;
        }
        
        try {
            console.log('▶️ Iniciando escucha...');
            this.recognition.start();
        } catch (error) {
            console.error('❌ Error al iniciar:', error);
            
            // Reintentar en 2 segundos
            if (this.isActive) {
                setTimeout(() => this.startListening(), 2000);
            }
        }
    }
    
    processCommand(transcript) {
        // Extraer comando después de "alexa"
        const alexaIndex = transcript.indexOf(this.wakeWord);
        let command = transcript.substring(alexaIndex + this.wakeWord.length).trim();
        command = command.replace(/[.,!?]/g, '').trim();
        
        console.log('📝 Comando:', command);
        
        // Comandos para detener
        if (this.isStopCommand(command)) {
            console.log('🛑 Comando DETENER');
            this.stopSpeaking();
            this.resetToListening();
            return;
        }
        
        // Si solo dijo "alexa"
        if (!command) {
            this.speak("¿Sí? ¿En qué puedo ayudarte?");
            return;
        }
        
        // Buscar respuesta
        this.findResponse(command);
    }
    
    isStopCommand(command) {
        const stopWords = ['para', 'detente', 'cállate', 'callate', 'silencio', 'basta', 'alto'];
        return stopWords.some(word => command.includes(word));
    }
    
    findResponse(query) {
        console.log('🔍 Buscando respuesta para:', query);
        
        // Cambiar botón a modo pensando (IMAGEN)
        this.changeButtonImage('thinking');
        this.button.style.animation = 'none';
        
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
            console.log('🌐 Buscando en web...');
            this.searchWebAndSpeak(query);
            return;
        }
        
        // 3. Respuesta por defecto
        this.speak(`Entendí "${query}", pero aún estoy aprendiendo.`);
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
            this.speak("Hubo un error al buscar.");
        }
    }
    
    removeEmojis(str) {
        // REMOVER TODOS LOS EMOJIS
        return str.replace(/[\p{Emoji}]/gu, '').replace(/\s+/g, ' ').trim();
    }
    
    speak(text) {
        console.log('🗣️ Hablando:', text.substring(0, 50) + '...');
        
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
                console.log('✅ Usando voz mexicana:', mexicanVoice.name);
            }
        }, 100);
        
        // Cuando empieza a hablar
        utterance.onstart = () => {
            console.log('▶️ Empezó a hablar (es-MX)');
        };
        
        // Cuando termina de hablar
        utterance.onend = () => {
            console.log('✅ Terminó de hablar');
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
        
        // Si Alexa sigue activa, volver a escuchar
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
        
        console.log('⏹️ Habla detenida');
        
        // Si Alexa sigue activa, volver a escuchar
        if (this.isActive) {
            this.resetToListening();
        } else {
            this.resetButton();
        }
    }
    
    resetToListening() {
        // Volver a modo escucha (IMAGEN)
        this.changeButtonImage('listening');
        this.button.classList.remove('speaking');
        this.button.classList.add('active');
        this.button.style.animation = 'pulse 0.5s infinite';
        
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
        this.button.title = 'Modo Alexa - Asistente por voz';
        
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
    console.log('🚀 Página cargada - Iniciando Alexa Button Final');
    
    // Esperar a que carguen todas las imágenes
    setTimeout(() => {
        try {
            window.alexaButton = new AlexaButton();
            console.log('✅ Alexa Button Final listo para usar');
            
            // Verificar que las imágenes existan
            const img = document.querySelector('#alexaBtn img');
            if (img && img.naturalWidth === 0) {
                console.warn('⚠️ Imagen no cargada, usando emoji de respaldo');
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><text y="20" font-size="20">🤖</text></svg>';
            }
        } catch (error) {
            console.error('❌ Error iniciando Alexa:', error);
            
            // Fallback simple con emoji
            const btn = document.getElementById('alexaBtn');
            if (btn) {
                btn.innerHTML = '🤖';
                btn.onclick = () => {
                    alert('Alexa no está disponible.\nPrueba actualizando tu navegador.');
                };
            }
        }
    }, 1500);
});

// Estilos para el botón con imágenes
if (!document.querySelector('#alexa-button-final-styles')) {
    const style = document.createElement('style');
    style.id = 'alexa-button-final-styles';
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
        }
        
        #alexaBtn.active {
            background: rgba(255, 51, 102, 0.2) !important;
            border-color: #ff3366 !important;
            animation: pulse-fast 0.5s infinite, glow-red 1s infinite !important;
        }
        
        #alexaBtn.speaking {
            background: rgba(0, 204, 102, 0.2) !important;
            border-color: #00cc66 !important;
            animation: pulse-fast 0.3s infinite, glow-green 1s infinite !important;
        }
        
        #alexaBtn:hover img {
            transform: scale(1.1);
        }
        
        #alexaBtn:active {
            transform: scale(0.95);
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
        }
    `;
    document.head.appendChild(style);
}

// Script para precargar imágenes (opcional)
function preloadAlexaImages() {
    const images = [
        'img/alexa-off.png',
        'img/alexa-on.png', 
        'img/alexa-speak.png',
        'img/alexa-think.png'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Precargar imágenes cuando sea posible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadAlexaImages);
} else {
    preloadAlexaImages();
}
