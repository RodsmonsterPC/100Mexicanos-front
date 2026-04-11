import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';

const SERVER_URL = import.meta.env.VITE_API_URL || 'https://one00mexicanos-back.onrender.com';

const UserCardsPage = () => {
  const { user, token } = useAuthContext();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cards, setCards] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  
  // States for cards
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState([
    { text: '', points: '' },
    { text: '', points: '' },
    { text: '', points: '' },
    { text: '', points: '' },
    { text: '', points: '' },
  ]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchCategories();
    }
  }, [token, navigate]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/user-categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/user-categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName })
      });
      const data = await res.json();
      if (res.ok) {
        setNewCatName('');
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este mazo completo? Se borrarán todas sus cartas.')) return;
    try {
      await fetch(`${SERVER_URL}/api/user-categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (selectedCategory && selectedCategory._id === id) setSelectedCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCategory = async (cat) => {
    setSelectedCategory(cat);
    fetchCards(cat._id);
  };

  const fetchCards = async (catId) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/user-categories/${catId}/cards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCards(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCardModal = (card = null) => {
    setMsg('');
    if (card) {
      setEditingCard(card);
      setQuestionText(card.question);
      setAnswers(card.answers.map(a => ({ text: a.text, points: a.points }))); // map to ignore _id temporarily in form
    } else {
      setEditingCard(null);
      setQuestionText('');
      setAnswers([
        { text: '', points: '' },
        { text: '', points: '' },
        { text: '', points: '' },
        { text: '', points: '' },
        { text: '', points: '' },
      ]);
    }
    setShowCardModal(true);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    
    // Validar formato
    const cleanAnswers = answers.map(a => ({ text: a.text.trim(), points: Number(a.points) }));
    if (!questionText.trim() || cleanAnswers.some(a => !a.text || !a.points)) {
      setMsg('Completa la pregunta y los textos/puntos de las 5 respuestas.');
      return;
    }

    try {
      const url = editingCard 
        ? `${SERVER_URL}/api/user-categories/${selectedCategory._id}/cards/${editingCard._id}`
        : `${SERVER_URL}/api/user-categories/${selectedCategory._id}/cards`;
      
      const method = editingCard ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: questionText, answers: cleanAnswers })
      });

      const data = await res.json();
      if (res.ok) {
        setShowCardModal(false);
        fetchCards(selectedCategory._id);
        fetchCategories(); // update totalPoints in parent
      } else {
        setMsg(data.message);
      }
    } catch (err) {
      setMsg('Error al guardar tarjeta.');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('¿Eliminar esta tarjeta?')) return;
    try {
      await fetch(`${SERVER_URL}/api/user-categories/${selectedCategory._id}/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCards(selectedCategory._id);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-content" style={{ minHeight: '100vh', background: 'var(--surface)', position: 'relative' }}>
        <Navbar />
        <main style={{ paddingTop: '100px', paddingBottom: '40px', paddingX: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* VISTA: LISTA DE MAZOS */}
          {!selectedCategory ? (
            <section style={{ width: '90%', maxWidth: '800px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                 <h2 className="font-headline" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '2rem' }}>MIS MAZOS DE CARTAS</h2>
                 <span style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', color: 'var(--on-surface)' }}>
                    Mazos creados: {categories.length} / 3
                 </span>
              </div>

              {categories.length < 3 && (
                <form onSubmit={handleCreateCategory} className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 'bold' }}>NUEVO MAZO</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Series Viejitas"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '12px 24px', height: '45px', fontSize: '1rem' }}>CREAR MAZO</button>
                </form>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {categories.map(cat => (
                  <div key={cat._id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: 0 }}>{cat.name}</h3>
                      <button onClick={() => handleDeleteCategory(cat._id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Tarjetas:</span>
                          <strong style={{ color: 'white' }}>{cat.cardsCount} / 20</strong>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Total Puntos mazo:</span>
                          <strong style={{ color: cat.totalPoints >= 500 ? 'var(--secondary)' : 'var(--error)' }}>
                             {cat.totalPoints} / 500
                          </strong>
                       </div>
                    </div>

                    {cat.isPlayable ? (
                      <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '8px', textAlign: 'center', borderRadius: '8px', fontWeight: 'bold' }}>
                         ✅ Listo para jugarse
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '8px', textAlign: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                         ⚠️ Requiere 500 puntos mínimo
                      </div>
                    )}

                    <button 
                      onClick={() => handleSelectCategory(cat)}
                      style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' }}
                    >
                       GESTIONAR TARJETAS
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            /* VISTA: TARJETAS DEL MAZO SELECCIONADO */
            <section style={{ width: '90%', maxWidth: '800px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                  <h2 className="font-headline" style={{ color: 'white', fontWeight: 800, fontSize: '2rem', margin: 0 }}>{selectedCategory.name}</h2>
                  <span style={{ color: 'var(--on-surface-variant)' }}>{cards.length}/20 Tarjetas &bull; {selectedCategory.totalPoints}/500 Puntos</span>
                </div>
              </div>

              {cards.length < 20 && (
                <button 
                   onClick={() => openCardModal()}
                   style={{ width: '100%', padding: '20px', background: 'rgba(74, 107, 219, 0.1)', border: '2px dashed var(--primary)', borderRadius: '16px', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                   <span className="material-symbols-outlined">add_circle</span> Añadir nueva tarjeta
                </button>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {cards.map((c, i) => (
                    <div key={c._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', margin: 0, fontWeight: 800 }}>{i + 1}. {c.question}</h3>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             <button onClick={() => openCardModal(c)} style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined">edit</span>
                             </button>
                             <button onClick={() => handleDeleteCard(c._id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined">delete</span>
                             </button>
                          </div>
                       </div>
                       
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                          {c.answers.map((a, j) => (
                             <div key={j} style={{ display: 'flex', justifyContent: 'space-between', color: 'white', borderBottom: j!==4?'1px solid rgba(255,255,255,0.1)':'none', paddingBottom: j!==4?'8px':0 }}>
                                <span>{a.text}</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--tertiary)' }}>{a.points} pts</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
                 {cards.length === 0 && <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center' }}>No hay tarjetas en este mazo.</p>}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* MODAL CREAR/EDITAR TARJETA */}
      {showCardModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
           <div className="glass-card" style={{ background: 'var(--surface-container-highest)', width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                 <h2 style={{ fontSize: '1.5rem', color: 'white', margin: 0 }}>{editingCard ? 'Editar Tarjeta' : 'Crear Tarjeta'}</h2>
                 <button onClick={() => setShowCardModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              {msg && <div style={{ color: 'var(--error)', padding: '10px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>{msg}</div>}

              <form onSubmit={handleSaveCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 'bold' }}>Pregunta (Lo que lee el presentador)</label>
                    <input 
                      type="text" value={questionText} onChange={e => setQuestionText(e.target.value)} required
                      placeholder="Ej. ¿Qué llevas a la playa?"
                      style={{ width: '100%', padding: '16px', marginTop: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem' }}
                    />
                 </div>

                 <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--tertiary)', fontWeight: 'bold' }}>5 Respuestas (De mayor a menor puntaje)</label>
                    {answers.map((ans, idx) => (
                       <div key={idx} style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                          <input 
                            type="text" value={ans.text} required placeholder={`Respuesta ${idx + 1}`}
                            onChange={e => {
                               const newAnswers = [...answers];
                               newAnswers[idx].text = e.target.value;
                               setAnswers(newAnswers);
                            }}
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                          />
                          <input 
                            type="number" value={ans.points} required min="1" max="100" placeholder="Puntos"
                            onChange={e => {
                               const newAnswers = [...answers];
                               newAnswers[idx].points = e.target.value;
                               setAnswers(newAnswers);
                            }}
                            style={{ width: '100px', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                          />
                       </div>
                    ))}
                 </div>

                 <button type="submit" className="btn-primary" style={{ padding: '16px', marginTop: '24px', fontSize: '1.1rem' }}>
                    {editingCard ? 'GUARDAR CAMBIOS' : 'AÑADIR TARJETA'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserCardsPage;
