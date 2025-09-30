import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import CreateRoom from './pages/CreateRoom'
import JoinRoom from './pages/JoinRoom'
import GameRoom from './components/GameRoom'
import { useSocket } from './hooks/useSocket'

function App() {
  const [gameState, setGameState] = useState({
    currentRoom: null,
    playerName: '',
    isHost: false,
    avatar: null,  // ← ADICIONADO
    gameStarted: false
  })

  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    // Escutar eventos do socket
    socket.on('room_joined', (roomData) => {
      setGameState(prev => ({
        ...prev,
        currentRoom: roomData.id,
        gameStarted: roomData.game_started
      }))
    })

    socket.on('game_started', () => {
      setGameState(prev => ({
        ...prev,
        gameStarted: true
      }))
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      alert(error.message || 'Erro de conexão')
    })

    return () => {
      socket.off('room_joined')
      socket.off('game_started')
      socket.off('error')
    }
  }, [socket])

  // ← ATUALIZADO: Agora recebe avatar como 4º parâmetro
  const handleRoomCreated = (roomId, playerName, isHost = false, avatar = '😀') => {
    setGameState(prev => ({
      ...prev,
      currentRoom: roomId,
      playerName,
      isHost,
      avatar,  // ← ADICIONADO
      gameStarted: false
    }))
  }

  // ← ATUALIZADO: Agora recebe avatar como 4º parâmetro
  const handleRoomJoined = (roomId, playerName, isHost = false, avatar = '😎') => {
    setGameState(prev => ({
      ...prev,
      currentRoom: roomId,
      playerName,
      isHost,
      avatar,  // ← ADICIONADO
      gameStarted: false
    }))
  }

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect()
    }
    setGameState({
      currentRoom: null,
      playerName: '',
      isHost: false,
      avatar: null,  // ← ADICIONADO
      gameStarted: false
    })
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">🎉 Party Challenges</h1>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={
              gameState.currentRoom ? 
                <Navigate to={`/room/${gameState.currentRoom}`} /> : 
                <Home />
            } />
            
            <Route path="/create" element={
              gameState.currentRoom ? 
                <Navigate to={`/room/${gameState.currentRoom}`} /> : 
                <CreateRoom onRoomCreated={handleRoomCreated} />
            } />
            
            <Route path="/join" element={
              gameState.currentRoom ? 
                <Navigate to={`/room/${gameState.currentRoom}`} /> : 
                <JoinRoom onRoomJoined={handleRoomJoined} />
            } />
            
            <Route path="/room/:roomId" element={
              gameState.currentRoom ? 
                <GameRoom 
                  roomId={gameState.currentRoom}
                  playerName={gameState.playerName}
                  isHost={gameState.isHost}
                  avatar={gameState.avatar}  
                  gameStarted={gameState.gameStarted}
                  onLeaveRoom={handleLeaveRoom}
                  socket={socket}
                /> : 
                <Navigate to="/" />
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="app-footer">
        <div className="footer-top">
          <p>Divirta-se com seus amigos! 🎮</p>
        </div>
  
        <div className="footer-beta">
          🚧 Projeto em Beta – bugs podem acontecer 😅
        </div>
        </footer>
      </div>
    </Router>
  )
}

export default App