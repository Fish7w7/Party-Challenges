import React, { useState } from 'react'

const AvatarPicker = ({ selectedAvatar, onAvatarSelect, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)

  const avatars = [
    '😀', '😎', '🤓', '😇', '🥳', '🤠',
    '👦', '👧', '👨', '👩', '🧑', '👴',
    '👵', '👶', '🤵', '👸', '🦸', '🦹',
    '🧙', '🧝', '🧚', '🎅', '🤶', '🧞',
    '🐶', '🐱', '🦊', '🐰', '🐻', '🦁',
    '🐸', '🐵', '🦉', '🦄', '🐲', '🐧'
  ]

  const handleAvatarClick = (avatar) => {
    onAvatarSelect(avatar)
    setIsOpen(false)
  }

  return (
    <div className={`avatar-picker ${disabled ? 'disabled' : ''}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="avatar-button"
        disabled={disabled}
        title="Escolher avatar"
      >
        <span className="current-avatar">{selectedAvatar || '👤'}</span>
        <span className="avatar-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div className="avatar-overlay" onClick={() => setIsOpen(false)} />
          <div className="avatar-dropdown">
            <div className="avatar-grid">
              {avatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarClick(avatar)}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  title={`Escolher ${avatar}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
            
            <div className="avatar-actions">
              <button
                onClick={() => handleAvatarClick('')}
                className="reset-avatar"
              >
                🚫 Sem avatar
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="close-picker"
              >
                Fechar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AvatarPicker