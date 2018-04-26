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

import initList from './view-controllers/list/controller.js';
import initFormDialog from './view-controllers/form-dialog/controller.js';
import initDeleteDialog from './view-controllers/delete-dialog/controller.js';
import initOverlay from './view-controllers/overlay/controller.js';

import { appendAll } from './utils/dom.general.util.js';

// module data
const addressBook = readDb(ADDRESS_BOOK, {});
let lastId = readDb(LAST_ID, {value: 0 }).value;

// initialize view controllers, append them, and initialize list contents
Promise
    .all([
        initList(),
        initFormDialog(),
        initDeleteDialog(),
        initOverlay(),
    ])
    .then((everything) => everything.reduce(
        (flatArray, $view) => {
            flatArray.push($view);
            return flatArray;
        },
        []
    ))
    .then((views) => {
        const $main = document.querySelector('.jsMain');

        appendAll($main, views);
    })
    .then(() => {
        notify(INIT_LIST, addressBook);
    });

// messages: form -> main
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

observeMessages(UPDATE_CONTACT, ({id, name, surname, country, email}) => {
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