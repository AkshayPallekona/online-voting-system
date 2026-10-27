// Additional voting logic if needed; main logic is in elections.js
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) {
    document.getElementById('confirmationMsg').textContent = 'Your vote has been successfully recorded. Thank you for participating!';
  }
});
