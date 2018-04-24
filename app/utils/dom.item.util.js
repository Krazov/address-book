import { itemText } from '../utils/text.util.js';

const createLabel = (name, surname, country, email) =>
    Object.assign(document.createElement('div'), {
        className: 'item-label',
        textContent: itemText({ name, surname, country, email }),
    });

const createButton = (className, textContent, type, id) => {
    const $button = document.createElement('button');

    $button.customData = {
        contactId: id,
        action: type,
    };

    $button.className = className;
    $button.textContent = textContent;

    return $button;
};

const createEditButton = (id) => createButton('itemEdit', 'Edit', 'edit', id);

const createDeleteButton = (id) => createButton('itemDelete', 'Delete', 'delete', id);

export const createItem = ({ id, name, surname, country, email }) => {
    const li = document.createElement('li');

    li.className = 'item';

    li.appendChild(createLabel(name, surname, country, email));
    li.appendChild(createEditButton(id));
    li.appendChild(createDeleteButton(id));

    return li;
};