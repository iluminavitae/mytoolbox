/* script.js - O CÉREBRO PRINCIPAL DO APLICATIVO */

document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainApp = document.getElementById('main-app');
    const loadingOverlay = document.getElementById('loading-overlay');
    const enterAppBtn = document.getElementById('enter-app-btn');
    const menuToggleBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    
    // Seletores específicos das ferramentas
    const toolButtons = document.querySelectorAll('.tool-btn');
    const zipInput = document.getElementById('zip-input');
    const zipContentsList = document.getElementById('zip-contents');
    const epubInput = document.getElementById('epub-input');
    const epubViewer = document.getElementById('epub-viewer');
    const iaButtons = document.querySelectorAll('.ia-btn');
    const saveFileBtn = document.getElementById('save-file-btn');
    const mainTextarea = document.getElementById('main-textarea');
    const fileNameInput = document.getElementById('file-name');
    const fileTypeSelect = document.getElementById('file-type');


    // --- ESTADO DA APLICAÇÃO ---
    let userApiKey = localStorage.getItem('my-tool-box-api-key') || '';
    if (userApiKey) {
        apiKeyInput.value = userApiKey;
    }

    // --- FUNÇÕES AUXILIARES ---
    const showLoading = (message = 'Processando...') => {
        if (loadingOverlay) {
            loadingOverlay.querySelector('p').textContent = message;
            loadingOverlay.classList.remove('hidden');
        }
    };

    const hideLoading = () => {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    };

    // --- LÓGICA DE INICIALIZAÇÃO ---

    // 1. Entrar no Aplicativo
    if (enterAppBtn) {
        enterAppBtn.addEventListener('click', () => {
            welcomeScreen.style.animation = 'fadeOut 0.5s forwards';
            welcomeScreen.addEventListener('animationend', () => {
                welcomeScreen.classList.add('hidden');
                mainApp.classList.remove('hidden');
                mainApp.style.animation = 'fadeIn 1s forwards';
            }, { once: true });
        });
    }

    // 2. Menu Responsivo (Mobile)
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && !menuToggleBtn.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // 3. Navegação por Abas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.classList.add('active');
            }
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // 4. Salvar Chave de API
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', () => {
            const newApiKey = apiKeyInput.value.trim();
            if (newApiKey) {
                localStorage.setItem('my-tool-box-api-key', newApiKey);
                userApiKey = newApiKey;
                alert('Chave de API salva com sucesso!');
            } else {
                localStorage.removeItem('my-tool-box-api-key');
                userApiKey = '';
                alert('Chave de API removida.');
            }
        });
    }

    // --- LÓGICA DAS FERRAMENTAS ---

    // 5. Ferramentas genéricas (com placeholder)
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toolName = button.textContent;
            const fileInput = button.parentElement.querySelector('.file-input');
            
            if (fileInput && !fileInput.files[0]) {
                alert('Por favor, selecione um arquivo primeiro.');
                return;
            }
            
            showLoading(`Processando com a ferramenta: ${toolName}...`);
            setTimeout(() => {
                hideLoading();
                alert(`A funcionalidade "${toolName}" foi acionada.\n\n(Aqui você deve integrar a biblioteca ou API para executar a ação real.)`);
            }, 1500);
        });
    });

    // 6. Ferramentas de IA (com placeholder)
    iaButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const action = button.getAttribute('data-action');
            const text = mainTextarea.value;

            if (!userApiKey) {
                alert('Por favor, insira e salve sua chave de API no menu lateral.');
                return;
            }
            if (!text) {
                alert('Por favor, escreva algo no editor de texto primeiro.');
                return;
            }

            showLoading();
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                mainTextarea.value = `[RESPOSTA SIMULADA PARA: ${action}]\n\nO texto processado pela IA apareceria aqui.`;
            } catch (error) {
                alert('Ocorreu um erro ao se comunicar com a API.');
            } finally {
                hideLoading();
            }
        });
    });

    // 7. Salvar Arquivo de Texto
    if (saveFileBtn) {
        saveFileBtn.addEventListener('click', () => {
            const text = mainTextarea.value;
            const fileName = fileNameInput.value.trim() || 'arquivo';
            const fileType = fileTypeSelect.value;
            const fullFileName = `${fileName}.${fileType}`;

            if (!text) {
                alert('O campo de texto está vazio.');
                return;
            }

            const blob = new Blob([text], { type: `text/${fileType};charset=utf-8` });
            saveAs(blob, fullFileName); // saveAs vem da biblioteca FileSaver.js
        });
    }

    // 8. Descompactador de ZIP (FUNCIONAL)
    if (zipInput) {
        zipInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            showLoading('Lendo arquivo ZIP...');
            const reader = new FileReader();
            reader.onload = function(e) {
                const jszip = new JSZip();
                jszip.loadAsync(e.target.result).then(function(zip) {
                    zipContentsList.innerHTML = '';
                    if (Object.keys(zip.files).length === 0) {
                        zipContentsList.innerHTML = '<li>Este arquivo ZIP está vazio.</li>';
                        hideLoading();
                        return;
                    }
                    zip.forEach(function (relativePath, zipEntry) {
                        if (!zipEntry.dir) {
                            const listItem = document.createElement('li');
                            const link = document.createElement('a');
                            link.href = '#';
                            link.textContent = zipEntry.name;
                            link.onclick = function(evt) {
                                evt.preventDefault();
                                showLoading(`Descompactando ${zipEntry.name}...`);
                                zipEntry.async('blob').then(function(content) {
                                    saveAs(content, zipEntry.name);
                                    hideLoading();
                                });
                            };
                            listItem.appendChild(link);
                            zipContentsList.appendChild(listItem);
                        }
                    });
                    hideLoading();
                }).catch(function(err) {
                    hideLoading();
                    zipContentsList.innerHTML = `<li>Erro ao ler o arquivo ZIP: ${err.message}</li>`;
                });
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // 9. Leitor de EPUB (FUNCIONAL)
    if (epubInput) {
        epubInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (window.FileReader) {
                    showLoading('Abrindo E-book...');
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        epubViewer.innerHTML = '';
                        const book = ePub(e.target.result);
                        const rendition = book.renderTo("epub-viewer", {
                            width: "100%",
                            height: 600,
                            flow: "paginated"
                        });
                        rendition.display().then(() => {
                            hideLoading();
                        });
                    };
                    reader.readAsArrayBuffer(file);
                } else {
                    alert("Seu navegador não suporta a leitura de arquivos locais.");
                }
            }
        });
    }
});
                                                  
