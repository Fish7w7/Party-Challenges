import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import uuid
from datetime import datetime
from utils.game_manager import GameManager

app = Flask(__name__)
app.config['SECRET_KEY'] = 'party-challenges-secret-key-2024'

# Configurar CORS
CORS(app, origins=["*"])

# Configurar Socket.IO
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",
    async_mode='eventlet',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Inicializar gerenciador de jogo
game_manager = GameManager()

# Dicionário para armazenar informações dos jogadores conectados
connected_players = {}

@app.route('/')
def index():
    return jsonify({"message": "Party Challenges API está rodando!"})

@app.route('/api/create-room', methods=['POST'])
def create_room():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados JSON são obrigatórios'}), 400
            
        player_name = data.get('player_name', '').strip()
        avatar = data.get('avatar', '😀')  # ← Receber avatar
        
        if not player_name:
            return jsonify({'error': 'Nome do jogador é obrigatório'}), 400
        
        room_id = str(uuid.uuid4())[:8].upper()
        
        # ✅ Criar sala COM o host já incluído
        room = game_manager.create_room(
            room_id=room_id,
            host_name=player_name,
            host_id=f"temp_host_{room_id}",  # ID temporário até conectar via socket
            host_avatar=avatar
        )
        
        return jsonify({
            'room_id': room_id,
            'player_name': player_name,
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/room/<room_id>', methods=['GET'])
def get_room_info(room_id):
    """Obter informações da sala"""
    try:
        room_info = game_manager.get_room_info(room_id)
        
        if not room_info:
            return jsonify({'error': 'Sala não encontrada'}), 404
        
        return jsonify(room_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    emit('connected', {'message': 'Conectado ao servidor!'})

@socketio.on('disconnect')
def handle_disconnect():
    # Remover jogador de todas as salas
    if request.sid in connected_players:
        player_info = connected_players[request.sid]
        room_id = player_info.get('room_id')
        
        if room_id:
            game_manager.remove_player(room_id, request.sid)
            room_players = game_manager.get_room_players(room_id)
            socketio.emit('player_left', {
                'player_id': request.sid,
                'players': room_players
            }, room=room_id)
        
        del connected_players[request.sid]

@socketio.on('join_room')
def handle_join_room(data):
    """Jogador entra em uma sala"""
    try:
        room_id = data.get('room_id')
        player_name = data.get('player_name')
        player_avatar = data.get('avatar', '👤')  # Avatar padrão se não fornecido
        
        if not room_id or not player_name:
            emit('error', {'message': 'Room ID e nome do jogador são obrigatórios'})
            return
        
        # Verificar se a sala existe
        if not game_manager.room_exists(room_id):
            emit('error', {'message': 'Sala não encontrada'})
            return
        
        # Verificar se o jogador já está na sala
        if request.sid in connected_players:
            player_info = connected_players[request.sid]
            if player_info.get('room_id') == room_id:
                room_info = game_manager.get_room_info(room_id)
                emit('room_joined', room_info)
                return
        
        # Adicionar jogador à sala com avatar
        success = game_manager.add_player(room_id, request.sid, player_name, player_avatar)
        
        if not success:
            emit('error', {'message': 'Não foi possível entrar na sala'})
            return
        
        # Armazenar informações do jogador
        connected_players[request.sid] = {
            'room_id': room_id,
            'player_name': player_name,
            'avatar': player_avatar
        }
        
        # Entrar na sala do Socket.IO
        join_room(room_id)
        
        # Notificar outros jogadores
        room_players = game_manager.get_room_players(room_id)
        socketio.emit('player_joined', {
            'player_id': request.sid,
            'player_name': player_name,
            'avatar': player_avatar,
            'players': room_players
        }, room=room_id)
        
        # Enviar estado atual para o jogador
        room_info = game_manager.get_room_info(room_id)
        emit('room_joined', room_info)
        
    except Exception as e:
        emit('error', {'message': 'Erro interno do servidor'})

@socketio.on('start_game')
def handle_start_game(data):
    """Iniciar o jogo"""
    try:
        room_id = data.get('room_id')
        
        if request.sid not in connected_players:
            emit('error', {'message': 'Jogador não encontrado'})
            return
        
        player_info = connected_players[request.sid]
        if player_info.get('room_id') != room_id:
            emit('error', {'message': 'Jogador não está nesta sala'})
            return
        
        # Verificar se o jogador é o host
        if not game_manager.is_host(room_id, request.sid):
            emit('error', {'message': 'Apenas o host pode iniciar o jogo'})
            return
        
        # Iniciar o jogo
        success = game_manager.start_game(room_id)
        
        if not success:
            emit('error', {'message': 'Não foi possível iniciar o jogo'})
            return
        
        # Notificar todos os jogadores
        socketio.emit('game_started', {
            'message': 'O jogo começou!'
        }, room=room_id)
        
        # Enviar primeiro desafio
        challenge = game_manager.get_current_challenge(room_id)
        if challenge:
            socketio.emit('new_challenge', challenge, room=room_id)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('submit_answer')
def handle_submit_answer(data):
    """Jogador submete uma resposta"""
    try:
        room_id = data.get('room_id')
        answer = data.get('answer', '').strip()
        
        if request.sid not in connected_players:
            emit('error', {'message': 'Jogador não encontrado'})
            return
        
        player_info = connected_players[request.sid]
        if player_info.get('room_id') != room_id:
            emit('error', {'message': 'Jogador não está nesta sala'})
            return
        
        # ✅ ATUALIZADO: recebe is_correct e points_earned
        is_correct, points_earned = game_manager.check_answer(room_id, request.sid, answer)
        
        # Notificar o jogador sobre sua resposta
        emit('answer_result', {
            'correct': is_correct,
            'answer': answer,
            'points_earned': points_earned  # ✅ NOVO CAMPO
        })
        
        # Verificar se todos responderam
        if game_manager.all_players_answered(room_id):
            # Mostrar resultados da rodada
            round_results = game_manager.get_round_results(room_id)
            socketio.emit('round_results', round_results, room=room_id)
            
    except Exception as e:
        emit('error', {'message': 'Erro interno do servidor'})

@socketio.on('next_round')
def handle_next_round(data):
    """Host solicita próxima rodada"""
    try:
        room_id = data.get('room_id')
        
        if request.sid not in connected_players:
            emit('error', {'message': 'Jogador não encontrado'})
            return
        
        player_info = connected_players[request.sid]
        if player_info.get('room_id') != room_id:
            emit('error', {'message': 'Jogador não está nesta sala'})
            return
        
        # Verificar se o jogador é o host
        if not game_manager.is_host(room_id, request.sid):
            emit('error', {'message': 'Apenas o host pode avançar para a próxima rodada'})
            return
        
        # Verificar se há próximo desafio
        if game_manager.has_next_challenge(room_id):
            challenge = game_manager.next_challenge(room_id)
            if challenge:
                socketio.emit('new_challenge', challenge, room=room_id)
            else:
                emit('error', {'message': 'Erro ao carregar próximo desafio'})
        else:
            # Jogo terminou
            final_results = game_manager.get_final_results(room_id)
            socketio.emit('game_ended', final_results, room=room_id)
            
    except Exception as e:
        emit('error', {'message': f'Erro interno: {str(e)}'})

@socketio.on('get_scoreboard')
def handle_get_scoreboard(data):
    """Obter placar atual"""
    try:
        room_id = data.get('room_id')
        
        if request.sid not in connected_players:
            emit('error', {'message': 'Jogador não encontrado'})
            return
        
        scoreboard = game_manager.get_scoreboard(room_id)
        emit('scoreboard_update', scoreboard)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('reset_game')
def handle_reset_game(data):
    """Host reseta o jogo para nova partida"""
    try:
        room_id = data.get('room_id')
        
        if request.sid not in connected_players:
            emit('error', {'message': 'Jogador não encontrado'})
            return
        
        # Verificar se é o host
        if not game_manager.is_host(room_id, request.sid):
            emit('error', {'message': 'Apenas o host pode resetar o jogo'})
            return
        
        # Resetar o jogo no game manager
        success = game_manager.reset_game(room_id)
        
        if success:
            # Notificar todos os jogadores que o jogo foi resetado
            socketio.emit('game_reset', {
                'message': 'O host iniciou uma nova partida!'
            }, room=room_id)
        else:
            emit('error', {'message': 'Erro ao resetar o jogo'})
            
    except Exception as e:
        emit('error', {'message': f'Erro: {str(e)}'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)