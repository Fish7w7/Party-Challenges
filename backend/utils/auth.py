import uuid
from functools import wraps
from flask import request, jsonify

def generate_player_id():
    """Gerar ID único para jogador"""
    return str(uuid.uuid4())

def validate_player_name(name):
    """Validar nome do jogador"""
    if not name or not isinstance(name, str):
        return False, "Nome é obrigatório"
    
    name = name.strip()
    if len(name) < 2:
        return False, "Nome deve ter pelo menos 2 caracteres"
    
    if len(name) > 20:
        return False, "Nome deve ter no máximo 20 caracteres"
    
    # Verificar caracteres válidos (letras, números, espaços, alguns símbolos)
    allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_.")
    if not all(c in allowed_chars for c in name):
        return False, "Nome contém caracteres inválidos"
    
    return True, name

def validate_room_id(room_id):
    """Validar ID da sala"""
    if not room_id or not isinstance(room_id, str):
        return False, "ID da sala é obrigatório"
    
    room_id = room_id.strip().upper()
    if len(room_id) != 8:
        return False, "ID da sala deve ter 8 caracteres"
    
    # Verificar se contém apenas letras e números
    if not room_id.isalnum():
        return False, "ID da sala deve conter apenas letras e números"
    
    return True, room_id

def require_json(f):
    """Decorator para exigir JSON no request"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Content-Type deve ser application/json'}), 400
        return f(*args, **kwargs)
    return wrapper

def validate_request_data(required_fields):
    """Decorator para validar campos obrigatórios no JSON"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON inválido ou vazio'}), 400
            
            missing_fields = []
            for field in required_fields:
                if field not in data or not data[field]:
                    missing_fields.append(field)
            
            if missing_fields:
                return jsonify({
                    'error': f'Campos obrigatórios ausentes: {", ".join(missing_fields)}'
                }), 400
            
            return f(*args, **kwargs)
        return wrapper
    return decorator