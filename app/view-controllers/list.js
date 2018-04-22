import { subscribe as observeMessages } from '/app/helpers/message-bus.helper.js';
import { compose } from '/app/utils/fp.util.js';
import { createItem } from '/app/view-controllers/item.js';

// elements
const list = document.querySelector('.list');

// methods
const addItem = (item) => {
    list.appendChild(item);
};

const addMessage = compose(addItem, createItem);

// main
observeMessages('new-contact', addMessage);
