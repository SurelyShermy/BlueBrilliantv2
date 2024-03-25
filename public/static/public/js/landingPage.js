document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login');
    const registerBtn = document.getElementById('register');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const showRegisterModal = "{{ show_register_modal|default:'False' }}";
    const alreadyRegistered = document.getElementById('AlreadyHaveAccountButton');
    const notRegistered = document.getElementById('NotRegisteredButton');
    const loginCloseButton = document.querySelector('#loginModal .close-button');
    const registerCloseButton = document.querySelector('#registerModal .close-button');
    if (showRegisterModal === 'True') {
        registerModal.style.display = 'block';
    }

    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
    });
    alreadyRegistered.addEventListener('click', () => {
        loginModal.style.display = 'block';
        registerModal.style.display = 'none';
    });
    notRegistered.addEventListener('click', () => {
        registerModal.style.display = 'block';
        loginModal.style.display = 'none';
    });
    loginCloseButton.addEventListener('click', () => {
      loginModal.style.display = 'none';
    });
  
    registerCloseButton.addEventListener('click', () => {
      registerModal.style.display = 'none';
    });
});