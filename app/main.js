import { addItem } from '/app/view-controllers/list.js';
import { createItem } from '/app/view-controllers/item.js';

import '/app/view-controllers/form.js';

import { subscribe as observeMessages } from '/app/helpers/message-bus.helper.js';
import { compose } from '/app/utils/fp.util.js';

// list with all contacts
// adding item
// editing item
// removing item
// data should be persistent on client side between refreshes
// validation

// messages container
// li’s container

const addMessage = compose(addItem, createItem);

observeMessages(addMessage);