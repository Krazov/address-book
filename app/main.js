import { NEW_CONTACT, ADD_TO_LIST, INIT_LIST } from '/app/constants/channels.js';
import { ADDRESS_BOOK, LAST_ID } from '/app/constants/databases.js';

import { notify, subscribe as observeMessages } from '/app/helpers/message-bus.helper.js';

import { update as updateDb, read as readDb } from '/app/services/db.service.js';

import '/app/view-controllers/list.js';
import '/app/view-controllers/form.js';

// list with all contacts
// editing item
// removing item
// data should be persistent on client side between refreshes
// validation

// --adding item

// messages container
// li’s container

// local data
const addressBook = readDb(ADDRESS_BOOK, {});
let lastId = readDb(LAST_ID, {value: 0 }).value;

// action
notify(INIT_LIST, addressBook);

observeMessages(NEW_CONTACT, ({name, surname, email}) => {
    lastId += 1;

    const newContact = {
        id: lastId,
        name,
        surname,
        email,
    };

    addressBook[lastId] = newContact;

    console.log('Address book', JSON.stringify(addressBook));

    updateDb({ lastId, addressBook });
    notify(ADD_TO_LIST, newContact);
});