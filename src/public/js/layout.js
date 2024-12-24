document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleNavbar');
    const navbar = document.querySelector('.navbar');
  
    toggleButton.addEventListener('click', () => {
      navbar.classList.toggle('collapsed');
    });
  });
  