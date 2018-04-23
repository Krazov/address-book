import { NEW_CONTACT, EDIT_CONTACT, UPDATE_CONTACT } from '../constants/channels.js';

import {
    validateName, validateSurname, validateCountry, validateEmail
} from '../../app/utils/validator.util.js';
import { notify, subscribe as observeMessages } from '../helpers/message-bus.helper.js';
import { compose } from '../utils/fp.util.js';

// main element
const $dialog = document.querySelector('.dialog-manage');
const $form = $dialog.querySelector('.form');

// containers
const $nameContainer = $form.querySelector('.name-container');
const $surnameContainer = $form.querySelector('.surname-container');
const $emailContainer = $form.querySelector('.email-container');

// inputs
const $id = $form.querySelector('.id');
const $name = $nameContainer.querySelector('.name');
const $surname = $surnameContainer.querySelector('.surname');
//const country = document.getElementById('country');
const $email = $emailContainer.querySelector('.email');

// methods
const getValues = () => ({
    id: $id.value,
    name: $name.value,
    surname: $surname.value,
    email: $email.value,
});

const closeForm = () => {
    $dialog.classList.remove('is-active');
    $id.value = '';
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

    const { id, name, surname, email } = getValues();

    if (!allGood(name, surname, email)) {
        return;
    }

    if (id) {
        notify(UPDATE_CONTACT, { id, name, surname, email });
    } else {
        notify(NEW_CONTACT, { name, surname, email });
    }

    closeForm();
});

observeMessages(EDIT_CONTACT, ({ id, name, surname, email }) => {
    $id.value = id;
    $name.value = name;
    $surname.value = surname;
    $email.value = email;

    $dialog.classList.add('is-active');
});