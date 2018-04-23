import {
    INIT_LIST,
    ADD_TO_LIST,
    UPDATE_LIST,
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
    notify(UPDATE_REQUEST, id);
};

const deleteItem = () => {
    console.log('To the delete!');
};

// action
$list.addEventListener('click', (event) => {
    const data = event.target.dataset;

    switch (data.type) {
    case 'edit':
        updateItem(data.id);
        break;
    case 'delete':
        deleteItem(data.id);
        break;
    }
});

observeMessages(INIT_LIST, (addressBook) => {
    Object
        .values(addressBook)
        .forEach(addSingleItem);
});

observeMessages(ADD_TO_LIST, addSingleItem);

observeMessages(UPDATE_LIST, ({id, name, surname, email }) => {
    items[id].querySelector('.item-label').textContent = itemText({ name, surname, email });
});

observeMessages('remove-from-list', () => {});