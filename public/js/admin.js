// js/admin.js - PAINEL ADMINISTRATIVO SOUZATEC (COMPLETO E FINALIZADO)

let db = null;
let auth = null;
let currentUser = null;
let currentUserData = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Painel Administrativo SouzaTec...');
    
    // Verificar se Firebase está disponível
    if (typeof firebase === 'undefined') {
        showCriticalError('Firebase não carregado. Verifique sua conexão.');
        return;
    }
    
    // Inicializar admin
    initializeAdmin();
    
    // Configurar listeners
    setupEventListeners();
});

async function initializeAdmin() {
    try {
        console.log('🔧 Inicializando sistema admin...');
        
        // Carregar configuração do Firebase
        const firebaseConfig = await loadFirebaseConfig();
        
        if (!firebaseConfig) {
            throw new Error('Configuração Firebase não disponível');
        }
        
        // Inicializar Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase App inicializado');
        }
        
        // Obter serviços
        db = firebase.firestore();
        auth = firebase.auth();
        
        console.log('✅ Serviços Firebase inicializados');
        
        // Configurar observador de autenticação
        setupAuthObserver();
        
        // Verificar usuário atual
        const user = auth.currentUser;
        if (user) {
            console.log('👤 Usuário já logado:', user.email);
            await handleUserLogin(user);
        }
        
    } catch (error) {
        console.error('❌ Erro crítico na inicialização:', error);
        showCriticalError(`Erro de inicialização: ${error.message}`);
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

function setupAuthObserver() {
    auth.onAuthStateChanged(async (user) => {
        console.log('🔍 Mudança de estado de autenticação:', user ? 'Logado' : 'Deslogado');
        
        if (user) {
            await handleUserLogin(user);
        } else {
            handleUserLogout();
        }
    });
}

// ========== AUTENTICAÇÃO ==========
async function handleUserLogin(user) {
    try {
        currentUser = user;
        
        // Verificar se usuário existe na coleção users
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            console.warn('⚠️ Usuário não encontrado na coleção users — criando registro automático');
            // Criar registro mínimo no Firestore para usuários que existem no Auth mas não no DB
            const newUserData = {
                name: user.displayName || '',
                email: user.email || '',
                phone: '',
                role: 'tecnico',
                active: true,
                created: new Date().toISOString(),
                createdBy: 'auth:auto'
            };

            try {
                await db.collection('users').doc(user.uid).set(newUserData);
                currentUserData = Object.assign({}, newUserData);
                currentUserData.uid = user.uid;
                console.log('✅ Documento de usuário criado automaticamente para:', user.email);
            } catch (createErr) {
                console.error('❌ Erro ao criar documento de usuário automático:', createErr);
                showLoginError('Usuário não autorizado. Contate o administrador.');
                await auth.signOut();
                return;
            }
        } else {
            currentUserData = userDoc.data();
            currentUserData.uid = user.uid;
        }
        
        console.log(`👤 Usuário autenticado: ${currentUserData.name} (${currentUserData.role})`);
        
        // Atualizar último login
        await updateLastLogin(user.uid);
        
        // Mostrar painel admin
        showAdminPanel();
        
        // Carregar dados
        loadInitialData();
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showLoginError('Erro ao verificar permissões do usuário');
    }
}

function handleUserLogout() {
    currentUser = null;
    currentUserData = null;
    
    console.log('👋 Usuário deslogado');
    showLoginPage();
}

async function updateLastLogin(uid) {
    try {
        await db.collection('users').doc(uid).update({
            lastLogin: new Date().toISOString(),
            lastLoginIP: await getClientIP()
        });
    } catch (error) {
        console.warn('⚠️ Não foi possível atualizar último login:', error);
    }
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.warn('⚠️ Não foi possível obter IP do cliente:', error);
        return 'unknown';
    }
}

// ========== LOGIN/LOGOUT ==========
function setupEventListeners() {
    // Botão de login
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Botão de logout
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Submit com Enter no formulário de login
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

async function handleLogin() {
    const email = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    
    // Validação
    if (!email || !password) {
        showLoginError('Por favor, preencha email e senha');
        return;
    }
    
    if (!isValidEmail(email)) {
        showLoginError('Email inválido');
        return;
    }
    
    // Mostrar loading
    showLoginLoading(true);
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login bem-sucedido para:', email);
        
        // Limpar erros
        clearLoginError();
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        
        let errorMessage = 'Erro ao fazer login';
        
        switch(error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Email inválido';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Conta desativada';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Usuário não encontrado';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Senha incorreta';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Muitas tentativas. Tente mais tarde';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Erro de rede. Verifique sua conexão';
                break;
            default:
                errorMessage = error.message || 'Erro desconhecido';
        }
        
        showLoginError(errorMessage);
        
    } finally {
        showLoginLoading(false);
    }
}

async function handleLogout() {
    if (!confirm('Deseja realmente sair do sistema?')) return;
    
    try {
        await auth.signOut();
        console.log('✅ Logout realizado');
    } catch (error) {
        console.error('❌ Erro no logout:', error);
        alert('Erro ao fazer logout');
    }
}

// ========== INTERFACE ==========
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    
    // Limpar campos
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    if (usernameField) usernameField.value = '';
    if (passwordField) passwordField.value = '';
    
    clearLoginError();
}

function showAdminPanel() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    
    // Atualizar interface do usuário
    updateUserInterface();
    
    // Configurar interface baseada na role
    setupRoleBasedInterface();
}

function updateUserInterface() {
    const userInfoElement = document.getElementById('currentUserInfo');
    
    if (userInfoElement && currentUserData) {
        userInfoElement.innerHTML = `
            <div class="user-info">
                <span class="user-name">${escapeHtml(currentUserData.name)}</span>
                <span class="user-role ${currentUserData.role}">
                    ${currentUserData.role === 'admin' ? 'Administrador' : 'Técnico'}
                </span>
            </div>
        `;
    }
}

function setupRoleBasedInterface() {
    if (!currentUserData) return;
    
    const isAdmin = currentUserData.role === 'admin';
    
    // Esconder/mostrar elementos baseado na role
    const usersSection = document.getElementById('usersSection');
    const usersTab = document.querySelector('a[onclick*="users"]')?.parentElement;
    
    if (!isAdmin) {
        if (usersSection) usersSection.style.display = 'none';
        if (usersTab) usersTab.style.display = 'none';
        
        // Esconder botões de exclusão para técnicos
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.style.display = 'none';
        });
    } else {
        if (usersSection) usersSection.style.display = 'block';
        if (usersTab) usersTab.style.display = 'list-item';
        
        // Adicionar botão de adicionar técnico
        addAdminButtons();
    }
}

function addAdminButtons() {
    const usersSection = document.getElementById('usersSection');
    if (!usersSection) return;
    
    // Remover botão existente se houver
    const existingBtn = usersSection.querySelector('.add-technician-btn');
    if (existingBtn) existingBtn.remove();
    
    // Criar novo botão
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-success add-technician-btn';
    addButton.innerHTML = '<i class="fas fa-user-plus"></i> Adicionar Técnico';
    addButton.onclick = showAddTechnicianModal;
    
    // Inserir após o título
    const title = usersSection.querySelector('h3');
    if (title) {
        title.insertAdjacentElement('afterend', addButton);
    }
}

function loadInitialData() {
    if (!db) {
        console.error('❌ Banco de dados não disponível');
        return;
    }
    
    // Carregar clientes
    loadClients();
    
    // Carregar estatísticas
    loadServicesStats();
    
    // Se for admin, carregar usuários
    if (currentUserData?.role === 'admin') {
        loadUsers();
    }
}

// ========== GERENCIAMENTO DE CLIENTES ==========
async function loadClients() {
    if (!db) {
        showTableError('clientsTableBody', 'Banco de dados não disponível');
        return;
    }
    
    showTableLoading('clientsTableBody', 'Carregando clientes...');
    
    try {
        // Construir query baseada nas permissões
        let query = db.collection('clients').orderBy('timestamp', 'desc').limit(100);
        
        // Se for técnico, filtrar por clientes atribuídos
        if (currentUserData?.role === 'tecnico' && currentUserData.uid) {
            query = query.where('assignedTo', '==', currentUserData.uid);
        }
        
        const snapshot = await query.get();
        
        const tableBody = document.getElementById('clientsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // Processar clientes do Firestore
        const clients = [];
        
        snapshot.forEach(doc => {
            const client = doc.data();
            client.id = doc.id;
            clients.push(client);
        });
        
        // Também carregar clientes salvos localmente (fallback offline)
        try {
            const localClients = JSON.parse(localStorage.getItem('souzatec_clients') || '[]');
            if (Array.isArray(localClients) && localClients.length > 0) {
                localClients.forEach(lc => {
                    const localClient = {...lc};
                    localClient.id = localClient.localId || ('local_' + (localClient.timestamp || Date.now()));
                    localClient.local = true; // flag para identificar origem local
                    clients.unshift(localClient);
                });
                console.log(`📱 ${localClients.length} clientes carregados do localStorage (offline)`);
            }
        } catch (localErr) {
            console.warn('⚠️ Erro ao ler clientes do localStorage:', localErr);
        }
        
        if (clients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-message">
                        <i class="fas fa-inbox"></i> Nenhum cliente encontrado
                    </td>
                </tr>
            `;
            return;
        }
        
        // Ordenar por timestamp/data (mais recente primeiro)
        clients.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        // Renderizar clientes
        clients.forEach(client => {
            const row = createClientRow(client);
            tableBody.appendChild(row);
        });
        
        console.log(`✅ ${clients.length} clientes carregados (incluindo offline)`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar clientes:', error);
        showTableError('clientsTableBody', `Erro: ${error.message}`);
    }
}

function createClientRow(client) {
    const row = document.createElement('tr');
    
    // Formatar data
    const date = client.date ? formatDate(client.date) : 'N/A';
    
    // Status
    const statusClass = client.status === 'completed' ? 'status-completed' : 'status-pending';
    const statusText = client.status === 'completed' ? 'Concluído' : 'Pendente';
    
    // Verificar permissões
    const isAdmin = currentUserData?.role === 'admin';
    const isAssignedToMe = client.assignedTo === currentUserData?.uid;
    const isLocal = client.local === true; // entradas salvas localmente
    const canComplete = !isLocal && client.status !== 'completed' && (isAdmin || isAssignedToMe);
    const canAssign = !isLocal && isAdmin && !client.assignedTo;
    
    // Mostrar etiqueta indicando origem local quando aplicável
    const localBadge = isLocal ? '<br><small style="color: #6b7280"><i class="fas fa-sd-card"></i> Salvo localmente (pendente sincronização)</small>' : '';
    
    row.innerHTML = `
        <td>${escapeHtml(client.name || 'Não informado')}</td>
        <td>
            ${escapeHtml(client.phone || 'Não informado')}
            ${client.email ? `<br><small>${escapeHtml(client.email)}</small>` : ''}
        </td>
        <td>${escapeHtml(client.service || 'Não especificado')}</td>
        <td>
            ${date}
            ${client.assignedToName ? `<br><small>👤 ${escapeHtml(client.assignedToName)}</small>` : ''}
            ${localBadge}
        </td>
        <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td class="actions-cell">
            ${canComplete ? 
                `<button class="action-btn btn-complete" onclick="markAsCompleted('${client.id}')">
                    <i class="fas fa-check"></i> Concluir
                </button>` : ''
            }
            ${canAssign ? 
                `<button class="action-btn btn-assign" onclick="assignToMe('${client.id}')">
                    <i class="fas fa-user-check"></i> Atribuir
                </button>` : ''
            }
            <button class="action-btn btn-whatsapp" onclick="contactClient('${client.phone}')">
                <i class="fab fa-whatsapp"></i>
            </button>
            ${isAdmin && !isLocal ? 
                `<button class="action-btn btn-delete" onclick="deleteClient('${client.id}')">
                    <i class="fas fa-trash"></i>
                </button>` : ''
            }
        </td>
    `;
    
    return row;
}

async function markAsCompleted(clientId) {
    if (!confirm('Marcar este serviço como concluído?')) return;
    
    try {
        await db.collection('clients').doc(clientId).update({
            status: 'completed',
            completedAt: new Date().toISOString(),
            completedBy: currentUserData.uid,
            completedByName: currentUserData.name
        });
        
        console.log('✅ Serviço marcado como concluído:', clientId);
        
        // Recarregar dados
        loadClients();
        loadServicesStats();
        
        showNotification('Serviço marcado como concluído!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao marcar como concluído:', error);
        showNotification('Erro ao atualizar serviço', 'error');
    }
}

async function assignToMe(clientId) {
    try {
        await db.collection('clients').doc(clientId).update({
            assignedTo: currentUserData.uid,
            assignedAt: new Date().toISOString(),
            assignedToName: currentUserData.name
        });
        
        console.log('✅ Cliente atribuído:', clientId);
        
        loadClients();
        showNotification('Cliente atribuído a você!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao atribuir cliente:', error);
        showNotification('Erro ao atribuir cliente', 'error');
    }
}

async function deleteClient(clientId) {
    if (!confirm('Tem certeza que deseja excluir este cliente permanentemente?')) return;
    
    try {
        await db.collection('clients').doc(clientId).delete();
        
        console.log('✅ Cliente excluído:', clientId);
        
        loadClients();
        loadServicesStats();
        
        showNotification('Cliente excluído com sucesso', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao excluir cliente:', error);
        showNotification('Erro ao excluir cliente', 'error');
    }
}

function contactClient(phone) {
    if (!phone) {
        showNotification('Telefone não disponível', 'warning');
        return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
        showNotification('Telefone inválido', 'error');
        return;
    }
    
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
}

// ========== GERENCIAMENTO DE USUÁRIOS ==========
async function loadUsers() {
    if (currentUserData?.role !== 'admin') return;
    
    showTableLoading('usersTableBody', 'Carregando usuários...');
    
    try {
        const snapshot = await db.collection('users').orderBy('created', 'desc').get();
        
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (snapshot.empty) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-message">
                        <i class="fas fa-users"></i> Nenhum usuário cadastrado
                    </td>
                </tr>
            `;
            return;
        }
        
        snapshot.forEach(doc => {
            const user = doc.data();
            user.id = doc.id;
            const row = createUserRow(user);
            tableBody.appendChild(row);
        });
        
        console.log(`✅ ${snapshot.size} usuários carregados`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        showTableError('usersTableBody', `Erro: ${error.message}`);
    }
}

function createUserRow(user) {
    const row = document.createElement('tr');
    
    const isCurrentUser = user.id === currentUserData?.uid;
    const roleClass = user.role === 'admin' ? 'user-role admin' : 'user-role tecnico';
    const roleText = user.role === 'admin' ? 'Administrador' : 'Técnico';
    const statusClass = user.active === false ? 'status-pending' : 'status-completed';
    const statusText = user.active === false ? 'Inativo' : 'Ativo';
    
    row.innerHTML = `
        <td>${escapeHtml(user.name || 'Não informado')}</td>
        <td>${escapeHtml(user.email || 'Não informado')}</td>
        <td>${user.phone ? escapeHtml(user.phone) : 'Não informado'}</td>
        <td>
            <span class="${roleClass}">${roleText}</span>
        </td>
        <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td class="actions-cell">
            ${!isCurrentUser ? 
                `<button class="action-btn btn-whatsapp" onclick="contactUser('${user.phone}')">
                    <i class="fab fa-whatsapp"></i>
                </button>` : ''
            }
            ${!isCurrentUser && user.active !== false ? 
                `<button class="action-btn btn-delete" onclick="deactivateUser('${user.id}')">
                    <i class="fas fa-user-slash"></i>
                </button>` : ''
            }
            ${!isCurrentUser && user.active === false ? 
                `<button class="action-btn btn-complete" onclick="activateUser('${user.id}')">
                    <i class="fas fa-user-check"></i>
                </button>` : ''
            }
        </td>
    `;
    
    return row;
}

async function deactivateUser(userId) {
    if (!confirm('Tem certeza que deseja desativar este usuário? Ele não poderá mais acessar o sistema.')) return;
    
    try {
        await db.collection('users').doc(userId).update({
            active: false,
            deactivatedAt: new Date().toISOString(),
            deactivatedBy: currentUserData.uid
        });
        
        console.log('✅ Usuário desativado:', userId);
        loadUsers();
        showNotification('Usuário desativado com sucesso', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao desativar usuário:', error);
        showNotification('Erro ao desativar usuário', 'error');
    }
}

async function activateUser(userId) {
    try {
        await db.collection('users').doc(userId).update({
            active: true,
            activatedAt: new Date().toISOString(),
            activatedBy: currentUserData.uid
        });
        
        console.log('✅ Usuário ativado:', userId);
        loadUsers();
        showNotification('Usuário ativado com sucesso', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao ativar usuário:', error);
        showNotification('Erro ao ativar usuário', 'error');
    }
}

function contactUser(phone) {
    if (!phone) {
        showNotification('Telefone não disponível', 'warning');
        return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
        showNotification('Telefone inválido', 'error');
        return;
    }
    
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
}

// ========== ESTATÍSTICAS ==========
async function loadServicesStats() {
    if (!db) return;
    
    try {
        const snapshot = await db.collection('clients').get();
        
        const totalServices = snapshot.size;
        let completedServices = 0;
        const serviceCounts = {};
        
        snapshot.forEach(doc => {
            const client = doc.data();
            
            // Contar serviços concluídos
            if (client.status === 'completed') {
                completedServices++;
            }
            
            // Contar por tipo de serviço
            if (client.service) {
                serviceCounts[client.service] = (serviceCounts[client.service] || 0) + 1;
            }
        });
        
        const pendingServices = totalServices - completedServices;
        
        // Atualizar estatísticas
        document.getElementById('totalServices').textContent = totalServices;
        document.getElementById('completedServices').textContent = completedServices;
        document.getElementById('pendingServices').textContent = pendingServices;
        
        // Atualizar serviços populares
        updatePopularServices(serviceCounts);
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
    }
}

function updatePopularServices(serviceCounts) {
    const popularServicesElement = document.getElementById('popularServices');
    if (!popularServicesElement) return;
    
    // Converter para array e ordenar
    const servicesArray = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5
    
    if (servicesArray.length === 0) {
        popularServicesElement.innerHTML = `
            <li class="empty-message">Nenhum serviço registrado ainda</li>
        `;
        return;
    }
    
    popularServicesElement.innerHTML = '';
    
    servicesArray.forEach(([service, count]) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="service-name">${escapeHtml(service)}</span>
            <span class="service-count">${count} solicitações</span>
        `;
        popularServicesElement.appendChild(li);
    });
}

// ========== FUNÇÕES AUXILIARES ==========
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function showLoginLoading(show) {
    const loginBtn = document.getElementById('loginButton');
    if (!loginBtn) return;
    
    if (show) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        loginBtn.disabled = true;
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar no Sistema';
        loginBtn.disabled = false;
    }
}

function showLoginError(message) {
    const errorElement = document.getElementById('loginError');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorElement && errorMessage) {
        errorElement.style.display = 'block';
        errorMessage.textContent = message;
    }
}

function clearLoginError() {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function showTableLoading(tableId, message) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-message">
                <i class="fas fa-spinner fa-spin"></i> ${message}
            </td>
        </tr>
    `;
}

function showTableError(tableId, message) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-message">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </td>
        </tr>
    `;
}

function showCriticalError(message) {
    alert(`❌ ERRO CRÍTICO: ${message}\n\nPor favor, recarregue a página ou contate o suporte.`);
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Estilos básicos para notificação
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
    
    // Adicionar estilos CSS para animação
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
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

// ========== MODAL DE ADICIONAR TÉCNICO ==========
function showAddTechnicianModal() {
    const modalHTML = `
        <div class="modal-overlay" id="addTechnicianModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Adicionar Novo Técnico</h3>
                    <span class="modal-close" onclick="closeModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="techName">Nome Completo</label>
                        <input type="text" id="techName" placeholder="Nome do técnico">
                    </div>
                    <div class="form-group">
                        <label for="techEmail">Email</label>
                        <input type="email" id="techEmail" placeholder="email@exemplo.com">
                    </div>
                    <div class="form-group">
                        <label for="techPhone">Telefone</label>
                        <input type="tel" id="techPhone" placeholder="(11) 99999-9999">
                    </div>
                    <div class="form-group">
                        <label for="techSpecialty">Especialidade</label>
                        <select id="techSpecialty">
                            <option value="">Selecione uma especialidade</option>
                            <option value="Manutenção de Computadores">Manutenção de Computadores</option>
                            <option value="Redes e Wi-Fi">Redes e Wi-Fi</option>
                            <option value="Recuperação de Dados">Recuperação de Dados</option>
                            <option value="Sistemas Operacionais">Sistemas Operacionais</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="addNewTechnician()">
                        <i class="fas fa-save"></i> Salvar Técnico
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao corpo
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Focar no primeiro campo
    setTimeout(() => {
        const nameInput = document.getElementById('techName');
        if (nameInput) nameInput.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('addTechnicianModal')?.parentElement;
    if (modal) {
        modal.remove();
    }
}

async function addNewTechnician() {
    const name = document.getElementById('techName')?.value.trim();
    const email = document.getElementById('techEmail')?.value.trim();
    const phone = document.getElementById('techPhone')?.value.trim();
    const specialty = document.getElementById('techSpecialty')?.value;
    
    // Validação
    if (!name || !email || !phone || !specialty) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Por favor, insira um email válido');
        return;
    }
    
    try {
        // Gerar senha temporária
        const tempPassword = Math.random().toString(36).slice(-8);
        
        // Criar usuário no Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, tempPassword);
        const userId = userCredential.user.uid;
        
        // Adicionar à coleção users (NÃO armazenar senha em texto claro)
        await db.collection('users').doc(userId).set({
            name: name,
            email: email,
            phone: phone,
            specialty: specialty,
            role: 'tecnico',
            active: true,
            created: new Date().toISOString(),
            createdBy: currentUserData.uid
        });
        
        console.log('✅ Técnico adicionado:', email);
        
        // Fechar modal e recarregar
        closeModal();
        loadUsers();
        
        // Mostrar informações de acesso
        showNotification(`Técnico adicionado! Envie estas credenciais:<br>Email: ${email}<br>Senha: ${tempPassword}`, 'success');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar técnico:', error);
        alert('Erro ao adicionar técnico: ' + error.message);
    }
}

// ========== RELATÓRIOS ==========
async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportMonth = document.getElementById('reportMonth').value;
    
    if (!reportMonth) {
        showNotification('Selecione um mês para gerar o relatório', 'warning');
        return;
    }
    
    try {
        // Mostrar loading
        const reportData = document.getElementById('reportData');
        reportData.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top: 15px;">Gerando relatório...</p>
            </div>
        `;
        
        // Calcular datas do período
        const [year, month] = reportMonth.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        
        // Buscar dados do período
        const snapshot = await db.collection('clients')
            .where('timestamp', '>=', startDate.toISOString())
            .where('timestamp', '<=', endDate.toISOString())
            .get();
        
        // Processar dados
        const clients = [];
        let totalCompleted = 0;
        let totalPending = 0;
        let totalValue = 0;
        const servicesCount = {};
        
        snapshot.forEach(doc => {
            const client = doc.data();
            client.id = doc.id;
            clients.push(client);
            
            // Contar status
            if (client.status === 'completed') {
                totalCompleted++;
            } else {
                totalPending++;
            }
            
            // Contar serviços
            if (client.service) {
                servicesCount[client.service] = (servicesCount[client.service] || 0) + 1;
            }
            
            // Calcular valor total (se houver)
            if (client.price) {
                totalValue += parseFloat(client.price) || 0;
            }
        });
        
        // Formatar relatório
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        const reportHTML = `
            <h4>Relatório de ${monthNames[month - 1]} de ${year}</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
                <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
                    <small>Total de Serviços</small>
                    <h3 style="margin: 10px 0; color: var(--primary-blue);">${clients.length}</h3>
                </div>
                <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
                    <small>Concluídos</small>
                    <h3 style="margin: 10px 0; color: var(--accent-emerald);">${totalCompleted}</h3>
                </div>
                <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
                    <small>Pendentes</small>
                    <h3 style="margin: 10px 0; color: var(--accent-amber);">${totalPending}</h3>
                </div>
                <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
                    <small>Taxa de Conclusão</small>
                    <h3 style="margin: 10px 0; color: var(--primary-dark);">
                        ${clients.length > 0 ? Math.round((totalCompleted / clients.length) * 100) : 0}%
                    </h3>
                </div>
            </div>
            
            <h5 style="margin-top: 25px;">Serviços por Tipo</h5>
            ${Object.entries(servicesCount).map(([service, count]) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <span>${escapeHtml(service)}</span>
                    <span style="font-weight: 600;">${count}</span>
                </div>
            `).join('')}
            
            ${clients.length > 0 ? `
                <div style="margin-top: 25px;">
                    <button class="btn btn-primary" onclick="exportReport(${year}, ${month})">
                        <i class="fas fa-download"></i> Exportar Relatório Completo
                    </button>
                </div>
            ` : ''}
        `;
        
        reportData.innerHTML = reportHTML;
        
    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        reportData.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Erro ao gerar relatório: ${error.message}
            </div>
        `;
    }
}

function exportReport(year, month) {
    // Esta função seria implementada para exportar para CSV ou PDF
    showNotification('Funcionalidade de exportação em desenvolvimento!', 'info');
}

// ========== EXPORTAR FUNÇÕES PARA HTML ==========
// Exportar funções que são chamadas diretamente do HTML
window.showSection = function(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar seção selecionada
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Atualizar navegação ativa
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    event.target.classList.add('active');
};

window.generateReport = generateReport;
window.showAddTechnicianModal = showAddTechnicianModal;
window.markAsCompleted = markAsCompleted;
window.assignToMe = assignToMe;
window.deleteClient = deleteClient;
window.contactClient = contactClient;