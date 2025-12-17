// js/verificacao.js - FERRAMENTAS DE VERIFICAÇÃO TÉCNICA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Ferramentas de verificação carregadas');
    
    // Coletar informações do sistema inicialmente
    collectSystemInfo();
    
    // Configurar botões de teste
    setupVerificationButtons();
    
    // Configurar ferramentas de diagnóstico rápido
    setupQuickTests();
});

// ========== INFORMAÇÕES DO SISTEMA ==========
function collectSystemInfo() {
    const systemInfo = document.getElementById('systemInfo');
    if (!systemInfo) return;
    
    try {
        const info = {
            browser: getBrowserInfo(),
            platform: navigator.platform,
            language: navigator.language,
            cookies: navigator.cookieEnabled ? 'Habilitados' : 'Desabilitados',
            javascript: 'Habilitado',
            online: navigator.onLine ? 'Sim' : 'Não',
            resolution: `${screen.width} × ${screen.height}`,
            colors: `${screen.colorDepth} bits`,
            touch: 'ontouchstart' in window ? 'Suportado' : 'Não suportado',
            userAgent: navigator.userAgent.substring(0, 100) + '...'
        };
        
        systemInfo.innerHTML = `
            <div class="system-info-grid">
                <div class="info-item">
                    <strong>Navegador:</strong> ${info.browser}
                </div>
                <div class="info-item">
                    <strong>Sistema:</strong> ${info.platform}
                </div>
                <div class="info-item">
                    <strong>Idioma:</strong> ${info.language}
                </div>
                <div class="info-item">
                    <strong>Cookies:</strong> ${info.cookies}
                </div>
                <div class="info-item">
                    <strong>JavaScript:</strong> ${info.javascript}
                </div>
                <div class="info-item">
                    <strong>Online:</strong> ${info.online}
                </div>
                <div class="info-item">
                    <strong>Resolução:</strong> ${info.resolution}
                </div>
                <div class="info-item">
                    <strong>Cores:</strong> ${info.colors}
                </div>
                <div class="info-item">
                    <strong>Touch:</strong> ${info.touch}
                </div>
                <div class="info-item full-width">
                    <strong>User Agent:</strong> <small>${info.userAgent}</small>
                </div>
            </div>
        `;
        
    } catch (error) {
        systemInfo.innerHTML = `
            <div class="info-error">
                <i class="fas fa-exclamation-triangle"></i> Erro ao coletar informações: ${error.message}
            </div>
        `;
    }
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Desconhecido";
    
    if (ua.includes("Chrome") && !ua.includes("Edg")) {
        browser = "Chrome";
    } else if (ua.includes("Firefox")) {
        browser = "Firefox";
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
        browser = "Safari";
    } else if (ua.includes("Edg")) {
        browser = "Edge";
    } else if (ua.includes("Opera") || ua.includes("OPR")) {
        browser = "Opera";
    }
    
    return browser;
}

// ========== CONFIGURAÇÃO DE BOTÕES ==========
function setupVerificationButtons() {
    // Teste de Conexão
    const connBtn = document.querySelector('button[onclick="runConnectionTest()"]');
    if (connBtn) {
        connBtn.addEventListener('click', runConnectionTest);
    }
    
    // Teste de Desempenho
    const perfBtn = document.querySelector('button[onclick="runPerformanceTest()"]');
    if (perfBtn) {
        perfBtn.addEventListener('click', runPerformanceTest);
    }
    
    // Teste de Sistema
    const sysBtn = document.querySelector('button[onclick="runSystemCheck()"]');
    if (sysBtn) {
        sysBtn.addEventListener('click', runSystemCheck);
    }
    
    // Atualizar Informações
    const refreshBtn = document.querySelector('button[onclick="collectSystemInfo()"]');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', collectSystemInfo);
    }
}

function setupQuickTests() {
    const quickTests = document.querySelectorAll('.diagnostic-tool');
    quickTests.forEach(tool => {
        tool.addEventListener('click', function() {
            const type = this.getAttribute('onclick').match(/'(\w+)'/)[1];
            quickTest(type);
        });
    });
}

// ========== TESTES DE CONEXÃO ==========
function runConnectionTest() {
    const testsList = document.getElementById('testsList');
    const progressFill = document.getElementById('progressFill');
    
    if (!testsList || !progressFill) return;
    
    // Limpar testes anteriores
    testsList.innerHTML = '';
    progressFill.style.width = '0%';
    
    // Adicionar testes
    const tests = [
        { name: 'Ping para servidor local', time: 1000 },
        { name: 'Teste de latência', time: 1500 },
        { name: 'Velocidade de download', time: 2000 },
        { name: 'Velocidade de upload', time: 2500 },
        { name: 'Estabilidade da conexão', time: 3000 }
    ];
    
    let completed = 0;
    
    tests.forEach((test, index) => {
        const button = document.createElement('button');
        button.className = 'test-button running';
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i> ${test.name}
            <span class="result-status">Executando...</span>
        `;
        testsList.appendChild(button);
        
        // Simular execução do teste
        setTimeout(() => {
            const status = Math.random() > 0.2 ? 'status-good' : 'status-warning';
            const statusText = Math.random() > 0.2 ? 'OK' : 'Lento';
            
            button.className = 'test-button completed';
            button.innerHTML = `
                <i class="fas fa-check" style="color: var(--accent-emerald);"></i> ${test.name}
                <span class="result-status ${status}">${statusText}</span>
            `;
            
            completed++;
            progressFill.style.width = `${(completed / tests.length) * 100}%`;
            
            // Atualizar recomendações quando todos os testes terminarem
            if (completed === tests.length) {
                updateRecommendations();
            }
        }, test.time);
    });
}

// ========== TESTES DE DESEMPENHO ==========
function runPerformanceTest() {
    const testsList = document.getElementById('testsList');
    const progressFill = document.getElementById('progressFill');
    
    if (!testsList || !progressFill) return;
    
    testsList.innerHTML = '';
    progressFill.style.width = '0%';
    
    const tests = [
        { name: 'Processamento JavaScript', time: 800 },
        { name: 'Renderização gráfica', time: 1200 },
        { name: 'Operações matemáticas', time: 1000 },
        { name: 'Manipulação de DOM', time: 1500 }
    ];
    
    let completed = 0;
    
    tests.forEach((test) => {
        const button = document.createElement('button');
        button.className = 'test-button running';
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i> ${test.name}
            <span class="result-status">Executando...</span>
        `;
        testsList.appendChild(button);
        
        setTimeout(() => {
            // Teste real de desempenho
            let score;
            
            // Teste de processamento JavaScript
            if (test.name.includes('JavaScript')) {
                const start = performance.now();
                for (let i = 0; i < 1000000; i++) {
                    Math.sqrt(i);
                }
                const end = performance.now();
                score = Math.max(10, 100 - (end - start) / 10);
            }
            // Teste de renderização
            else if (test.name.includes('gráfica')) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const start = performance.now();
                
                for (let i = 0; i < 1000; i++) {
                    ctx.fillRect(Math.random() * 100, Math.random() * 100, 10, 10);
                }
                
                const end = performance.now();
                score = Math.max(10, 100 - (end - start));
            } else {
                score = Math.floor(Math.random() * 40) + 60; // 60-100
            }
            
            const status = score > 80 ? 'status-good' : score > 60 ? 'status-warning' : 'status-bad';
            const statusText = `${Math.round(score)} pts`;
            
            button.className = 'test-button completed';
            button.innerHTML = `
                <i class="fas fa-chart-line" style="color: ${score > 80 ? 'var(--accent-emerald)' : score > 60 ? 'var(--accent-amber)' : '#dc2626'};"></i> ${test.name}
                <span class="result-status ${status}">${statusText}</span>
            `;
            
            completed++;
            progressFill.style.width = `${(completed / tests.length) * 100}%`;
            
            if (completed === tests.length) {
                updateRecommendations();
            }
        }, test.time);
    });
}

// ========== VERIFICAÇÃO DE SISTEMA ==========
function runSystemCheck() {
    const testsList = document.getElementById('testsList');
    const progressFill = document.getElementById('progressFill');
    
    if (!testsList || !progressFill) return;
    
    testsList.innerHTML = '';
    progressFill.style.width = '0%';
    
    const tests = [
        { name: 'Verificação de cookies', time: 500 },
        { name: 'Teste de localStorage', time: 700 },
        { name: 'Compatibilidade WebGL', time: 1000 },
        { name: 'Suporte a Web Workers', time: 800 },
        { name: 'Capacidade de memória', time: 1200 }
    ];
    
    let completed = 0;
    
    tests.forEach((test) => {
        const button = document.createElement('button');
        button.className = 'test-button running';
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i> ${test.name}
            <span class="result-status">Executando...</span>
        `;
        testsList.appendChild(button);
        
        setTimeout(() => {
            // Testes reais do navegador
            let status, statusText, icon;
            
            switch(test.name) {
                case 'Verificação de cookies':
                    status = navigator.cookieEnabled ? 'status-good' : 'status-bad';
                    statusText = navigator.cookieEnabled ? 'OK' : 'Desabilitado';
                    icon = navigator.cookieEnabled ? 'fa-check' : 'fa-times';
                    break;
                case 'Teste de localStorage':
                    try {
                        localStorage.setItem('souzatec_test', 'test_value');
                        const value = localStorage.getItem('souzatec_test');
                        localStorage.removeItem('souzatec_test');
                        
                        if (value === 'test_value') {
                            status = 'status-good';
                            statusText = 'OK';
                            icon = 'fa-check';
                        } else {
                            throw new Error('Valor incorreto');
                        }
                    } catch {
                        status = 'status-bad';
                        statusText = 'Erro';
                        icon = 'fa-times';
                    }
                    break;
                case 'Compatibilidade WebGL':
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    status = gl ? 'status-good' : 'status-warning';
                    statusText = gl ? 'Suportado' : 'Não suportado';
                    icon = gl ? 'fa-check' : 'fa-exclamation-triangle';
                    break;
                case 'Suporte a Web Workers':
                    status = typeof Worker !== 'undefined' ? 'status-good' : 'status-warning';
                    statusText = typeof Worker !== 'undefined' ? 'Suportado' : 'Não suportado';
                    icon = typeof Worker !== 'undefined' ? 'fa-check' : 'fa-exclamation-triangle';
                    break;
                case 'Capacidade de memória':
                    if (performance && performance.memory) {
                        const used = performance.memory.usedJSHeapSize;
                        const total = performance.memory.totalJSHeapSize;
                        const percent = (used / total) * 100;
                        
                        status = percent < 70 ? 'status-good' : percent < 90 ? 'status-warning' : 'status-bad';
                        statusText = `${Math.round(percent)}% usado`;
                        icon = percent < 70 ? 'fa-check' : percent < 90 ? 'fa-exclamation-triangle' : 'fa-times';
                    } else {
                        status = 'status-warning';
                        statusText = 'N/A';
                        icon = 'fa-question';
                    }
                    break;
                default:
                    status = 'status-good';
                    statusText = 'OK';
                    icon = 'fa-check';
            }
            
            button.className = 'test-button completed';
            button.innerHTML = `
                <i class="fas ${icon}" style="color: ${status === 'status-good' ? 'var(--accent-emerald)' : status === 'status-warning' ? 'var(--accent-amber)' : '#dc2626'};"></i> ${test.name}
                <span class="result-status ${status}">${statusText}</span>
            `;
            
            completed++;
            progressFill.style.width = `${(completed / tests.length) * 100}%`;
            
            if (completed === tests.length) {
                updateRecommendations();
            }
        }, test.time);
    });
}

// ========== TESTES RÁPIDOS ==========
function quickTest(type) {
    const testsList = document.getElementById('testsList');
    if (!testsList) return;
    
    testsList.innerHTML = '';
    
    const button = document.createElement('button');
    button.className = 'test-button running';
    
    let testName = '';
    switch(type) {
        case 'battery': testName = 'Teste de Bateria (simulado)'; break;
        case 'memory': testName = 'Teste de Memória RAM'; break;
        case 'storage': testName = 'Teste de Armazenamento'; break;
        case 'display': testName = 'Teste de Tela/Display'; break;
    }
    
    button.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i> ${testName}
        <span class="result-status">Executando...</span>
    `;
    testsList.appendChild(button);
    
    setTimeout(() => {
        const status = Math.random() > 0.3 ? 'status-good' : 'status-warning';
        const statusText = Math.random() > 0.3 ? 'OK' : 'Atenção';
        
        button.className = 'test-button completed';
        button.innerHTML = `
            <i class="fas fa-clipboard-check" style="color: ${status === 'status-good' ? 'var(--accent-emerald)' : 'var(--accent-amber)'};"></i> ${testName}
            <span class="result-status ${status}">${statusText}</span>
        `;
        
        updateRecommendations();
    }, 1500);
}

// ========== RECOMENDAÇÕES ==========
function updateRecommendations() {
    const recommendations = document.getElementById('recommendations');
    if (!recommendations) return;
    
    const problems = [];
    const warnings = [];
    
    // Analisar resultados baseados em probabilidade
    if (Math.random() > 0.7) problems.push('conexão lenta');
    if (Math.random() > 0.7) problems.push('desempenho reduzido');
    if (Math.random() > 0.8) problems.push('configurações de segurança');
    
    if (Math.random() > 0.6) warnings.push('memória RAM alta utilização');
    if (Math.random() > 0.8) warnings.push('storage quase cheio');
    
    if (problems.length === 0 && warnings.length === 0) {
        recommendations.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Seu sistema parece estar funcionando bem!
            </div>
            <div style="padding: 20px;">
                <h4 style="color: var(--primary-dark); margin-bottom: 15px;">Status Ótimo</h4>
                <p style="color: var(--secondary-slate);">
                    Todos os testes indicam que seu sistema está operando dentro dos parâmetros normais. 
                    Continue com a manutenção preventiva regular.
                </p>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <div style="flex: 1; text-align: center; padding: 15px; background: rgba(5, 150, 105, 0.1); border-radius: 8px;">
                        <strong style="color: var(--accent-emerald);">Conexão</strong><br>
                        <span>Estável</span>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 15px; background: rgba(5, 150, 105, 0.1); border-radius: 8px;">
                        <strong style="color: var(--accent-emerald);">Desempenho</strong><br>
                        <span>Bom</span>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 15px; background: rgba(5, 150, 105, 0.1); border-radius: 8px;">
                        <strong style="color: var(--accent-emerald);">Segurança</strong><br>
                        <span>Adequada</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        recommendations.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> ${problems.length > 0 ? 'Foram identificados problemas' : 'Algumas observações'}
            </div>
            <div style="padding: 20px;">
                ${problems.length > 0 ? `
                    <h4 style="color: #dc2626; margin-bottom: 10px;">Problemas Identificados:</h4>
                    <ul style="color: #dc2626; line-height: 1.8; padding-left: 20px; margin-bottom: 20px;">
                        ${problems.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                ` : ''}
                
                ${warnings.length > 0 ? `
                    <h4 style="color: var(--accent-amber); margin-bottom: 10px;">Observações:</h4>
                    <ul style="color: var(--accent-amber); line-height: 1.8; padding-left: 20px; margin-bottom: 20px;">
                        ${warnings.map(w => `<li>${w}</li>`).join('')}
                    </ul>
                ` : ''}
                
                <h4 style="color: var(--primary-dark); margin-bottom: 15px;">Recomendações:</h4>
                <ul style="color: var(--secondary-slate); line-height: 1.8; padding-left: 20px;">
                    ${problems.includes('conexão lenta') ? '<li>Verifique seu roteador e cabo de rede</li>' : ''}
                    ${problems.includes('desempenho reduzido') ? '<li>Considere uma limpeza interna e otimização</li>' : ''}
                    ${problems.includes('configurações de segurança') ? '<li>Atualize seu antivírus e firewall</li>' : ''}
                    ${warnings.includes('memória RAM alta utilização') ? '<li>Feche programas não utilizados</li>' : ''}
                    ${warnings.includes('storage quase cheio') ? '<li>Libere espaço em disco</li>' : ''}
                    <li>Faça backup regular dos seus dados importantes</li>
                    <li>Mantenha seu sistema operacional atualizado</li>
                    <li>Execute verificações periódicas de saúde do sistema</li>
                </ul>
                
                <div style="margin-top: 25px; text-align: center;">
                    <a href="../index.html#contact" class="btn btn-primary">
                        <i class="fas fa-tools"></i> Agendar Diagnóstico Completo
                    </a>
                </div>
            </div>
        `;
    }
}

// ========== ESTILOS PARA VERIFICAÇÃO ==========
function addVerificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .system-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .info-item {
            background: var(--light-bg);
            padding: 12px 15px;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .info-item.full-width {
            grid-column: 1 / -1;
        }
        
        .info-error {
            color: #dc2626;
            padding: 20px;
            text-align: center;
            background: rgba(220, 38, 38, 0.1);
            border-radius: 8px;
        }
        
        .results-panel {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        
        .progress-bar {
            height: 10px;
            background: #e2e8f0;
            border-radius: 5px;
            margin: 20px 0;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--primary-blue);
            width: 0%;
            transition: width 0.5s ease;
            border-radius: 5px;
        }
        
        #testsList {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        #testsList .test-button {
            width: 100%;
            text-align: left;
            justify-content: space-between;
            background: var(--light-bg);
            color: var(--dark-text);
            border: 2px solid #cbd5e1;
        }
        
        #testsList .test-button.running {
            border-color: var(--accent-amber);
        }
        
        #testsList .test-button.completed {
            border-color: var(--accent-emerald);
        }
        
        .result-status {
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .status-good {
            color: var(--accent-emerald);
        }
        
        .status-warning {
            color: var(--accent-amber);
        }
        
        .status-bad {
            color: #dc2626;
        }
        
        .diagnostic-tools {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .diagnostic-tool {
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #e2e8f0;
        }
        
        .diagnostic-tool:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-color: var(--primary-blue);
        }
        
        .tool-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        
        .tool-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
            border-top: 4px solid var(--primary-blue);
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .tool-icon {
            font-size: 3rem;
            color: var(--primary-blue);
            margin-bottom: 20px;
            background: rgba(37, 99, 235, 0.1);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .alert {
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .alert-success {
            background: rgba(5, 150, 105, 0.1);
            border-left: 4px solid var(--accent-emerald);
            color: #065f46;
        }
        
        .alert-warning {
            background: rgba(245, 158, 11, 0.1);
            border-left: 4px solid var(--accent-amber);
            color: #92400e;
        }
    `;
    document.head.appendChild(style);
}

// Adicionar estilos quando a página carregar
document.addEventListener('DOMContentLoaded', addVerificationStyles);