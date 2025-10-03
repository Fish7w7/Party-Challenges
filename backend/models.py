from datetime import datetime
from typing import Dict, List, Optional
import json

class Player:
    def __init__(self, player_id: str, name: str, avatar: str = None):
        self.id = player_id
        self.name = name
        self.avatar = avatar or '👤'
        self.score = 0
        self.joined_at = datetime.now()
        self.answered_current_round = False
        self.current_answer = None
        self.answer_time = None
    
    def reset_round(self):
        """Resetar dados da rodada atual"""
        self.answered_current_round = False
        self.current_answer = None
        self.answer_time = None
    
    def submit_answer(self, answer: str):
        """Submeter resposta para a rodada atual"""
        self.current_answer = answer.strip().lower() if isinstance(answer, str) else answer
        self.answer_time = datetime.now()
        self.answered_current_round = True
    
    def add_points(self, points: int):
        """Adicionar pontos ao jogador"""
        self.score += points
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'avatar': self.avatar,
            'score': self.score,
            'joined_at': self.joined_at.isoformat(),
            'answered_current_round': self.answered_current_round
        }

class Challenge:
    def __init__(self, challenge_data: dict):
        self.type = challenge_data.get('type', 'quiz')
        self.question = challenge_data.get('question', '')
        self.description = challenge_data.get('description', '')
        self.answer = challenge_data.get('answer', '').lower() if challenge_data.get('answer') else None
        self.options = challenge_data.get('options', [])
        self.points = challenge_data.get('points', 100)
        self.time_limit = challenge_data.get('time_limit', 30)
        self.config = challenge_data.get('config', {})
    
    def check_answer(self, user_answer: str) -> tuple:
        """
        Verificar se a resposta está correta
        Retorna (is_correct, points_earned)
        """
        # Minigames retornam resultado JSON
        if self.type in ['target', 'memory', 'math']:
            try:
                result = json.loads(user_answer) if isinstance(user_answer, str) else user_answer
                points = result.get('score', 0)
                return True, points
            except (json.JSONDecodeError, AttributeError, TypeError):
                return False, 0
        
        # Action challenges sempre retornam True
        if self.type == 'action':
            return True, self.points
        
        # Quiz tradicional
        if not self.answer:
            return False, 0
        
        # Normalizar resposta do usuário
        normalized_answer = user_answer.strip().lower()
        
        # Verificar resposta exata
        if normalized_answer == self.answer:
            return True, self.points
        
        # Para múltipla escolha, verificar se a opção está correta
        if self.options:
            try:
                option_index = int(normalized_answer)
                if 0 <= option_index < len(self.options):
                    is_correct = self.options[option_index].lower() == self.answer
                    return is_correct, self.points if is_correct else 0
            except ValueError:
                pass
        
        return False, 0
    
    def to_dict(self):
        result = {
            'type': self.type,
            'points': self.points,
            'time_limit': self.time_limit
        }
        
        if self.type == 'quiz':
            result['question'] = self.question
            if self.options:
                result['options'] = self.options
        elif self.type == 'action':
            result['description'] = self.description
        elif self.type in ['target', 'memory', 'math']:
            result['description'] = self.description
            result['config'] = self.config
        
        return result

class GameRoom:
    def __init__(self, room_id: str, host_id: str = None, host_name: str = None, host_avatar: str = None):
        self.id = room_id
        self.host_id = host_id
        self.players: Dict[str, Player] = {}
        self.challenges: List[Challenge] = []
        self.current_challenge_index = -1
        self.game_started = False
        self.game_ended = False
        self.created_at = datetime.now()
        self.round_start_time = None
        
        if host_id and host_name:
            self.add_player(host_id, host_name, host_avatar)
    
    def add_player(self, player_id: str, player_name: str, avatar: str = None) -> bool:
        """Adicionar jogador à sala"""
        if len(self.players) >= 10:
            return False
        
        # Atualizar se já existe (previne duplicação)
        if player_id in self.players:
            self.players[player_id].name = player_name
            self.players[player_id].avatar = avatar or '👤'
            return True
        
        # Se é o primeiro jogador, torna-se host
        if not self.players:
            self.host_id = player_id
        
        # Adiciona novo jogador
        self.players[player_id] = Player(player_id, player_name, avatar)
        return True
    
    def remove_player(self, player_id: str) -> bool:
        """Remover jogador da sala"""
        if player_id not in self.players:
            return False
        
        del self.players[player_id]
        
        if player_id == self.host_id and self.players:
            self.host_id = next(iter(self.players))
        
        return True
    
    def set_challenges(self, challenges: List[Challenge]):
        """Definir lista de desafios do jogo"""
        self.challenges = challenges
    
    def start_game(self) -> bool:
        """Iniciar o jogo"""
        if len(self.players) < 2:
            return False
        
        if not self.challenges:
            return False
        
        self.game_started = True
        self.current_challenge_index = 0
        self.round_start_time = datetime.now()
        
        for player in self.players.values():
            player.reset_round()
        
        return True
    
    def get_current_challenge(self) -> Optional[Challenge]:
        """Obter desafio atual"""
        if 0 <= self.current_challenge_index < len(self.challenges):
            return self.challenges[self.current_challenge_index]
        return None
    
    def next_challenge(self) -> Optional[Challenge]:
        """Avançar para próximo desafio"""
        self.current_challenge_index += 1
        self.round_start_time = datetime.now()
        
        for player in self.players.values():
            player.reset_round()
        
        return self.get_current_challenge()
    
    def submit_answer(self, player_id: str, answer: str) -> tuple:
        """
        Jogador submete resposta
        Retorna (success, points_earned)
        """
        if player_id not in self.players:
            return False, 0
        
        player = self.players[player_id]
        if player.answered_current_round:
            return False, 0
        
        player.submit_answer(answer)
        
        current_challenge = self.get_current_challenge()
        if current_challenge:
            is_correct, points = current_challenge.check_answer(answer)
            
            # Adicionar bônus por velocidade (apenas para quiz tradicional)
            if current_challenge.type == 'quiz' and is_correct and self.round_start_time:
                time_elapsed = (datetime.now() - self.round_start_time).total_seconds()
                if time_elapsed <= 10:
                    points += 50
            
            if points > 0:
                player.add_points(points)
            
            return is_correct, points
        
        return False, 0
    
    def all_players_answered(self) -> bool:
        """Verificar se todos os jogadores responderam"""
        if not self.players:
            return False
        return all(player.answered_current_round for player in self.players.values())
    
    def has_next_challenge(self) -> bool:
        """Verificar se há próximo desafio"""
        return self.current_challenge_index + 1 < len(self.challenges)
    
    def get_scoreboard(self) -> List[dict]:
        """Obter placar ordenado"""
        sorted_players = sorted(
            self.players.values(), 
            key=lambda p: p.score, 
            reverse=True
        )
        return [player.to_dict() for player in sorted_players]
    
    def get_round_results(self) -> dict:
        """Obter resultados da rodada atual"""
        current_challenge = self.get_current_challenge()
        results = {
            'challenge': current_challenge.to_dict() if current_challenge else None,
            'correct_answer': current_challenge.answer if current_challenge and current_challenge.type == 'quiz' else None,
            'players_results': [],
            'scoreboard': self.get_scoreboard()
        }
        
        for player in self.players.values():
            is_correct = False
            points_earned = 0
            
            if current_challenge and player.current_answer:
                is_correct, points_earned = current_challenge.check_answer(str(player.current_answer))
            
            # Para minigames, mostrar score em vez da resposta bruta
            display_answer = player.current_answer
            if current_challenge and current_challenge.type in ['target', 'memory', 'math']:
                try:
                    result = json.loads(player.current_answer) if isinstance(player.current_answer, str) else player.current_answer
                    display_answer = f"Score: {result.get('score', 0)}"
                except:
                    display_answer = "Concluído"
            
            results['players_results'].append({
                'player_id': player.id,
                'player_name': player.name,
                'player_avatar': player.avatar,
                'answer': display_answer,
                'correct': is_correct,
                'points_earned': points_earned
            })
        
        return results
    
    def to_dict(self):
        return {
            'id': self.id,
            'host_id': self.host_id,
            'players': [player.to_dict() for player in self.players.values()],
            'player_count': len(self.players),
            'game_started': self.game_started,
            'game_ended': self.game_ended,
            'current_challenge_index': self.current_challenge_index,
            'total_challenges': len(self.challenges),
            'created_at': self.created_at.isoformat()
        }