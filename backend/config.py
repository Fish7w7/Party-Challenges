import os

class Config:
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'party-challenges-secret-key-2024'
    
    # Socket.IO settings
    SOCKETIO_ASYNC_MODE = 'eventlet'
    
    # Game settings
    MAX_PLAYERS_PER_ROOM = 10
    CHALLENGES_PER_GAME = 10
    ANSWER_TIME_LIMIT = 30  # segundos
    
    # Scoring
    CORRECT_ANSWER_POINTS = 100
    SPEED_BONUS_POINTS = 50  # pontos extras para resposta rápida
    
    # File paths
    CHALLENGES_FILE = os.path.join(os.path.dirname(__file__), 'quiz_data', 'challenges.json')
    
class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False