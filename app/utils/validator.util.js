import countryList from './country-list.util.js';

// note:
// validators could probably be improved,
// as they allow for names like “@#$-()”,
// but this could take hours, if not days,
// so it was left at the very basic functionality

export const validateName =
    (name) =>
        typeof name == 'string' &&
        name.length > 0 &&
        /[\w]+/.test(name.replace(/\d/g, ''));

export const validateSurname =
    (surname) => {
        if (typeof surname != 'string') {
            return false;
        }

        const nameWithoutDigits = surname.replace(/\d/g, '');

        return surname === '' || /[\w]+/.test(nameWithoutDigits);
    };

export const validateCountry = (code) => {
    return countryList.getName(code) !== undefined;
};

// source: https://www.regular-expressions.info/email.html
const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export const validateEmail =
    (email) =>
        typeof email == 'string' &&
        emailRegex.test(email);