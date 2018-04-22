import { notify } from '/app/helpers/message-bus.helper.js';

const form = document.querySelector('.form');

const name = document.getElementById('name');
const surname = document.getElementById('surname');
//const country = document.getElementById('country');
const email = document.getElementById('email');

const clearForm = () => {
    name.value = '';
    surname.value = '';
    email.value = '';
};

form.addEventListener('submit', (event) => {
    event.preventDefault();

    notify('new-contact', {
        name: name.value,
        surname: surname.value,
        email: email.value,
    });

    clearForm();
}, { passive: false });