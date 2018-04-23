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

},{"../utils/fp.util.js":7}],4:[function(require,module,exports){
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

},{"./constants/channels.js":1,"./constants/databases.js":2,"./helpers/message-bus.helper.js":3,"./services/db.service.js":5,"./view-controllers/delete.js":11,"./view-controllers/list.js":12,"./view-controllers/manage.js":13}],5:[function(require,module,exports){
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

},{"../constants/databases.js":2,"../utils/local-storage.util.js":8}],6:[function(require,module,exports){
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

},{"../utils/text.util.js":9}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"../constants/channels.js":1,"../helpers/message-bus.helper.js":3,"../utils/text.util.js":9}],12:[function(require,module,exports){
'use strict';

var _channels = require('../constants/channels.js');

var _messageBusHelper = require('../helpers/message-bus.helper.js');

var _fpUtil = require('../utils/fp.util.js');

var _textUtil = require('../utils/text.util.js');

var _domItemUtil = require('../utils/dom.item.util.js');

// module data
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

    var newItem = (0, _domItemUtil.createItem)({ id: id, name: name, surname: surname, email: email });

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

},{"../constants/channels.js":1,"../helpers/message-bus.helper.js":3,"../utils/dom.item.util.js":6,"../utils/fp.util.js":7,"../utils/text.util.js":9}],13:[function(require,module,exports){
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

},{"../../app/utils/validator.util.js":10,"../constants/channels.js":1,"../helpers/message-bus.helper.js":3,"../utils/fp.util.js":7}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvY29uc3RhbnRzL2NoYW5uZWxzLmpzIiwiYXBwL2NvbnN0YW50cy9kYXRhYmFzZXMuanMiLCJhcHAvaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zZXJ2aWNlcy9kYi5zZXJ2aWNlLmpzIiwiYXBwL3V0aWxzL2RvbS5pdGVtLnV0aWwuanMiLCJhcHAvdXRpbHMvZnAudXRpbC5qcyIsImFwcC91dGlscy9sb2NhbC1zdG9yYWdlLnV0aWwuanMiLCJhcHAvdXRpbHMvdGV4dC51dGlsLmpzIiwiYXBwL3V0aWxzL3ZhbGlkYXRvci51dGlsLmpzIiwiYXBwL3ZpZXctY29udHJvbGxlcnMvZGVsZXRlLmpzIiwiYXBwL3ZpZXctY29udHJvbGxlcnMvbGlzdC5qcyIsImFwcC92aWV3LWNvbnRyb2xsZXJzL21hbmFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQUE7QUFDTyxJQUFNLHNDQUFlLGNBQXJCOztBQUVQO0FBQ08sSUFBTSxvQ0FBYyxhQUFwQjtBQUNBLElBQU0sMENBQWlCLGdCQUF2Qjs7QUFFUDtBQUNPLElBQU0sMENBQWlCLGdCQUF2Qjs7QUFFUDtBQUNPLElBQU0sMENBQWlCLGdCQUF2QjtBQUNBLElBQU0sd0NBQWdCLGVBQXRCOztBQUVQO0FBQ08sSUFBTSxnQ0FBWSxXQUFsQjtBQUNBLElBQU0sb0NBQWMsYUFBcEI7QUFDQSxJQUFNLG9DQUFjLGFBQXBCO0FBQ0EsSUFBTSw4Q0FBbUIsa0JBQXpCOztBQUVQO0FBQ08sSUFBTSwwQ0FBaUIsZ0JBQXZCO0FBQ0EsSUFBTSwwQ0FBaUIsZ0JBQXZCOzs7Ozs7OztBQ3RCQSxJQUFNLDRCQUFVLFNBQWhCO0FBQ0EsSUFBTSxzQ0FBZSxjQUFyQjs7Ozs7Ozs7OztBQ0RQOztBQUVBLElBQU0sY0FBYyxFQUFwQjs7QUFFTyxJQUFNLGdDQUFZLFNBQVosU0FBWSxDQUFDLE9BQUQsRUFBVSxFQUFWLEVBQWlCO0FBQ3RDLFFBQUksQ0FBQyxjQUFjLE9BQWQsQ0FBTCxFQUE2QjtBQUN6QixvQkFBWSxPQUFaLElBQXVCLEVBQXZCO0FBQ0g7O0FBRUQsUUFBSSxPQUFPLEVBQVAsSUFBYSxVQUFqQixFQUE2QjtBQUN6QixvQkFBWSxPQUFaLEVBQXFCLElBQXJCLENBQTBCLEVBQTFCO0FBQ0o7QUFDSCxDQVJNOztBQVVBLElBQU0sb0NBQWMsU0FBZCxXQUFjLENBQUMsT0FBRCxFQUFVLEVBQVYsRUFBaUI7QUFDeEMsUUFBSSxjQUFjLE9BQWQsQ0FBSixFQUE0QjtBQUN4QixvQkFBWSxPQUFaLEVBQXFCLE1BQXJCLENBQTRCLFlBQVksT0FBWixDQUFvQixFQUFwQixDQUE1QixFQUFxRCxDQUFyRDtBQUNIO0FBQ0osQ0FKTTs7QUFNQSxJQUFNLDBCQUFTLFNBQVQsTUFBUyxDQUFDLE9BQUQsRUFBVSxPQUFWLEVBQXNCO0FBQ3hDLFFBQUksY0FBYyxPQUFkLENBQUosRUFBNEI7QUFDeEIsb0JBQVksT0FBWixFQUFxQixPQUFyQixDQUE2QixVQUFDLEVBQUQsRUFBUTtBQUNqQyxlQUFHLE9BQUg7QUFDSCxTQUZEO0FBR0g7QUFDSixDQU5NOztBQVFQLFNBQVMsYUFBVCxDQUF1QixPQUF2QixFQUFnQztBQUM1QixXQUFPLHFCQUFRLFdBQVIsRUFBcUIsT0FBckIsQ0FBUDtBQUNIOzs7OztBQzlCRDs7QUFjQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFNLGNBQWMsOENBQXFCLEVBQXJCLENBQXBCO0FBQ0EsSUFBSSxTQUFTLHlDQUFnQixFQUFDLE9BQU8sQ0FBUixFQUFoQixFQUE2QixLQUExQzs7QUFFQTtBQUNBLG1EQUFrQixXQUFsQjs7QUFFQTtBQUNBLHdEQUE2QixnQkFBNEI7QUFBQSxRQUExQixJQUEwQixRQUExQixJQUEwQjtBQUFBLFFBQXBCLE9BQW9CLFFBQXBCLE9BQW9CO0FBQUEsUUFBWCxLQUFXLFFBQVgsS0FBVzs7QUFDckQsY0FBVSxDQUFWOztBQUVBLFFBQU0sYUFBYTtBQUNmLFlBQUksTUFEVztBQUVmLGtCQUZlO0FBR2Ysd0JBSGU7QUFJZjtBQUplLEtBQW5COztBQU9BLGdCQUFZLE1BQVosSUFBc0IsVUFBdEI7O0FBRUEsMkJBQVMsRUFBRSxjQUFGLEVBQVUsd0JBQVYsRUFBVDtBQUNBLHlEQUFvQixVQUFwQjtBQUNILENBZEQ7O0FBZ0JBLDJEQUFnQyxpQkFBZ0M7QUFBQSxRQUE5QixFQUE4QixTQUE5QixFQUE4QjtBQUFBLFFBQTFCLElBQTBCLFNBQTFCLElBQTBCO0FBQUEsUUFBcEIsT0FBb0IsU0FBcEIsT0FBb0I7QUFBQSxRQUFYLEtBQVcsU0FBWCxLQUFXOztBQUM1RCxnQkFBWSxFQUFaLElBQWtCLEVBQUUsTUFBRixFQUFNLFVBQU4sRUFBWSxnQkFBWixFQUFxQixZQUFyQixFQUFsQjtBQUNBLDJCQUFTLEVBQUUsd0JBQUYsRUFBVDtBQUNBLHlEQUFvQixFQUFFLE1BQUYsRUFBTSxVQUFOLEVBQVksZ0JBQVosRUFBcUIsWUFBckIsRUFBcEI7QUFDSCxDQUpEOztBQU1BO0FBQ0EsMkRBQWdDLGlCQUFVO0FBQUEsUUFBUixFQUFRLFNBQVIsRUFBUTs7QUFDdEMsV0FBTyxZQUFZLEVBQVosQ0FBUDtBQUNBLDJCQUFTLEVBQUUsd0JBQUYsRUFBVDtBQUNBLDhEQUF5QixFQUFFLE1BQUYsRUFBekI7QUFDSCxDQUpEOztBQU1BO0FBQ0EsMkRBQWdDLGlCQUFZO0FBQUEsUUFBVCxFQUFTLFNBQVQsRUFBUzs7QUFDeEMsNERBQXVCLEVBQUUsTUFBRixFQUFNLFNBQVMsWUFBWSxFQUFaLENBQWYsRUFBdkI7QUFDSCxDQUZEOztBQUlBLDJEQUFnQyxpQkFBWTtBQUFBLFFBQVQsRUFBUyxTQUFULEVBQVM7O0FBQ3hDLDBEQUFxQixZQUFZLEVBQVosQ0FBckI7QUFDSCxDQUZEOzs7Ozs7Ozs7O0FDdEVBOztBQUNBOztBQUVPLElBQU0sMEJBQVMsU0FBVCxNQUFTLE9BQTJCO0FBQUEsUUFBekIsTUFBeUIsUUFBekIsTUFBeUI7QUFBQSxRQUFqQixXQUFpQixRQUFqQixXQUFpQjs7QUFDN0MsUUFBSSxNQUFKLEVBQVk7QUFDUix1REFBYSxLQUFLLFNBQUwsQ0FBZSxFQUFDLE9BQU8sTUFBUixFQUFmLENBQWI7QUFDSDs7QUFFRCxRQUFJLFdBQUosRUFBaUI7QUFDYiw0REFBa0IsS0FBSyxTQUFMLENBQWUsV0FBZixDQUFsQjtBQUNIO0FBQ0osQ0FSTTs7QUFVQSxJQUFNLHNCQUFPLFNBQVAsSUFBTyxDQUFDLEdBQUQ7QUFBQSxRQUFNLFFBQU4sdUVBQWlCLElBQWpCO0FBQUEsV0FBMEIsMkJBQUksR0FBSixLQUFZLFFBQXRDO0FBQUEsQ0FBYjs7Ozs7Ozs7OztBQ2JQOztBQUVBLElBQU0sY0FBYyxTQUFkLFdBQWMsQ0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQixPQUFoQixFQUF5QixLQUF6QjtBQUFBLFdBQ2hCLE9BQU8sTUFBUCxDQUFjLFNBQVMsYUFBVCxDQUF1QixLQUF2QixDQUFkLEVBQTZDO0FBQ3pDLG1CQUFXLFlBRDhCO0FBRXpDLHFCQUFhLHdCQUFTLEVBQUUsVUFBRixFQUFRLGdCQUFSLEVBQWlCLFlBQWpCLEVBQVQ7QUFGNEIsS0FBN0MsQ0FEZ0I7QUFBQSxDQUFwQjs7QUFNQSxJQUFNLGVBQWUsU0FBZixZQUFlLENBQUMsU0FBRCxFQUFZLFdBQVosRUFBeUIsSUFBekIsRUFBK0IsRUFBL0IsRUFBc0M7QUFDdkQsUUFBTSxVQUFVLFNBQVMsYUFBVCxDQUF1QixRQUF2QixDQUFoQjs7QUFFQSxZQUFRLFVBQVIsR0FBcUI7QUFDakIsbUJBQVcsRUFETTtBQUVqQixnQkFBUTtBQUZTLEtBQXJCOztBQUtBLFlBQVEsU0FBUixHQUFvQixTQUFwQjtBQUNBLFlBQVEsV0FBUixHQUFzQixXQUF0Qjs7QUFFQSxXQUFPLE9BQVA7QUFDSCxDQVpEOztBQWNBLElBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQixDQUFDLEVBQUQ7QUFBQSxXQUFRLGFBQWEsVUFBYixFQUF5QixNQUF6QixFQUFpQyxNQUFqQyxFQUF5QyxFQUF6QyxDQUFSO0FBQUEsQ0FBekI7O0FBRUEsSUFBTSxxQkFBcUIsU0FBckIsa0JBQXFCLENBQUMsRUFBRDtBQUFBLFdBQVEsYUFBYSxZQUFiLEVBQTJCLFFBQTNCLEVBQXFDLFFBQXJDLEVBQStDLEVBQS9DLENBQVI7QUFBQSxDQUEzQjs7QUFFTyxJQUFNLGtDQUFhLFNBQWIsVUFBYSxPQUEyQztBQUFBLFFBQXhDLEVBQXdDLFFBQXhDLEVBQXdDO0FBQUEsUUFBcEMsSUFBb0MsUUFBcEMsSUFBb0M7QUFBQSxRQUE5QixPQUE4QixRQUE5QixPQUE4QjtBQUFBLFFBQXJCLE9BQXFCLFFBQXJCLE9BQXFCO0FBQUEsUUFBWixLQUFZLFFBQVosS0FBWTs7QUFDakUsUUFBTSxLQUFLLFNBQVMsYUFBVCxDQUF1QixJQUF2QixDQUFYOztBQUVBLE9BQUcsU0FBSCxHQUFlLE1BQWY7O0FBRUEsT0FBRyxXQUFILENBQWUsWUFBWSxJQUFaLEVBQWtCLE9BQWxCLEVBQTJCLE9BQTNCLEVBQW9DLEtBQXBDLENBQWY7QUFDQSxPQUFHLFdBQUgsQ0FBZSxpQkFBaUIsRUFBakIsQ0FBZjtBQUNBLE9BQUcsV0FBSCxDQUFlLG1CQUFtQixFQUFuQixDQUFmOztBQUVBLFdBQU8sRUFBUDtBQUNILENBVk07Ozs7Ozs7Ozs7O0FDMUJBLElBQU0sNEJBQ1QsU0FEUyxPQUNUO0FBQUEsc0NBQUksU0FBSjtBQUFJLGlCQUFKO0FBQUE7O0FBQUEsV0FBa0IsWUFBZ0I7QUFBQSwyQ0FBWixPQUFZO0FBQVosbUJBQVk7QUFBQTs7QUFDOUIsWUFBTSxZQUFZLFVBQVUsTUFBVixHQUFtQixDQUFyQzs7QUFFQSxlQUFPLFVBQVUsV0FBVixDQUNILFVBQUMsS0FBRCxFQUFRLEVBQVIsRUFBWSxLQUFaO0FBQUEsbUJBQXNCLFVBQVUsU0FBVixHQUFzQix1Q0FBTSxLQUFOLEVBQXRCLEdBQXFDLEdBQUcsS0FBSCxDQUEzRDtBQUFBLFNBREcsRUFFSCxPQUZHLENBQVA7QUFJSCxLQVBEO0FBQUEsQ0FERzs7QUFVQSxJQUFNLDRCQUNULFNBRFMsT0FDVCxDQUFDLE1BQUQsRUFBUyxJQUFUO0FBQUEsV0FBa0IsT0FBTyxjQUFQLENBQXNCLElBQXRCLENBQWxCO0FBQUEsQ0FERzs7Ozs7Ozs7Y0NWa0IsTTtJQUFqQixZLFdBQUEsWTtBQUVELElBQU0sb0JBQU0sU0FBTixHQUFNLENBQUMsR0FBRCxFQUFNLEtBQU4sRUFBZ0I7QUFDL0IsaUJBQWEsT0FBYixDQUFxQixHQUFyQixFQUEwQixLQUExQjtBQUNILENBRk07O0FBSUEsSUFBTSxvQkFBTSxTQUFOLEdBQU0sQ0FBQyxHQUFELEVBQVM7QUFDeEIsUUFBTSxTQUFTLGFBQWEsT0FBYixDQUFxQixHQUFyQixDQUFmOztBQUVBLFdBQU8sVUFBVSxJQUFWLEdBQWlCLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBakIsR0FBc0MsSUFBN0M7QUFDSCxDQUpNOzs7Ozs7OztBQ05BLElBQU0sOEJBQVcsU0FBWCxRQUFXO0FBQUEsTUFBRSxJQUFGLFFBQUUsSUFBRjtBQUFBLE1BQVEsT0FBUixRQUFRLE9BQVI7QUFBQSwwQkFBaUIsT0FBakI7QUFBQSxNQUFpQixPQUFqQixnQ0FBMkIsSUFBM0I7QUFBQSxNQUFpQyxLQUFqQyxRQUFpQyxLQUFqQztBQUFBLFNBQStDLElBQS9DLFNBQXVELE9BQXZELFVBQW1FLE9BQW5FLFdBQWdGLEtBQWhGO0FBQUEsQ0FBakI7Ozs7Ozs7O0FDQVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxJQUFNLHNDQUNULFNBRFMsWUFDVCxDQUFDLElBQUQ7QUFBQSxXQUNJLE9BQU8sSUFBUCxJQUFlLFFBQWYsSUFDQSxLQUFLLE1BQUwsR0FBYyxDQURkLElBRUEsUUFBUSxJQUFSLENBQWEsS0FBSyxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQixDQUFiLENBSEo7QUFBQSxDQURHOztBQU1BLElBQU0sNENBQ1QsU0FEUyxlQUNULENBQUMsT0FBRCxFQUFhO0FBQ1QsUUFBSSxPQUFPLE9BQVAsSUFBa0IsUUFBdEIsRUFBZ0M7QUFDNUIsZUFBTyxLQUFQO0FBQ0g7O0FBRUQsUUFBTSxvQkFBb0IsUUFBUSxPQUFSLENBQWdCLEtBQWhCLEVBQXVCLEVBQXZCLENBQTFCOztBQUVBLFdBQU8sWUFBWSxFQUFaLElBQWtCLFFBQVEsSUFBUixDQUFhLGlCQUFiLENBQXpCO0FBQ0gsQ0FURTs7QUFXQSxJQUFNLDRDQUFrQixTQUFsQixlQUFrQjtBQUFBLFdBQU0sSUFBTjtBQUFBLENBQXhCOztBQUVQO0FBQ0EsSUFBTSxhQUFhLHVJQUFuQjs7QUFFTyxJQUFNLHdDQUNULFNBRFMsYUFDVCxDQUFDLEtBQUQ7QUFBQSxXQUNJLE9BQU8sS0FBUCxJQUFnQixRQUFoQixJQUNBLFdBQVcsSUFBWCxDQUFnQixLQUFoQixDQUZKO0FBQUEsQ0FERzs7Ozs7QUM1QlA7O0FBQ0E7O0FBQ0E7O0FBRUE7QUFDQSxJQUFJLE1BQU0sSUFBVjs7QUFFQTtBQUNBLElBQU0sVUFBVSxTQUFTLGFBQVQsQ0FBdUIsZ0JBQXZCLENBQWhCO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFzQixPQUF0QixDQUFkOztBQUVBLElBQU0sTUFBTSxNQUFNLGFBQU4sQ0FBb0IsS0FBcEIsQ0FBWjtBQUNBLElBQU0sV0FBVyxNQUFNLGFBQU4sQ0FBb0Isa0JBQXBCLENBQWpCOztBQUVBLElBQU0sT0FBTyxNQUFNLGFBQU4sQ0FBb0IsV0FBcEIsQ0FBYjtBQUNBLElBQU0sTUFBTSxNQUFNLGFBQU4sQ0FBb0IsVUFBcEIsQ0FBWjs7QUFFQTtBQUNBLElBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLEdBQTJCO0FBQUEsUUFBMUIsRUFBMEIsdUVBQXJCLEVBQXFCO0FBQUEsUUFBakIsT0FBaUIsdUVBQVAsRUFBTzs7QUFDN0MsUUFBSSxLQUFKLEdBQVksRUFBWjtBQUNBLGFBQVMsV0FBVCxHQUF1Qix3QkFBUyxPQUFULENBQXZCO0FBQ0gsQ0FIRDs7QUFLQSxJQUFNLGVBQWUsU0FBZixZQUFlLENBQUMsTUFBRDtBQUFBLFdBQVksWUFBTTtBQUNuQyxnQkFBUSxTQUFSLENBQWtCLE1BQWxCLENBQXlCLFdBQXpCLEVBQXNDLE1BQXRDO0FBQ0gsS0FGb0I7QUFBQSxDQUFyQjtBQUdBLElBQU0sYUFBYSxhQUFhLElBQWIsQ0FBbkI7QUFDQSxJQUFNLGFBQWEsYUFBYSxLQUFiLENBQW5COztBQUVBLElBQU0sY0FBYyxTQUFkLFdBQWMsR0FBTTtBQUN0QixVQUFNLElBQU47QUFDQSxVQUFNLEtBQU47QUFDQTtBQUNBO0FBQ0gsQ0FMRDs7QUFPQTtBQUNBLDJEQUFnQyxnQkFBbUI7QUFBQSxRQUFqQixFQUFpQixRQUFqQixFQUFpQjtBQUFBLFFBQWIsT0FBYSxRQUFiLE9BQWE7O0FBQy9DLFVBQU0sRUFBTjtBQUNBLGtCQUFjLEVBQWQsRUFBa0IsT0FBbEI7QUFDQTtBQUNILENBSkQ7O0FBTUE7QUFDQSxLQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCLFVBQUMsS0FBRCxFQUFXO0FBQ3RDLFVBQU0sY0FBTjtBQUNBLDREQUF1QixFQUFFLElBQUksR0FBTixFQUF2QjtBQUNBO0FBQ0gsQ0FKRDs7QUFNQSxJQUFJLGdCQUFKLENBQXFCLE9BQXJCLEVBQThCLFVBQUMsS0FBRCxFQUFXO0FBQ3JDLFVBQU0sY0FBTjtBQUNBO0FBQ0gsQ0FIRDs7Ozs7QUNsREE7O0FBU0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7QUFDQSxJQUFNLFFBQVEsRUFBZDs7QUFFQTtBQUNBLElBQU0sUUFBUSxTQUFTLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBZDs7QUFFQTtBQUNBLElBQU0sVUFBVSxTQUFWLE9BQVUsQ0FBQyxJQUFELEVBQVU7QUFDdEIsVUFBTSxXQUFOLENBQWtCLElBQWxCO0FBQ0gsQ0FGRDs7QUFJQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixPQUFnQztBQUFBLFFBQTlCLEVBQThCLFFBQTlCLEVBQThCO0FBQUEsUUFBMUIsSUFBMEIsUUFBMUIsSUFBMEI7QUFBQSxRQUFwQixPQUFvQixRQUFwQixPQUFvQjtBQUFBLFFBQVgsS0FBVyxRQUFYLEtBQVc7O0FBQ2xELFFBQU0sVUFBVSw2QkFBVyxFQUFFLE1BQUYsRUFBTSxVQUFOLEVBQVksZ0JBQVosRUFBcUIsWUFBckIsRUFBWCxDQUFoQjs7QUFFQSxVQUFNLEVBQU4sSUFBWSxPQUFaOztBQUVBLFlBQVEsT0FBUjtBQUNILENBTkQ7O0FBUUEsSUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLEVBQUQsRUFBUTtBQUN2Qiw0REFBdUIsRUFBRSxNQUFGLEVBQXZCO0FBQ0gsQ0FGRDs7QUFJQSxJQUFNLGFBQWEsU0FBYixVQUFhLENBQUMsRUFBRCxFQUFRO0FBQ3ZCLDREQUF1QixFQUFFLE1BQUYsRUFBdkI7QUFDSCxDQUZEOztBQUlBO0FBQ0Esc0RBQTJCLFVBQUMsV0FBRCxFQUFpQjtBQUN4QyxXQUNLLE1BREwsQ0FDWSxXQURaLEVBRUssT0FGTCxDQUVhLGFBRmI7QUFHSCxDQUpEOztBQU1BLHdEQUE2QixhQUE3Qjs7QUFFQSx3REFBNkIsaUJBQWlDO0FBQUEsUUFBL0IsRUFBK0IsU0FBL0IsRUFBK0I7QUFBQSxRQUEzQixJQUEyQixTQUEzQixJQUEyQjtBQUFBLFFBQXJCLE9BQXFCLFNBQXJCLE9BQXFCO0FBQUEsUUFBWixLQUFZLFNBQVosS0FBWTs7QUFDMUQsVUFBTSxFQUFOLEVBQVUsYUFBVixDQUF3QixhQUF4QixFQUF1QyxXQUF2QyxHQUFxRCx3QkFBUyxFQUFFLFVBQUYsRUFBUSxnQkFBUixFQUFpQixZQUFqQixFQUFULENBQXJEO0FBQ0gsQ0FGRDs7QUFJQSw2REFBa0MsaUJBQVk7QUFBQSxRQUFULEVBQVMsU0FBVCxFQUFTOztBQUMxQyxVQUFNLFdBQU4sQ0FBa0IsTUFBTSxFQUFOLENBQWxCO0FBQ0EsV0FBTyxNQUFNLEVBQU4sQ0FBUDtBQUNILENBSEQ7O0FBS0E7QUFDQSxNQUFNLGdCQUFOLENBQXVCLE9BQXZCLEVBQWdDLFVBQUMsS0FBRCxFQUFXO0FBQUEsZ0NBQ1QsTUFBTSxNQUFOLENBQWEsVUFESjtBQUFBLFFBQy9CLE1BRCtCLHlCQUMvQixNQUQrQjtBQUFBLFFBQ3ZCLFNBRHVCLHlCQUN2QixTQUR1Qjs7O0FBR3ZDLFlBQVEsTUFBUjtBQUNBLGFBQUssTUFBTDtBQUNJLHVCQUFXLFNBQVg7QUFDQTtBQUNKLGFBQUssUUFBTDtBQUNJLHVCQUFXLFNBQVg7QUFDQTtBQU5KO0FBUUgsQ0FYRDs7Ozs7QUM1REE7O0FBRUE7O0FBR0E7O0FBQ0E7O0FBRUE7QUFDQSxJQUFNLFVBQVUsU0FBUyxhQUFULENBQXVCLGdCQUF2QixDQUFoQjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBc0IsT0FBdEIsQ0FBZDs7QUFFQTtBQUNBLElBQU0saUJBQWlCLE1BQU0sYUFBTixDQUFvQixpQkFBcEIsQ0FBdkI7QUFDQSxJQUFNLG9CQUFvQixNQUFNLGFBQU4sQ0FBb0Isb0JBQXBCLENBQTFCO0FBQ0EsSUFBTSxrQkFBa0IsTUFBTSxhQUFOLENBQW9CLGtCQUFwQixDQUF4Qjs7QUFFQTtBQUNBLElBQU0sTUFBTSxNQUFNLGFBQU4sQ0FBb0IsS0FBcEIsQ0FBWjtBQUNBLElBQU0sUUFBUSxlQUFlLGFBQWYsQ0FBNkIsT0FBN0IsQ0FBZDtBQUNBLElBQU0sV0FBVyxrQkFBa0IsYUFBbEIsQ0FBZ0MsVUFBaEMsQ0FBakI7QUFDQTtBQUNBLElBQU0sU0FBUyxnQkFBZ0IsYUFBaEIsQ0FBOEIsUUFBOUIsQ0FBZjs7QUFFQTtBQUNBLElBQU0sWUFBWSxTQUFaLFNBQVk7QUFBQSxXQUFPO0FBQ3JCLFlBQUksSUFBSSxLQURhO0FBRXJCLGNBQU0sTUFBTSxLQUZTO0FBR3JCLGlCQUFTLFNBQVMsS0FIRztBQUlyQixlQUFPLE9BQU87QUFKTyxLQUFQO0FBQUEsQ0FBbEI7O0FBT0EsSUFBTSxZQUFZLFNBQVosU0FBWSxHQUFNO0FBQ3BCLFlBQVEsU0FBUixDQUFrQixNQUFsQixDQUF5QixXQUF6QjtBQUNBLFFBQUksS0FBSixHQUFZLEVBQVo7QUFDQSxVQUFNLEtBQU47QUFDSCxDQUpEOztBQU1BLElBQU0sZUFDQSxTQURBLFlBQ0EsQ0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQixLQUFoQjtBQUFBLFdBQTJCO0FBQ3ZCLGNBQU0saUNBQWEsSUFBYixDQURpQjtBQUV2QixpQkFBUyxvQ0FBZ0IsT0FBaEIsQ0FGYztBQUd2QixlQUFPLGtDQUFjLEtBQWQ7QUFIZ0IsS0FBM0I7QUFBQSxDQUROOztBQU9BLElBQU0sYUFBYSxTQUFiLFVBQWEsT0FBOEI7QUFBQSxRQUEzQixJQUEyQixRQUEzQixJQUEyQjtBQUFBLFFBQXJCLE9BQXFCLFFBQXJCLE9BQXFCO0FBQUEsUUFBWixLQUFZLFFBQVosS0FBWTs7QUFDN0MsbUJBQWUsU0FBZixDQUF5QixNQUF6QixDQUFnQyxXQUFoQyxFQUE2QyxDQUFDLElBQTlDO0FBQ0Esc0JBQWtCLFNBQWxCLENBQTRCLE1BQTVCLENBQW1DLFdBQW5DLEVBQWdELENBQUMsT0FBakQ7QUFDQSxvQkFBZ0IsU0FBaEIsQ0FBMEIsTUFBMUIsQ0FBaUMsV0FBakMsRUFBOEMsQ0FBQyxLQUEvQzs7QUFFQSxXQUFPLEVBQUUsVUFBRixFQUFRLGdCQUFSLEVBQWlCLFlBQWpCLEVBQVA7QUFDSCxDQU5EOztBQVFBLElBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLENBQUMsTUFBRDtBQUFBLFdBQVksT0FBTyxNQUFQLENBQWMsTUFBZCxFQUFzQixLQUF0QixDQUE0QixVQUFDLEtBQUQ7QUFBQSxlQUFXLFNBQVMsSUFBcEI7QUFBQSxLQUE1QixDQUFaO0FBQUEsQ0FBdEI7O0FBRUEsSUFBTSxVQUFVLHFCQUFRLGFBQVIsRUFBdUIsVUFBdkIsRUFBbUMsWUFBbkMsQ0FBaEI7O0FBRUE7QUFDQSxNQUFNLGdCQUFOLENBQXVCLFFBQXZCLEVBQWlDLFVBQUMsS0FBRCxFQUFXO0FBQ3hDLFVBQU0sY0FBTjs7QUFEd0MscUJBR0gsV0FIRztBQUFBLFFBR2hDLEVBSGdDLGNBR2hDLEVBSGdDO0FBQUEsUUFHNUIsSUFINEIsY0FHNUIsSUFINEI7QUFBQSxRQUd0QixPQUhzQixjQUd0QixPQUhzQjtBQUFBLFFBR2IsS0FIYSxjQUdiLEtBSGE7O0FBS3hDLFFBQUksQ0FBQyxRQUFRLElBQVIsRUFBYyxPQUFkLEVBQXVCLEtBQXZCLENBQUwsRUFBb0M7QUFDaEM7QUFDSDs7QUFFRCxRQUFJLEVBQUosRUFBUTtBQUNKLGdFQUF1QixFQUFFLE1BQUYsRUFBTSxVQUFOLEVBQVksZ0JBQVosRUFBcUIsWUFBckIsRUFBdkI7QUFDSCxLQUZELE1BRU87QUFDSCw2REFBb0IsRUFBRSxVQUFGLEVBQVEsZ0JBQVIsRUFBaUIsWUFBakIsRUFBcEI7QUFDSDs7QUFFRDtBQUNILENBaEJEOztBQWtCQSx5REFBOEIsaUJBQWtDO0FBQUEsUUFBL0IsRUFBK0IsU0FBL0IsRUFBK0I7QUFBQSxRQUEzQixJQUEyQixTQUEzQixJQUEyQjtBQUFBLFFBQXJCLE9BQXFCLFNBQXJCLE9BQXFCO0FBQUEsUUFBWixLQUFZLFNBQVosS0FBWTs7QUFDNUQsUUFBSSxLQUFKLEdBQVksRUFBWjtBQUNBLFVBQU0sS0FBTixHQUFjLElBQWQ7QUFDQSxhQUFTLEtBQVQsR0FBaUIsT0FBakI7QUFDQSxXQUFPLEtBQVAsR0FBZSxLQUFmOztBQUVBLFlBQVEsU0FBUixDQUFrQixHQUFsQixDQUFzQixXQUF0QjtBQUNILENBUEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBtYWluIC0+IGZvcm1cclxuZXhwb3J0IGNvbnN0IEVESVRfQ09OVEFDVCA9ICdlZGl0LWNvbnRhY3QnO1xyXG5cclxuLy8gZm9ybSAtPiBtYWluXHJcbmV4cG9ydCBjb25zdCBORVdfQ09OVEFDVCA9ICduZXctY29udGFjdCc7XHJcbmV4cG9ydCBjb25zdCBVUERBVEVfQ09OVEFDVCA9ICd1cGRhdGUtY29udGFjdCc7XHJcblxyXG4vLyBtYWluIC0+IGRlbGV0ZVxyXG5leHBvcnQgY29uc3QgREVMRVRFX0NPTlRBQ1QgPSAnZGVsZXRlLWNvbnRhY3QnO1xyXG5cclxuLy8gZGVsZXRlIC0+IG1haW5cclxuZXhwb3J0IGNvbnN0IERFTEVURV9DT05GSVJNID0gJ2RlbGV0ZS1jb25maXJtJztcclxuZXhwb3J0IGNvbnN0IERFTEVURV9DQU5DRUwgPSAnZGVsZXRlLWNhbmNlbCc7XHJcblxyXG4vLyBtYWluIC0+IGxpc3RcclxuZXhwb3J0IGNvbnN0IElOSVRfTElTVCA9ICdpbml0LWxpc3QnO1xyXG5leHBvcnQgY29uc3QgQUREX1RPX0xJU1QgPSAnYWRkLXRvLWxpc3QnO1xyXG5leHBvcnQgY29uc3QgVVBEQVRFX0xJU1QgPSAndXBkYXRlLWxpc3QnO1xyXG5leHBvcnQgY29uc3QgUkVNT1ZFX0ZST01fTElTVCA9ICdyZW1vdmUtZnJvbS1saXN0JztcclxuXHJcbi8vIGxpc3QgLT4gbWFpblxyXG5leHBvcnQgY29uc3QgVVBEQVRFX1JFUVVFU1QgPSAndXBkYXRlLXJlcXVlc3QnO1xyXG5leHBvcnQgY29uc3QgREVMRVRFX1JFUVVFU1QgPSAnZGVsZXRlLXJlcXVlc3QnOyIsImV4cG9ydCBjb25zdCBMQVNUX0lEID0gJ2xhc3QtaWQnO1xyXG5leHBvcnQgY29uc3QgQUREUkVTU19CT09LID0gJ2FkZHJlc3MtYm9vayc7IiwiaW1wb3J0IHsgaGFzUHJvcCB9IGZyb20gJy4uL3V0aWxzL2ZwLnV0aWwuanMnO1xyXG5cclxuY29uc3Qgc3Vic2NyaWJlcnMgPSB7fTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdWJzY3JpYmUgPSAoY2hhbm5lbCwgZm4pID0+IHtcclxuICAgIGlmICghY2hhbm5lbEV4aXN0cyhjaGFubmVsKSkge1xyXG4gICAgICAgIHN1YnNjcmliZXJzW2NoYW5uZWxdID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgc3Vic2NyaWJlcnNbY2hhbm5lbF0ucHVzaChmbik7XHJcbiAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB1bnN1YnNjcmliZSA9IChjaGFubmVsLCBmbikgPT4ge1xyXG4gICAgaWYgKGNoYW5uZWxFeGlzdHMoY2hhbm5lbCkpIHtcclxuICAgICAgICBzdWJzY3JpYmVyc1tjaGFubmVsXS5zcGxpY2Uoc3Vic2NyaWJlcnMuaW5kZXhPZihmbiksIDEpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IG5vdGlmeSA9IChjaGFubmVsLCBtZXNzYWdlKSA9PiB7XHJcbiAgICBpZiAoY2hhbm5lbEV4aXN0cyhjaGFubmVsKSkge1xyXG4gICAgICAgIHN1YnNjcmliZXJzW2NoYW5uZWxdLmZvckVhY2goKGZuKSA9PiB7XHJcbiAgICAgICAgICAgIGZuKG1lc3NhZ2UpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBjaGFubmVsRXhpc3RzKGNoYW5uZWwpIHtcclxuICAgIHJldHVybiBoYXNQcm9wKHN1YnNjcmliZXJzLCBjaGFubmVsKTtcclxufSIsImltcG9ydCB7XHJcbiAgICBFRElUX0NPTlRBQ1QsXHJcbiAgICBORVdfQ09OVEFDVCxcclxuICAgIFVQREFURV9DT05UQUNULFxyXG4gICAgREVMRVRFX0NPTlRBQ1QsXHJcbiAgICBJTklUX0xJU1QsXHJcbiAgICBBRERfVE9fTElTVCxcclxuICAgIFVQREFURV9MSVNULFxyXG4gICAgUkVNT1ZFX0ZST01fTElTVCxcclxuICAgIFVQREFURV9SRVFVRVNULFxyXG4gICAgREVMRVRFX1JFUVVFU1QsXHJcbiAgICBERUxFVEVfQ09ORklSTSxcclxufSBmcm9tICcuL2NvbnN0YW50cy9jaGFubmVscy5qcyc7XHJcblxyXG5pbXBvcnQgeyBBRERSRVNTX0JPT0ssIExBU1RfSUQgfSBmcm9tICcuL2NvbnN0YW50cy9kYXRhYmFzZXMuanMnO1xyXG5cclxuaW1wb3J0IHsgbm90aWZ5LCBzdWJzY3JpYmUgYXMgb2JzZXJ2ZU1lc3NhZ2VzIH0gZnJvbSAnLi9oZWxwZXJzL21lc3NhZ2UtYnVzLmhlbHBlci5qcyc7XHJcblxyXG5pbXBvcnQgeyB1cGRhdGUgYXMgdXBkYXRlRGIsIHJlYWQgYXMgcmVhZERiIH0gZnJvbSAnLi9zZXJ2aWNlcy9kYi5zZXJ2aWNlLmpzJztcclxuXHJcbmltcG9ydCAnLi92aWV3LWNvbnRyb2xsZXJzL2xpc3QuanMnO1xyXG5pbXBvcnQgJy4vdmlldy1jb250cm9sbGVycy9tYW5hZ2UuanMnO1xyXG5pbXBvcnQgJy4vdmlldy1jb250cm9sbGVycy9kZWxldGUuanMnO1xyXG5cclxuLy8gZWRpdGluZyBpdGVtXHJcbi8vIHJlbW92aW5nIGl0ZW1cclxuLy8gdmFsaWRhdGlvblxyXG5cclxuLy8gbG9jYWwgZGF0YVxyXG5jb25zdCBhZGRyZXNzQm9vayA9IHJlYWREYihBRERSRVNTX0JPT0ssIHt9KTtcclxubGV0IGxhc3RJZCA9IHJlYWREYihMQVNUX0lELCB7dmFsdWU6IDAgfSkudmFsdWU7XHJcblxyXG4vLyByZXN0b3JlXHJcbm5vdGlmeShJTklUX0xJU1QsIGFkZHJlc3NCb29rKTtcclxuXHJcbi8vIG1lc3NhZ2VzOiBmcm9tIC0+IG1haW5cclxub2JzZXJ2ZU1lc3NhZ2VzKE5FV19DT05UQUNULCAoe25hbWUsIHN1cm5hbWUsIGVtYWlsfSkgPT4ge1xyXG4gICAgbGFzdElkICs9IDE7XHJcblxyXG4gICAgY29uc3QgbmV3Q29udGFjdCA9IHtcclxuICAgICAgICBpZDogbGFzdElkLFxyXG4gICAgICAgIG5hbWUsXHJcbiAgICAgICAgc3VybmFtZSxcclxuICAgICAgICBlbWFpbCxcclxuICAgIH07XHJcblxyXG4gICAgYWRkcmVzc0Jvb2tbbGFzdElkXSA9IG5ld0NvbnRhY3Q7XHJcblxyXG4gICAgdXBkYXRlRGIoeyBsYXN0SWQsIGFkZHJlc3NCb29rIH0pO1xyXG4gICAgbm90aWZ5KEFERF9UT19MSVNULCBuZXdDb250YWN0KTtcclxufSk7XHJcblxyXG5vYnNlcnZlTWVzc2FnZXMoVVBEQVRFX0NPTlRBQ1QsICh7aWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsfSkgPT4ge1xyXG4gICAgYWRkcmVzc0Jvb2tbaWRdID0geyBpZCwgbmFtZSwgc3VybmFtZSwgZW1haWwgfTtcclxuICAgIHVwZGF0ZURiKHsgYWRkcmVzc0Jvb2sgfSk7XHJcbiAgICBub3RpZnkoVVBEQVRFX0xJU1QsIHsgaWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pO1xyXG59KTtcclxuXHJcbi8vIG1lc3NhZ2VzOiBkZWxldGUgLT4gbWFpblxyXG5vYnNlcnZlTWVzc2FnZXMoREVMRVRFX0NPTkZJUk0sICh7aWR9KSA9PiB7XHJcbiAgICBkZWxldGUgYWRkcmVzc0Jvb2tbaWRdO1xyXG4gICAgdXBkYXRlRGIoeyBhZGRyZXNzQm9vayB9KTtcclxuICAgIG5vdGlmeShSRU1PVkVfRlJPTV9MSVNULCB7IGlkIH0pO1xyXG59KTtcclxuXHJcbi8vIG1lc3NhZ2VzOiBsaXN0IC0+IG1haW5cclxub2JzZXJ2ZU1lc3NhZ2VzKERFTEVURV9SRVFVRVNULCAoeyBpZCB9KSA9PiB7XHJcbiAgICBub3RpZnkoREVMRVRFX0NPTlRBQ1QsIHsgaWQsIGNvbnRhY3Q6IGFkZHJlc3NCb29rW2lkXSB9KTtcclxufSk7XHJcblxyXG5vYnNlcnZlTWVzc2FnZXMoVVBEQVRFX1JFUVVFU1QsICh7IGlkIH0pID0+IHtcclxuICAgIG5vdGlmeShFRElUX0NPTlRBQ1QsIGFkZHJlc3NCb29rW2lkXSk7XHJcbn0pOyIsImltcG9ydCB7IExBU1RfSUQsIEFERFJFU1NfQk9PSyB9IGZyb20gJy4uL2NvbnN0YW50cy9kYXRhYmFzZXMuanMnO1xyXG5pbXBvcnQgeyBzZXQsIGdldCB9IGZyb20gJy4uL3V0aWxzL2xvY2FsLXN0b3JhZ2UudXRpbC5qcyc7XHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlID0gKHtsYXN0SWQsIGFkZHJlc3NCb29rfSkgPT4ge1xyXG4gICAgaWYgKGxhc3RJZCkge1xyXG4gICAgICAgIHNldChMQVNUX0lELCBKU09OLnN0cmluZ2lmeSh7dmFsdWU6IGxhc3RJZH0pKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWRkcmVzc0Jvb2spIHtcclxuICAgICAgICBzZXQoQUREUkVTU19CT09LLCBKU09OLnN0cmluZ2lmeShhZGRyZXNzQm9vaykpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlYWQgPSAoa2V5LCBmYWxsYmFjayA9IG51bGwpID0+IGdldChrZXkpIHx8IGZhbGxiYWNrOyIsImltcG9ydCB7IGl0ZW1UZXh0IH0gZnJvbSAnLi4vdXRpbHMvdGV4dC51dGlsLmpzJztcclxuXHJcbmNvbnN0IGNyZWF0ZUxhYmVsID0gKG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsKSA9PlxyXG4gICAgT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSwge1xyXG4gICAgICAgIGNsYXNzTmFtZTogJ2l0ZW0tbGFiZWwnLFxyXG4gICAgICAgIHRleHRDb250ZW50OiBpdGVtVGV4dCh7IG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pLFxyXG4gICAgfSk7XHJcblxyXG5jb25zdCBjcmVhdGVCdXR0b24gPSAoY2xhc3NOYW1lLCB0ZXh0Q29udGVudCwgdHlwZSwgaWQpID0+IHtcclxuICAgIGNvbnN0ICRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuXHJcbiAgICAkYnV0dG9uLmN1c3RvbURhdGEgPSB7XHJcbiAgICAgICAgY29udGFjdElkOiBpZCxcclxuICAgICAgICBhY3Rpb246IHR5cGUsXHJcbiAgICB9O1xyXG5cclxuICAgICRidXR0b24uY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgJGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHRDb250ZW50O1xyXG5cclxuICAgIHJldHVybiAkYnV0dG9uO1xyXG59O1xyXG5cclxuY29uc3QgY3JlYXRlRWRpdEJ1dHRvbiA9IChpZCkgPT4gY3JlYXRlQnV0dG9uKCdpdGVtRWRpdCcsICdFZGl0JywgJ2VkaXQnLCBpZCk7XHJcblxyXG5jb25zdCBjcmVhdGVEZWxldGVCdXR0b24gPSAoaWQpID0+IGNyZWF0ZUJ1dHRvbignaXRlbURlbGV0ZScsICdEZWxldGUnLCAnZGVsZXRlJywgaWQpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZUl0ZW0gPSAoeyBpZCwgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSkgPT4ge1xyXG4gICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG5cclxuICAgIGxpLmNsYXNzTmFtZSA9ICdpdGVtJztcclxuXHJcbiAgICBsaS5hcHBlbmRDaGlsZChjcmVhdGVMYWJlbChuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCkpO1xyXG4gICAgbGkuYXBwZW5kQ2hpbGQoY3JlYXRlRWRpdEJ1dHRvbihpZCkpO1xyXG4gICAgbGkuYXBwZW5kQ2hpbGQoY3JlYXRlRGVsZXRlQnV0dG9uKGlkKSk7XHJcblxyXG4gICAgcmV0dXJuIGxpO1xyXG59O1xyXG4iLCJleHBvcnQgY29uc3QgY29tcG9zZSA9XHJcbiAgICAoLi4uZnVuY3Rpb25zKSA9PiAoLi4uaW5pdGlhbCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IGZ1bmN0aW9ucy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb25zLnJlZHVjZVJpZ2h0KFxyXG4gICAgICAgICAgICAodmFsdWUsIGZuLCBpbmRleCkgPT4gaW5kZXggPT09IGxhc3RJbmRleCA/IGZuKC4uLnZhbHVlKSA6IGZuKHZhbHVlKSxcclxuICAgICAgICAgICAgaW5pdGlhbFxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhc1Byb3AgPVxyXG4gICAgKG9iamVjdCwgcHJvcCkgPT4gb2JqZWN0Lmhhc093blByb3BlcnR5KHByb3ApOyIsImNvbnN0IHsgbG9jYWxTdG9yYWdlIH0gPSB3aW5kb3c7XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0ID0gKGtleSwgdmFsdWUpID0+IHtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldCA9IChrZXkpID0+IHtcclxuICAgIGNvbnN0IG9iamVjdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcblxyXG4gICAgcmV0dXJuIG9iamVjdCAhPSBudWxsID8gSlNPTi5wYXJzZShvYmplY3QpIDogbnVsbDtcclxufSIsImV4cG9ydCBjb25zdCBpdGVtVGV4dCA9ICh7bmFtZSwgc3VybmFtZSwgY291bnRyeSA9ICctLScsIGVtYWlsfSkgPT4gYCR7bmFtZX0gJHtzdXJuYW1lfSAoJHtjb3VudHJ5fSksICR7ZW1haWx9YDsiLCIvLyBub3RlOlxyXG4vLyB2YWxpZGF0b3JzIGNvdWxkIHByb2JhYmx5IGJlIGltcHJvdmVkLFxyXG4vLyBhcyB0aGV5IGFsbG93IGZvciBuYW1lcyBsaWtlIOKAnEAjJC0oKeKAnSxcclxuLy8gYnV0IHRoaXMgY291bGQgdGFrZSBob3VycywgaWYgbm90IGRheXMsXHJcbi8vIHNvIGl0IHdhcyBsZWZ0IGF0IHRoZSB2ZXJ5IGJhc2ljIGZ1bmN0aW9uYWxpdHlcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZGF0ZU5hbWUgPVxyXG4gICAgKG5hbWUpID0+XHJcbiAgICAgICAgdHlwZW9mIG5hbWUgPT0gJ3N0cmluZycgJiZcclxuICAgICAgICBuYW1lLmxlbmd0aCA+IDAgJiZcclxuICAgICAgICAvW1xcd10rLy50ZXN0KG5hbWUucmVwbGFjZSgvXFxkL2csICcnKSk7XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRhdGVTdXJuYW1lID1cclxuICAgIChzdXJuYW1lKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzdXJuYW1lICE9ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5hbWVXaXRob3V0RGlnaXRzID0gc3VybmFtZS5yZXBsYWNlKC9cXGQvZywgJycpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3VybmFtZSA9PT0gJycgfHwgL1tcXHddKy8udGVzdChuYW1lV2l0aG91dERpZ2l0cyk7XHJcbiAgICB9O1xyXG5cclxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlQ291bnRyeSA9ICgpID0+IHRydWU7XHJcblxyXG4vLyBzb3VyY2U6IGh0dHBzOi8vd3d3LnJlZ3VsYXItZXhwcmVzc2lvbnMuaW5mby9lbWFpbC5odG1sXHJcbmNvbnN0IGVtYWlsUmVnZXggPSAvW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKyg/OlxcLlthLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSspKkAoPzpbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/XFwuKStbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/LztcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUVtYWlsID1cclxuICAgIChlbWFpbCkgPT5cclxuICAgICAgICB0eXBlb2YgZW1haWwgPT0gJ3N0cmluZycgJiZcclxuICAgICAgICBlbWFpbFJlZ2V4LnRlc3QoZW1haWwpOyIsImltcG9ydCB7IERFTEVURV9DT05UQUNULCBERUxFVEVfQ09ORklSTSB9IGZyb20gJy4uL2NvbnN0YW50cy9jaGFubmVscy5qcyc7XHJcbmltcG9ydCB7IG5vdGlmeSwgc3Vic2NyaWJlIGFzIG9ic2VydmVNZXNzYWdlcyB9IGZyb20gJy4uL2hlbHBlcnMvbWVzc2FnZS1idXMuaGVscGVyLmpzJztcclxuaW1wb3J0IHsgaXRlbVRleHQgfSBmcm9tICcuLi91dGlscy90ZXh0LnV0aWwuanMnO1xyXG5cclxuLy8gZGF0YVxyXG5sZXQgX2lkID0gbnVsbDtcclxuXHJcbi8vIGVsZW1lbnRzXHJcbmNvbnN0ICRkaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGlhbG9nLWRlbGV0ZScpO1xyXG5jb25zdCAkZm9ybSA9ICRkaWFsb2cucXVlcnlTZWxlY3RvcignLmZvcm0nKTtcclxuXHJcbmNvbnN0ICRpZCA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5pZCcpO1xyXG5jb25zdCAkZGV0YWlscyA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5jb250YWN0LWRldGFpbHMnKTtcclxuXHJcbmNvbnN0ICR5ZXMgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuZm9ybS15ZXMnKTtcclxuY29uc3QgJG5vID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmZvcm0tbm8nKTtcclxuXHJcbi8vIG1ldGhvZHNcclxuY29uc3QgdXBkYXRlRGV0YWlscyA9IChpZCA9ICcnLCBjb250YWN0ID0gJycpID0+IHtcclxuICAgICRpZC52YWx1ZSA9IGlkO1xyXG4gICAgJGRldGFpbHMudGV4dENvbnRlbnQgPSBpdGVtVGV4dChjb250YWN0KTtcclxufTtcclxuXHJcbmNvbnN0IHRvZ2dsZURpYWxvZyA9IChzdGF0dXMpID0+ICgpID0+IHtcclxuICAgICRkaWFsb2cuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJywgc3RhdHVzKTtcclxufTtcclxuY29uc3Qgc2hvd0RpYWxvZyA9IHRvZ2dsZURpYWxvZyh0cnVlKTtcclxuY29uc3QgaGlkZURpYWxvZyA9IHRvZ2dsZURpYWxvZyhmYWxzZSk7XHJcblxyXG5jb25zdCBjbG9zZURpYWxvZyA9ICgpID0+IHtcclxuICAgIF9pZCA9IG51bGw7XHJcbiAgICAkZm9ybS5yZXNldCgpO1xyXG4gICAgdXBkYXRlRGV0YWlscygpO1xyXG4gICAgaGlkZURpYWxvZygpO1xyXG59XHJcblxyXG4vLyBtZXNzYWdlIGJ1c1xyXG5vYnNlcnZlTWVzc2FnZXMoREVMRVRFX0NPTlRBQ1QsICh7aWQsIGNvbnRhY3R9KSA9PiB7XHJcbiAgICBfaWQgPSBpZDtcclxuICAgIHVwZGF0ZURldGFpbHMoaWQsIGNvbnRhY3QpO1xyXG4gICAgc2hvd0RpYWxvZygpO1xyXG59KTtcclxuXHJcbi8vIHVzZXIgaW50ZXJhY3Rpb25zXHJcbiR5ZXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBub3RpZnkoREVMRVRFX0NPTkZJUk0sIHsgaWQ6IF9pZCB9KTtcclxuICAgIGNsb3NlRGlhbG9nKCk7XHJcbn0pO1xyXG5cclxuJG5vLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgY2xvc2VEaWFsb2coKTtcclxufSk7IiwiaW1wb3J0IHtcclxuICAgIElOSVRfTElTVCxcclxuICAgIEFERF9UT19MSVNULFxyXG4gICAgVVBEQVRFX0xJU1QsXHJcbiAgICBSRU1PVkVfRlJPTV9MSVNULFxyXG4gICAgVVBEQVRFX1JFUVVFU1QsXHJcbiAgICBERUxFVEVfUkVRVUVTVCxcclxufSBmcm9tICcuLi9jb25zdGFudHMvY2hhbm5lbHMuanMnO1xyXG5cclxuaW1wb3J0IHsgbm90aWZ5LCBzdWJzY3JpYmUgYXMgb2JzZXJ2ZU1lc3NhZ2VzIH0gZnJvbSAnLi4vaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMnO1xyXG5pbXBvcnQgeyBjb21wb3NlIH0gZnJvbSAnLi4vdXRpbHMvZnAudXRpbC5qcyc7XHJcbmltcG9ydCB7IGl0ZW1UZXh0IH0gZnJvbSAnLi4vdXRpbHMvdGV4dC51dGlsLmpzJztcclxuaW1wb3J0IHsgY3JlYXRlSXRlbSB9IGZyb20gJy4uL3V0aWxzL2RvbS5pdGVtLnV0aWwuanMnO1xyXG5cclxuLy8gbW9kdWxlIGRhdGFcclxuY29uc3QgaXRlbXMgPSB7fTtcclxuXHJcbi8vIGVsZW1lbnRzXHJcbmNvbnN0ICRsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxpc3QnKTtcclxuXHJcbi8vIG1ldGhvZHNcclxuY29uc3QgYWRkSXRlbSA9IChpdGVtKSA9PiB7XHJcbiAgICAkbGlzdC5hcHBlbmRDaGlsZChpdGVtKTtcclxufTtcclxuXHJcbmNvbnN0IGFkZFNpbmdsZUl0ZW0gPSAoe2lkLCBuYW1lLCBzdXJuYW1lLCBlbWFpbH0pID0+IHtcclxuICAgIGNvbnN0IG5ld0l0ZW0gPSBjcmVhdGVJdGVtKHsgaWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pO1xyXG5cclxuICAgIGl0ZW1zW2lkXSA9IG5ld0l0ZW07XHJcblxyXG4gICAgYWRkSXRlbShuZXdJdGVtKTtcclxufVxyXG5cclxuY29uc3QgdXBkYXRlSXRlbSA9IChpZCkgPT4ge1xyXG4gICAgbm90aWZ5KFVQREFURV9SRVFVRVNULCB7IGlkIH0pO1xyXG59O1xyXG5cclxuY29uc3QgZGVsZXRlSXRlbSA9IChpZCkgPT4ge1xyXG4gICAgbm90aWZ5KERFTEVURV9SRVFVRVNULCB7IGlkIH0pO1xyXG59O1xyXG5cclxuLy8gbWVzc2FnZSBidXNcclxub2JzZXJ2ZU1lc3NhZ2VzKElOSVRfTElTVCwgKGFkZHJlc3NCb29rKSA9PiB7XHJcbiAgICBPYmplY3RcclxuICAgICAgICAudmFsdWVzKGFkZHJlc3NCb29rKVxyXG4gICAgICAgIC5mb3JFYWNoKGFkZFNpbmdsZUl0ZW0pO1xyXG59KTtcclxuXHJcbm9ic2VydmVNZXNzYWdlcyhBRERfVE9fTElTVCwgYWRkU2luZ2xlSXRlbSk7XHJcblxyXG5vYnNlcnZlTWVzc2FnZXMoVVBEQVRFX0xJU1QsICh7aWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pID0+IHtcclxuICAgIGl0ZW1zW2lkXS5xdWVyeVNlbGVjdG9yKCcuaXRlbS1sYWJlbCcpLnRleHRDb250ZW50ID0gaXRlbVRleHQoeyBuYW1lLCBzdXJuYW1lLCBlbWFpbCB9KTtcclxufSk7XHJcblxyXG5vYnNlcnZlTWVzc2FnZXMoUkVNT1ZFX0ZST01fTElTVCwgKHsgaWQgfSkgPT4ge1xyXG4gICAgJGxpc3QucmVtb3ZlQ2hpbGQoaXRlbXNbaWRdKTtcclxuICAgIGRlbGV0ZSBpdGVtc1tpZF07XHJcbn0pO1xyXG5cclxuLy8gdXNlciBpbnRlcmFjdGlvblxyXG4kbGlzdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgY29uc3QgeyBhY3Rpb24sIGNvbnRhY3RJZCB9ID0gZXZlbnQudGFyZ2V0LmN1c3RvbURhdGE7XHJcblxyXG4gICAgc3dpdGNoIChhY3Rpb24pIHtcclxuICAgIGNhc2UgJ2VkaXQnOlxyXG4gICAgICAgIHVwZGF0ZUl0ZW0oY29udGFjdElkKTtcclxuICAgICAgICBicmVhaztcclxuICAgIGNhc2UgJ2RlbGV0ZSc6XHJcbiAgICAgICAgZGVsZXRlSXRlbShjb250YWN0SWQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG59KTsiLCJpbXBvcnQgeyBORVdfQ09OVEFDVCwgRURJVF9DT05UQUNULCBVUERBVEVfQ09OVEFDVCB9IGZyb20gJy4uL2NvbnN0YW50cy9jaGFubmVscy5qcyc7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgdmFsaWRhdGVOYW1lLCB2YWxpZGF0ZVN1cm5hbWUsIHZhbGlkYXRlQ291bnRyeSwgdmFsaWRhdGVFbWFpbFxyXG59IGZyb20gJy4uLy4uL2FwcC91dGlscy92YWxpZGF0b3IudXRpbC5qcyc7XHJcbmltcG9ydCB7IG5vdGlmeSwgc3Vic2NyaWJlIGFzIG9ic2VydmVNZXNzYWdlcyB9IGZyb20gJy4uL2hlbHBlcnMvbWVzc2FnZS1idXMuaGVscGVyLmpzJztcclxuaW1wb3J0IHsgY29tcG9zZSB9IGZyb20gJy4uL3V0aWxzL2ZwLnV0aWwuanMnO1xyXG5cclxuLy8gbWFpbiBlbGVtZW50XHJcbmNvbnN0ICRkaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGlhbG9nLW1hbmFnZScpO1xyXG5jb25zdCAkZm9ybSA9ICRkaWFsb2cucXVlcnlTZWxlY3RvcignLmZvcm0nKTtcclxuXHJcbi8vIGNvbnRhaW5lcnNcclxuY29uc3QgJG5hbWVDb250YWluZXIgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcubmFtZS1jb250YWluZXInKTtcclxuY29uc3QgJHN1cm5hbWVDb250YWluZXIgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuc3VybmFtZS1jb250YWluZXInKTtcclxuY29uc3QgJGVtYWlsQ29udGFpbmVyID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmVtYWlsLWNvbnRhaW5lcicpO1xyXG5cclxuLy8gaW5wdXRzXHJcbmNvbnN0ICRpZCA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5pZCcpO1xyXG5jb25zdCAkbmFtZSA9ICRuYW1lQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJyk7XHJcbmNvbnN0ICRzdXJuYW1lID0gJHN1cm5hbWVDb250YWluZXIucXVlcnlTZWxlY3RvcignLnN1cm5hbWUnKTtcclxuLy9jb25zdCBjb3VudHJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50cnknKTtcclxuY29uc3QgJGVtYWlsID0gJGVtYWlsQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5lbWFpbCcpO1xyXG5cclxuLy8gbWV0aG9kc1xyXG5jb25zdCBnZXRWYWx1ZXMgPSAoKSA9PiAoe1xyXG4gICAgaWQ6ICRpZC52YWx1ZSxcclxuICAgIG5hbWU6ICRuYW1lLnZhbHVlLFxyXG4gICAgc3VybmFtZTogJHN1cm5hbWUudmFsdWUsXHJcbiAgICBlbWFpbDogJGVtYWlsLnZhbHVlLFxyXG59KTtcclxuXHJcbmNvbnN0IGNsb3NlRm9ybSA9ICgpID0+IHtcclxuICAgICRkaWFsb2cuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAkaWQudmFsdWUgPSAnJztcclxuICAgICRmb3JtLnJlc2V0KCk7XHJcbn07XHJcblxyXG5jb25zdCB2YWxpZGF0ZUZvcm0gPVxyXG4gICAgICAobmFtZSwgc3VybmFtZSwgZW1haWwpID0+ICh7XHJcbiAgICAgICAgICBuYW1lOiB2YWxpZGF0ZU5hbWUobmFtZSksXHJcbiAgICAgICAgICBzdXJuYW1lOiB2YWxpZGF0ZVN1cm5hbWUoc3VybmFtZSksXHJcbiAgICAgICAgICBlbWFpbDogdmFsaWRhdGVFbWFpbChlbWFpbCksXHJcbiAgICAgIH0pO1xyXG5cclxuY29uc3QgbWFya0Vycm9ycyA9ICh7IG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pID0+IHtcclxuICAgICRuYW1lQ29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoJ2hhcy1lcnJvcicsICFuYW1lKTtcclxuICAgICRzdXJuYW1lQ29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoJ2hhcy1lcnJvcicsICFzdXJuYW1lKTtcclxuICAgICRlbWFpbENvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKCdoYXMtZXJyb3InLCAhZW1haWwpO1xyXG5cclxuICAgIHJldHVybiB7IG5hbWUsIHN1cm5hbWUsIGVtYWlsIH07XHJcbn07XHJcblxyXG5jb25zdCBjaGVja1ZhbGlkaXR5ID0gKHJlcG9ydCkgPT4gT2JqZWN0LnZhbHVlcyhyZXBvcnQpLmV2ZXJ5KChmaWVsZCkgPT4gZmllbGQgPT0gdHJ1ZSk7XHJcblxyXG5jb25zdCBhbGxHb29kID0gY29tcG9zZShjaGVja1ZhbGlkaXR5LCBtYXJrRXJyb3JzLCB2YWxpZGF0ZUZvcm0pO1xyXG5cclxuLy8gYWN0aW9uXHJcbiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT4ge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBjb25zdCB7IGlkLCBuYW1lLCBzdXJuYW1lLCBlbWFpbCB9ID0gZ2V0VmFsdWVzKCk7XHJcblxyXG4gICAgaWYgKCFhbGxHb29kKG5hbWUsIHN1cm5hbWUsIGVtYWlsKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaWQpIHtcclxuICAgICAgICBub3RpZnkoVVBEQVRFX0NPTlRBQ1QsIHsgaWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBub3RpZnkoTkVXX0NPTlRBQ1QsIHsgbmFtZSwgc3VybmFtZSwgZW1haWwgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2VGb3JtKCk7XHJcbn0pO1xyXG5cclxub2JzZXJ2ZU1lc3NhZ2VzKEVESVRfQ09OVEFDVCwgKHsgaWQsIG5hbWUsIHN1cm5hbWUsIGVtYWlsIH0pID0+IHtcclxuICAgICRpZC52YWx1ZSA9IGlkO1xyXG4gICAgJG5hbWUudmFsdWUgPSBuYW1lO1xyXG4gICAgJHN1cm5hbWUudmFsdWUgPSBzdXJuYW1lO1xyXG4gICAgJGVtYWlsLnZhbHVlID0gZW1haWw7XHJcblxyXG4gICAgJGRpYWxvZy5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxufSk7Il19
