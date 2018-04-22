import { INIT_LIST, ADD_TO_LIST } from '/app/constants/channels.js';
import { subscribe as observeMessages } from '/app/helpers/message-bus.helper.js';
import { compose } from '/app/utils/fp.util.js';
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
    const newItem = createItem({ name, surname, email });

    items[id] = newItem;

    addItem(newItem);
}

// action
observeMessages(INIT_LIST, (addressBook) => {
    Object
        .values(addressBook)
        .forEach(addSingleItem);
});

$list.addEventListener('click', (event) => {
    console.log('target', event.target);
    console.log('currentTarget', event.currentTarget);
});

observeMessages(ADD_TO_LIST, addSingleItem);

observeMessages('update-list', () => {});

observeMessages('remove-from-list', () => {});