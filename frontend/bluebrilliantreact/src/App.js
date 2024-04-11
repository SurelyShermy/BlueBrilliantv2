import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Modal from './components/modal'; 
import LoginForm from './components/loginform'; 
import RegisterForm from './components/registerform';
import ChessBoard from './components/ChessBoard';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ws, setWs] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = async (username, password) => {
    
    const response = await fetch('/login/', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('Login successful, token:', data.token);
      } else {
        console.error('Login failed:', data.error);
      }
    } else {
      console.error('Login request failed');
    }
  };
  
  const handleRegister = async (username, password) => {
    const response = await fetch('/register/', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    });
  
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('Registration successful');
        
      } else {
        console.error('Registration failed:', data.errors);
      }
    } else {
      console.error('Registration request failed');
    }
  };
  
  const handlePlayAsGuest = () => {
    const newWs = new WebSocket('ws://localhost:4000/ws/some_game_id');
    setIsConnecting(true);
    newWs.onopen = () => {
      setIsConnecting(false);
      setIsPlaying(true);
    };
    newWs.onclose = () => {
      console.log("Disconnected from the game WebSocket");
      setIsPlaying(false);
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(newWs);  // Save the WebSocket connection in state
  };
  return (
    <div className="App">
      <header className="App-header">
      {!isPlaying && (
          <>
            <button onClick={() => setIsLoginModalOpen(true)}>Open Login</button>
            <button onClick={() => setIsRegisterModalOpen(true)}>Register</button>
            <button onClick={handlePlayAsGuest} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Play as Guest'}
            </button>
          </>
        )}
        <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
          <LoginForm onLogin={handleLogin} />
        </Modal>
        <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)}>
          <RegisterForm onRegister={handleRegister} />
        </Modal>
        {isPlaying && <ChessBoard ws={ws} />}
      </header>
    </div>
  );
}

export default App;