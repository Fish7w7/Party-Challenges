import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API functions
export const createRoom = async (playerName, avatar = '😀') => {
  try {
    const response = await api.post('/create-room', {
      player_name: playerName,
      avatar: avatar  // ← Enviar avatar
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao criar sala')
  }
}

export const getRoomInfo = async (roomId) => {
  try {
    const response = await api.get(`/room/${roomId}`)
    return response.data
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Sala não encontrada')
    }
    throw new Error(error.response?.data?.error || 'Erro ao buscar informações da sala')
  }
}

// Função helper para validar formato do room ID
export const validateRoomId = (roomId) => {
  if (!roomId || typeof roomId !== 'string') {
    return { valid: false, message: 'ID da sala é obrigatório' }
  }

  const cleanRoomId = roomId.trim().toUpperCase()
  
  if (cleanRoomId.length !== 8) {
    return { valid: false, message: 'ID da sala deve ter 8 caracteres' }
  }

  if (!/^[A-Z0-9]+$/.test(cleanRoomId)) {
    return { valid: false, message: 'ID da sala deve conter apenas letras e números' }
  }

  return { valid: true, roomId: cleanRoomId }
}

// Função helper para validar nome do jogador
export const validatePlayerName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Nome é obrigatório' }
  }

  const cleanName = name.trim()
  
  if (cleanName.length < 2) {
    return { valid: false, message: 'Nome deve ter pelo menos 2 caracteres' }
  }

  if (cleanName.length > 20) {
    return { valid: false, message: 'Nome deve ter no máximo 20 caracteres' }
  }

  // Verificar caracteres válidos
  const allowedChars = /^[a-zA-Z0-9 \-_.]+$/
  if (!allowedChars.test(cleanName)) {
    return { valid: false, message: 'Nome contém caracteres inválidos' }
  }

  return { valid: true, name: cleanName }
}

export default api