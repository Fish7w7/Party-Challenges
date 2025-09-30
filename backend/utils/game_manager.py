import json
import random
from typing import Dict, List, Optional
from backend.models import GameRoom, Challenge
import config

class GameManager:
    def __init__(self):
        self.rooms: Dict[str, GameRoom] = {}
        self.challenges_pool = self.load_challenges()
    
    def load_challenges(self) -> List[Challenge]:
        """Carregar desafios do arquivo JSON"""
        try:
            with open(config.Config.CHALLENGES_FILE, 'r', encoding='utf-8') as file:
                challenges_data = json.load(file)
                return [Challenge(challenge_data) for challenge_data in challenges_data]
        except FileNotFoundError:
            print(f"Arquivo de desafios não encontrado: {config.Config.CHALLENGES_FILE}")
            return self.get_default_challenges()
        except json.JSONDecodeError:
            print("Erro ao decodificar arquivo JSON de desafios")
            return self.get_default_challenges()
    
    def get_default_challenges(self) -> List[Challenge]:
        """Desafios padrão caso não consiga carregar do arquivo"""
        default_data = [
            {
                "type": "quiz",
                "question": "Qual é a capital da França?",
                "answer": "paris",
                "points": 100
            },
            {
                "type": "target",
                "description": "Clique nos alvos que aparecem!",
                "points": 200,
                "time_limit": 30,
                "config": {"targetCount": 10}
            },
            {
                "type": "memory",
                "description": "Memorize a sequência de cores!",
                "points": 250,
                "time_limit": 90,
                "config": {"rounds": 5}
            },
            {
                "type": "math",
                "description": "Resolva as operações!",
                "points": 200,
                "time_limit": 60,
                "config": {"questionCount": 10}
            }
        ]
        return [Challenge(challenge) for challenge in default_data]
    
    def create_empty_room(self, room_id: str) -> GameRoom:
        """Criar uma sala vazia (sem jogadores ainda)"""
        room = GameRoom(room_id, None, None, None)
        
        selected_challenges = random.sample(
            self.challenges_pool, 
            min(config.Config.CHALLENGES_PER_GAME, len(self.challenges_pool))
        )
        room.set_challenges(selected_challenges)
        
        self.rooms[room_id] = room
        return room
    
    def create_room(self, room_id: str, host_name: str, host_id: str = None, host_avatar: str = None) -> GameRoom:
        """Criar uma nova sala"""
        if host_id is None:
            host_id = f"host_{room_id}"
        
        room = GameRoom(room_id, host_id, host_name, host_avatar)
        
        selected_challenges = random.sample(
            self.challenges_pool, 
            min(config.Config.CHALLENGES_PER_GAME, len(self.challenges_pool))
        )
        room.set_challenges(selected_challenges)
        
        self.rooms[room_id] = room
        return room
    
    def get_room(self, room_id: str) -> Optional[GameRoom]:
        """Obter sala pelo ID"""
        return self.rooms.get(room_id)
    
    def room_exists(self, room_id: str) -> bool:
        """Verificar se sala existe"""
        return room_id in self.rooms
    
    def add_player(self, room_id: str, player_id: str, player_name: str, avatar: str = None) -> bool:
        """Adicionar jogador à sala"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        return room.add_player(player_id, player_name, avatar)
    
    def remove_player(self, room_id: str, player_id: str) -> bool:
        """Remover jogador da sala"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        success = room.remove_player(player_id)
        
        if not room.players:
            del self.rooms[room_id]
        
        return success
    
    def is_host(self, room_id: str, player_id: str) -> bool:
        """Verificar se jogador é o host da sala"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        return room.host_id == player_id
    
    def start_game(self, room_id: str) -> bool:
        """Iniciar jogo na sala"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        return room.start_game()
    
    def get_current_challenge(self, room_id: str) -> Optional[dict]:
        """Obter desafio atual da sala"""
        room = self.get_room(room_id)
        if not room:
            return None
        
        challenge = room.get_current_challenge()
        return challenge.to_dict() if challenge else None
    
    def check_answer(self, room_id: str, player_id: str, answer: str) -> tuple:
        """
        Verificar resposta do jogador
        Retorna (is_correct, points_earned)
        ✅ ATUALIZADO: Agora retorna tupla
        """
        room = self.get_room(room_id)
        if not room:
            return False, 0
        
        if player_id in room.players and room.players[player_id].answered_current_round:
            return False, 0
        
        is_correct, points = room.submit_answer(player_id, answer)
        return is_correct, points
    
    def all_players_answered(self, room_id: str) -> bool:
        """Verificar se todos os jogadores responderam"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        return room.all_players_answered()
    
    def get_round_results(self, room_id: str) -> Optional[dict]:
        """Obter resultados da rodada atual"""
        room = self.get_room(room_id)
        if not room:
            return None
        
        return room.get_round_results()
    
    def has_next_challenge(self, room_id: str) -> bool:
        """Verificar se há próximo desafio"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        return room.has_next_challenge()
    
    def next_challenge(self, room_id: str) -> Optional[dict]:
        """Avançar para próximo desafio"""
        room = self.get_room(room_id)
        if not room:
            return None
        
        challenge = room.next_challenge()
        return challenge.to_dict() if challenge else None
    
    def get_final_results(self, room_id: str) -> Optional[dict]:
        """Obter resultados finais do jogo"""
        room = self.get_room(room_id)
        if not room:
            return None
        
        scoreboard = room.get_scoreboard()
        winner = scoreboard[0] if scoreboard else None
        
        return {
            'winner': winner,
            'final_scoreboard': scoreboard,
            'total_challenges': len(room.challenges),
            'game_summary': {
                'total_players': len(room.players),
                'total_rounds': room.current_challenge_index + 1
            }
        }
    
    def get_scoreboard(self, room_id: str) -> Optional[List[dict]]:
        """Obter placar da sala"""
        room = self.get_room(room_id)
        if not room:
            return None
        
        return room.get_scoreboard()
    
    def get_room_players(self, room_id: str) -> List[dict]:
        """Obter lista de jogadores da sala"""
        room = self.get_room(room_id)
        if not room:
            return []
        
        return [player.to_dict() for player in room.players.values()]
    
    def get_room_info(self, room_id: str) -> Optional[dict]:
        """Obter informações completas da sala"""
        room = self.get_room(room_id)
        if not room:
            return None
        
        room_data = room.to_dict()
        
        if room.game_started and room.get_current_challenge():
            room_data['current_challenge'] = room.get_current_challenge().to_dict()
        
        return room_data
    
    def cleanup_empty_rooms(self):
        """Limpar salas vazias (pode ser chamado periodicamente)"""
        empty_rooms = [room_id for room_id, room in self.rooms.items() if not room.players]
        for room_id in empty_rooms:
            del self.rooms[room_id]
        
        return len(empty_rooms)
    
    def reset_game(self, room_id: str) -> bool:
        """Resetar o jogo mantendo os jogadores"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        for player in room.players.values():
            player.score = 0
            player.reset_round()
        
        selected_challenges = random.sample(
            self.challenges_pool, 
            min(config.Config.CHALLENGES_PER_GAME, len(self.challenges_pool))
        )
        room.set_challenges(selected_challenges)
        
        room.current_challenge_index = -1
        room.game_started = False
        room.game_ended = False
        room.round_start_time = None
        
        return True