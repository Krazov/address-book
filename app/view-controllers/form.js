import {
    validateName, validateSurname, validateCountry, validateEmail
} from '../../app/utils/validator.util.js';
import { notify } from '/app/helpers/message-bus.helper.js';
import { compose } from '/app/utils/fp.util.js';

// main element
const $form = document.querySelector('.form');

// containers
const $nameContainer = $form.querySelector('.name-container');
const $surnameContainer = $form.querySelector('.surname-container');
const $emailContainer = $form.querySelector('.email-container');

// inputs
const $name = $nameContainer.querySelector('.name');
const $surname = $surnameContainer.querySelector('.surname');
//const country = document.getElementById('country');
const $email = $emailContainer.querySelector('.email');

// methods
const getValues = () => ({
    name: $name.value,
    surname: $surname.value,
    email: $email.value,
});

const clearForm = () => {
    $form.reset();
};

const validateForm =
      (name, surname, email) => ({
          name: validateName(name),
          surname: validateSurname(surname),
          email: validateEmail(email),
      });

const markErrors = ({ name, surname, email }) => {
    $nameContainer.classList.toggle('has-error', !name);
    $surnameContainer.classList.toggle('has-error', !surname);
    $emailContainer.classList.toggle('has-error', !email);

    return { name, surname, email };
};

const checkValidity = (report) => Object.values(report).every((field) => field == true);

const allGood = compose(checkValidity, markErrors, validateForm);

// action
$form.addEventListener('submit', (event) => {
    event.preventDefault();

    const { name, surname, email } = getValues();

    if (!allGood(name, surname, email)) {
        return;
    }

    notify('new-contact', { name, surname, email });

    clearForm();
}, { passive: false });