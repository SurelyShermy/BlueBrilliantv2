import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './components/modal'; 
import LoginForm from './components/loginform'; 
import RegisterForm from './components/registerform';
import ChessBoard from './components/ChessBoard';

function App() {
  // const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeForm, setActiveForm] = useState('login');
  const [isPlaying, setIsPlaying] = useState(false);
  const [ws, setWs] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [user, setUser] = useState({
    username: null,
    isAuthenticated: false,
  });
  const generateUUID = () => {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      const r = (Math.random() * 16) | 0;
      return r.toString(16);
    });
  };
  const refreshCsrfToken = async () => {
    const response = await fetch('/csrf/', { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      metaTag.setAttribute('content', data.csrfToken);
    }
  };
  const showLoginForm = () => { setActiveForm('login'); };
  const showRegisterForm = () => { setActiveForm('register'); };
  const getCsrfToken = () => {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    return token;
  };
  
  const handleLogin = async (username, password) => {
    const csrfToken = getCsrfToken();
    const response = await fetch('login/', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken,
      },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('Login successful, token:', data.token);
        setUser({
          username: data.username,
          isAuthenticated: true,
        });
        refreshCsrfToken();
      } else {
        console.error('Login failed:', data.error);
      }
    } else {
      console.error('Login request failed');
    }
  };
  const handleRegister = async (username, password, confirmPassword) => {
    const csrfToken = getCsrfToken();
    const response = await fetch('/register/', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: username,
        password1: password,
        password2: confirmPassword
      }).toString()
    });
  
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('Registration successful');
        handleLogin(username, password);
      } else {
        console.error('Registration failed:', data.errors);
      }
    } else {
      console.error('Registration request failed');
    }
  };
  const handleLogout = async () => {
    const csrfToken = getCsrfToken();
    const response = await fetch('logout/', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('Logout successful');
        setUser({
          username: null,
          isAuthenticated: false,
        });
      } else {
        console.error('Logout failed:', data.error);
      }
    } else {
      console.error('Logout request failed');
    }
  };
  const checkSession = async () => {
    const response = await fetch('check_session/', {
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      if (data.isAuthenticated) {
        setUser({
          username: data.username,
          isAuthenticated: true,
        });
      } else {
        setUser({
          username: null,
          isAuthenticated: false,
        });
      }
    } else {
      console.error('Failed to validate session');
    }
  };
  
  useEffect(() => {
    const initializeAuthState = async () => {
      const data = await checkSession();
      if (data.isAuthenticated) {
        setUser({
          username: data.username,
          isAuthenticated: true,
        });
      } else {
        setUser({
          username: null,
          isAuthenticated: false,
        });
      }
    };
  
    initializeAuthState();
  }, [user.isAuthenticated]);
  useEffect(() => {
    checkSession();
  }, []);
  const handlePvEGameStart = () => {
    let userId = user.username;
  
    if (!user.isAuthenticated) {
      // Generate UUID for non-authenticated users and update immediately
      userId = generateUUID();
      console.log('Generated UUID:', userId);
      setUser({
        username: userId,
        isAuthenticated: false,  // Make sure state reflects non-authentication
      });
    }
    console.log('Starting new PvE game for user:', user.username);
    startPvEGame(userId);
  };
  const startPvEGame = (userId) => {
    console.log('Starting new PvE game for user:', userId)
    fetch(`http://localhost:4000/engine_game/${userId}`, {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      setGameId(data.game_id);
      createWS(data.game_id);
    })
    .catch(error => {
      console.error('Error starting new PvE game:', error);
    });
  };
  const handlePvPGameStart = () => {
    if (user.isAuthenticated) {
      setMatching(true);
      startPvPMatchmaking(user.id);
    } else {
      console.error('User must be authenticated to start a PvP game');
    }
  };

  const startPvPMatchmaking = (userId) => {
    fetch(`http://localhost:4000/matchmaking/${userId}`, {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      if (data.match_found) {
        setMatching(false);
        setGameId(data.game_id);
        createWS(data.game_id);
      } else {
        setTimeout(() => startPvPMatchmaking(userId), 3000);  // Poll every 3 seconds
      }
    })
    .catch(error => {
      console.error('Error in PvP matchmaking:', error);
    });
  };
  const createWS = (gameId) => {
    const newWs = new WebSocket(`ws://localhost:4000/ws/${gameId}`);
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

    setWs(newWs);
  };
  return (
    <div className="App">
      <header className="App-header">
        {!isPlaying && (
          <>
          <div key={user.isAuthenticated}>
            {user.isAuthenticated ? (
              <>
                <p>Welcome, {user.username}!</p>
                <button onClick={handleLogout}>Logout</button>
                <button onClick={handlePvEGameStart} disabled={isConnecting || matching}>
                  {isConnecting ? 'Connecting...' : 'Play the Engine'}
                </button>
                <button onClick={handlePvPGameStart} disabled={matching || isConnecting}>Play vs Player</button>
              </>
            ) : (
              <>
                {activeForm === 'login' ? (
                  <>
                    <LoginForm onLogin={handleLogin} />
                    <button onClick={() => setActiveForm('register')}>Don't Have an account? Register Today!</button>
                  </>
                ) : (
                  <>
                    <RegisterForm onRegister={handleRegister} />
                    <button onClick={() => setActiveForm('login')}>Have An Account? Login</button>
                  </>
                )}
              </>
            )}
            </div>
          </>
        )}
        {isPlaying && <ChessBoard ws={ws} username={user.username} gameId={gameId} />}
      </header>
    </div>
  );
}

export default App;