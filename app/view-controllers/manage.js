import {
    NEW_CONTACT,
    EDIT_CONTACT,
    UPDATE_CONTACT ,
    NEW_REQUEST,
} from '../constants/channels.js';

import {
    validateName,
    validateSurname,
    validateCountry,
    validateEmail,
} from '../../app/utils/validator.util.js';

import { notify, subscribe as observeMessages } from '../helpers/message-bus.helper.js';
import { compose } from '../utils/fp.util.js';
import createOption from '../utils/dom.option.util.js';
import countryList from '../utils/country-list.util.js';

// main element
const $dialog = document.querySelector('.dialog-manage');
const $form = $dialog.querySelector('.form');

// containers
const $nameContainer = $form.querySelector('.name-container');
const $surnameContainer = $form.querySelector('.surname-container');
const $countryContainer = $form.querySelector('.country-container');
const $emailContainer = $form.querySelector('.email-container');

// inputs
const $id = $form.querySelector('.id');
const $name = $nameContainer.querySelector('.name');
const $surname = $surnameContainer.querySelector('.surname');
const $country = $countryContainer.querySelector('.country');
const $email = $emailContainer.querySelector('.email');

const $cancel = $form.querySelector('.cancel');

// methods
const toggleDialog = (status) => () => {
    $dialog.classList.toggle('is-active', status);
};
const showDialog = toggleDialog(true);
const hideDialog = toggleDialog(false);

const fillFormFields = ({ id, name, surname, country, email }) => {
    $id.value = id;
    $name.value = name;
    $surname.value = surname;
    $country.value = country;
    $email.value = email;
};

const getValues = () => ({
    id: $id.value,
    name: $name.value,
    surname: $surname.value,
    country: $country.value,
    email: $email.value,
});

const dismissForm = () => {
    hideDialog();
    $id.value = '';
    $form.reset();
};

const validateForm = (name, surname, country, email) => ({
    name: validateName(name),
    surname: validateSurname(surname),
    country: validateCountry(country),
    email: validateEmail(email),
});

const toggleErrorClass = ($field, status) => {
    $field.classList.toggle('has-error', status);
};

const markErrors = ({ name, surname, country, email }) => {
    toggleErrorClass($nameContainer, !name);
    toggleErrorClass($surnameContainer, !surname);
    toggleErrorClass($countryContainer, !country);
    toggleErrorClass($emailContainer, !email);

    return { name, surname, country, email };
};

const checkValidity = (report) => Object.values(report).every((field) => field == true);

const allGood = compose(checkValidity, markErrors, validateForm);

// on load
{
    const countries = countryList.getCodeList();

    Object
        .keys(countries)
        .map((code) => createOption(code, countries[code]))
        .forEach(($option) => {
            $country.appendChild($option);
        })
}

// message bus
observeMessages(NEW_REQUEST, () => {
    showDialog();
});

observeMessages(EDIT_CONTACT, ({ id, name, surname, country, email }) => {
    fillFormFields({ id, name, surname, country, email });
    showDialog();
});

// user interactions
$form.addEventListener('submit', (event) => {
    event.preventDefault();

    const { id, name, surname, country, email } = getValues();

    if (!allGood(name, surname, country, email)) {
        return;
    }

    if (id) {
        notify(UPDATE_CONTACT, { id, name, surname, country, email });
    } else {
        notify(NEW_CONTACT, { name, surname, country, email });
    }

    dismissForm();
});

$cancel.addEventListener('click', () => {
    dismissForm();
});