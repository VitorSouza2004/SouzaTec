// js/script.js - SITE PRINCIPAL SOUZATEC (COMPLETO E ATUALIZADO)

let db = null;
let firebaseInitialized = false;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando SouzaTec...');
    
    // Inicializar Firebase
    initializeFirebase();
    
    // Configurar formulário de contato
    setupContactForm();
    
    // Configurar navegação suave
    setupSmoothNavigation();
    
    // Configurar animações
    setupAnimations();
    
    // Configurar formatação de telefone
    setupPhoneMask();
    
    // Configurar navegação ativa
    setupActiveNavigation();
});

// ========== FIREBASE ==========
async function initializeFirebase() {
    try {
        console.log('🔧 Inicializando Firebase...');
        
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase não disponível');
            return;
        }
        
        // Carregar configuração do Firebase Hosting
        const firebaseConfig = await loadFirebaseConfig();
        
        if (!firebaseConfig) {
            console.warn('⚠️ Configuração Firebase não disponível');
            return;
        }
        
        // Inicializar Firebase apenas uma vez
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase inicializado');
        }
        
        db = firebase.firestore();
        firebaseInitialized = true;
        
        // Testar conexão
        await testFirebaseConnection();
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        db = null;
        firebaseInitialized = false;
    }
}

async function loadFirebaseConfig() {
    try {
        // Tentar carregar do Firebase Hosting (fonte canônica)
        const response = await fetch('/__/firebase/init.json');

        if (response.ok) {
            const config = await response.json();
            console.log('📁 Configuração carregada do Firebase Hosting');
            return config;
        }

        // Sem fallback local: evitar incluir credenciais no código-fonte.
        console.error('❌ Configuração do Firebase não encontrada em /__/firebase/init.json');
        return null;

    } catch (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        return null;
    }
}

async function testFirebaseConnection() {
    if (!db) return false;
    
    try {
        // Teste simples de conexão
        await db.collection('test_connection').limit(1).get();
        console.log('✅ Conexão com Firestore estabelecida');
        return true;
    } catch (error) {
        console.warn('⚠️ Firestore não acessível:', error.code);
        return false;
    }
}

// ========== FORMULÁRIO DE CONTATO ==========
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        console.warn('⚠️ Formulário de contato não encontrado');
        return;
    }
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Coletar dados do formulário
        const formData = {
            name: sanitizeInput(document.getElementById('name').value),
            phone: sanitizeInput(document.getElementById('phone').value),
            email: sanitizeInput(document.getElementById('email').value || ''),
            service: document.getElementById('service').value,
            message: sanitizeInput(document.getElementById('message').value),
            status: 'pending',
            date: new Date().toISOString(),
            timestamp: Date.now(),
            source: 'website_form',
            ip: await getClientIP()
        };
        
        // Validação
        if (!validateFormData(formData)) {
            showFormError('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }
        
        console.log('📝 Dados do formulário:', formData);
        
        // Mostrar loading
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Tentar salvar no Firebase
        let savedInFirebase = false;
        if (firebaseInitialized && db) {
            savedInFirebase = await saveToFirebase(formData);
        }
        
        // Preparar mensagem para WhatsApp
        const whatsappUrl = generateWhatsAppUrl(formData);
        
        // Feedback para o usuário
        if (savedInFirebase) {
            showFormSuccess('✅ Pedido enviado com sucesso! Entraremos em contato em breve.');
        } else {
            showFormWarning('⚠️ Pedido enviado para WhatsApp! Alguns dados podem não ter sido salvos.');
        }
        
        // Abrir WhatsApp após 1 segundo
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1000);
        
        // Limpar formulário após 2 segundos
        setTimeout(() => {
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
        
    });
}

function validateFormData(data) {
    if (!data.name || data.name.trim().length < 2) {
        showFormError('Nome deve ter pelo menos 2 caracteres');
        return false;
    }
    
    if (!data.phone || data.phone.replace(/\D/g, '').length < 10) {
        showFormError('Telefone inválido. Digite um número com DDD');
        return false;
    }
    
    if (!data.service || data.service === '') {
        showFormError('Selecione um serviço de interesse');
        return false;
    }
    
    if (!data.message || data.message.trim().length < 5) {
        showFormError('Descreva sua necessidade em pelo menos 5 caracteres');
        return false;
    }
    
    if (data.email && !isValidEmail(data.email)) {
        showFormError('Email inválido');
        return false;
    }
    
    return true;
}

function sanitizeInput(input) {
    if (!input) return '';
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .trim();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function saveToFirebase(formData) {
    if (!db) {
        console.warn('❌ Banco de dados não disponível — salvando localmente');
        try {
            const clients = JSON.parse(localStorage.getItem('souzatec_clients') || '[]');
            clients.push({
                ...formData,
                localId: 'local_' + Date.now(),
                needsSync: true
            });

            localStorage.setItem('souzatec_clients', JSON.stringify(clients));
            console.log('📱 Dados salvos localmente (localStorage):', clients.length, 'clientes');

            // Agendar sincronização
            scheduleSync();
        } catch (localError) {
            console.error('❌ Erro ao salvar localmente:', localError);
        }

        return false;
    }
    
    try {
        // Remover campo IP se não foi coletado
        if (!formData.ip) delete formData.ip;
        
        const docRef = await db.collection('clients').add(formData);
        console.log('✅ Cliente salvo no Firebase com ID:', docRef.id);
        
        // Enviar notificação
        await sendNotification(formData);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao salvar no Firebase:', error);
        
        // Fallback: salvar no localStorage
        try {
            const clients = JSON.parse(localStorage.getItem('souzatec_clients') || '[]');
            clients.push({
                ...formData,
                localId: 'local_' + Date.now(),
                needsSync: true
            });
            
            localStorage.setItem('souzatec_clients', JSON.stringify(clients));
            console.log('📱 Dados salvos localmente (localStorage):', clients.length, 'clientes');
            
            // Agendar sincronização
            scheduleSync();
            
        } catch (localError) {
            console.error('❌ Erro ao salvar localmente:', localError);
        }
        
        return false;
    }
}

function generateWhatsAppUrl(formData) {
    const phone = '5511939231112';
    
    const message = `*NOVO PEDIDO - SouzaTec*%0A%0A` +
                   `👤 *Nome:* ${formData.name}%0A` +
                   `📞 *Telefone:* ${formData.phone}%0A` +
                   `📧 *Email:* ${formData.email || 'Não informado'}%0A` +
                   `🔧 *Serviço:* ${formData.service}%0A` +
                   `📝 *Mensagem:* ${formData.message}%0A` +
                   `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}%0A` +
                   `⏰ *Hora:* ${new Date().toLocaleTimeString('pt-BR')}%0A%0A` +
                   `_Enviado via site https://souza-tch.web.app/_`;
    
    return `https://wa.me/${phone}?text=${message}`;
}

// ========== NOTIFICAÇÕES ==========
async function sendNotification(formData) {
    // Esta função pode ser expandida para enviar notificações por email
    console.log('🔔 Notificação de novo cliente:', formData.name);
    
    // Aqui você pode adicionar integração com webhook, email, etc.
    // Exemplo: await fetch('/api/notify', { method: 'POST', body: JSON.stringify(formData) });
}

// ========== SINCRONIZAÇÃO OFFLINE ==========
async function scheduleSync() {
    // Sincronizar dados offline quando online
    if (navigator.onLine) {
        await syncOfflineData();
    } else {
        window.addEventListener('online', syncOfflineData);
    }
}

async function syncOfflineData() {
    if (!db || !firebaseInitialized) return;
    
    const localClients = JSON.parse(localStorage.getItem('souzatec_clients') || '[]');
    
    if (localClients.length === 0) return;
    
    console.log(`🔄 Sincronizando ${localClients.length} clientes offline...`);
    
    const synced = [];
    
    for (const client of localClients) {
        if (client.needsSync) {
            try {
                // Remover campos locais
                const { localId, needsSync, ...firebaseData } = client;
                
                await db.collection('clients').add(firebaseData);
                synced.push(client.localId);
                
                console.log(`✅ Cliente sincronizado: ${client.name}`);
                
            } catch (error) {
                console.error('❌ Erro ao sincronizar cliente:', error);
            }
        }
    }
    
    // Remover clientes sincronizados
    if (synced.length > 0) {
        const remaining = localClients.filter(client => !synced.includes(client.localId));
        localStorage.setItem('souzatec_clients', JSON.stringify(remaining));
        console.log(`✅ ${synced.length} clientes sincronizados`);
        
        // Mostrar notificação
        showNotification(`${synced.length} pedidos sincronizados com sucesso!`, 'success');
    }
}

// ========== INTERFACE ==========
function setupSmoothNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') return;
            
            if (href.startsWith('#') && document.querySelector(href)) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Atualizar URL sem recarregar
                history.pushState(null, null, href);
                
                // Atualizar navegação ativa
                updateActiveNavigation(href);
            }
        });
    });
}

function setupActiveNavigation() {
    // Atualizar navegação baseada na rolagem
    window.addEventListener('scroll', updateNavigationOnScroll);
    
    // Inicializar navegação ativa
    updateNavigationOnScroll();
}

function updateNavigationOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            currentSection = '#' + section.id;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentSection) {
            link.classList.add('active');
        }
    });
}

function updateActiveNavigation(href) {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === href) {
            link.classList.add('active');
        }
    });
}

function setupAnimations() {
    // Animar cards quando aparecerem na tela
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar cards de serviço
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observar cards de contato
    document.querySelectorAll('.contact-method').forEach(method => {
        observer.observe(method);
    });
    
    // Observar estatísticas
    document.querySelectorAll('.stat-item').forEach(stat => {
        observer.observe(stat);
    });
}

function setupPhoneMask() {
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() {
            this.value = formatPhone(this.value);
        });
        
        // Aplicar máscara inicial se já houver valor
        if (input.value) {
            input.value = formatPhone(input.value);
        }
    });
}

function showFormError(message) {
    showFormMessage(message, 'error');
}

function showFormWarning(message) {
    showFormMessage(message, 'warning');
}

function showFormSuccess(message) {
    showFormMessage(message, 'success');
}

function showFormMessage(message, type) {
    // Remover mensagens anteriores
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Criar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message alert alert-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'check-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar ao formulário
    const form = document.getElementById('contactForm');
    if (form) {
        form.insertBefore(messageDiv, form.firstChild);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar estilos
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
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========== UTILITÁRIOS ==========
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.warn('⚠️ Não foi possível obter IP do cliente');
        return null;
    }
}

function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length > 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
}

// ========== ESTILOS DINÂMICOS ==========
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .service-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .service-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .contact-method {
            opacity: 0;
            transform: translateX(-20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .contact-method.animate-in {
            opacity: 1;
            transform: translateX(0);
        }
        
        .stat-item {
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .stat-item.animate-in {
            opacity: 1;
            transform: scale(1);
        }
        
        .form-message {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .alert-error {
            background-color: rgba(220, 38, 38, 0.1);
            border-left: 4px solid #dc2626;
            color: #b91c1c;
        }
        
        .alert-warning {
            background-color: rgba(245, 158, 11, 0.1);
            border-left: 4px solid var(--accent-amber);
            color: #92400e;
        }
        
        .alert-success {
            background-color: rgba(5, 150, 105, 0.1);
            border-left: 4px solid var(--accent-emerald);
            color: #065f46;
        }
        
        /* Estilo para navegação ativa */
        .main-nav a.active {
            color: var(--pure-white) !important;
        }
        
        .main-nav a.active::after {
            width: 100% !important;
        }
        
        /* Estilo para botão WhatsApp flutuante */
        .whatsapp-float {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: #25D366;
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
            z-index: 1000;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .whatsapp-float:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
        }
    `;
    document.head.appendChild(style);
}

// ========== INICIALIZAÇÃO TARDIA ==========
setTimeout(() => {
    // Sincronizar dados offline
    if (navigator.onLine && firebaseInitialized) {
        syncOfflineData();
    }
    
    // Configurar observador de rede
    window.addEventListener('online', () => {
        if (firebaseInitialized) {
            syncOfflineData();
        }
    });
}, 3000);

// ========== INICIALIZAÇÃO FINAL ==========
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar estilos dinâmicos
    addDynamicStyles();
    
    // Adicionar animação de carregamento
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('✅ SouzaTec completamente carregado!');
});