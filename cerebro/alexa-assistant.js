// Oye Voice Final - Asistente por voz simple
class OyeVoice {
    constructor() {
        this.isActive = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.wakeWord = "oye"; // PALABRA CLAVE SIMPLE
        this.button = document.getElementById('alexaBtn');
        
        // Imágenes para los estados del botón
        this.buttonImages = {
            inactive: 'img/alexa-off.png',
            listening: 'img/alexa-on.png',
            speaking: 'img/alexa-speak.png',
            thinking: 'img/alexa-think.png'
        };
        
        // Inicializar
        this.initialize();
    }
    
    initialize() {
        console.log('🎯 Oye Voice inicializando...');
        
        // Configurar el botón
        if (this.button) {
            this.button.innerHTML = '';
            const img = document.createElement('img');
            img.src = this.buttonImages.inactive;
            img.alt = 'Oye';
            img.style.width = '32px';
            img.style.height = '32px';
            this.button.appendChild(img);
            
            this.button.addEventListener('click', () => this.toggleMicrophone());
            console.log('✅ Botón configurado');
        } else {
            console.error('❌ Botón no encontrado');
            return;
        }
        
        // Configurar reconocimiento de voz
        this.setupVoiceRecognition();
        
        // Botón comienza con animación suave
        this.button.style.animation = 'pulse 2s infinite';
    }
    
    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('⚠️ Navegador no soporta voz');
            this.button.onclick = () => {
                alert('Tu navegador no soporta reconocimiento de voz.\nUsa Chrome o Edge.');
            };
            return;
        }
        
        // Crear reconocimiento
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'es-MX';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        // Eventos
        this.recognition.onstart = () => {
            console.log('🎤 Micrófono ACTIVADO');
            this.animateMouth('listening');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log('👂 Escuché:', transcript);
            
            // Buscar "oye" (acepta variaciones)
            const hasWakeWord = transcript.includes('oye') || 
                               transcript.includes('oí') ||
                               transcript.includes('oi') ||
                               transcript.includes('oy');
            
            if (hasWakeWord) {
                console.log('✅ "Oye" detectado');
                this.processCommand(transcript);
            } else {
                console.log('❌ No dijo "Oye"');
                this.resetToListening();
            }
        };
        
        this.recognition.onerror = (event) => {
            console.log('⚠️ Error micrófono:', event.error);
            
            if (event.error === 'not-allowed') {
                this.showMessage('🎤 Permitir micrófono');
            }
            
            this.resetButton();
        };
        
        this.recognition.onend = () => {
            console.log('🔇 Micrófono DESACTIVADO');
            
            if (this.isActive && !this.isSpeaking) {
                setTimeout(() => {
                    if (this.isActive && !this.isSpeaking) {
                        this.startListening();
                    }
                }, 1000);
            }
        };
        
        console.log('✅ Reconocimiento listo');
    }
    
    toggleMicrophone() {
        console.log('🔄 Botón presionado');
        
        if (this.isSpeaking) {
            this.stopSpeaking();
            return;
        }
        
        if (!this.isActive) {
            this.activateMicrophone();
        } else {
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
        
        // Cambiar botón SIN SONIDO
        this.changeButtonImage('listening');
        this.button.classList.add('active');
        this.button.style.animation = 'pulse 0.5s infinite';
        
        // Mostrar indicador SIN SONIDO
        this.showStatusIndicator('Di "Oye"', false);
        
        console.log('🚀 Oye ACTIVADO');
        
        // Iniciar escucha SIN SONIDO
        setTimeout(() => {
            this.startListening();
        }, 300);
    }
    
    deactivateMicrophone() {
        this.isActive = false;
        
        // Cambiar botón SIN SONIDO
        this.changeButtonImage('inactive');
        this.button.classList.remove('active');
        this.button.style.animation = 'pulse 2s infinite';
        
        // Detener SIN SONIDO
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('Error deteniendo:', e);
            }
        }
        
        this.hideStatusIndicator();
        
        console.log('⏸️ Oye DESACTIVADO');
        
        this.animateMouth('normal');
    }
    
    startListening() {
        if (!this.recognition || !this.isActive || this.isSpeaking) {
            return;
        }
        
        try {
            console.log('▶️ Escuchando...');
            this.recognition.start();
        } catch (error) {
            console.error('❌ Error al iniciar:', error);
            
            if (this.isActive) {
                setTimeout(() => this.startListening(), 2000);
            }
        }
    }
    
    extractCommand(transcript) {
        // Buscar "oye" y extraer lo que sigue
        const wakeWordPattern = /(oye|o[iíí]|oy)/i;
        const match = transcript.match(wakeWordPattern);
        
        if (match) {
            const startIndex = transcript.indexOf(match[0].toLowerCase());
            const command = transcript.substring(startIndex + match[0].length).trim();
            // MANTENER NÚMEROS, SÍMBOLOS, PORCENTAJES - SOLO QUITAR EMOJIS
            return this.cleanText(command);
        }
        
        return '';
    }
    
    cleanText(text) {
        // SOLO QUITAR EMOJIS - MANTENER TODO LO DEMÁS
        // Esto mantiene números (123), símbolos (%, $, +, -), letras, espacios
        return text.replace(/[\p{Emoji}]/gu, '').trim();
    }
    
    processCommand(transcript) {
        const command = this.extractCommand(transcript);
        
        console.log('📝 Comando:', command);
        
        // Comandos para detener (SIN SONIDO)
        if (this.isStopCommand(command)) {
            console.log('🛑 Comando DETENER');
            this.stopSpeaking();
            this.resetToListening();
            return;
        }
        
        if (!command) {
            this.speak("¿Sí? ¿En qué puedo ayudarte?");
            return;
        }
        
        this.findResponse(command);
    }
    
    isStopCommand(command) {
        const stopWords = ['para', 'detente', 'cállate', 'callate', 'silencio', 'basta', 'alto'];
        return stopWords.some(word => command.includes(word));
    }
    
    findResponse(query) {
        console.log('🔍 Buscando respuesta para:', query);
        
        this.changeButtonImage('thinking');
        this.button.style.animation = 'none';
        
        this.showStatusIndicator('🤔 Procesando...', false);
        
        // 1. Buscar en respuestas predefinidas
        if (typeof getPredefinedResponse === 'function') {
            const response = getPredefinedResponse(query);
            if (response) {
                console.log('✅ Respuesta predefinida encontrada');
                const responseText = typeof response === 'object' ? response.text : response;
                // LIMPIAR SOLO EMOJIS - MANTENER NÚMEROS Y SÍMBOLOS
                const cleanText = this.cleanText(responseText);
                this.speak(cleanText);
                return;
            }
        }
        
        // 2. Buscar en Wikipedia
        if (typeof searchWeb === 'function') {
            console.log('🌐 Buscando en web...');
            this.searchWebAndSpeak(query);
            return;
        }
        
        // 3. Respuesta por defecto (CON NÚMEROS Y SÍMBOLOS SI LOS TIENE)
        this.speak(`Entendí "${query}", ¿qué más quieres saber?`);
    }
    
    searchWebAndSpeak(query) {
        const originalAddMessage = window.addMessage;
        let responseCaptured = false;
        
        window.addMessage = (text, sender) => {
            if (sender === 'bot' && !responseCaptured) {
                // LIMPIAR SOLO EMOJIS - MANTENER NÚMEROS, %, SÍMBOLOS
                const cleanText = this.cleanText(text);
                
                if (cleanText.length > 20 && 
                    !cleanText.includes('Buscando') && 
                    !cleanText.includes('Cargando') &&
                    !cleanText.includes('Hola! Soy CyberPet')) {
                    
                    responseCaptured = true;
                    console.log('✅ Respuesta web encontrada');
                    
                    // Hablar manteniendo números y símbolos
                    this.speak(cleanText);
                    
                    window.addMessage = originalAddMessage;
                }
            }
            
            if (originalAddMessage && !responseCaptured) {
                originalAddMessage(text, sender);
            }
        };
        
        try {
            searchWeb(query);
            
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
    
    removeOnlyEmojis(str) {
        // SOLO REMOVER EMOJIS - MANTENER TODO LO DEMÁS
        // Esto mantiene: números 0-9, símbolos !@#$%^&*()_+-=, letras, espacios
        return str.replace(/[\p{Emoji}]/gu, '').trim();
    }
    
    speak(text) {
        console.log('🗣️ Hablando:', text.substring(0, 50) + '...');
        
        if (!window.speechSynthesis) {
            console.error('❌ No puede hablar');
            this.resetToListening();
            return;
        }
        
        this.isSpeaking = true;
        this.changeButtonImage('speaking');
        this.button.classList.add('speaking');
        this.button.style.animation = 'pulse 0.3s infinite';
        
        this.showStatusIndicator('🗣️ Hablando...', false);
        
        this.animateMouth('speaking');
        this.startMouthAnimation();
        
        // Detener micrófono SIN SONIDO
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
        
        // MANTENER NÚMEROS, %, SÍMBOLOS - SOLO QUITAR EMOJIS
        const cleanText = this.removeOnlyEmojis(text);
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'es-MX';
        utterance.rate = 0.85;
        utterance.pitch = 0.9;
        utterance.volume = 1.0;
        
        // Buscar voz mexicana
        setTimeout(() => {
            const voices = window.speechSynthesis.getVoices();
            const mexicanVoice = voices.find(voice => 
                voice.lang === 'es-MX' || voice.lang.startsWith('es-MX')
            );
            
            if (mexicanVoice) {
                utterance.voice = mexicanVoice;
            }
        }, 100);
        
        utterance.onstart = () => {
            console.log('▶️ Empezó a hablar');
        };
        
        utterance.onend = () => {
            console.log('✅ Terminó de hablar');
            this.finishSpeaking();
        };
        
        utterance.onerror = (event) => {
            console.error('❌ Error al hablar:', event);
            this.finishSpeaking();
        };
        
        // SIN SONIDO DE BEEP
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 200);
    }
    
    finishSpeaking() {
        this.isSpeaking = false;
        this.stopMouthAnimation();
        
        if (this.isActive) {
            this.resetToListening();
        } else {
            this.resetButton();
        }
    }
    
    stopSpeaking() {
        // Detener habla SIN SONIDO
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        this.isSpeaking = false;
        this.stopMouthAnimation();
        
        console.log('⏹️ Habla detenida');
        
        // SIN SONIDO DE BEEP
        this.showStatusIndicator('🛑 Detenido', false, true);
        
        setTimeout(() => {
            if (this.isActive) {
                this.resetToListening();
            } else {
                this.resetButton();
            }
        }, 1500);
    }
    
    resetToListening() {
        // Volver a escuchar SIN SONIDO
        this.changeButtonImage('listening');
        this.button.classList.remove('speaking');
        this.button.classList.add('active');
        this.button.style.animation = 'pulse 0.5s infinite';
        
        this.showStatusIndicator('Di "Oye"', false);
        
        this.animateMouth('listening');
        
        setTimeout(() => {
            if (this.isActive && !this.isSpeaking) {
                this.startListening();
            }
        }, 1000);
    }
    
    resetButton() {
        this.changeButtonImage('inactive');
        this.button.classList.remove('active', 'speaking');
        this.button.style.animation = 'pulse 2s infinite';
        
        this.hideStatusIndicator();
        
        this.animateMouth('normal');
    }
    
    animateMouth(state) {
        const mouth = document.getElementById('mouth');
        if (!mouth) return;
        
        mouth.classList.remove('listening', 'speaking', 'happy', 'surprised');
        
        if (state === 'listening') {
            mouth.classList.add('surprised');
        } else if (state === 'speaking') {
            mouth.classList.add('happy');
        } else {
            mouth.classList.add('happy');
        }
    }
    
    startMouthAnimation() {
        const mouth = document.getElementById('mouth');
        if (!mouth) return;
        
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
        
        let indicator = document.getElementById('oyeStatus');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'oyeStatus';
            indicator.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Orbitron', sans-serif;
                font-size: 14px;
            `;
            container.appendChild(indicator);
        }
        
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

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Oye Voice');
    
    setTimeout(() => {
        try {
            window.oyeVoice = new OyeVoice();
            console.log('✅ Oye Voice listo');
            
            // Verificar imágenes
            const img = document.querySelector('#alexaBtn img');
            if (img && img.naturalWidth === 0) {
                console.warn('⚠️ Imagen no cargada');
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><text y="20" font-size="20">🎤</text></svg>';
            }
        } catch (error) {
            console.error('❌ Error:', error);
            
            const btn = document.getElementById('alexaBtn');
            if (btn) {
                btn.innerHTML = '🎤';
                btn.onclick = () => {
                    alert('Asistente de voz no disponible.');
                };
            }
        }
    }, 1500);
});

// Estilos SIN ANIMACIONES DE SONIDO
if (!document.querySelector('#oye-voice-styles')) {
    const style = document.createElement('style');
    style.id = 'oye-voice-styles';
    style.textContent = `
        /* Animaciones visuales SIN SONIDO */
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
            50% { box-shadow: 0 0 15px #ff3366; }
            100% { box-shadow: 0 0 5px #ff3366; }
        }
        
        @keyframes glow-green {
            0% { box-shadow: 0 0 5px #00cc66; }
            50% { box-shadow: 0 0 15px #00cc66; }
            100% { box-shadow: 0 0 5px #00cc66; }
        }
        
        /* Botón SIN SONIDO */
        #alexaBtn {
            transition: all 0.3s;
            cursor: pointer;
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
            filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.3));
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
    `;
    document.head.appendChild(style);
}

// Precargar imágenes
function preloadImages() {
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

// Precargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadImages);
} else {
    preloadImages();
}

