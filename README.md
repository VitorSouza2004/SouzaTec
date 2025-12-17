# SouzaTec - Sistema Completo de Gerenciamento de TI

## 📋 Visão Geral
Sistema web completo para a **SouzaTec - Soluções em TI**, oferecendo site institucional, painel administrativo e guia técnico especializado em root para dispositivos Android.

**URL do Site:** [https://souza-tch.web.app/](https://souza-tch.web.app/)

---

## 🏗️ Estrutura do Projeto

### 📁 Organização de Arquivos
```
souzatec-site/
│
├── 📁 css/                          # Estilos do sistema
│   ├── style.css                   # Estilos do site principal
│   ├── admin.css                   # Estilos do painel administrativo
│   ├── verificacao.css             # Estilos da página de verificação
│   └── firebase.css                # Estilos do guia Firebase
│
├── 📁 js/                           # Scripts JavaScript
│   ├── script.js                   # Lógica do site principal
│   ├── admin.js                    # Lógica do painel administrativo
│   └── root.js                     # Funções específicas do guia de root
│
├── 📁 pages/                        # Páginas auxiliares
│   ├── verificacao.html            # Ferramenta de verificação técnica
│   └── firebase.html               # Guia de configuração do Firebase
│
├── 📁 __/firebase/                  # Configurações seguras do Firebase
│   └── init.json                   # Credenciais (não versionado)
│
├── 📁 assets/                       # Recursos multimídia
│   ├── images/                     # Imagens do site
│   ├── fonts/                      # Fontes personalizadas
│   └── downloads/                  # Arquivos para download
│
├── index.html                      # Página principal
├── root.html                       # Guia completo de root para Android
├── admin.html                      # Painel administrativo
├── README.md                       # Esta documentação
└── .gitignore                      # Arquivos ignorados pelo Git
```

---

## 🚀 Funcionalidades

### 🌐 Site Principal (`index.html`)
- **Design Responsivo** - Adaptável a todos os dispositivos
- **Seção de Serviços** - Apresentação dos serviços de TI oferecidos
- **Formulário de Contato** - Integrado com WhatsApp e Firebase
- **Sobre a Empresa** - História e valores da SouzaTec
- **Google Analytics** - Monitoramento de visitas

### 📱 Guia de Root (`root.html`)
- **Passo a Passo Completo** - Instruções detalhadas para root
- **Multiplataforma** - Comandos para Windows, macOS, Linux e Termux
- **Links Oficiais** - Downloads de TWRP, Magisk e Shizuku
- **FAQ** - Perguntas frequentes e soluções de problemas
- **Avisos de Segurança** - Alertas importantes para o usuário

### 🔐 Painel Administrativo (`admin.html`)
- **Sistema de Login** - Autenticação segura com Firebase
- **Gerenciamento de Clientes** - CRUD completo de clientes
- **Controle de Serviços** - Acompanhamento de serviços pendentes/concluídos
- **Relatórios** - Estatísticas e faturamento mensal
- **Gestão de Usuários** - Controle de acesso administrativo

---

## 🔧 Configuração Técnica

### ⚙️ Pré-requisitos
- Conta no [Firebase](https://firebase.google.com/)
- Editor de código (VS Code, Sublime, etc.)
- Navegador moderno (Chrome, Firefox, Edge)

### 🔐 Configuração do Firebase

#### 1. Criar Projeto no Firebase
```bash
1. Acesse https://console.firebase.google.com/
2. Clique em "Criar projeto"
3. Nomeie como "SouzaTec"
4. Siga o assistente de configuração
```

#### 2. Configurar Serviços Necessários
```bash
# No Console do Firebase:
1. Authentication → Método Email/Senha
2. Firestore Database → Criar banco de dados
3. Hosting → Configurar hospedagem
```

#### 3. Configuração de Segurança
```json
// Arquivo: public/__/firebase/init.json
{
  "apiKey": "SUA_API_KEY_AQUI",
  "authDomain": "seu-projeto.firebaseapp.com",
  "projectId": "seu-projeto-id",
  "storageBucket": "seu-projeto.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef123456"
}
```

#### 4. Regras de Segurança do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permissões para clientes (dados públicos)
    match /clients/{document} {
      allow write: if request.auth != null;
      allow read: if request.auth != null;
    }
    
    // Permissões administrativas
    match /admin/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🛠️ Instalação e Deploy

### 📥 Instalação Local
```bash
# 1. Clone ou copie os arquivos
git clone [seu-repositorio]

# 2. Navegue até a pasta
cd souzatec-site

# 3. Instale o Firebase CLI (se necessário)
npm install -g firebase-tools

# 4. Faça login no Firebase
firebase login

# 5. Inicialize o projeto
firebase init hosting

# 6. Teste localmente
firebase serve --only hosting
```

### 🚀 Deploy para Produção
```bash
# 1. Faça o build (se necessário)
# (Este projeto não requer build, é estático)

# 2. Execute o deploy
firebase deploy --only hosting

# 3. Verifique o deploy
firebase open hosting
```

### 🔄 Comandos Úteis
```bash
# Testar localmente
firebase serve --only hosting

# Fazer deploy
firebase deploy --only hosting

# Visualizar logs
firebase hosting:channel:open

# Listar deploys
firebase hosting:list
```

---

## 🔐 Segurança

### 📋 Boas Práticas Implementadas
1. **Credenciais Protegidas** - Chaves do Firebase em `__/firebase/init.json`
2. **API Key Restrita** - Configuração de restrições no Google Cloud Console
3. **Autenticação Obrigatória** - Acesso administrativo requer login
4. **HTTPS Obrigatório** - Todas as conexões são criptografadas
5. **Validação de Dados** - Formulários com validação client-side e server-side

### 🛡️ Configuração de Segurança da API Key
```bash
# No Google Cloud Console (https://console.cloud.google.com):
1. APIs & Services → Credentials
2. Selecione sua API Key
3. Application restrictions: HTTP referrers
   - https://souza-tch.web.app/*
   - https://*.souza-tch.web.app/*
   - http://localhost:* (desenvolvimento)
4. API restrictions: Restrict key
   - Firebase Installations API
   - Cloud Firestore API
   - Firebase Authentication API
```

---

## 📱 Recursos Avançados

### 🔗 Integrações
- **WhatsApp Business** - Contato direto com clientes
- **Google Analytics** - Análise de tráfego
- **Firebase Analytics** - Métricas de engajamento
- **Font Awesome** - Ícones profissionais

### 🎨 Design System
```css
/* Cores principais */
:root {
    --primary: #2c3e50;    /* Azul escuro */
    --secondary: #3498db;  /* Azul claro */
    --accent: #e74c3c;     /* Vermelho */
    --success: #2ecc71;    /* Verde */
    --warning: #f39c12;    /* Amarelo */
    --dark: #2c3e50;       /* Escuro */
    --light: #ecf0f1;      /* Claro */
}
```

### 📱 Responsividade
- Mobile First design
- Breakpoints: 768px, 992px, 1200px
- Images responsivas
- Menu hamburguer para mobile

---

## 🐛 Solução de Problemas

### Problemas Comuns e Soluções

| Problema | Solução |
|----------|---------|
| Firebase não inicializa | Verifique `__/firebase/init.json` |
| Formulário não envia | Verifique conexão com Firestore |
| Login falha | Confira credenciais no Firebase Auth |
| Site não carrega | Execute `firebase deploy --only hosting` |
| Erros no console | Verifique se todas as bibliotecas estão carregadas |

### 🔍 Depuração
```javascript
// Habilitar modo debug
localStorage.setItem('debug', 'true');

// Verificar Firebase
console.log('Firebase apps:', firebase.apps.length);
console.log('Firebase config:', firebase.app().options);

// Testar conexão Firestore
db.collection('test').add({test: true})
  .then(() => console.log('Firestore OK'))
  .catch(err => console.error('Firestore error:', err));
```

---

## 📈 Monitoramento e Manutenção

### 📊 Métricas Importantes
- **Uptime do site**: Monitorar via Firebase Hosting
- **Performance**: Google PageSpeed Insights
- **Segurança**: Scans regulares de vulnerabilidade
- **Backups**: Backup automático do Firestore

### 🔄 Atualizações
```bash
# 1. Verificar atualizações do Firebase
npm outdated

# 2. Atualizar dependências
npm update

# 3. Testar atualizações
firebase serve --only hosting

# 4. Deploy de atualizações
firebase deploy --only hosting --message "Atualização: [descrição]"
```

---

## 🤝 Contribuição

### 📝 Como Contribuir
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### 🎯 Roadmap
- [ ] Sistema de agendamento online
- [ ] Integração com pagamentos
- [ ] App mobile
- [ ] Chat em tempo real
- [ ] Sistema de tickets

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

- **Site**: [https://souza-tch.web.app/](https://souza-tch.web.app/)
- **Email**: souzah101124@gmail.com
- **WhatsApp**: +55 (11) 93923-1112
- **Área**: Parelheiros - São Paulo/SP

---

## 🙏 Agradecimentos

- Equipe Firebase/Google pela plataforma
- Comunidade de desenvolvedores web
- Contribuidores do projeto
- Clientes da SouzaTec pela confiança

---

**Última atualização**: Dezembro 2025  
**Versão**: 1.0.0  
**Status**: Produção  

---
*Documentação mantida pela equipe SouzaTec - Soluções em TI com qualidade e confiabilidade.*