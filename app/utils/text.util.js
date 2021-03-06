import countryList from './country-list.util.js';

export const itemText =
      ({ name, surname, country, email }) =>
        `${name} ${surname} (${country && countryList.getName(country)}), ${email}`;