const getForm = document.querySelector('#create_customer');
const getFirstName = document.querySelector('#RegisterForm-FirstName');
const getLastName = document.querySelector('#RegisterForm-LastName');
const getEmail = document.querySelector('#RegisterForm-email');
const getPassword = document.querySelector('#RegisterForm-password');

getForm.addEventListener('submit', () => {

    fetch('https://gses-dev.myshopify.com/apps/moodle-app/api/route/testing', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",  
        },
        body: JSON.stringify({
            customerFirstName  : getFirstName.value,
            customerLastName   : getLastName.value,
            customerEmail      : getEmail.value,
            customerPassword   : getPassword.value,
        })
    })
    .then(response => response.json());
});