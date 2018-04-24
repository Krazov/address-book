import {
    EDIT_CONTACT,
    NEW_CONTACT,
    UPDATE_CONTACT,
    DELETE_CONTACT,
    INIT_LIST,
    ADD_TO_LIST,
    UPDATE_LIST,
    REMOVE_FROM_LIST,
    UPDATE_REQUEST,
    DELETE_REQUEST,
    DELETE_CONFIRM,
} from './constants/channels.js';

import { ADDRESS_BOOK, LAST_ID } from './constants/databases.js';

import { notify, subscribe as observeMessages } from './helpers/message-bus.helper.js';

import { update as updateDb, read as readDb } from './services/db.service.js';

import './view-controllers/list.js';
import './view-controllers/manage.js';
import './view-controllers/delete.js';

//import './utils/country-list.util.js';

// module data
const addressBook = readDb(ADDRESS_BOOK, {});
let lastId = readDb(LAST_ID, {value: 0 }).value;

// on restore
notify(INIT_LIST, addressBook);

// messages: from -> main
observeMessages(NEW_CONTACT, ({name, surname, country, email}) => {
    lastId += 1;

    const newContact = {
        id: lastId,
        name,
        surname,
        country,
        email,
    };

    addressBook[lastId] = newContact;

    updateDb({ lastId, addressBook });
    notify(ADD_TO_LIST, newContact);
});

observeMessages(UPDATE_CONTACT, ({id, name, surname, email}) => {
    addressBook[id] = { id, name, surname, country, email };
    updateDb({ addressBook });
    notify(UPDATE_LIST, { id, name, surname, country, email });
});

// messages: delete -> main
observeMessages(DELETE_CONFIRM, ({id}) => {
    delete addressBook[id];
    updateDb({ addressBook });
    notify(REMOVE_FROM_LIST, { id });
});

// messages: list -> main
observeMessages(DELETE_REQUEST, ({ id }) => {
    notify(DELETE_CONTACT, { id, contact: addressBook[id] });
});

observeMessages(UPDATE_REQUEST, ({ id }) => {
    notify(EDIT_CONTACT, addressBook[id]);
});