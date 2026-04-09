import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = 'http://localhost:5000';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok && data.user.isAdmin) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al en el servidor');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <section className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '400px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <h2 className="font-headline" style={{ color: '#ef4444', fontWeight: 900, textAlign: 'center', marginBottom: '8px', fontSize: '2rem' }}>
          ACCESO RESTRINGIDO
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Solo Administradores
        </p>
        
        {error && (
          <div style={{ color: '#fca5a5', marginBottom: '16px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>USUARIO ADMIN</label>
            <input 
              type="text" 
              value={username} onChange={e => setUsername(e.target.value)} 
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '4px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>CONTRASEÑA</label>
            <input 
              type="password" 
              value={password} onChange={e => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '4px', outline: 'none' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, marginTop: '8px', cursor: 'pointer', letterSpacing: '0.1em', transition: 'background 0.2s', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}
          >
            INGRESAR AL PANEL
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminLoginPage;
