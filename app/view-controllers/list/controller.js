import {
    INIT_LIST,
    ADD_TO_LIST,
    UPDATE_LIST,
    REMOVE_FROM_LIST,
    NEW_REQUEST,
    UPDATE_REQUEST,
    DELETE_REQUEST,
} from '../../constants/channels.js';

import { notify, subscribe as observeMessages } from '../../helpers/message-bus.helper.js';
import { compose } from '../../utils/fp.util.js';
import getTemplate from '../../utils/dom.template.util.js';
import { itemText } from '../../utils/text.util.js';
import { createItem } from '../../utils/dom.item.util.js';

// init function
export default () =>
    getTemplate('/app/view-controllers/list/view.html')
        .then(($view) => {
            // module data
            const items = {};

            // elements
            const $contacts = $view.querySelector('.jsContacts');
            const $new = $contacts.querySelector('.jsNew');
            const $list = $contacts.querySelector('.jsContactsList');

            // methods ________________________________________________________________________________________________
            const addItem = (item) => {
                $list.appendChild(item);
            };

            const addSingleItem = ({id, name, surname, country, email}) => {
                const newItem = createItem({ id, name, surname, country, email });

                items[id] = newItem;

                addItem(newItem);
            }

            const updateItem = (id) => {
                notify(UPDATE_REQUEST, { id });
            };

            const deleteItem = (id) => {
                notify(DELETE_REQUEST, { id });
            };

            // message bus ____________________________________________________________________________________________
            observeMessages(INIT_LIST, (addressBook) => {
                Object
                    .values(addressBook)
                    .forEach(addSingleItem);
            });

            observeMessages(ADD_TO_LIST, addSingleItem);

            observeMessages(UPDATE_LIST, ({id, name, surname, country, email }) => {
                items[id].querySelector('.item-label').textContent = itemText({ name, surname, country, email });
            });

            observeMessages(REMOVE_FROM_LIST, ({ id }) => {
                $list.removeChild(items[id]);
                delete items[id];
            });

            // user interactions ______________________________________________________________________________________
            $new.addEventListener('click', () => {
                notify(NEW_REQUEST, true);
            });

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

            return $view;
        });
