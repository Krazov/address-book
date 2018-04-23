import { DELETE_CONTACT, DELETE_CONFIRM } from '../constants/channels.js';
import { notify, subscribe as observeMessages } from '../helpers/message-bus.helper.js';
import { itemText } from '../utils/text.util.js';

// data
let _id = null;

// elements
const $dialog = document.querySelector('.dialog-delete');
const $form = $dialog.querySelector('.form');

const $id = $form.querySelector('.id');
const $details = $form.querySelector('.contact-details');

const $yes = $form.querySelector('.form-yes');
const $no = $form.querySelector('.form-no');

// methods
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

// message bus
observeMessages(DELETE_CONTACT, ({id, contact}) => {
    _id = id;
    updateDetails(id, contact);
    showDialog();
});

// user interactions
$yes.addEventListener('click', (event) => {
    event.preventDefault();
    notify(DELETE_CONFIRM, { id: _id });
    closeDialog();
});

$no.addEventListener('click', (event) => {
    event.preventDefault();
    closeDialog();
});