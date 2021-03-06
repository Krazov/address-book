import countryList from './country-list.util.js';

export const itemCreator = ($template) => ({ id, name, surname, country, email }) => {
    const $item = $template.cloneNode(true);

    $item.querySelector('.jsName').textContent = `${name} ${surname}`;
    $item.querySelector('.jsCountry').textContent = `${country && countryList.getName(country)}`;
    $item.querySelector('.jsEmail').textContent = `${email}`;

    $item.querySelector('.jsEdit').customData = {
        contactId: id,
        action: 'edit',
    };

    $item.querySelector('.jsDelete').customData = {
        contactId: id,
        action: 'delete',
    };

    return $item;
};

export const refreshItem = ($item, { name, surname, country, email }) => {
    $item.querySelector('.jsName').textContent = `${name} ${surname}`;
    $item.querySelector('.jsCountry').textContent = `${country && countryList.getName(country)}`;
    $item.querySelector('.jsEmail').textContent = `${email}`;
};