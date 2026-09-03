const API_BASE = "http://localhost:8000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Auth
export const register = async (username, email, password) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
};

export const login = async (username, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data;
};

export const getMe = async () => {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
};

export const logout = () => localStorage.removeItem("token");

// Pets
export const getMyPets = async () => {
  const res = await fetch(`${API_BASE}/pets`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to load pets");
  return res.json();
};

export const createPet = async (name, species_id) => {
  const res = await fetch(`${API_BASE}/pets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, species_id }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create pet");
  }
  return res.json();
};

export const petAction = async (petId, action) => {
  const res = await fetch(`${API_BASE}/pets/${petId}/action`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Action failed");
  }
  return res.json();
};

export const deletePet = async (petId) => {
  const res = await fetch(`${API_BASE}/pets/${petId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete pet");
  return res.json();
};

export const getCommunityPets = async () => {
  const res = await fetch(`${API_BASE}/community`);
  if (!res.ok) throw new Error("Failed to load community");
  return res.json();
};

export const getSpecies = async () => {
  const res = await fetch(`${API_BASE}/species`);
  if (!res.ok) throw new Error("Failed to load species");
  return res.json();
};
