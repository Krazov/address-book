(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// main -> form
var EDIT_CONTACT = exports.EDIT_CONTACT = 'edit-contact';

// form -> main
var NEW_CONTACT = exports.NEW_CONTACT = 'new-contact';
var UPDATE_CONTACT = exports.UPDATE_CONTACT = 'update-contact';

// main -> delete
var DELETE_CONTACT = exports.DELETE_CONTACT = 'delete-contact';

// delete -> main
var DELETE_CONFIRM = exports.DELETE_CONFIRM = 'delete-confirm';
var DELETE_CANCEL = exports.DELETE_CANCEL = 'delete-cancel';

// main -> list
var INIT_LIST = exports.INIT_LIST = 'init-list';
var ADD_TO_LIST = exports.ADD_TO_LIST = 'add-to-list';
var UPDATE_LIST = exports.UPDATE_LIST = 'update-list';
var REMOVE_FROM_LIST = exports.REMOVE_FROM_LIST = 'remove-from-list';

// list -> main
var UPDATE_REQUEST = exports.UPDATE_REQUEST = 'update-request';
var DELETE_REQUEST = exports.DELETE_REQUEST = 'delete-request';

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var LAST_ID = exports.LAST_ID = 'last-id';
var ADDRESS_BOOK = exports.ADDRESS_BOOK = 'address-book';

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.notify = exports.unsubscribe = exports.subscribe = undefined;

var _fpUtil = require('../utils/fp.util.js');

var subscribers = {};

var subscribe = exports.subscribe = function subscribe(channel, fn) {
    if (!channelExists(channel)) {
        subscribers[channel] = [];
    }

    if (typeof fn == 'function') {
        subscribers[channel].push(fn);
    }
};

var unsubscribe = exports.unsubscribe = function unsubscribe(channel, fn) {
    if (channelExists(channel)) {
        subscribers[channel].splice(subscribers.indexOf(fn), 1);
    }
};

var notify = exports.notify = function notify(channel, message) {
    if (channelExists(channel)) {
        subscribers[channel].forEach(function (fn) {
            fn(message);
        });
    }
};

function channelExists(channel) {
    return (0, _fpUtil.hasProp)(subscribers, channel);
}

},{"../utils/fp.util.js":6}],4:[function(require,module,exports){
'use strict';

var _channels = require('./constants/channels.js');

var _databases = require('./constants/databases.js');

var _messageBusHelper = require('./helpers/message-bus.helper.js');

var _dbService = require('./services/db.service.js');

require('./view-controllers/list.js');

require('./view-controllers/manage.js');

require('./view-controllers/delete.js');

// editing item
// removing item
// validation

// local data
var addressBook = (0, _dbService.read)(_databases.ADDRESS_BOOK, {});
var lastId = (0, _dbService.read)(_databases.LAST_ID, { value: 0 }).value;

// restore
(0, _messageBusHelper.notify)(_channels.INIT_LIST, addressBook);

// messages: from -> main
(0, _messageBusHelper.subscribe)(_channels.NEW_CONTACT, function (_ref) {
    var name = _ref.name,
        surname = _ref.surname,
        email = _ref.email;

    lastId += 1;

    var newContact = {
        id: lastId,
        name: name,
        surname: surname,
        email: email
    };

    addressBook[lastId] = newContact;

    (0, _dbService.update)({ lastId: lastId, addressBook: addressBook });
    (0, _messageBusHelper.notify)(_channels.ADD_TO_LIST, newContact);
});

(0, _messageBusHelper.subscribe)(_channels.UPDATE_CONTACT, function (_ref2) {
    var id = _ref2.id,
        name = _ref2.name,
        surname = _ref2.surname,
        email = _ref2.email;

    addressBook[id] = { id: id, name: name, surname: surname, email: email };
    (0, _dbService.update)({ addressBook: addressBook });
    (0, _messageBusHelper.notify)(_channels.UPDATE_LIST, { id: id, name: name, surname: surname, email: email });
});

// messages: delete -> main
(0, _messageBusHelper.subscribe)(_channels.DELETE_CONFIRM, function (_ref3) {
    var id = _ref3.id;

    delete addressBook[id];
    (0, _dbService.update)({ addressBook: addressBook });
    (0, _messageBusHelper.notify)(_channels.REMOVE_FROM_LIST, { id: id });
});

// messages: list -> main
(0, _messageBusHelper.subscribe)(_channels.DELETE_REQUEST, function (_ref4) {
    var id = _ref4.id;

    (0, _messageBusHelper.notify)(_channels.DELETE_CONTACT, { id: id, contact: addressBook[id] });
});

(0, _messageBusHelper.subscribe)(_channels.UPDATE_REQUEST, function (_ref5) {
    var id = _ref5.id;

    (0, _messageBusHelper.notify)(_channels.EDIT_CONTACT, addressBook[id]);
});

},{"./constants/channels.js":1,"./constants/databases.js":2,"./helpers/message-bus.helper.js":3,"./services/db.service.js":5,"./view-controllers/delete.js":10,"./view-controllers/list.js":12,"./view-controllers/manage.js":13}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.read = exports.update = undefined;

var _databases = require('../constants/databases.js');

var _localStorageUtil = require('../utils/local-storage.util.js');

var update = exports.update = function update(_ref) {
    var lastId = _ref.lastId,
        addressBook = _ref.addressBook;

    if (lastId) {
        (0, _localStorageUtil.set)(_databases.LAST_ID, JSON.stringify({ value: lastId }));
    }

    if (addressBook) {
        (0, _localStorageUtil.set)(_databases.ADDRESS_BOOK, JSON.stringify(addressBook));
    }
};

var read = exports.read = function read(key) {
    var fallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return (0, _localStorageUtil.get)(key) || fallback;
};

},{"../constants/databases.js":2,"../utils/local-storage.util.js":7}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var compose = exports.compose = function compose() {
    for (var _len = arguments.length, functions = Array(_len), _key = 0; _key < _len; _key++) {
        functions[_key] = arguments[_key];
    }

    return function () {
        for (var _len2 = arguments.length, initial = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            initial[_key2] = arguments[_key2];
        }

        var lastIndex = functions.length - 1;

        return functions.reduceRight(function (value, fn, index) {
            return index === lastIndex ? fn.apply(undefined, _toConsumableArray(value)) : fn(value);
        }, initial);
    };
};

var hasProp = exports.hasProp = function hasProp(object, prop) {
    return object.hasOwnProperty(prop);
};

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var _window = window,
    localStorage = _window.localStorage;
var set = exports.set = function set(key, value) {
    localStorage.setItem(key, value);
};

var get = exports.get = function get(key) {
    var object = localStorage.getItem(key);

    return object != null ? JSON.parse(object) : null;
};

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var itemText = exports.itemText = function itemText(_ref) {
  var name = _ref.name,
      surname = _ref.surname,
      _ref$country = _ref.country,
      country = _ref$country === undefined ? '--' : _ref$country,
      email = _ref.email;
  return name + ' ' + surname + ' (' + country + '), ' + email;
};

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// note:
// validators could probably be improved,
// as they allow for names like “@#$-()”,
// but this could take hours, if not days,
// so it was left at the very basic functionality

var validateName = exports.validateName = function validateName(name) {
    return typeof name == 'string' && name.length > 0 && /[\w]+/.test(name.replace(/\d/g, ''));
};

var validateSurname = exports.validateSurname = function validateSurname(surname) {
    if (typeof surname != 'string') {
        return false;
    }

    var nameWithoutDigits = surname.replace(/\d/g, '');

    return surname === '' || /[\w]+/.test(nameWithoutDigits);
};

var validateCountry = exports.validateCountry = function validateCountry() {
    return true;
};

// source: https://www.regular-expressions.info/email.html
var emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

var validateEmail = exports.validateEmail = function validateEmail(email) {
    return typeof email == 'string' && emailRegex.test(email);
};

},{}],10:[function(require,module,exports){
'use strict';

var _channels = require('../constants/channels.js');

var _messageBusHelper = require('../helpers/message-bus.helper.js');

var _textUtil = require('../utils/text.util.js');

// data
var _id = null;

// elements
var $dialog = document.querySelector('.dialog-delete');
var $form = $dialog.querySelector('.form');

var $id = $form.querySelector('.id');
var $details = $form.querySelector('.contact-details');

var $yes = $form.querySelector('.form-yes');
var $no = $form.querySelector('.form-no');

// methods
var updateDetails = function updateDetails() {
    var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var contact = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    $id.value = id;
    $details.textContent = (0, _textUtil.itemText)(contact);
};

var toggleDialog = function toggleDialog(status) {
    return function () {
        $dialog.classList.toggle('is-active', status);
    };
};
var showDialog = toggleDialog(true);
var hideDialog = toggleDialog(false);

var closeDialog = function closeDialog() {
    _id = null;
    $form.reset();
    updateDetails();
    hideDialog();
};

// message bus
(0, _messageBusHelper.subscribe)(_channels.DELETE_CONTACT, function (_ref) {
    var id = _ref.id,
        contact = _ref.contact;

    _id = id;
    updateDetails(id, contact);
    showDialog();
});

// user interactions
$yes.addEventListener('click', function (event) {
    event.preventDefault();
    (0, _messageBusHelper.notify)(_channels.DELETE_CONFIRM, { id: _id });
    closeDialog();
});

$no.addEventListener('click', function (event) {
    event.preventDefault();
    closeDialog();
});

},{"../constants/channels.js":1,"../helpers/message-bus.helper.js":3,"../utils/text.util.js":8}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createItem = undefined;

var _textUtil = require('../utils/text.util.js');

var createLabel = function createLabel(name, surname, country, email) {
    return Object.assign(document.createElement('div'), {
        className: 'item-label',
        textContent: (0, _textUtil.itemText)({ name: name, surname: surname, email: email })
    });
};

var createButton = function createButton(className, textContent, type, id) {
    var $button = document.createElement('button');

    $button.customData = {
        contactId: id,
        action: type
    };

    $button.className = className;
    $button.textContent = textContent;

    return $button;
};

var createEditButton = function createEditButton(id) {
    return createButton('itemEdit', 'Edit', 'edit', id);
};

var createDeleteButton = function createDeleteButton(id) {
    return createButton('itemDelete', 'Delete', 'delete', id);
};

var createItem = exports.createItem = function createItem(_ref) {
    var id = _ref.id,
        name = _ref.name,
        surname = _ref.surname,
        country = _ref.country,
        email = _ref.email;

    var li = document.createElement('li');

    li.className = 'item';

    li.appendChild(createLabel(name, surname, country, email));
    li.appendChild(createEditButton(id));
    li.appendChild(createDeleteButton(id));

    return li;
};

},{"../utils/text.util.js":8}],12:[function(require,module,exports){
'use strict';

var _channels = require('../constants/channels.js');

var _messageBusHelper = require('../helpers/message-bus.helper.js');

var _fpUtil = require('../utils/fp.util.js');

var _textUtil = require('../utils/text.util.js');

var _item = require('../view-controllers/item.js');

// local data
var items = {};

// elements
var $list = document.querySelector('.list');

// methods
var addItem = function addItem(item) {
    $list.appendChild(item);
};

var addSingleItem = function addSingleItem(_ref) {
    var id = _ref.id,
        name = _ref.name,
        surname = _ref.surname,
        email = _ref.email;

    var newItem = (0, _item.createItem)({ id: id, name: name, surname: surname, email: email });

    items[id] = newItem;

    addItem(newItem);
};

var updateItem = function updateItem(id) {
    (0, _messageBusHelper.notify)(_channels.UPDATE_REQUEST, { id: id });
};

var deleteItem = function deleteItem(id) {
    (0, _messageBusHelper.notify)(_channels.DELETE_REQUEST, { id: id });
};

// message bus
(0, _messageBusHelper.subscribe)(_channels.INIT_LIST, function (addressBook) {
    Object.values(addressBook).forEach(addSingleItem);
});

(0, _messageBusHelper.subscribe)(_channels.ADD_TO_LIST, addSingleItem);

(0, _messageBusHelper.subscribe)(_channels.UPDATE_LIST, function (_ref2) {
    var id = _ref2.id,
        name = _ref2.name,
        surname = _ref2.surname,
        email = _ref2.email;

    items[id].querySelector('.item-label').textContent = (0, _textUtil.itemText)({ name: name, surname: surname, email: email });
});

(0, _messageBusHelper.subscribe)(_channels.REMOVE_FROM_LIST, function (_ref3) {
    var id = _ref3.id;

    $list.removeChild(items[id]);
    delete items[id];
});

// user interaction
$list.addEventListener('click', function (event) {
    var _event$target$customD = event.target.customData,
        action = _event$target$customD.action,
        contactId = _event$target$customD.contactId;


    switch (action) {
        case 'edit':
            updateItem(contactId);
            break;
        case 'delete':
            deleteItem(contactId);
            break;
    }
});

},{"../constants/channels.js":1,"../helpers/message-bus.helper.js":3,"../utils/fp.util.js":6,"../utils/text.util.js":8,"../view-controllers/item.js":11}],13:[function(require,module,exports){
'use strict';

var _channels = require('../constants/channels.js');

var _validatorUtil = require('../../app/utils/validator.util.js');

var _messageBusHelper = require('../helpers/message-bus.helper.js');

var _fpUtil = require('../utils/fp.util.js');

// main element
var $dialog = document.querySelector('.dialog-manage');
var $form = $dialog.querySelector('.form');

// containers
var $nameContainer = $form.querySelector('.name-container');
var $surnameContainer = $form.querySelector('.surname-container');
var $emailContainer = $form.querySelector('.email-container');

// inputs
var $id = $form.querySelector('.id');
var $name = $nameContainer.querySelector('.name');
var $surname = $surnameContainer.querySelector('.surname');
//const country = document.getElementById('country');
var $email = $emailContainer.querySelector('.email');

// methods
var getValues = function getValues() {
    return {
        id: $id.value,
        name: $name.value,
        surname: $surname.value,
        email: $email.value
    };
};

var closeForm = function closeForm() {
    $dialog.classList.remove('is-active');
    $id.value = '';
    $form.reset();
};

var validateForm = function validateForm(name, surname, email) {
    return {
        name: (0, _validatorUtil.validateName)(name),
        surname: (0, _validatorUtil.validateSurname)(surname),
        email: (0, _validatorUtil.validateEmail)(email)
    };
};

var markErrors = function markErrors(_ref) {
    var name = _ref.name,
        surname = _ref.surname,
        email = _ref.email;

    $nameContainer.classList.toggle('has-error', !name);
    $surnameContainer.classList.toggle('has-error', !surname);
    $emailContainer.classList.toggle('has-error', !email);

    return { name: name, surname: surname, email: email };
};

var checkValidity = function checkValidity(report) {
    return Object.values(report).every(function (field) {
        return field == true;
    });
};

var allGood = (0, _fpUtil.compose)(checkValidity, markErrors, validateForm);

// action
$form.addEventListener('submit', function (event) {
    event.preventDefault();

    var _getValues = getValues(),
        id = _getValues.id,
        name = _getValues.name,
        surname = _getValues.surname,
        email = _getValues.email;

    if (!allGood(name, surname, email)) {
        return;
    }

    if (id) {
        (0, _messageBusHelper.notify)(_channels.UPDATE_CONTACT, { id: id, name: name, surname: surname, email: email });
    } else {
        (0, _messageBusHelper.notify)(_channels.NEW_CONTACT, { name: name, surname: surname, email: email });
    }

    closeForm();
});

(0, _messageBusHelper.subscribe)(_channels.EDIT_CONTACT, function (_ref2) {
    var id = _ref2.id,
        name = _ref2.name,
        surname = _ref2.surname,
        email = _ref2.email;

    $id.value = id;
    $name.value = name;
    $surname.value = surname;
    $email.value = email;

    $dialog.classList.add('is-active');
});

},{"../../app/utils/validator.util.js":9,"../constants/channels.js":1,"../helpers/message-bus.helper.js":3,"../utils/fp.util.js":6}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvY29uc3RhbnRzL2NoYW5uZWxzLmpzIiwiYXBwL2NvbnN0YW50cy9kYXRhYmFzZXMuanMiLCJhcHAvaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zZXJ2aWNlcy9kYi5zZXJ2aWNlLmpzIiwiYXBwL3V0aWxzL2ZwLnV0aWwuanMiLCJhcHAvdXRpbHMvbG9jYWwtc3RvcmFnZS51dGlsLmpzIiwiYXBwL3V0aWxzL3RleHQudXRpbC5qcyIsImFwcC91dGlscy92YWxpZGF0b3IudXRpbC5qcyIsImFwcC92aWV3LWNvbnRyb2xsZXJzL2RlbGV0ZS5qcyIsImFwcC92aWV3LWNvbnRyb2xsZXJzL2l0ZW0uanMiLCJhcHAvdmlldy1jb250cm9sbGVycy9saXN0LmpzIiwiYXBwL3ZpZXctY29udHJvbGxlcnMvbWFuYWdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNBQTtBQUNPLElBQU0sc0NBQWUsY0FBckI7O0FBRVA7QUFDTyxJQUFNLG9DQUFjLGFBQXBCO0FBQ0EsSUFBTSwwQ0FBaUIsZ0JBQXZCOztBQUVQO0FBQ08sSUFBTSwwQ0FBaUIsZ0JBQXZCOztBQUVQO0FBQ08sSUFBTSwwQ0FBaUIsZ0JBQXZCO0FBQ0EsSUFBTSx3Q0FBZ0IsZUFBdEI7O0FBRVA7QUFDTyxJQUFNLGdDQUFZLFdBQWxCO0FBQ0EsSUFBTSxvQ0FBYyxhQUFwQjtBQUNBLElBQU0sb0NBQWMsYUFBcEI7QUFDQSxJQUFNLDhDQUFtQixrQkFBekI7O0FBRVA7QUFDTyxJQUFNLDBDQUFpQixnQkFBdkI7QUFDQSxJQUFNLDBDQUFpQixnQkFBdkI7Ozs7Ozs7O0FDdEJBLElBQU0sNEJBQVUsU0FBaEI7QUFDQSxJQUFNLHNDQUFlLGNBQXJCOzs7Ozs7Ozs7O0FDRFA7O0FBRUEsSUFBTSxjQUFjLEVBQXBCOztBQUVPLElBQU0sZ0NBQVksU0FBWixTQUFZ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Z0VBQXVCLEVBQUUsTUFBRixFQUFNLFVBQU4sRUFBWSxnQkFBWixFQUFxQixZQUFyQixFQUF2QjtBQUNILEtBRkQsTUFFTztBQUNILDZEQUFvQixFQUFFLFVBQUYsRUFBUSxnQkFBUixFQUFpQixZQUFqQixFQUFwQjtBQUNIOztBQUVEO0FBQ0gsQ0FoQkQ7O0FBa0JBLHlEQUE4QixpQkFBa0M7QUFBQSxRQUEvQixFQUErQixTQUEvQixFQUErQjtBQUFBLFFBQTNCLElBQTJCLFNBQTNCLElBQTJCO0FBQUEsUUFBckIsT0FBcUIsU0FBckIsT0FBcUI7QUFBQSxRQUFaLEtBQVksU0FBWixLQUFZOztBQUM1RCxRQUFJLEtBQUosR0FBWSxFQUFaO0FBQ0EsVUFBTSxLQUFOLEdBQWMsSUFBZDtBQUNBLGFBQVMsS0FBVCxHQUFpQixPQUFqQjtBQUNBLFdBQU8sS0FBUCxHQUFlLEtBQWY7O0FBRUEsWUFBUSxTQUFSLENBQWtCLEdBQWxCLENBQXNCLFdBQXRCO0FBQ0gsQ0FQRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIG1haW4gLT4gZm9ybVxyXG5leHBvcnQgY29uc3QgRURJVF9DT05UQUNUID0gJ2VkaXQtY29udGFjdCc7XHJcblxyXG4vLyBmb3JtIC0+IG1haW5cclxuZXhwb3J0IGNvbnN0IE5FV19DT05UQUNUID0gJ25ldy1jb250YWN0JztcclxuZXhwb3J0IGNvbnN0IFVQREFURV9DT05UQUNUID0gJ3VwZGF0ZS1jb250YWN0JztcclxuXHJcbi8vIG1haW4gLT4gZGVsZXRlXHJcbmV4cG9ydCBjb25zdCBERUxFVEVfQ09OVEFDVCA9ICdkZWxldGUtY29udGFjdCc7XHJcblxyXG4vLyBkZWxldGUgLT4gbWFpblxyXG5leHBvcnQgY29uc3QgREVMRVRFX0NPTkZJUk0gPSAnZGVsZXRlLWNvbmZpcm0nO1xyXG5leHBvcnQgY29uc3QgREVMRVRFX0NBTkNFTCA9ICdkZWxldGUtY2FuY2VsJztcclxuXHJcbi8vIG1haW4gLT4gbGlzdFxyXG5leHBvcnQgY29uc3QgSU5JVF9MSVNUID0gJ2luaXQtbGlzdCc7XHJcbmV4cG9ydCBjb25zdCBBRERfVE9fTElTVCA9ICdhZGQtdG8tbGlzdCc7XHJcbmV4cG9ydCBjb25zdCBVUERBVEVfTElTVCA9ICd1cGRhdGUtbGlzdCc7XHJcbmV4cG9ydCBjb25zdCBSRU1PVkVfRlJPTV9MSVNUID0gJ3JlbW92ZS1mcm9tLWxpc3QnO1xyXG5cclxuLy8gbGlzdCAtPiBtYWluXHJcbmV4cG9ydCBjb25zdCBVUERBVEVfUkVRVUVTVCA9ICd1cGRhdGUtcmVxdWVzdCc7XHJcbmV4cG9ydCBjb25zdCBERUxFVEVfUkVRVUVTVCA9ICdkZWxldGUtcmVxdWVzdCc7IiwiZXhwb3J0IGNvbnN0IExBU1RfSUQgPSAnbGFzdC1pZCc7XHJcbmV4cG9ydCBjb25zdCBBRERSRVNTX0JPT0sgPSAnYWRkcmVzcy1ib29rJzsiLCJpbXBvcnQgeyBoYXNQcm9wIH0gZnJvbSAnLi4vdXRpbHMvZnAudXRpbC5qcyc7XHJcblxyXG5jb25zdCBzdWJzY3JpYmVycyA9IHt9O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN1YnNjcmliZSA9IChjaGFubmVsLCBmbikgPT4ge1xyXG4gICAgaWYgKCFjaGFubmVsRXhpc3RzKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgc3Vic2NyaWJlcnNbY2hhbm5lbF0gPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGZuID09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBzdWJzY3JpYmVyc1tjaGFubmVsXS5wdXNoKGZuKTtcclxuICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHVuc3Vic2NyaWJlID0gKGNoYW5uZWwsIGZuKSA9PiB7XHJcbiAgICBpZiAoY2hhbm5lbEV4aXN0cyhjaGFubmVsKSkge1xyXG4gICAgICAgIHN1YnNjcmliZXJzW2NoYW5uZWxdLnNwbGljZShzdWJzY3JpYmVycy5pbmRleE9mKGZuKSwgMSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgbm90aWZ5ID0gKGNoYW5uZWwsIG1lc3NhZ2UpID0+IHtcclxuICAgIGlmIChjaGFubmVsRXhpc3RzKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgc3Vic2NyaWJlcnNbY2hhbm5lbF0uZm9yRWFjaCgoZm4pID0+IHtcclxuICAgICAgICAgICAgZm4obWVzc2FnZSk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIGNoYW5uZWxFeGlzdHMoY2hhbm5lbCkge1xyXG4gICAgcmV0dXJuIGhhc1Byb3Aoc3Vic2NyaWJlcnMsIGNoYW5uZWwpO1xyXG59IiwiaW1wb3J0IHtcclxuICAgIEVESVRfQ09OVEFDVCxcclxuICAgIE5FV19DT05UQUNULFxyXG4gICAgVVBEQVRFX0NPTlRBQ1QsXHJcbiAgICBERUxFVEVfQ09OVEFDVCxcclxuICAgIElOSVRfTElTVCxcclxuICAgIEFERF9UT19MSVNULFxyXG4gICAgVVBEQVRFX0xJU1QsXHJcbiAgICBSRU1PVkVfRlJPTV9MSVNULFxyXG4gICAgVVBEQVRFX1JFUVVFU1QsXHJcbiAgICBERUxFVEVfUkVRVUVTVCxcclxuICAgIERFTEVURV9DT05GSVJNLFxyXG59IGZyb20gJy4vY29uc3RhbnRzL2NoYW5uZWxzLmpzJztcclxuXHJcbmltcG9ydCB7IEFERFJFU1NfQk9PSywgTEFTVF9JRCB9IGZyb20gJy4vY29uc3RhbnRzL2RhdGFiYXNlcy5qcyc7XHJcblxyXG5pbXBvcnQgeyBub3RpZnksIHN1YnNjcmliZSBhcyBvYnNlcnZlTWVzc2FnZXMgfSBmcm9tICcuL2hlbHBlcnMvbWVzc2FnZS1idXMuaGVscGVyLmpzJztcclxuXHJcbmltcG9ydCB7IHVwZGF0ZSBhcyB1cGRhdGVEYiwgcmVhZCBhcyByZWFkRGIgfSBmcm9tICcuL3NlcnZpY2VzL2RiLnNlcnZpY2UuanMnO1xyXG5cclxuaW1wb3J0ICcuL3ZpZXctY29udHJvbGxlcnMvbGlzdC5qcyc7XHJcbmltcG9ydCAnLi92aWV3LWNvbnRyb2xsZXJzL21hbmFnZS5qcyc7XHJcbmltcG9ydCAnLi92aWV3LWNvbnRyb2xsZXJzL2RlbGV0ZS5qcyc7XHJcblxyXG4vLyBlZGl0aW5nIGl0ZW1cclxuLy8gcmVtb3ZpbmcgaXRlbVxyXG4vLyB2YWxpZGF0aW9uXHJcblxyXG4vLyBsb2NhbCBkYXRhXHJcbmNvbnN0IGFkZHJlc3NCb29rID0gcmVhZERiKEFERFJFU1NfQk9PSywge30pO1xyXG5sZXQgbGFzdElkID0gcmVhZERiKExBU1RfSUQsIHt2YWx1ZTogMCB9KS52YWx1ZTtcclxuXHJcbi8vIHJlc3RvcmVcclxubm90aWZ5KElOSVRfTElTVCwgYWRkcmVzc0Jvb2spO1xyXG5cclxuLy8gbWVzc2FnZXM6IGZyb20gLT4gbWFpblxyXG5vYnNlcnZlTWVzc2FnZXMoTkVXX0NPTlRBQ1QsICh7bmFtZSwgc3VybmFtZSwgZW1haWx9KSA9PiB7XHJcbiAgICBsYXN0SWQgKz0gMTtcclxuXHJcbiAgICBjb25zdCBuZXdDb250YWN0ID0ge1xyXG4gICAgICAgIGlkOiBsYXN0SWQsXHJcbiAgICAgICAgbmFtZSxcclxuICAgICAgICBzdXJuYW1lLFxyXG4gICAgICAgIGVtYWlsLFxyXG4gICAgfTtcclxuXHJcbiAgICBhZGRyZXNzQm9va1tsYXN0SWRdID0gbmV3Q29udGFjdDtcclxuXHJcbiAgICB1cGRhdGVEYih7IGxhc3RJZCwgYWRkcmVzc0Jvb2sgfSk7XHJcbiAgICBub3RpZnkoQUREX1RPX0xJU1QsIG5ld0NvbnRhY3QpO1xyXG59KTtcclxuXHJcbm9ic2VydmVNZXNzYWdlcyhVUERBVEVfQ09OVEFDVCwgKHtpZCwgbmFtZSwgc3VybmFtZSwgZW1haWx9KSA9PiB7XHJcbiAgICBhZGRyZXNzQm9va1tpZF0gPSB7IGlkLCBuYW1lLCBzdXJuYW1lLCBlbWFpbCB9O1xyXG4gICAgdXBkYXRlRGIoeyBhZGRyZXNzQm9vayB9KTtcclxuICAgIG5vdGlmeShVUERBVEVfTElTVCwgeyBpZCwgbmFtZSwgc3VybmFtZSwgZW1haWwgfSk7XHJcbn0pO1xyXG5cclxuLy8gbWVzc2FnZXM6IGRlbGV0ZSAtPiBtYWluXHJcbm9ic2VydmVNZXNzYWdlcyhERUxFVEVfQ09ORklSTSwgKHtpZH0pID0+IHtcclxuICAgIGRlbGV0ZSBhZGRyZXNzQm9va1tpZF07XHJcbiAgICB1cGRhdGVEYih7IGFkZHJlc3NCb29rIH0pO1xyXG4gICAgbm90aWZ5KFJFTU9WRV9GUk9NX0xJU1QsIHsgaWQgfSk7XHJcbn0pO1xyXG5cclxuLy8gbWVzc2FnZXM6IGxpc3QgLT4gbWFpblxyXG5vYnNlcnZlTWVzc2FnZXMoREVMRVRFX1JFUVVFU1QsICh7IGlkIH0pID0+IHtcclxuICAgIG5vdGlmeShERUxFVEVfQ09OVEFDVCwgeyBpZCwgY29udGFjdDogYWRkcmVzc0Jvb2tbaWRdIH0pO1xyXG59KTtcclxuXHJcbm9ic2VydmVNZXNzYWdlcyhVUERBVEVfUkVRVUVTVCwgKHsgaWQgfSkgPT4ge1xyXG4gICAgbm90aWZ5KEVESVRfQ09OVEFDVCwgYWRkcmVzc0Jvb2tbaWRdKTtcclxufSk7IiwiaW1wb3J0IHsgTEFTVF9JRCwgQUREUkVTU19CT09LIH0gZnJvbSAnLi4vY29uc3RhbnRzL2RhdGFiYXNlcy5qcyc7XHJcbmltcG9ydCB7IHNldCwgZ2V0IH0gZnJvbSAnLi4vdXRpbHMvbG9jYWwtc3RvcmFnZS51dGlsLmpzJztcclxuXHJcbmV4cG9ydCBjb25zdCB1cGRhdGUgPSAoe2xhc3RJZCwgYWRkcmVzc0Jvb2t9KSA9PiB7XHJcbiAgICBpZiAobGFzdElkKSB7XHJcbiAgICAgICAgc2V0KExBU1RfSUQsIEpTT04uc3RyaW5naWZ5KHt2YWx1ZTogbGFzdElkfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhZGRyZXNzQm9vaykge1xyXG4gICAgICAgIHNldChBRERSRVNTX0JPT0ssIEpTT04uc3RyaW5naWZ5KGFkZHJlc3NCb29rKSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgcmVhZCA9IChrZXksIGZhbGxiYWNrID0gbnVsbCkgPT4gZ2V0KGtleSkgfHwgZmFsbGJhY2s7IiwiZXhwb3J0IGNvbnN0IGNvbXBvc2UgPVxyXG4gICAgKC4uLmZ1bmN0aW9ucykgPT4gKC4uLmluaXRpYWwpID0+IHtcclxuICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBmdW5jdGlvbnMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9ucy5yZWR1Y2VSaWdodChcclxuICAgICAgICAgICAgKHZhbHVlLCBmbiwgaW5kZXgpID0+IGluZGV4ID09PSBsYXN0SW5kZXggPyBmbiguLi52YWx1ZSkgOiBmbih2YWx1ZSksXHJcbiAgICAgICAgICAgIGluaXRpYWxcclxuICAgICAgICApO1xyXG4gICAgfTtcclxuXHJcbmV4cG9ydCBjb25zdCBoYXNQcm9wID1cclxuICAgIChvYmplY3QsIHByb3ApID0+IG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wKTsiLCJjb25zdCB7IGxvY2FsU3RvcmFnZSB9ID0gd2luZG93O1xyXG5cclxuZXhwb3J0IGNvbnN0IHNldCA9IChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXQgPSAoa2V5KSA9PiB7XHJcbiAgICBjb25zdCBvYmplY3QgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xyXG5cclxuICAgIHJldHVybiBvYmplY3QgIT0gbnVsbCA/IEpTT04ucGFyc2Uob2JqZWN0KSA6IG51bGw7XHJcbn0iLCJleHBvcnQgY29uc3QgaXRlbVRleHQgPSAoe25hbWUsIHN1cm5hbWUsIGNvdW50cnkgPSAnLS0nLCBlbWFpbH0pID0+IGAke25hbWV9ICR7c3VybmFtZX0gKCR7Y291bnRyeX0pLCAke2VtYWlsfWA7IiwiLy8gbm90ZTpcclxuLy8gdmFsaWRhdG9ycyBjb3VsZCBwcm9iYWJseSBiZSBpbXByb3ZlZCxcclxuLy8gYXMgdGhleSBhbGxvdyBmb3IgbmFtZXMgbGlrZSDigJxAIyQtKCnigJ0sXHJcbi8vIGJ1dCB0aGlzIGNvdWxkIHRha2UgaG91cnMsIGlmIG5vdCBkYXlzLFxyXG4vLyBzbyBpdCB3YXMgbGVmdCBhdCB0aGUgdmVyeSBiYXNpYyBmdW5jdGlvbmFsaXR5XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRhdGVOYW1lID1cclxuICAgIChuYW1lKSA9PlxyXG4gICAgICAgIHR5cGVvZiBuYW1lID09ICdzdHJpbmcnICYmXHJcbiAgICAgICAgbmFtZS5sZW5ndGggPiAwICYmXHJcbiAgICAgICAgL1tcXHddKy8udGVzdChuYW1lLnJlcGxhY2UoL1xcZC9nLCAnJykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlU3VybmFtZSA9XHJcbiAgICAoc3VybmFtZSkgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc3VybmFtZSAhPSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBuYW1lV2l0aG91dERpZ2l0cyA9IHN1cm5hbWUucmVwbGFjZSgvXFxkL2csICcnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN1cm5hbWUgPT09ICcnIHx8IC9bXFx3XSsvLnRlc3QobmFtZVdpdGhvdXREaWdpdHMpO1xyXG4gICAgfTtcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUNvdW50cnkgPSAoKSA9PiB0cnVlO1xyXG5cclxuLy8gc291cmNlOiBodHRwczovL3d3dy5yZWd1bGFyLWV4cHJlc3Npb25zLmluZm8vZW1haWwuaHRtbFxyXG5jb25zdCBlbWFpbFJlZ2V4ID0gL1thLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSsoPzpcXC5bYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKSpAKD86W2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pP1xcLikrW2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pPy87XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRhdGVFbWFpbCA9XHJcbiAgICAoZW1haWwpID0+XHJcbiAgICAgICAgdHlwZW9mIGVtYWlsID09ICdzdHJpbmcnICYmXHJcbiAgICAgICAgZW1haWxSZWdleC50ZXN0KGVtYWlsKTsiLCJpbXBvcnQgeyBERUxFVEVfQ09OVEFDVCwgREVMRVRFX0NPTkZJUk0gfSBmcm9tICcuLi9jb25zdGFudHMvY2hhbm5lbHMuanMnO1xyXG5pbXBvcnQgeyBub3RpZnksIHN1YnNjcmliZSBhcyBvYnNlcnZlTWVzc2FnZXMgfSBmcm9tICcuLi9oZWxwZXJzL21lc3NhZ2UtYnVzLmhlbHBlci5qcyc7XHJcbmltcG9ydCB7IGl0ZW1UZXh0IH0gZnJvbSAnLi4vdXRpbHMvdGV4dC51dGlsLmpzJztcclxuXHJcbi8vIGRhdGFcclxubGV0IF9pZCA9IG51bGw7XHJcblxyXG4vLyBlbGVtZW50c1xyXG5jb25zdCAkZGlhbG9nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRpYWxvZy1kZWxldGUnKTtcclxuY29uc3QgJGZvcm0gPSAkZGlhbG9nLnF1ZXJ5U2VsZWN0b3IoJy5mb3JtJyk7XHJcblxyXG5jb25zdCAkaWQgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuaWQnKTtcclxuY29uc3QgJGRldGFpbHMgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuY29udGFjdC1kZXRhaWxzJyk7XHJcblxyXG5jb25zdCAkeWVzID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmZvcm0teWVzJyk7XHJcbmNvbnN0ICRubyA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5mb3JtLW5vJyk7XHJcblxyXG4vLyBtZXRob2RzXHJcbmNvbnN0IHVwZGF0ZURldGFpbHMgPSAoaWQgPSAnJywgY29udGFjdCA9ICcnKSA9PiB7XHJcbiAgICAkaWQudmFsdWUgPSBpZDtcclxuICAgICRkZXRhaWxzLnRleHRDb250ZW50ID0gaXRlbVRleHQoY29udGFjdCk7XHJcbn07XHJcblxyXG5jb25zdCB0b2dnbGVEaWFsb2cgPSAoc3RhdHVzKSA9PiAoKSA9PiB7XHJcbiAgICAkZGlhbG9nLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScsIHN0YXR1cyk7XHJcbn07XHJcbmNvbnN0IHNob3dEaWFsb2cgPSB0b2dnbGVEaWFsb2codHJ1ZSk7XHJcbmNvbnN0IGhpZGVEaWFsb2cgPSB0b2dnbGVEaWFsb2coZmFsc2UpO1xyXG5cclxuY29uc3QgY2xvc2VEaWFsb2cgPSAoKSA9PiB7XHJcbiAgICBfaWQgPSBudWxsO1xyXG4gICAgJGZvcm0ucmVzZXQoKTtcclxuICAgIHVwZGF0ZURldGFpbHMoKTtcclxuICAgIGhpZGVEaWFsb2coKTtcclxufVxyXG5cclxuLy8gbWVzc2FnZSBidXNcclxub2JzZXJ2ZU1lc3NhZ2VzKERFTEVURV9DT05UQUNULCAoe2lkLCBjb250YWN0fSkgPT4ge1xyXG4gICAgX2lkID0gaWQ7XHJcbiAgICB1cGRhdGVEZXRhaWxzKGlkLCBjb250YWN0KTtcclxuICAgIHNob3dEaWFsb2coKTtcclxufSk7XHJcblxyXG4vLyB1c2VyIGludGVyYWN0aW9uc1xyXG4keWVzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgbm90aWZ5KERFTEVURV9DT05GSVJNLCB7IGlkOiBfaWQgfSk7XHJcbiAgICBjbG9zZURpYWxvZygpO1xyXG59KTtcclxuXHJcbiRuby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGNsb3NlRGlhbG9nKCk7XHJcbn0pOyIsImltcG9ydCB7IGl0ZW1UZXh0IH0gZnJvbSAnLi4vdXRpbHMvdGV4dC51dGlsLmpzJztcclxuXHJcbmNvbnN0IGNyZWF0ZUxhYmVsID0gKG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsKSA9PlxyXG4gICAgT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSwge1xyXG4gICAgICAgIGNsYXNzTmFtZTogJ2l0ZW0tbGFiZWwnLFxyXG4gICAgICAgIHRleHRDb250ZW50OiBpdGVtVGV4dCh7IG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pLFxyXG4gICAgfSk7XHJcblxyXG5jb25zdCBjcmVhdGVCdXR0b24gPSAoY2xhc3NOYW1lLCB0ZXh0Q29udGVudCwgdHlwZSwgaWQpID0+IHtcclxuICAgIGNvbnN0ICRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuXHJcbiAgICAkYnV0dG9uLmN1c3RvbURhdGEgPSB7XHJcbiAgICAgICAgY29udGFjdElkOiBpZCxcclxuICAgICAgICBhY3Rpb246IHR5cGUsXHJcbiAgICB9O1xyXG5cclxuICAgICRidXR0b24uY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgJGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHRDb250ZW50O1xyXG5cclxuICAgIHJldHVybiAkYnV0dG9uO1xyXG59O1xyXG5cclxuY29uc3QgY3JlYXRlRWRpdEJ1dHRvbiA9IChpZCkgPT4gY3JlYXRlQnV0dG9uKCdpdGVtRWRpdCcsICdFZGl0JywgJ2VkaXQnLCBpZCk7XHJcblxyXG5jb25zdCBjcmVhdGVEZWxldGVCdXR0b24gPSAoaWQpID0+IGNyZWF0ZUJ1dHRvbignaXRlbURlbGV0ZScsICdEZWxldGUnLCAnZGVsZXRlJywgaWQpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZUl0ZW0gPSAoeyBpZCwgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSkgPT4ge1xyXG4gICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG5cclxuICAgIGxpLmNsYXNzTmFtZSA9ICdpdGVtJztcclxuXHJcbiAgICBsaS5hcHBlbmRDaGlsZChjcmVhdGVMYWJlbChuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCkpO1xyXG4gICAgbGkuYXBwZW5kQ2hpbGQoY3JlYXRlRWRpdEJ1dHRvbihpZCkpO1xyXG4gICAgbGkuYXBwZW5kQ2hpbGQoY3JlYXRlRGVsZXRlQnV0dG9uKGlkKSk7XHJcblxyXG4gICAgcmV0dXJuIGxpO1xyXG59O1xyXG4iLCJpbXBvcnQge1xyXG4gICAgSU5JVF9MSVNULFxyXG4gICAgQUREX1RPX0xJU1QsXHJcbiAgICBVUERBVEVfTElTVCxcclxuICAgIFJFTU9WRV9GUk9NX0xJU1QsXHJcbiAgICBVUERBVEVfUkVRVUVTVCxcclxuICAgIERFTEVURV9SRVFVRVNULFxyXG59IGZyb20gJy4uL2NvbnN0YW50cy9jaGFubmVscy5qcyc7XHJcblxyXG5pbXBvcnQgeyBub3RpZnksIHN1YnNjcmliZSBhcyBvYnNlcnZlTWVzc2FnZXMgfSBmcm9tICcuLi9oZWxwZXJzL21lc3NhZ2UtYnVzLmhlbHBlci5qcyc7XHJcbmltcG9ydCB7IGNvbXBvc2UgfSBmcm9tICcuLi91dGlscy9mcC51dGlsLmpzJztcclxuaW1wb3J0IHsgaXRlbVRleHQgfSBmcm9tICcuLi91dGlscy90ZXh0LnV0aWwuanMnO1xyXG5pbXBvcnQgeyBjcmVhdGVJdGVtIH0gZnJvbSAnLi4vdmlldy1jb250cm9sbGVycy9pdGVtLmpzJztcclxuXHJcbi8vIGxvY2FsIGRhdGFcclxuY29uc3QgaXRlbXMgPSB7fTtcclxuXHJcbi8vIGVsZW1lbnRzXHJcbmNvbnN0ICRsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxpc3QnKTtcclxuXHJcbi8vIG1ldGhvZHNcclxuY29uc3QgYWRkSXRlbSA9IChpdGVtKSA9PiB7XHJcbiAgICAkbGlzdC5hcHBlbmRDaGlsZChpdGVtKTtcclxufTtcclxuXHJcbmNvbnN0IGFkZFNpbmdsZUl0ZW0gPSAoe2lkLCBuYW1lLCBzdXJuYW1lLCBlbWFpbH0pID0+IHtcclxuICAgIGNvbnN0IG5ld0l0ZW0gPSBjcmVhdGVJdGVtKHsgaWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pO1xyXG5cclxuICAgIGl0ZW1zW2lkXSA9IG5ld0l0ZW07XHJcblxyXG4gICAgYWRkSXRlbShuZXdJdGVtKTtcclxufVxyXG5cclxuY29uc3QgdXBkYXRlSXRlbSA9IChpZCkgPT4ge1xyXG4gICAgbm90aWZ5KFVQREFURV9SRVFVRVNULCB7IGlkIH0pO1xyXG59O1xyXG5cclxuY29uc3QgZGVsZXRlSXRlbSA9IChpZCkgPT4ge1xyXG4gICAgbm90aWZ5KERFTEVURV9SRVFVRVNULCB7IGlkIH0pO1xyXG59O1xyXG5cclxuLy8gbWVzc2FnZSBidXNcclxub2JzZXJ2ZU1lc3NhZ2VzKElOSVRfTElTVCwgKGFkZHJlc3NCb29rKSA9PiB7XHJcbiAgICBPYmplY3RcclxuICAgICAgICAudmFsdWVzKGFkZHJlc3NCb29rKVxyXG4gICAgICAgIC5mb3JFYWNoKGFkZFNpbmdsZUl0ZW0pO1xyXG59KTtcclxuXHJcbm9ic2VydmVNZXNzYWdlcyhBRERfVE9fTElTVCwgYWRkU2luZ2xlSXRlbSk7XHJcblxyXG5vYnNlcnZlTWVzc2FnZXMoVVBEQVRFX0xJU1QsICh7aWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pID0+IHtcclxuICAgIGl0ZW1zW2lkXS5xdWVyeVNlbGVjdG9yKCcuaXRlbS1sYWJlbCcpLnRleHRDb250ZW50ID0gaXRlbVRleHQoeyBuYW1lLCBzdXJuYW1lLCBlbWFpbCB9KTtcclxufSk7XHJcblxyXG5vYnNlcnZlTWVzc2FnZXMoUkVNT1ZFX0ZST01fTElTVCwgKHsgaWQgfSkgPT4ge1xyXG4gICAgJGxpc3QucmVtb3ZlQ2hpbGQoaXRlbXNbaWRdKTtcclxuICAgIGRlbGV0ZSBpdGVtc1tpZF07XHJcbn0pO1xyXG5cclxuLy8gdXNlciBpbnRlcmFjdGlvblxyXG4kbGlzdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgY29uc3QgeyBhY3Rpb24sIGNvbnRhY3RJZCB9ID0gZXZlbnQudGFyZ2V0LmN1c3RvbURhdGE7XHJcblxyXG4gICAgc3dpdGNoIChhY3Rpb24pIHtcclxuICAgIGNhc2UgJ2VkaXQnOlxyXG4gICAgICAgIHVwZGF0ZUl0ZW0oY29udGFjdElkKTtcclxuICAgICAgICBicmVhaztcclxuICAgIGNhc2UgJ2RlbGV0ZSc6XHJcbiAgICAgICAgZGVsZXRlSXRlbShjb250YWN0SWQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG59KTsiLCJpbXBvcnQgeyBORVdfQ09OVEFDVCwgRURJVF9DT05UQUNULCBVUERBVEVfQ09OVEFDVCB9IGZyb20gJy4uL2NvbnN0YW50cy9jaGFubmVscy5qcyc7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgdmFsaWRhdGVOYW1lLCB2YWxpZGF0ZVN1cm5hbWUsIHZhbGlkYXRlQ291bnRyeSwgdmFsaWRhdGVFbWFpbFxyXG59IGZyb20gJy4uLy4uL2FwcC91dGlscy92YWxpZGF0b3IudXRpbC5qcyc7XHJcbmltcG9ydCB7IG5vdGlmeSwgc3Vic2NyaWJlIGFzIG9ic2VydmVNZXNzYWdlcyB9IGZyb20gJy4uL2hlbHBlcnMvbWVzc2FnZS1idXMuaGVscGVyLmpzJztcclxuaW1wb3J0IHsgY29tcG9zZSB9IGZyb20gJy4uL3V0aWxzL2ZwLnV0aWwuanMnO1xyXG5cclxuLy8gbWFpbiBlbGVtZW50XHJcbmNvbnN0ICRkaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGlhbG9nLW1hbmFnZScpO1xyXG5jb25zdCAkZm9ybSA9ICRkaWFsb2cucXVlcnlTZWxlY3RvcignLmZvcm0nKTtcclxuXHJcbi8vIGNvbnRhaW5lcnNcclxuY29uc3QgJG5hbWVDb250YWluZXIgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcubmFtZS1jb250YWluZXInKTtcclxuY29uc3QgJHN1cm5hbWVDb250YWluZXIgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuc3VybmFtZS1jb250YWluZXInKTtcclxuY29uc3QgJGVtYWlsQ29udGFpbmVyID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmVtYWlsLWNvbnRhaW5lcicpO1xyXG5cclxuLy8gaW5wdXRzXHJcbmNvbnN0ICRpZCA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5pZCcpO1xyXG5jb25zdCAkbmFtZSA9ICRuYW1lQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJyk7XHJcbmNvbnN0ICRzdXJuYW1lID0gJHN1cm5hbWVDb250YWluZXIucXVlcnlTZWxlY3RvcignLnN1cm5hbWUnKTtcclxuLy9jb25zdCBjb3VudHJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50cnknKTtcclxuY29uc3QgJGVtYWlsID0gJGVtYWlsQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5lbWFpbCcpO1xyXG5cclxuLy8gbWV0aG9kc1xyXG5jb25zdCBnZXRWYWx1ZXMgPSAoKSA9PiAoe1xyXG4gICAgaWQ6ICRpZC52YWx1ZSxcclxuICAgIG5hbWU6ICRuYW1lLnZhbHVlLFxyXG4gICAgc3VybmFtZTogJHN1cm5hbWUudmFsdWUsXHJcbiAgICBlbWFpbDogJGVtYWlsLnZhbHVlLFxyXG59KTtcclxuXHJcbmNvbnN0IGNsb3NlRm9ybSA9ICgpID0+IHtcclxuICAgICRkaWFsb2cuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAkaWQudmFsdWUgPSAnJztcclxuICAgICRmb3JtLnJlc2V0KCk7XHJcbn07XHJcblxyXG5jb25zdCB2YWxpZGF0ZUZvcm0gPVxyXG4gICAgICAobmFtZSwgc3VybmFtZSwgZW1haWwpID0+ICh7XHJcbiAgICAgICAgICBuYW1lOiB2YWxpZGF0ZU5hbWUobmFtZSksXHJcbiAgICAgICAgICBzdXJuYW1lOiB2YWxpZGF0ZVN1cm5hbWUoc3VybmFtZSksXHJcbiAgICAgICAgICBlbWFpbDogdmFsaWRhdGVFbWFpbChlbWFpbCksXHJcbiAgICAgIH0pO1xyXG5cclxuY29uc3QgbWFya0Vycm9ycyA9ICh7IG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pID0+IHtcclxuICAgICRuYW1lQ29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoJ2hhcy1lcnJvcicsICFuYW1lKTtcclxuICAgICRzdXJuYW1lQ29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoJ2hhcy1lcnJvcicsICFzdXJuYW1lKTtcclxuICAgICRlbWFpbENvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKCdoYXMtZXJyb3InLCAhZW1haWwpO1xyXG5cclxuICAgIHJldHVybiB7IG5hbWUsIHN1cm5hbWUsIGVtYWlsIH07XHJcbn07XHJcblxyXG5jb25zdCBjaGVja1ZhbGlkaXR5ID0gKHJlcG9ydCkgPT4gT2JqZWN0LnZhbHVlcyhyZXBvcnQpLmV2ZXJ5KChmaWVsZCkgPT4gZmllbGQgPT0gdHJ1ZSk7XHJcblxyXG5jb25zdCBhbGxHb29kID0gY29tcG9zZShjaGVja1ZhbGlkaXR5LCBtYXJrRXJyb3JzLCB2YWxpZGF0ZUZvcm0pO1xyXG5cclxuLy8gYWN0aW9uXHJcbiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT4ge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBjb25zdCB7IGlkLCBuYW1lLCBzdXJuYW1lLCBlbWFpbCB9ID0gZ2V0VmFsdWVzKCk7XHJcblxyXG4gICAgaWYgKCFhbGxHb29kKG5hbWUsIHN1cm5hbWUsIGVtYWlsKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaWQpIHtcclxuICAgICAgICBub3RpZnkoVVBEQVRFX0NPTlRBQ1QsIHsgaWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBub3RpZnkoTkVXX0NPTlRBQ1QsIHsgbmFtZSwgc3VybmFtZSwgZW1haWwgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2VGb3JtKCk7XHJcbn0pO1xyXG5cclxub2JzZXJ2ZU1lc3NhZ2VzKEVESVRfQ09OVEFDVCwgKHsgaWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pID0+IHtcclxuICAgICRpZC52YWx1ZSA9IGlkO1xyXG4gICAgJG5hbWUudmFsdWUgPSBuYW1lO1xyXG4gICAgJHN1cm5hbWUudmFsdWUgPSBzdXJuYW1lO1xyXG4gICAgJGVtYWlsLnZhbHVlID0gZW1haWw7XHJcblxyXG4gICAgJGRpYWxvZy5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxufSk7Il19
