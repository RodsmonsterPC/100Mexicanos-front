import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_API_URL || 'https://one00mexicanos-back.onrender.com';

const AdminDashboardPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    category: 'General',
    answers: [
      { text: '', points: 0 },
      { text: '', points: 0 },
      { text: '', points: 0 },
      { text: '', points: 0 },
      { text: '', points: 0 },
    ]
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchQuestions();
  }, [navigate, token]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/questions`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (err) {
      console.error('Error fetching questions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta pregunta?')) return;
    
    try {
      await fetch(`${SERVER_URL}/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting', err);
    }
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setFormData({
      question: '',
      category: 'General',
      answers: [
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingCard(card);
    setFormData({
      question: card.question,
      category: card.category || 'General',
      answers: card.answers.map(a => ({ text: a.text, points: a.points }))
    });
    setIsModalOpen(true);
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index][field] = field === 'points' ? Number(value) : value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingCard;
    const url = isEditing 
      ? `${SERVER_URL}/api/questions/${editingCard._id}`
      : `${SERVER_URL}/api/questions`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchQuestions();
      } else {
        alert(data.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error de conexión');
    }
  };

  const uniqueCategories = [...new Set(questions.map(q => q.category || 'General'))].sort();
  const filteredQuestions = questions.filter(q => {
    const matchesCategory = filterCategory === '' || (q.category || 'General') === filterCategory;
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="font-headline" style={{ color: '#ef4444', textShadow: '0 0 10px rgba(239,68,68,0.5)', margin: 0 }}>PANEL DE CONTROL</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Gestor de Tarjetas de Preguntas</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: '20px' }}>search</span>
              <input 
                type="text"
                placeholder="Buscar pregunta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.95rem', minWidth: '200px' }}
              />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: '20px' }}>filter_list</span>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                <option value="" style={{ color: 'black' }}>Todas las Categorías</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat} style={{ color: 'black' }}>{cat}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={openCreateModal}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span className="material-symbols-outlined">add</span>
              NUEVA TARJETA

            </button>
            <button 
              onClick={handleLogout}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
            >
              SALIR
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Cargando datos...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredQuestions.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>
                No se encontraron tarjetas para esta categoría.
              </div>
            ) : null}
            {filteredQuestions.map(q => (
              <div key={q._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ 
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  background: 'linear-gradient(45deg, #3b82f6, #6366f1)', 
                  color: 'white', 
                  padding: '6px 14px', 
                  borderRadius: '16px', 
                  fontSize: '0.75rem', 
                  fontWeight: 900, 
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                  marginBottom: '12px',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {q.category || 'General'}
                </div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', lineHeight: 1.4, color: 'white', fontWeight: 800 }}>{q.question}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.answers.map((a, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '4px' }}>
                      <span>{a.text}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{a.points}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button onClick={() => openEditModal(q)} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Editar</button>
                  <button onClick={() => handleDelete(q._id)} style={{ flex: 1, padding: '8px', background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ background: '#111827', width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: 'white' }}>{editingCard ? 'Editar Tarjeta' : 'Crear Tarjeta'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Pregunta Principal</label>
                <input 
                  type="text" 
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Categoría</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Ej: General, Cultura, Deportes..."
                  required
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Respuestas (Obligatorio 5)</label>
                {formData.answers.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        placeholder={`Respuesta #${i + 1}`}
                        value={a.text}
                        onChange={(e) => handleAnswerChange(i, 'text', e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                      />
                    </div>
                    <div style={{ width: '100px' }}>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="Pts"
                        value={a.points || ''}
                        onChange={(e) => handleAnswerChange(i, 'points', e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', textAlign: 'center' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 24px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Guardar Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
