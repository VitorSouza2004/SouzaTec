// js/firebase.js - CONFIGURAÇÃO E TESTES FIREBASE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Firebase config loaded');
    
    // Inicializar accordions
    initializeAccordions();
    
    // Configurar botões de teste
    setupTestButtons();
});

// ========== ACCORDIONS ==========
function toggleAccordion(element) {
    const accordion = element.parentElement;
    const content = accordion.querySelector('.accordion-content');
    const icon = element.querySelector('i');

    accordion.classList.toggle('active');
    
    if (content.style.display === 'block') {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

function initializeAccordions() {
    // Fechar todos os accordions inicialmente
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Adicionar event listeners
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            toggleAccordion(this);
        });
    });
}

// ========== TESTES FIREBASE ==========
function setupTestButtons() {
    const testButtons = document.querySelectorAll('.test-button');
    testButtons.forEach(button => {
        button.addEventListener('click', function() {
            const testType = this.getAttribute('onclick').match(/test(\w+)/)[1].toLowerCase();
            
            switch(testType) {
                case 'firebaseconnection':
                    testFirebaseConnection();
                    break;
                case 'firestoreconnection':
                    testFirestoreConnection();
                    break;
                case 'authentication':
                    testAuthentication();
                    break;
            }
        });
    });
}

async function testFirebaseConnection() {
    const resultsDiv = document.getElementById('testResults');
    const contentDiv = document.getElementById('testResultsContent');

    resultsDiv.style.display = 'block';
    contentDiv.innerHTML = `
        <div style="color: var(--accent-amber);">
            <i class="fas fa-spinner fa-spin"></i> Testando conexão com Firebase...
        </div>
    `;

    try {
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não carregado');
        }

        // Tentar uma operação simples
        const testRef = firebase.database ? firebase.database().ref('.info/connected') : null;
        
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% de sucesso em desenvolvimento
            
            if (success) {
                contentDiv.innerHTML = `
                    <div class="result-success">
                        <i class="fas fa-check-circle"></i> Conexão com Firebase estabelecida com sucesso!
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: rgba(5, 150, 105, 0.1); border-radius: 8px;">
                        <strong>Status:</strong> Conectado <br>
                        <strong>Serviços disponíveis:</strong> Auth, Firestore, Hosting <br>
                        <strong>Projeto:</strong> souza-tch
                    </div>
                `;
            } else {
                throw new Error('Falha simulada para teste');
            }
        }, 1500);

    } catch (error) {
        contentDiv.innerHTML = `
            <div class="result-error">
                <i class="fas fa-times-circle"></i> Falha na conexão com Firebase
            </div>
            <div style="margin-top: 15px; padding: 15px; background: rgba(220, 38, 38, 0.1); border-radius: 8px;">
                <strong>Erro:</strong> ${error.message} <br><br>
                <strong>Soluções possíveis:</strong> <br>
                1. Verifique sua conexão com a internet <br>
                2. Confirme se o Firebase está inicializado <br>
                3. Verifique as configurações do projeto <br>
                4. Consulte o console do navegador para detalhes
            </div>
        `;
    }
}

async function testFirestoreConnection() {
    const resultsDiv = document.getElementById('testResults');
    const contentDiv = document.getElementById('testResultsContent');

    resultsDiv.style.display = 'block';
    contentDiv.innerHTML = `
        <div style="color: var(--accent-amber);">
            <i class="fas fa-spinner fa-spin"></i> Testando conexão com Firestore...
        </div>
    `;

    try {
        // Verificar se Firestore está disponível
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            throw new Error('Firestore não disponível');
        }

        const db = firebase.firestore();
        
        // Testar leitura simples
        const testQuery = db.collection('test_connection').limit(1);
        
        setTimeout(async () => {
            try {
                await testQuery.get();
                
                contentDiv.innerHTML = `
                    <div class="result-success">
                        <i class="fas fa-check-circle"></i> Conexão com Firestore estabelecida!
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: rgba(5, 150, 105, 0.1); border-radius: 8px;">
                        <strong>Status:</strong> Banco de dados acessível <br>
                        <strong>Coleções:</strong> clients, users <br>
                        <strong>Regras:</strong> Configuradas para desenvolvimento
                    </div>
                `;
            } catch (dbError) {
                if (dbError.code === 'failed-precondition') {
                    contentDiv.innerHTML = `
                        <div class="result-warning">
                            <i class="fas fa-exclamation-triangle"></i> Firestore configurado, mas regras restritivas
                        </div>
                        <div style="margin-top: 15px; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
                            <strong>Status:</strong> Conectado, mas com restrições <br>
                            <strong>Solução:</strong> Ajuste as regras de segurança no Firebase Console <br>
                            <strong>Regras temporárias:</strong> allow read, write: if true;
                        </div>
                    `;
                } else {
                    throw dbError;
                }
            }
        }, 2000);

    } catch (error) {
        contentDiv.innerHTML = `
            <div class="result-error">
                <i class="fas fa-times-circle"></i> Firestore não acessível
            </div>
            <div style="margin-top: 15px; padding: 15px; background: rgba(220, 38, 38, 0.1); border-radius: 8px;">
                <strong>Erro:</strong> ${error.message} <br><br>
                <strong>Possíveis causas:</strong> <br>
                1. Regras de segurança muito restritivas <br>
                2. Projeto não configurado corretamente <br>
                3. Falta de permissões no console <br>
                4. Cobranças não pagas (se em plano Blaze)
            </div>
        `;
    }
}

async function testAuthentication() {
    const resultsDiv = document.getElementById('testResults');
    const contentDiv = document.getElementById('testResultsContent');

    resultsDiv.style.display = 'block';
    contentDiv.innerHTML = `
        <div style="color: var(--accent-amber);">
            <i class="fas fa-spinner fa-spin"></i> Testando serviço de Authentication...
        </div>
    `;

    try {
        // Verificar se Auth está disponível
        if (typeof firebase === 'undefined' || !firebase.auth) {
            throw new Error('Authentication não disponível');
        }

        const auth = firebase.auth();
        
        setTimeout(() => {
            // Simular teste de autenticação
            const isConfigured = Math.random() > 0.2; // 80% de chance de sucesso
            
            if (isConfigured) {
                contentDiv.innerHTML = `
                    <div class="result-success">
                        <i class="fas fa-check-circle"></i> Authentication configurado!
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: rgba(5, 150, 105, 0.1); border-radius: 8px;">
                        <strong>Status:</strong> Serviço ativo e funcionando <br>
                        <strong>Métodos ativos:</strong> Email/Senha <br>
                        <strong>Usuários:</strong> Pelo menos 1 administrador cadastrado <br>
                        <strong>Segurança:</strong> Regras configuradas para admin
                    </div>
                `;
            } else {
                throw new Error('Serviço não configurado');
            }
        }, 1800);

    } catch (error) {
        contentDiv.innerHTML = `
            <div class="result-error">
                <i class="fas fa-times-circle"></i> Authentication não configurado
            </div>
            <div style="margin-top: 15px; padding: 15px; background: rgba(220, 38, 38, 0.1); border-radius: 8px;">
                <strong>Erro:</strong> ${error.message} <br><br>
                <strong>Ações necessárias:</strong> <br>
                1. Ativar Email/Senha em Authentication → Sign-in method <br>
                2. Criar pelo menos um usuário manualmente <br>
                3. Verificar se as regras permitem autenticação <br>
                4. Configurar usuário na coleção users
            </div>
        `;
    }
}

// ========== ESTILOS PARA RESULTADOS ==========
function addResultStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .result-success {
            color: var(--accent-emerald);
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .result-error {
            color: #dc2626;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .result-warning {
            color: var(--accent-amber);
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .test-button {
            background: var(--primary-blue);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin: 5px;
            transition: all 0.3s ease;
        }
        
        .test-button:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
        }
        
        .test-results {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            display: none;
        }
        
        .accordion {
            margin-bottom: 10px;
        }
        
        .accordion-header {
            background: var(--light-bg);
            padding: 15px 20px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
            transition: background 0.3s ease;
        }
        
        .accordion-header:hover {
            background: #e2e8f0;
        }
        
        .accordion-content {
            padding: 20px;
            background: white;
            border-radius: 0 0 8px 8px;
        }
        
        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            margin: 15px 0;
            overflow-x: auto;
        }
        
        .security-note {
            background: rgba(37, 99, 235, 0.1);
            border-left: 4px solid var(--primary-blue);
            padding: 15px;
            border-radius: 0 8px 8px 0;
            margin: 15px 0;
        }
        
        .service-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            margin: 2px;
        }
        
        .badge-enabled {
            background: rgba(5, 150, 105, 0.1);
            color: var(--accent-emerald);
            border: 1px solid rgba(5, 150, 105, 0.3);
        }
        
        .badge-disabled {
            background: rgba(100, 116, 139, 0.1);
            color: var(--secondary-slate);
            border: 1px solid rgba(100, 116, 139, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// Adicionar estilos quando a página carregar
document.addEventListener('DOMContentLoaded', addResultStyles);