import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';

const SERVER_URL = 'http://localhost:5000';

const avatarColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

const ProfilePage = () => {
  const { user, token, setUser, logoutContext } = useAuthContext();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [avatarColor, setAvatarColor] = useState('#6366f1');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (user) {
      setUsername(user.username);
      setAvatarColor(user.avatarColor || '#6366f1');
    }
  }, [user, token, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/me`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatarColor })
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.user);
        setMsg('Perfil actualizado exitosamente ✅');
        setTimeout(() => setMsg(''), 3000);
      } else {
        setMsg(`Error: ${data.message}`);
      }
    } catch (err) {
      setMsg('Error al conectar con el servidor');
    }
  };

  const handleLogout = () => {
    logoutContext();
    navigate('/');
  };

  if (!user) return <div style={{background: 'var(--surface)', minHeight: '100vh'}}></div>;

  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-content" style={{ minHeight: '100vh', background: 'var(--surface)', position: 'relative' }}>
        <Navbar />
        <main style={{ paddingTop: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <section className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '500px' }}>
            <h2 className="font-headline" style={{ color: 'var(--primary)', fontWeight: 800, textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>MI PERFIL</h2>
            {msg && <div style={{ color: msg.includes('Error') ? 'var(--error)' : '#10b981', marginBottom: '16px', textAlign: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>{msg}</div>}
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>
                    {username?.charAt(0).toUpperCase()}
                </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>PARTIDAS GANADAS</div>
                     <div style={{ fontSize: '1.5rem', color: 'var(--secondary)', fontWeight: 900 }}>{user.victorias} 🏆</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>NIVEL</div>
                     <div style={{ fontSize: '1.5rem', color: 'var(--tertiary)', fontWeight: 900 }}>EXPERTO</div>
                </div>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontWeight: 600 }}>CÓDIGO DE COLOR</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {avatarColors.map(c => (
                        <div 
                           key={c} 
                           onClick={() => setAvatarColor(c)}
                           style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, cursor: 'pointer', border: avatarColor === c ? '3px solid white' : 'none' }}
                        />
                    ))}
                </div>
              </div>
              
              <div>
                <label style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontWeight: 600 }}>NOMBRE DE USUARIO</label>
                <input 
                  type="text" 
                  value={username} onChange={e => setUsername(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', marginTop: '4px', outline: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, marginTop: '8px', cursor: 'pointer' }}
              >
                GUARDAR CAMBIOS
              </button>
            </form>

            <button 
                onClick={handleLogout}
                style={{ background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', padding: '12px', borderRadius: '8px', fontWeight: 700, marginTop: '16px', cursor: 'pointer', width: '100%' }}
              >
                CERRAR SESIÓN
              </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
