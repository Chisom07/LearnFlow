const API = "http://localhost:5000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  return response.json();
}