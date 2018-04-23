import {
    INIT_LIST,
    ADD_TO_LIST,
    UPDATE_LIST,
    REMOVE_FROM_LIST,
    UPDATE_REQUEST,
    DELETE_REQUEST,
} from '/app/constants/channels.js';

import { notify, subscribe as observeMessages } from '/app/helpers/message-bus.helper.js';
import { compose } from '/app/utils/fp.util.js';
import { itemText } from '/app/utils/text.util.js';
import { createItem } from '/app/view-controllers/item.js';

// local data
const items = {};

// elements
const $list = document.querySelector('.list');

// methods
const addItem = (item) => {
    $list.appendChild(item);
};

const addSingleItem = ({id, name, surname, email}) => {
    const newItem = createItem({ id, name, surname, email });

    items[id] = newItem;

    addItem(newItem);
}

const updateItem = (id) => {
    notify(UPDATE_REQUEST, { id });
};

const deleteItem = (id) => {
    notify(DELETE_REQUEST, { id });
};

// message bus
observeMessages(INIT_LIST, (addressBook) => {
    Object
        .values(addressBook)
        .forEach(addSingleItem);
});

observeMessages(ADD_TO_LIST, addSingleItem);

observeMessages(UPDATE_LIST, ({id, name, surname, email }) => {
    items[id].querySelector('.item-label').textContent = itemText({ name, surname, email });
});

observeMessages(REMOVE_FROM_LIST, ({ id }) => {
    $list.removeChild(items[id]);
    delete items[id];
});

// user interaction
$list.addEventListener('click', (event) => {
    const { action, contactId } = event.target.customData;

    switch (action) {
    case 'edit':
        updateItem(contactId);
        break;
    case 'delete':
        deleteItem(contactId);
        break;
    }
});