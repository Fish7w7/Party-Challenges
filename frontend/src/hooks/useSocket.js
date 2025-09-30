import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000'

export const useSocket = () => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const socketInstance = io(SERVER_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Erro de conexão:', error)
    })

    setSocket(socketInstance)

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [])

  return socket
}

export const useGameSocket = (socket, roomId) => {
  const [gameData, setGameData] = useState({
    players: [],
    currentChallenge: null,
    scoreboard: [],
    gameStarted: false,
    gameEnded: false,
    roundResults: null
  })

  useEffect(() => {
    if (!socket || !roomId) return

    const handlePlayerJoined = (data) => {
      setGameData(prev => ({ ...prev, players: data.players }))
    }

    const handlePlayerLeft = (data) => {
      setGameData(prev => ({ ...prev, players: data.players }))
    }

    const handleRoomJoined = (data) => {
      setGameData(prev => ({
        ...prev,
        players: data.players || [],
        gameStarted: data.game_started || false
      }))
    }

    const handleGameStarted = () => {
      setGameData(prev => ({ ...prev, gameStarted: true }))
    }

    const handleNewChallenge = (challenge) => {
      setGameData(prev => ({
        ...prev,
        currentChallenge: challenge,
        roundResults: null
      }))
    }

    const handleRoundResults = (results) => {
      setGameData(prev => ({
        ...prev,
        roundResults: results,
        scoreboard: results.scoreboard
      }))
    }

    const handleGameEnded = (finalResults) => {
      setGameData(prev => ({
        ...prev,
        gameEnded: true,
        scoreboard: finalResults.final_scoreboard,
        winner: finalResults.winner
      }))
    }

    const handleScoreboardUpdate = (scoreboard) => {
      setGameData(prev => ({ ...prev, scoreboard }))
    }

    const handleGameReset = () => {
      setGameData(prev => ({
        ...prev,
        gameStarted: false,
        gameEnded: false,
        currentChallenge: null,
        roundResults: null,
        scoreboard: []
      }))
    }

    const handleError = (error) => {
      console.error('Erro:', error.message)
    }

    // Adicionar listeners
    socket.on('player_joined', handlePlayerJoined)
    socket.on('player_left', handlePlayerLeft)
    socket.on('room_joined', handleRoomJoined)
    socket.on('game_started', handleGameStarted)
    socket.on('new_challenge', handleNewChallenge)
    socket.on('round_results', handleRoundResults)
    socket.on('game_ended', handleGameEnded)
    socket.on('scoreboard_update', handleScoreboardUpdate)
    socket.on('game_reset', handleGameReset)
    socket.on('error', handleError)

    return () => {
      socket.off('player_joined', handlePlayerJoined)
      socket.off('player_left', handlePlayerLeft)
      socket.off('room_joined', handleRoomJoined)
      socket.off('game_started', handleGameStarted)
      socket.off('new_challenge', handleNewChallenge)
      socket.off('round_results', handleRoundResults)
      socket.off('game_ended', handleGameEnded)
      socket.off('scoreboard_update', handleScoreboardUpdate)
      socket.off('game_reset', handleGameReset)
      socket.off('error', handleError)
    }
  }, [socket, roomId])

  const joinRoom = (playerName, avatar = '👤') => {
    if (socket) {
      socket.emit('join_room', { 
        room_id: roomId, 
        player_name: playerName,
        avatar: avatar 
      })
    }
  }

  const startGame = () => {
    if (socket) {
      socket.emit('start_game', { room_id: roomId })
    }
  }

  const submitAnswer = (answer) => {
    if (socket) {
      socket.emit('submit_answer', { room_id: roomId, answer })
    }
  }

  const nextRound = () => {
    if (socket) {
      socket.emit('next_round', { room_id: roomId })
    }
  }

  const getScoreboard = () => {
    if (socket) {
      socket.emit('get_scoreboard', { room_id: roomId })
    }
  }

  const resetGame = () => {
    if (socket) {
      socket.emit('reset_game', { room_id: roomId })
    }
  }

  return {
    ...gameData,
    joinRoom,
    startGame,
    submitAnswer,
    nextRound,
    getScoreboard,
    resetGame
  }
}