import {
    EDIT_CONTACT,
    NEW_CONTACT,
    UPDATE_CONTACT,
    INIT_LIST,
    ADD_TO_LIST,
    UPDATE_LIST,
    UPDATE_REQUEST,
    DELETE_REQUEST,
} from '/app/constants/channels.js';

import { ADDRESS_BOOK, LAST_ID } from '/app/constants/databases.js';

import { notify, subscribe as observeMessages } from '/app/helpers/message-bus.helper.js';

import { update as updateDb, read as readDb } from '/app/services/db.service.js';

import '/app/view-controllers/list.js';
import '/app/view-controllers/form.js';

// editing item
// removing item
// validation

// local data
const addressBook = readDb(ADDRESS_BOOK, {});
let lastId = readDb(LAST_ID, {value: 0 }).value;

// restore
notify(INIT_LIST, addressBook);

// messages from form
observeMessages(NEW_CONTACT, ({name, surname, email}) => {
    lastId += 1;

    const newContact = {
        id: lastId,
        name,
        surname,
        email,
    };

    addressBook[lastId] = newContact;

    updateDb({ lastId, addressBook });
    notify(ADD_TO_LIST, newContact);
});

observeMessages(UPDATE_CONTACT, ({id, name, surname, email}) => {
    addressBook[id] = { id, name, surname, email };
    updateDb({ addressBook });
    notify(UPDATE_LIST, { id, name, surname, email });
});

// messages from list
observeMessages(UPDATE_REQUEST, (id) => {
    notify(EDIT_CONTACT, addressBook[id]);
});