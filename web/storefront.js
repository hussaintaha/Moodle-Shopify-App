const getForm = document.querySelector('#create_customer');
const getFirstName = document.querySelector('#RegisterForm-FirstName');
const getLastName = document.querySelector('#RegisterForm-LastName');
const getEmail = document.querySelector('#RegisterForm-email');
const getPassword = document.querySelector('#RegisterForm-password');




getForm.addEventListener('submit', () => {
    alert(getFirstName.value);
    alert(getLastName.value);
    alert(getEmail.value);
    alert(getPassword.value);
});

fetch('https://gses-dev.myshopify.com/apps/moodle-app/api/route/testing');