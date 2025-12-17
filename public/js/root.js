// js/root.js - GUIAS DE ROOT PARA ANDROID
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Guia de Root carregado');
    
    // Inicializar accordions
    initializeRootAccordions();
    
    // Configurar navegação suave
    setupRootNavigation();
});

// ========== ACCORDIONS PARA GUIAS ==========
function toggleRootAccordion(element) {
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

function initializeRootAccordions() {
    // Fechar todos os accordions inicialmente (exceto o primeiro)
    const accordions = document.querySelectorAll('.accordion-content');
    accordions.forEach((content, index) => {
        if (index !== 0) {
            content.style.display = 'none';
        } else {
            content.style.display = 'block';
            const accordion = content.parentElement;
            const icon = accordion.querySelector('.accordion-header i');
            accordion.classList.add('active');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    });
    
    // Adicionar event listeners
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            toggleRootAccordion(this);
        });
    });
}

// ========== NAVEGAÇÃO ==========
function setupRootNavigation() {
    // Navegação suave para âncoras internas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') return;
            
            if (href.startsWith('#') && document.querySelector(href)) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Atualizar URL
                history.pushState(null, null, href);
            }
        });
    });
}

// ========== FUNÇÕES ESPECÍFICAS DO ROOT ==========
function switchPlatform(platformId) {
    // Remove active class from all tabs and content
    const allTabs = document.querySelectorAll('.platform-tab');
    const allContents = document.querySelectorAll('.platform-content');

    allTabs.forEach(tab => tab.classList.remove('active'));
    allContents.forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    const targetContent = document.getElementById(platformId);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Marcar aba como ativa
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function downloadTool(toolName) {
    const tools = {
        'adb': {
            url: 'https://developer.android.com/studio/releases/platform-tools',
            filename: 'platform-tools.zip',
            description: 'ADB e Fastboot tools'
        },
        'magisk': {
            url: 'https://github.com/topjohnwu/Magisk/releases',
            filename: 'Magisk.apk',
            description: 'Sistema de root Magisk'
        },
        'twrp': {
            url: 'https://twrp.me/',
            filename: 'TWRP.img',
            description: 'Recovery personalizado TWRP'
        }
    };
    
    const tool = tools[toolName.toLowerCase()];
    if (tool) {
        const message = `Iniciando download de ${tool.filename}...\n\n` +
                       `Descrição: ${tool.description}\n` +
                       `URL: ${tool.url}\n\n` +
                       `Clique em OK para continuar ou Cancelar para abortar.`;
        
        if (confirm(message)) {
            window.open(tool.url, '_blank');
            showNotification(`Download de ${tool.filename} iniciado!`, 'success');
        }
    } else {
        showNotification('Ferramenta não encontrada', 'error');
    }
}

function showRootWarning() {
    const warningModal = `
        <div class="modal-overlay" id="rootWarningModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> AVISO DE SEGURANÇA</h3>
                    <span class="modal-close" onclick="closeModal('rootWarningModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <p><strong>O processo de ROOT pode:</strong></p>
                    <ul style="color: var(--secondary-slate); line-height: 1.8; margin: 15px 0;">
                        <li>Anular a garantia do seu dispositivo</li>
                        <li>Causar danos permanentes (brick)</li>
                        <li>Expor seu dispositivo a riscos de segurança</li>
                        <li>Impedir atualizações automáticas</li>
                        <li>Fazer alguns apps pararem de funcionar</li>
                    </ul>
                    <p style="color: var(--accent-amber); font-weight: 600;">
                        <i class="fas fa-info-circle"></i> Proceda por sua própria conta e risco!
                    </p>
                </div>
                <div class="modal-actions">
                    <button class="btn" onclick="closeModal('rootWarningModal')">Cancelar</button>
                    <button class="btn btn-primary" onclick="closeModal('rootWarningModal'); proceedWithRoot()">
                        Entendo os riscos e quero continuar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', warningModal);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function proceedWithRoot() {
    console.log('Usuário aceitou os riscos do root');
    // Aqui você poderia redirecionar para uma página mais detalhada
    // ou mostrar instruções avançadas
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========== ESTILOS PARA ROOT ==========
function addRootStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .guide-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .root-hero {
            background: linear-gradient(135deg, var(--primary-dark), #1e293b);
            color: white;
            padding: 100px 0;
            text-align: center;
            margin-bottom: 40px;
        }
        
        .warning-banner {
            background: rgba(245, 158, 11, 0.1);
            border-left: 4px solid var(--accent-amber);
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 25px 0;
        }
        
        .step-card {
            background: var(--light-bg);
            padding: 25px;
            border-radius: 10px;
        }
        
        .step-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-blue);
            margin-bottom: 15px;
        }
        
        .download-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }
        
        .download-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        
        .download-card:hover {
            border-color: var(--primary-blue);
            transform: translateY(-5px);
        }
        
        .download-icon {
            font-size: 2.5rem;
            color: var(--primary-blue);
            margin-bottom: 15px;
        }
        
        .accordion {
            margin-bottom: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .accordion.active {
            border-color: var(--primary-blue);
        }
        
        .accordion-header {
            background: var(--light-bg);
            padding: 18px 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            transition: background 0.3s ease;
        }
        
        .accordion-header:hover {
            background: #e2e8f0;
        }
        
        .accordion-content {
            padding: 25px;
            background: white;
        }
        
        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.95rem;
            margin: 15px 0;
            overflow-x: auto;
        }
        
        .compatibility-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .compatibility-table th {
            background: var(--light-bg);
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: var(--primary-dark);
            border-bottom: 3px solid var(--primary-blue);
        }
        
        .compatibility-table td {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .compatibility-table tr:hover {
            background: rgba(37, 99, 235, 0.02);
        }
        
        .tag {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .tag-success {
            background: rgba(5, 150, 105, 0.1);
            color: var(--accent-emerald);
        }
        
        .tag-warning {
            background: rgba(245, 158, 11, 0.1);
            color: var(--accent-amber);
        }
        
        .danger-zone {
            background: rgba(220, 38, 38, 0.05);
            border: 2px solid rgba(220, 38, 38, 0.2);
            border-radius: 12px;
            padding: 30px;
            margin: 40px 0;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Adicionar estilos quando a página carregar
document.addEventListener('DOMContentLoaded', addRootStyles);

// Configurar botões de download
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.download-card .btn-primary').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const toolName = this.parentElement.querySelector('h3').textContent;
            downloadTool(toolName);
        });
    });
});