/* script.js - VERSÃO FINAL E COMPLETA */

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS GLOBAIS ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainApp = document.getElementById('main-app');
    const enterAppBtn = document.getElementById('enter-app-btn');
    const animatedBg = document.getElementById('animated-background');
    const mainContent = document.getElementById('main-content');
    const allViews = document.querySelectorAll('.app-view');
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menu-toggle');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');

    // --- LÓGICA DE NAVEGAÇÃO E ESTADO ---
    function navigateTo(viewId) {
        allViews.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Mostra/esconde o botão "voltar"
        if (viewId === 'view-dashboard') {
            backToDashboardBtn.classList.add('hidden');
        } else {
            backToDashboardBtn.classList.remove('hidden');
        }
        
        // Salva o estado atual
        localStorage.setItem('lastView', viewId);

        // Fecha o menu no mobile após a navegação
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    // Evento para voltar ao Dashboard
    backToDashboardBtn.addEventListener('click', () => navigateTo('view-dashboard'));

    // --- INICIALIZAÇÃO DO APP ---
    enterAppBtn.addEventListener('click', () => {
        welcomeScreen.style.opacity = '0';
        welcomeScreen.addEventListener('transitionend', () => {
            welcomeScreen.classList.remove('active');
            mainApp.classList.remove('hidden');
            // Verifica se há uma última visualização salva
            const lastView = localStorage.getItem('lastView') || 'view-dashboard';
            navigateTo(lastView);
        }, { once: true });
    });

    // --- FUNDO ANIMADO VIVO ---
    function createParticles() {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${Math.random() * 3}px`;
            particle.style.height = particle.style.width;
            particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            animatedBg.appendChild(particle);
        }
    }
    // Adiciona um pouco de CSS para as partículas
    const style = document.createElement('style');
    style.innerHTML = `
        .particle {
            position: absolute;
            background-color: var(--accent-color);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--glow-color);
            opacity: 0;
            animation: moveParticle linear infinite;
        }
        @keyframes moveParticle {
            0% { transform: translate(0, 0); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    createParticles();


    // --- MENU LATERAL (SIDEBAR) ---
    // Lógica do Acordeão
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            // Fecha outros acordeões abertos
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                    otherHeader.nextElementSibling.style.padding = "0 20px";
                }
            });
            // Abre ou fecha o atual
            if (content && content.style.maxHeight) {
                content.style.maxHeight = null;
                content.style.padding = "0 20px";
                header.classList.remove('active');
            } else if (content) {
                content.style.maxHeight = content.scrollHeight + "px";
                content.style.padding = "10px 20px";
                header.classList.add('active');
            } else {
                // Se for um item sem conteúdo (como Dashboard), apenas navega
                navigateTo('view-dashboard');
            }
        });
    });

    // Lógica dos links de ferramentas no menu
    const toolLinks = document.querySelectorAll('.tool-link');
    toolLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('data-view');
            navigateTo(viewId);
        });
    });

    // Lógica dos cards do dashboard
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('click', () => {
            const viewId = card.getAttribute('data-view');
            navigateTo(viewId);
        });
    });

    // Controle do menu mobile
    menuToggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && !menuToggleBtn.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // --- LÓGICA DA FERRAMENTA: FALA PARA TEXTO ---
    const sttToggleBtn = document.getElementById('stt-toggle-btn');
    const sttStopBtn = document.getElementById('stt-stop-btn');
    const sttCopyBtn = document.getElementById('stt-copy-btn');
    const sttSaveBtn = document.getElementById('stt-save-btn');
    const sttCorrectBtn = document.getElementById('stt-correct-btn');
    const sttTextarea = document.getElementById('stt-textarea');

    let recognition;
    let isRecording = false;
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    sttTextarea.value += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
        };

        sttToggleBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
                sttToggleBtn.innerHTML = '<span><i class="fas fa-play"></i> Iniciar</span>';
            } else {
                recognition.start();
                sttToggleBtn.innerHTML = '<span><i class="fas fa-pause"></i> Pausar</span>';
            }
            isRecording = !isRecording;
        });

        sttStopBtn.addEventListener('click', () => {
            recognition.stop();
            isRecording = false;
            sttToggleBtn.innerHTML = '<span><i class="fas fa-play"></i> Iniciar</span>';
        });

        sttCopyBtn.addEventListener('click', () => {
            sttTextarea.select();
            document.execCommand('copy');
            alert('Texto copiado!');
        });
        
        sttSaveBtn.addEventListener('click', () => {
            const blob = new Blob([sttTextarea.value], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, 'transcricao.txt');
        });

        sttCorrectBtn.addEventListener('click', () => {
            alert('Funcionalidade "Corrigir com IA" a ser implementada com a chave de API.');
        });

    } else {
        alert('Seu navegador não suporta a API de reconhecimento de voz.');
    }
});
