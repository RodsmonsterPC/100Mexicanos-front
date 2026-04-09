const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://one00mexicanos-back.onrender.com/api';

export const getRandomQuestion = async (categories = []) => {
  let url = `${API_BASE}/questions/random`;
  if (categories && categories.length > 0) {
    url += `?categories=${categories.join(',')}`;
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
