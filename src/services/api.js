const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://one00mexicanos-back.onrender.com/api';

export const getRandomQuestion = async (categories = []) => {
  let url = `${API_BASE}/questions/random`;
  if (categories && categories.length > 0) {
    const globalCats = categories.filter(c => !c.startsWith('USR:'));
    const userCats = categories.filter(c => c.startsWith('USR:')).map(c => c.replace('USR:', ''));
    
    const params = new URLSearchParams();
    if (globalCats.length > 0) params.append('categories', globalCats.join(','));
    if (userCats.length > 0) params.append('userCategories', userCats.join(','));
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al obtener pregunta aleatoria');
  }
  return response.json();
};

export const getCategories = async () => {
  const response = await fetch(`${API_BASE}/questions/categories`);
  if (!response.ok) {
    throw new Error('Error al obtener categorías');
  }
  return response.json();
};

export const getAllQuestions = async () => {
  const response = await fetch(`${API_BASE}/questions`);
  if (!response.ok) {
    throw new Error('Error al obtener preguntas');
  }
  return response.json();
};

export const createQuestion = async (questionData) => {
  const response = await fetch(`${API_BASE}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData),
  });
  if (!response.ok) {
    throw new Error('Error al crear pregunta');
  }
  return response.json();
};

export const deleteQuestion = async (id) => {
  const response = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar pregunta');
  }
  return response.json();
};

export const validateAnswerAPI = async (questionId, input, revealed) => {
  const response = await fetch(`${API_BASE}/questions/${questionId}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, revealed }),
  });
  if (!response.ok) {
    throw new Error('Error al validar respuesta semántica');
  }
  return response.json();
};
