# 🎉 Party Challenges

Um jogo web divertido de quiz e desafios para jogar com amigos em tempo real!

## 📋 Sobre o Projeto

Party Challenges é um jogo multiplayer online onde você pode criar salas privadas, convidar amigos e participar de rodadas de quiz e desafios divertidos. O jogo utiliza WebSockets para comunicação em tempo real, garantindo uma experiência sincronizada para todos os participantes.

### ✨ Características

- 🎯 **Salas Privadas**: Crie salas com código único para jogar com seus amigos
- ⚡ **Tempo Real**: Comunicação instantânea via WebSockets
- 📊 **Placar Dinâmico**: Acompanhe a pontuação em tempo real
- 🎮 **Dois Tipos de Desafios**:
  - **Quiz**: Perguntas de conhecimento geral
  - **Ação**: Desafios divertidos para fazer
- 👑 **Sistema de Host**: O criador da sala controla o fluxo do jogo
- 🏆 **Pontuação por Velocidade**: Respostas mais rápidas ganham pontos extras

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **Flask-SocketIO**: WebSockets para comunicação em tempo real
- **Flask-CORS**: Configuração de CORS
- **Python 3.8+**

### Frontend
- **React 18**: Interface do usuário
- **Vite**: Build tool e dev server
- **Socket.IO Client**: Comunicação WebSocket
- **React Router**: Roteamento
- **CSS3**: Estilização moderna

## 🚀 Como Executar

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- npm ou yarn

### 1. Preparar o Ambiente

Primeiro, execute o script para criar a estrutura de pastas:

```bash
# Dar permissão de execução ao script
chmod +x setup_structure.sh

# Executar script de setup
./setup_structure.sh
```

### 2. Configurar Backend

```bash
# Navegar para pasta do backend
cd party-challenges/backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# No Linux/Mac:
source venv/bin/activate
# No Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor Flask
python app.py
```

O backend estará rodando em `http://localhost:5000`

### 3. Configurar Frontend

```bash
# Em outro terminal, navegar para pasta do frontend
cd party-challenges/frontend

# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

### 4. Acessar o Jogo

Abra seu navegador e acesse `http://localhost:5173`

## 🎮 Como Jogar

### 1. Criar uma Sala
1. Clique em "Criar Nova Sala"
2. Digite seu nome
3. Compartilhe o código da sala com seus amigos

### 2. Entrar em uma Sala
1. Clique em "Entrar em Sala"
2. Digite o código da sala fornecido pelo host
3. Digite seu nome
4. Aguarde o host iniciar o jogo

### 3. Durante o Jogo
- **Quiz**: Responda as perguntas o mais rápido possível
- **Desafios de Ação**: Complete as ações propostas
- **Pontuação**: Respostas corretas e rápidas dão mais pontos
- **Placar**: Acompanhe sua posição em tempo real

## 📁 Estrutura do Projeto

```
party-challenges/
│
├── backend/                  # Flask + Flask-SocketIO
│   ├── app.py                # Arquivo principal do Flask
│   ├── requirements.txt      # Dependências Python
│   ├── config.py             # Configurações gerais
│   ├── models.py             # Modelos (usuários, salas, desafios)
│   ├── quiz_data/            # Pasta com perguntas/desafios em JSON
│   │   └── challenges.json
│   └── utils/
│       ├── __init__.py
│       ├── game_manager.py   # Lógica do jogo
│       └── auth.py           # Validações e autenticação
│
├── frontend/                 # React App
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.jsx
│       ├── App.jsx
│       ├── components/       # Componentes React
│       │   ├── Lobby.jsx
│       │   ├── GameRoom.jsx
│       │   ├── Challenge.jsx
│       │   ├── Scoreboard.jsx
│       │   └── AvatarPicker.jsx
│       ├── pages/            # Páginas principais
│       │   ├── Home.jsx
│       │   ├── CreateRoom.jsx
│       │   └── JoinRoom.jsx
│       ├── hooks/
│       │   └── useSocket.js  # Hook customizado para Socket.IO
│       ├── services/
│       │   └── api.js        # Serviços de API
│       └── styles/
│           └── main.css      # Estilização
│
├── docker-compose.yml        # Configuração Docker
├── setup_structure.sh        # Script de setup
└── README.md                 # Este arquivo
```

## 🎯 Funcionalidades Principais

### Backend (Flask + SocketIO)

- **Endpoints REST**:
  - `POST /api/create-room` - Criar nova sala
  - `GET /api/room/:id` - Informações da sala

- **Eventos WebSocket**:
  - `join_room` - Entrar em sala
  - `start_game` - Iniciar jogo (apenas host)
  - `submit_answer` - Enviar resposta
  - `get_scoreboard` - Obter placar
  - `next_round` - Próxima rodada (apenas host)

### Frontend (React)

- **Páginas**:
  - Home - Tela inicial
  - CreateRoom - Criar sala
  - JoinRoom - Entrar em sala
  - GameRoom - Sala de jogo principal

- **Componentes**:
  - Lobby - Aguardar jogadores
  - Challenge - Desafios e quiz
  - Scoreboard - Placar
  - AvatarPicker - Seleção de avatar

## 🔧 Configurações

### Variáveis de Ambiente

Você pode configurar as seguintes variáveis no arquivo `backend/config.py`:

- `MAX_PLAYERS_PER_ROOM` - Máximo de jogadores por sala (padrão: 10)
- `CHALLENGES_PER_GAME` - Número de desafios por jogo (padrão: 10)
- `ANSWER_TIME_LIMIT` - Tempo limite para responder (padrão: 30s)
- `CORRECT_ANSWER_POINTS` - Pontos por resposta correta (padrão: 100)
- `SPEED_BONUS_POINTS` - Pontos extras por velocidade (padrão: 50)

### Personalizar Desafios

Edite o arquivo `backend/quiz_data/challenges.json` para adicionar seus próprios desafios:

```json
[
  {
    "type": "quiz",
    "question": "Sua pergunta aqui?",
    "answer": "resposta esperada",
    "points": 100,
    "time_limit": 30
  },
  {
    "type": "action",
    "description": "Descrição do desafio",
    "points": 150,
    "time_limit": 45
  }
]
```

## 🐳 Docker (Opcional)

Para executar com Docker:

```bash
# Construir e executar containers
docker-compose up --build

# Executar em background
docker-compose up -d
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎊 Créditos

Desenvolvido com ❤️ para diversão com amigos!

### 🚀 Próximas Funcionalidades

- [ ] Salas públicas
- [ ] Mais tipos de desafios
- [ ] Sistema de ranking global
- [ ] Personalização de avatares
- [ ] Modo torneio
- [ ] Chat entre jogadores

---

**Divirta-se jogando Party Challenges! 🎮🎉**