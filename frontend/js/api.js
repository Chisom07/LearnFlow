const API = "http://localhost:5000";

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });

    const data = await response.json();
    data._status = response.status;
    data._ok = response.ok;
    return data;
  } catch {
    return {
      _status: 0,
      _ok: false,
      message: "We could not connect to LearnFlow. Please try again."
    };
  }
}

function showMessage(message, type = "info") {
  let toast = document.getElementById("appToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast toast-${type} toast-visible`;

  clearTimeout(window.learnFlowToastTimer);
  window.learnFlowToastTimer = setTimeout(() => {
    toast.classList.remove("toast-visible");
  }, 4000);
}

function redirectToLogin(message, returnTo) {
  sessionStorage.setItem(
    "authMessage",
    message || "You have to login/register first to enrol."
  );
  sessionStorage.setItem(
    "returnTo",
    returnTo ||
      `${window.location.pathname.split("/").pop()}${window.location.search}`
  );
  window.location.href = "login.html";
}