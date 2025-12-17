# 🚀 SouzaTec - Sistema Completo de Gerenciamento de TI

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-online-success)
![Firebase](https://img.shields.io/badge/firebase-hosting-orange)

Sistema web completo para a **SouzaTec - Soluções em TI**, oferecendo site institucional, painel administrativo e guias técnicos integrados, com hospedagem no **Firebase Hosting**.

🌐 **Site em produção (ambiente de TESTE):**
[https://souza-tch.web.app/](https://souza-tch.web.app/)

> ⚠️ **AVISO IMPORTANTE – AMBIENTE DE TESTE**
>
> Todas as chaves de API, credenciais, configurações do Firebase e dados apresentados neste repositório são **EXCLUSIVAMENTE PARA TESTE E DESENVOLVIMENTO**.
> Nenhuma credencial é real, válida para produção ou concede acesso a dados sensíveis, clientes reais ou sistemas internos.

---

## 📋 Visão Geral

O projeto **SouzaTec** foi desenvolvido para fins de **estudo, portfólio e demonstração técnica**, simulando um sistema real de gerenciamento de serviços de TI.

Ele contempla:

* Site institucional
* Painel administrativo
* Integração com Firebase (Auth, Firestore e Hosting)
* Estrutura organizada e escalável

---

## 🏗️ Estrutura do Projeto

### 📁 Organização de Arquivos

```
SouzaTec/
│
├── public/
│   ├── css/                        # Estilos do sistema
│   │   ├── style.css               # Estilos do site principal
│   │   ├── admin.css               # Estilos do painel administrativo
│   │   ├── verificacao.css         # Estilos da página de verificação
│   │   ├── firebase.css            # Estilos relacionados ao Firebase
│   │   └── root.css                # Estilos do guia root
│   │
│   ├── js/                         # Scripts JavaScript
│   │   ├── script.js               # Lógica do site principal
│   │   ├── admin.js                # Lógica do painel administrativo
│   │   ├── firebase.js             # Integração Firebase
│   │   ├── root.js                 # Guia técnico root
│   │   └── verificacao.js          # Scripts de verificação
│   │
│   ├── pages/                      # Páginas auxiliares
│   │   ├── firebase.html           # Guia Firebase
│   │   └── verificacao.html        # Página de verificação
│   │
│   ├── index.html                  # Página principal
│   ├── admin.html                  # Painel administrativo
│   └── root.html                   # Guia completo de root Android
│
├── public/__/firebase/             # Inicialização do Firebase
│   └── init.json                   # ⚠️ Credenciais de TESTE (não reais)
│
├── firebase.json                   # Configuração do Firebase Hosting
├── .firebaserc                     # Configuração do projeto Firebase
├── package.json                    # Dependências e scripts
├── package-lock.json               # Lock de dependências
├── README.md                       # Documentação
├── LICENSE                         # Licença MIT
└── .gitignore                      # Arquivos ignorados pelo Git
```

---

## 🚀 Funcionalidades

### 🌐 Site Institucional

* Design responsivo
* Apresentação de serviços de TI
* Informações institucionais
* Integração com WhatsApp

### 🔐 Painel Administrativo

* Autenticação via Firebase Authentication
* Controle administrativo (simulado)
* Estrutura pronta para CRUD

### 📱 Guias Técnicos

* Guia técnico de root Android (educacional)
* Páginas de verificação e apoio
* Conteúdo explicativo e organizado

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript
* Firebase Authentication
* Firebase Firestore
* Firebase Hosting
* Node.js (CLI e scripts)

---

## ⚙️ Como rodar o projeto localmente

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/VitorSouza2004/SouzaTec.git
```

### 2️⃣ Entrar na pasta

```bash
cd SouzaTec
```

### 3️⃣ Instalar dependências

```bash
npm install
```

### 4️⃣ Executar localmente (Firebase)

```bash
firebase serve --only hosting
```

---

## 🔧 Configuração do Firebase (TESTE)

> ⚠️ Todas as configurações abaixo são **APENAS EXEMPLOS DE TESTE**.

```json
// public/__/firebase/init.json
// CONFIGURAÇÃO DE TESTE – NÃO REAL
{
  "apiKey": "API_KEY_DE_TESTE",
  "authDomain": "projeto-teste.firebaseapp.com",
  "projectId": "projeto-teste",
  "storageBucket": "projeto-teste.appspot.com",
  "messagingSenderId": "000000000",
  "appId": "1:000000000:web:000000"
}
```

---

## 🔐 Segurança

* Credenciais reais **não são versionadas**
* Arquivos sensíveis protegidos via `.gitignore`
* Uso obrigatório de HTTPS via Firebase Hosting
* Projeto não armazena dados reais de usuários

---

## 🚀 Deploy

```bash
firebase deploy --only hosting
```

---

## 🤝 Contribuição

Este projeto é aberto para fins educacionais.

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'feat: nova funcionalidade'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**.
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Vitor Souza**
GitHub: [https://github.com/VitorSouza2004](https://github.com/VitorSouza2004)

---

## 🧠 Observações Finais

Este projeto **não representa um sistema comercial ativo**.

Ele foi criado exclusivamente para:

* Estudo
* Portfólio
* Demonstração técnica

---

**Status:** Online (ambiente de teste)
**Última atualização:** Dezembro/2025

