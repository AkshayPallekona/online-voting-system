document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData);
      const msg = document.getElementById('message');
      msg.textContent = 'Registering...';
      try {
        await api.apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        msg.className = 'alert alert-success';
        msg.textContent = 'Registration successful! Redirecting to login...';
        setTimeout(() => window.location.href = '/login.html', 1500);
      } catch (err) {
        msg.className = 'alert alert-danger';
        msg.textContent = err.message;
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData);
      const msg = document.getElementById('message');
      msg.textContent = 'Logging in...';
      try {
        const res = await api.apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        msg.className = 'alert alert-success';
        msg.textContent = 'Login successful! Redirecting...';
        const redirect = res.user.role === 'admin' ? '/admin-dashboard.html' : '/voter-dashboard.html';
        setTimeout(() => window.location.href = redirect, 1000);
      } catch (err) {
        msg.className = 'alert alert-danger';
        msg.textContent = err.message;
      }
    });
  }
});
