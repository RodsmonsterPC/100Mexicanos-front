import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';

const SERVER_URL = 'http://localhost:5000';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginContext } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        loginContext(data.token, data.user);
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-content" style={{ minHeight: '100vh', background: 'var(--surface)', position: 'relative' }}>
        <Navbar />
        <main style={{ paddingTop: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <section className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
            <h2 className="font-headline" style={{ color: 'var(--primary)', fontWeight: 800, textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>INICIAR SESIÓN</h2>
            {error && <div style={{ color: 'var(--error)', marginBottom: '16px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontWeight: 600 }}>USUARIO</label>
                <input 
                  type="text" 
                  value={username} onChange={e => setUsername(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', marginTop: '4px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontWeight: 600 }}>CONTRASEÑA</label>
                <input 
                  type="password" 
                  value={password} onChange={e => setPassword(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', marginTop: '4px', outline: 'none' }}
                />
              </div>
              <button 
                type="submit" 
                style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, marginTop: '8px', cursor: 'pointer' }}
              >
                ENTRAR
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--on-surface-variant)' }}>
              ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--secondary)' }}>Regístrate</Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
