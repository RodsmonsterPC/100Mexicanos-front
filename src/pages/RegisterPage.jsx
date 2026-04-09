import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';

const SERVER_URL = 'http://localhost:5000';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginContext } = useAuthContext();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
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
            <h2 className="font-headline" style={{ color: 'var(--primary)', fontWeight: 800, textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>CREAR CUENTA</h2>
            {error && <div style={{ color: 'var(--error)', marginBottom: '16px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <label style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontWeight: 600 }}>CORREO ELECTRÓNICO</label>
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)} 
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
                REGISTRARSE
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--on-surface-variant)' }}>
              ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--secondary)' }}>Inicia sesión</Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RegisterPage;
