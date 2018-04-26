import {
    NEW_REQUEST,
    UPDATE_REQUEST,
    DELETE_CONTACT,
    DELETE_CONFIRM,
    OVERLAY_CLICKED,
} from '../../constants/channels.js';

import getTemplate from '../../utils/dom.template.util.js';
import { notify, subscribe as observeMessages } from '../../helpers/message-bus.helper.js';
import { itemText } from '../../utils/text.util.js';

// init function
export default () =>
    getTemplate('/app/view-controllers/delete-dialog/view.html')
        .then(($view) => {
            // data
            let _id = null;

            // elements
            const $dialog = $view.querySelector('.jsDialog');
            const $form = $dialog.querySelector('.jsForm');

            const $id = $form.querySelector('.jsId');
            const $details = $form.querySelector('.jsDetails');

            const $yes = $form.querySelector('.jsYes');
            const $no = $form.querySelector('.jsNo');

            // methods ________________________________________________________________________________________________
            const updateDetails = (id = '', contact = '') => {
                $id.value = id;
                $details.textContent = itemText(contact);
            };

            const toggleDialog = (status) => () => {
                $dialog.classList.toggle('is-active', status);
            };
            const showDialog = toggleDialog(true);
            const hideDialog = toggleDialog(false);

            const closeDialog = () => {
                _id = null;
                $form.reset();
                updateDetails();
                hideDialog();
            }

            // message bus ____________________________________________________________________________________________
            observeMessages(DELETE_CONTACT, ({id, contact}) => {
                _id = id;
                updateDetails(id, contact);
                showDialog();
            });

            observeMessages(NEW_REQUEST, hideDialog);
            observeMessages(UPDATE_REQUEST, hideDialog);
            observeMessages(OVERLAY_CLICKED, hideDialog);

            // user interactions ______________________________________________________________________________________
            $yes.addEventListener('click', (event) => {
                event.preventDefault();
                notify(DELETE_CONFIRM, { id: _id });
                closeDialog();
            });

            $no.addEventListener('click', (event) => {
                event.preventDefault();
                closeDialog();
            });

            return $view;
        });