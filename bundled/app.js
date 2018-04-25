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
var NEW_REQUEST = exports.NEW_REQUEST = 'new-request';
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

},{"../utils/fp.util.js":11}],4:[function(require,module,exports){
'use strict';

var _channels = require('./constants/channels.js');

var _databases = require('./constants/databases.js');

var _messageBusHelper = require('./helpers/message-bus.helper.js');

var _dbService = require('./services/db.service.js');

var _controller = require('./view-controllers/list/controller.js');

var _controller2 = _interopRequireDefault(_controller);

var _controller3 = require('./view-controllers/form-dialog/controller.js');

var _controller4 = _interopRequireDefault(_controller3);

var _controller5 = require('./view-controllers/delete-dialog/controller.js');

var _controller6 = _interopRequireDefault(_controller5);

var _domGeneralUtil = require('./utils/dom.general.util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// module data
var addressBook = (0, _dbService.read)(_databases.ADDRESS_BOOK, {});
var lastId = (0, _dbService.read)(_databases.LAST_ID, { value: 0 }).value;

// initialize view controllers, append them, and initialize list contents
Promise.all([(0, _controller2.default)(), (0, _controller4.default)(), (0, _controller6.default)()]).then(function (everything) {
    return everything.reduce(function (flatArray, $view) {
        flatArray.push($view);
        return flatArray;
    }, []);
}).then(function (views) {
    var $main = document.querySelector('.jsMain');

    (0, _domGeneralUtil.appendAll)($main, views);
}).then(function () {
    (0, _messageBusHelper.notify)(_channels.INIT_LIST, addressBook);
});

// messages: form -> main
(0, _messageBusHelper.subscribe)(_channels.NEW_CONTACT, function (_ref) {
    var name = _ref.name,
        surname = _ref.surname,
        country = _ref.country,
        email = _ref.email;

    lastId += 1;

    var newContact = {
        id: lastId,
        name: name,
        surname: surname,
        country: country,
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
        country = _ref2.country,
        email = _ref2.email;

    addressBook[id] = { id: id, name: name, surname: surname, country: country, email: email };
    (0, _dbService.update)({ addressBook: addressBook });
    (0, _messageBusHelper.notify)(_channels.UPDATE_LIST, { id: id, name: name, surname: surname, country: country, email: email });
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

},{"./constants/channels.js":1,"./constants/databases.js":2,"./helpers/message-bus.helper.js":3,"./services/db.service.js":5,"./utils/dom.general.util.js":7,"./view-controllers/delete-dialog/controller.js":16,"./view-controllers/form-dialog/controller.js":17,"./view-controllers/list/controller.js":18}],5:[function(require,module,exports){
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

},{"../constants/databases.js":2,"../utils/local-storage.util.js":12}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _countryList = require('../../libs/country-list/country-list.js');

var _countryList2 = _interopRequireDefault(_countryList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _countryList2.default();

},{"../../libs/country-list/country-list.js":19}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var stringToHtml = exports.stringToHtml = function stringToHtml(stringTemplate) {
    return document.createRange().createContextualFragment(stringTemplate);
};

var appendAll = exports.appendAll = function appendAll($parent, children) {
    [].forEach.call(children, function ($child) {
        $parent.appendChild($child);
    });
};

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createItem = undefined;

var _textUtil = require('../utils/text.util.js');

var createLabel = function createLabel(name, surname, country, email) {
    return Object.assign(document.createElement('div'), {
        className: 'item-label',
        textContent: (0, _textUtil.itemText)({ name: name, surname: surname, country: country, email: email })
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

},{"../utils/text.util.js":14}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (code, name) {
    var $option = document.createElement('option');

    $option.value = code;
    $option.textContent = name;

    return $option;
};

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promisifiedRequestUtil = require('./promisified.request.util.js');

var _domGeneralUtil = require('./dom.general.util.js');

exports.default = function (url) {
  return (0, _promisifiedRequestUtil.get)(url).then(_domGeneralUtil.stringToHtml);
};

},{"./dom.general.util.js":7,"./promisified.request.util.js":13}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// source: https://stackoverflow.com/a/30008115/5658702
var general = function general(method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.open(method, url);

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };

        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };

        xhr.send();
    });
};

var get = exports.get = function get(url) {
    return general('GET', url);
};

var post = exports.post = function post(url) {
    return general('POST', url);
};

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.itemText = undefined;

var _countryListUtil = require('./country-list.util.js');

var _countryListUtil2 = _interopRequireDefault(_countryListUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var itemText = exports.itemText = function itemText(_ref) {
  var name = _ref.name,
      surname = _ref.surname,
      country = _ref.country,
      email = _ref.email;
  return name + ' ' + surname + ' (' + (country && _countryListUtil2.default.getName(country)) + '), ' + email;
};

},{"./country-list.util.js":6}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.validateEmail = exports.validateCountry = exports.validateSurname = exports.validateName = undefined;

var _countryListUtil = require('./country-list.util.js');

var _countryListUtil2 = _interopRequireDefault(_countryListUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var validateCountry = exports.validateCountry = function validateCountry(code) {
    return _countryListUtil2.default.getName(code) !== undefined;
};

// source: https://www.regular-expressions.info/email.html
var emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

var validateEmail = exports.validateEmail = function validateEmail(email) {
    return typeof email == 'string' && emailRegex.test(email);
};

},{"./country-list.util.js":6}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
            value: true
});

var _channels = require('../../constants/channels.js');

var _domTemplateUtil = require('../../utils/dom.template.util.js');

var _domTemplateUtil2 = _interopRequireDefault(_domTemplateUtil);

var _messageBusHelper = require('../../helpers/message-bus.helper.js');

var _textUtil = require('../../utils/text.util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// init function
exports.default = function () {
            return (0, _domTemplateUtil2.default)('/app/view-controllers/delete-dialog/view.html').then(function ($view) {
                        // data
                        var _id = null;

                        // elements
                        var $dialog = $view.querySelector('.jsDialog');
                        var $form = $dialog.querySelector('.jsForm');

                        var $id = $form.querySelector('.jsId');
                        var $details = $form.querySelector('.jsDetails');

                        var $yes = $form.querySelector('.jsYes');
                        var $no = $form.querySelector('.jsNo');

                        // methods ________________________________________________________________________________________________
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

                        // message bus ____________________________________________________________________________________________
                        (0, _messageBusHelper.subscribe)(_channels.DELETE_CONTACT, function (_ref) {
                                    var id = _ref.id,
                                        contact = _ref.contact;

                                    _id = id;
                                    updateDetails(id, contact);
                                    showDialog();
                        });

                        // user interactions ______________________________________________________________________________________
                        $yes.addEventListener('click', function (event) {
                                    event.preventDefault();
                                    (0, _messageBusHelper.notify)(_channels.DELETE_CONFIRM, { id: _id });
                                    closeDialog();
                        });

                        $no.addEventListener('click', function (event) {
                                    event.preventDefault();
                                    closeDialog();
                        });

                        return $view;
            });
};

},{"../../constants/channels.js":1,"../../helpers/message-bus.helper.js":3,"../../utils/dom.template.util.js":10,"../../utils/text.util.js":14}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _channels = require('../../constants/channels.js');

var _validatorUtil = require('../../../app/utils/validator.util.js');

var _messageBusHelper = require('../../helpers/message-bus.helper.js');

var _domTemplateUtil = require('../../utils/dom.template.util.js');

var _domTemplateUtil2 = _interopRequireDefault(_domTemplateUtil);

var _fpUtil = require('../../utils/fp.util.js');

var _domOptionUtil = require('../../utils/dom.option.util.js');

var _domOptionUtil2 = _interopRequireDefault(_domOptionUtil);

var _countryListUtil = require('../../utils/country-list.util.js');

var _countryListUtil2 = _interopRequireDefault(_countryListUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// init function
exports.default = function () {
    return (0, _domTemplateUtil2.default)('/app/view-controllers/form-dialog/view.html').then(function ($view) {
        // main element
        var $dialog = $view.querySelector('.jsDialog');
        var $form = $dialog.querySelector('.jsForm');

        // containers
        var $nameContainer = $form.querySelector('.jsNameContainer');
        var $surnameContainer = $form.querySelector('.jsSurnameContainer');
        var $countryContainer = $form.querySelector('.jsCountryContainer');
        var $emailContainer = $form.querySelector('.jsEmailContainer');

        // inputs
        var $id = $form.querySelector('.jsId');
        var $name = $nameContainer.querySelector('.jsName');
        var $surname = $surnameContainer.querySelector('.jsSurname');
        var $country = $countryContainer.querySelector('.jsCountry');
        var $email = $emailContainer.querySelector('.jsEmail');

        var $cancel = $form.querySelector('.jsCancel');

        // methods ________________________________________________________________________________________________
        var toggleDialog = function toggleDialog(status) {
            return function () {
                $dialog.classList.toggle('is-active', status);
            };
        };
        var showDialog = toggleDialog(true);
        var hideDialog = toggleDialog(false);

        var fillFormFields = function fillFormFields(_ref) {
            var id = _ref.id,
                name = _ref.name,
                surname = _ref.surname,
                country = _ref.country,
                email = _ref.email;

            $id.value = id;
            $name.value = name;
            $surname.value = surname;
            $country.value = country;
            $email.value = email;
        };

        var getValues = function getValues() {
            return {
                id: $id.value,
                name: $name.value,
                surname: $surname.value,
                country: $country.value,
                email: $email.value
            };
        };

        var dismissForm = function dismissForm() {
            hideDialog();
            $id.value = '';
            $form.reset();
        };

        var validateForm = function validateForm(name, surname, country, email) {
            return {
                name: (0, _validatorUtil.validateName)(name),
                surname: (0, _validatorUtil.validateSurname)(surname),
                country: (0, _validatorUtil.validateCountry)(country),
                email: (0, _validatorUtil.validateEmail)(email)
            };
        };

        var toggleErrorClass = function toggleErrorClass($field, status) {
            $field.classList.toggle('has-error', status);
        };

        var markErrors = function markErrors(_ref2) {
            var name = _ref2.name,
                surname = _ref2.surname,
                country = _ref2.country,
                email = _ref2.email;

            toggleErrorClass($nameContainer, !name);
            toggleErrorClass($surnameContainer, !surname);
            toggleErrorClass($countryContainer, !country);
            toggleErrorClass($emailContainer, !email);

            return { name: name, surname: surname, country: country, email: email };
        };

        var checkValidity = function checkValidity(report) {
            return Object.values(report).every(function (field) {
                return field == true;
            });
        };

        var allGood = (0, _fpUtil.compose)(checkValidity, markErrors, validateForm);

        // on load ________________________________________________________________________________________________
        {
            var countries = _countryListUtil2.default.getCodeList();

            Object.keys(countries).map(function (code) {
                return (0, _domOptionUtil2.default)(code, countries[code]);
            }).forEach(function ($option) {
                $country.appendChild($option);
            });
        }

        // message bus ____________________________________________________________________________________________
        (0, _messageBusHelper.subscribe)(_channels.NEW_REQUEST, function () {
            showDialog();
        });

        (0, _messageBusHelper.subscribe)(_channels.EDIT_CONTACT, function (_ref3) {
            var id = _ref3.id,
                name = _ref3.name,
                surname = _ref3.surname,
                country = _ref3.country,
                email = _ref3.email;

            fillFormFields({ id: id, name: name, surname: surname, country: country, email: email });
            showDialog();
        });

        // user interactions ______________________________________________________________________________________
        $form.addEventListener('submit', function (event) {
            event.preventDefault();

            var _getValues = getValues(),
                id = _getValues.id,
                name = _getValues.name,
                surname = _getValues.surname,
                country = _getValues.country,
                email = _getValues.email;

            if (!allGood(name, surname, country, email)) {
                return;
            }

            if (id) {
                (0, _messageBusHelper.notify)(_channels.UPDATE_CONTACT, { id: id, name: name, surname: surname, country: country, email: email });
            } else {
                (0, _messageBusHelper.notify)(_channels.NEW_CONTACT, { name: name, surname: surname, country: country, email: email });
            }

            dismissForm();
        });

        $cancel.addEventListener('click', function () {
            dismissForm();
        });

        return $view;
    });
};

},{"../../../app/utils/validator.util.js":15,"../../constants/channels.js":1,"../../helpers/message-bus.helper.js":3,"../../utils/country-list.util.js":6,"../../utils/dom.option.util.js":9,"../../utils/dom.template.util.js":10,"../../utils/fp.util.js":11}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _channels = require('../../constants/channels.js');

var _messageBusHelper = require('../../helpers/message-bus.helper.js');

var _fpUtil = require('../../utils/fp.util.js');

var _domTemplateUtil = require('../../utils/dom.template.util.js');

var _domTemplateUtil2 = _interopRequireDefault(_domTemplateUtil);

var _textUtil = require('../../utils/text.util.js');

var _domItemUtil = require('../../utils/dom.item.util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// init function
exports.default = function () {
    return (0, _domTemplateUtil2.default)('/app/view-controllers/list/view.html').then(function ($view) {
        // module data
        var items = {};

        // elements
        var $contacts = $view.querySelector('.jsContacts');
        var $new = $contacts.querySelector('.jsNew');
        var $list = $contacts.querySelector('.jsContactsList');

        // methods ________________________________________________________________________________________________
        var addItem = function addItem(item) {
            $list.appendChild(item);
        };

        var addSingleItem = function addSingleItem(_ref) {
            var id = _ref.id,
                name = _ref.name,
                surname = _ref.surname,
                country = _ref.country,
                email = _ref.email;

            var newItem = (0, _domItemUtil.createItem)({ id: id, name: name, surname: surname, country: country, email: email });

            items[id] = newItem;

            addItem(newItem);
        };

        var updateItem = function updateItem(id) {
            (0, _messageBusHelper.notify)(_channels.UPDATE_REQUEST, { id: id });
        };

        var deleteItem = function deleteItem(id) {
            (0, _messageBusHelper.notify)(_channels.DELETE_REQUEST, { id: id });
        };

        // message bus ____________________________________________________________________________________________
        (0, _messageBusHelper.subscribe)(_channels.INIT_LIST, function (addressBook) {
            Object.values(addressBook).forEach(addSingleItem);
        });

        (0, _messageBusHelper.subscribe)(_channels.ADD_TO_LIST, addSingleItem);

        (0, _messageBusHelper.subscribe)(_channels.UPDATE_LIST, function (_ref2) {
            var id = _ref2.id,
                name = _ref2.name,
                surname = _ref2.surname,
                country = _ref2.country,
                email = _ref2.email;

            items[id].querySelector('.item-label').textContent = (0, _textUtil.itemText)({ name: name, surname: surname, country: country, email: email });
        });

        (0, _messageBusHelper.subscribe)(_channels.REMOVE_FROM_LIST, function (_ref3) {
            var id = _ref3.id;

            $list.removeChild(items[id]);
            delete items[id];
        });

        // user interactions ______________________________________________________________________________________
        $new.addEventListener('click', function () {
            (0, _messageBusHelper.notify)(_channels.NEW_REQUEST, true);
        });

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

        return $view;
    });
};

},{"../../constants/channels.js":1,"../../helpers/message-bus.helper.js":3,"../../utils/dom.item.util.js":8,"../../utils/dom.template.util.js":10,"../../utils/fp.util.js":11,"../../utils/text.util.js":14}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _data = require('./data.js');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//'use strict'
//
//var data = require('./data.json')

/**
 * Precompute name and code lookups.
 */
var nameMap = {}; // source: https://github.com/fannarsh/country-list
// the file has been modulrized but anything else is as it was

var codeMap = {};

_data2.default.forEach(function (country) {
  nameMap[country.name.toLowerCase()] = country.code;
  codeMap[country.code.toLowerCase()] = country.name;
});

function CountryList() {
  if (!(this instanceof CountryList)) return new CountryList();
};

CountryList.prototype.getCode = function getCode(name) {
  return nameMap[name.toLowerCase()];
};

CountryList.prototype.getName = function getName(code) {
  return codeMap[code.toLowerCase()];
};

CountryList.prototype.getNames = function getNames() {
  return _data2.default.map(function (country) {
    return country.name;
  });
};

CountryList.prototype.getCodes = function getCodes() {
  return _data2.default.map(function (country) {
    return country.code;
  });
};

CountryList.prototype.getCodeList = function () {
  return codeMap;
};

CountryList.prototype.getNameList = function () {
  return nameMap;
};

CountryList.prototype.getData = function getData() {
  return _data2.default;
};

exports.default = CountryList;

},{"./data.js":20}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// source: https://github.com/fannarsh/country-list
// this was JSON file but native modules didn’t want to work

exports.default = [{
  "code": "AF",
  "name": "Afghanistan"
}, {
  "code": "AX",
  "name": "Åland Islands"
}, {
  "code": "AL",
  "name": "Albania"
}, {
  "code": "DZ",
  "name": "Algeria"
}, {
  "code": "AS",
  "name": "American Samoa"
}, {
  "code": "AD",
  "name": "Andorra"
}, {
  "code": "AO",
  "name": "Angola"
}, {
  "code": "AI",
  "name": "Anguilla"
}, {
  "code": "AQ",
  "name": "Antarctica"
}, {
  "code": "AG",
  "name": "Antigua and Barbuda"
}, {
  "code": "AR",
  "name": "Argentina"
}, {
  "code": "AM",
  "name": "Armenia"
}, {
  "code": "AW",
  "name": "Aruba"
}, {
  "code": "AU",
  "name": "Australia"
}, {
  "code": "AT",
  "name": "Austria"
}, {
  "code": "AZ",
  "name": "Azerbaijan"
}, {
  "code": "BS",
  "name": "Bahamas"
}, {
  "code": "BH",
  "name": "Bahrain"
}, {
  "code": "BD",
  "name": "Bangladesh"
}, {
  "code": "BB",
  "name": "Barbados"
}, {
  "code": "BY",
  "name": "Belarus"
}, {
  "code": "BE",
  "name": "Belgium"
}, {
  "code": "BZ",
  "name": "Belize"
}, {
  "code": "BJ",
  "name": "Benin"
}, {
  "code": "BM",
  "name": "Bermuda"
}, {
  "code": "BT",
  "name": "Bhutan"
}, {
  "code": "BO",
  "name": "Bolivia, Plurinational State of"
}, {
  "code": "BQ",
  "name": "Bonaire, Sint Eustatius and Saba"
}, {
  "code": "BA",
  "name": "Bosnia and Herzegovina"
}, {
  "code": "BW",
  "name": "Botswana"
}, {
  "code": "BV",
  "name": "Bouvet Island"
}, {
  "code": "BR",
  "name": "Brazil"
}, {
  "code": "IO",
  "name": "British Indian Ocean Territory"
}, {
  "code": "BN",
  "name": "Brunei Darussalam"
}, {
  "code": "BG",
  "name": "Bulgaria"
}, {
  "code": "BF",
  "name": "Burkina Faso"
}, {
  "code": "BI",
  "name": "Burundi"
}, {
  "code": "KH",
  "name": "Cambodia"
}, {
  "code": "CM",
  "name": "Cameroon"
}, {
  "code": "CA",
  "name": "Canada"
}, {
  "code": "CV",
  "name": "Cape Verde"
}, {
  "code": "KY",
  "name": "Cayman Islands"
}, {
  "code": "CF",
  "name": "Central African Republic"
}, {
  "code": "TD",
  "name": "Chad"
}, {
  "code": "CL",
  "name": "Chile"
}, {
  "code": "CN",
  "name": "China"
}, {
  "code": "CX",
  "name": "Christmas Island"
}, {
  "code": "CC",
  "name": "Cocos (Keeling) Islands"
}, {
  "code": "CO",
  "name": "Colombia"
}, {
  "code": "KM",
  "name": "Comoros"
}, {
  "code": "CG",
  "name": "Congo"
}, {
  "code": "CD",
  "name": "Congo, the Democratic Republic of the"
}, {
  "code": "CK",
  "name": "Cook Islands"
}, {
  "code": "CR",
  "name": "Costa Rica"
}, {
  "code": "CI",
  "name": "Côte d'Ivoire"
}, {
  "code": "HR",
  "name": "Croatia"
}, {
  "code": "CU",
  "name": "Cuba"
}, {
  "code": "CW",
  "name": "Curaçao"
}, {
  "code": "CY",
  "name": "Cyprus"
}, {
  "code": "CZ",
  "name": "Czech Republic"
}, {
  "code": "DK",
  "name": "Denmark"
}, {
  "code": "DJ",
  "name": "Djibouti"
}, {
  "code": "DM",
  "name": "Dominica"
}, {
  "code": "DO",
  "name": "Dominican Republic"
}, {
  "code": "EC",
  "name": "Ecuador"
}, {
  "code": "EG",
  "name": "Egypt"
}, {
  "code": "SV",
  "name": "El Salvador"
}, {
  "code": "GQ",
  "name": "Equatorial Guinea"
}, {
  "code": "ER",
  "name": "Eritrea"
}, {
  "code": "EE",
  "name": "Estonia"
}, {
  "code": "ET",
  "name": "Ethiopia"
}, {
  "code": "FK",
  "name": "Falkland Islands (Malvinas)"
}, {
  "code": "FO",
  "name": "Faroe Islands"
}, {
  "code": "FJ",
  "name": "Fiji"
}, {
  "code": "FI",
  "name": "Finland"
}, {
  "code": "FR",
  "name": "France"
}, {
  "code": "GF",
  "name": "French Guiana"
}, {
  "code": "PF",
  "name": "French Polynesia"
}, {
  "code": "TF",
  "name": "French Southern Territories"
}, {
  "code": "GA",
  "name": "Gabon"
}, {
  "code": "GM",
  "name": "Gambia"
}, {
  "code": "GE",
  "name": "Georgia"
}, {
  "code": "DE",
  "name": "Germany"
}, {
  "code": "GH",
  "name": "Ghana"
}, {
  "code": "GI",
  "name": "Gibraltar"
}, {
  "code": "GR",
  "name": "Greece"
}, {
  "code": "GL",
  "name": "Greenland"
}, {
  "code": "GD",
  "name": "Grenada"
}, {
  "code": "GP",
  "name": "Guadeloupe"
}, {
  "code": "GU",
  "name": "Guam"
}, {
  "code": "GT",
  "name": "Guatemala"
}, {
  "code": "GG",
  "name": "Guernsey"
}, {
  "code": "GN",
  "name": "Guinea"
}, {
  "code": "GW",
  "name": "Guinea-Bissau"
}, {
  "code": "GY",
  "name": "Guyana"
}, {
  "code": "HT",
  "name": "Haiti"
}, {
  "code": "HM",
  "name": "Heard Island and McDonald Islands"
}, {
  "code": "VA",
  "name": "Holy See (Vatican City State)"
}, {
  "code": "HN",
  "name": "Honduras"
}, {
  "code": "HK",
  "name": "Hong Kong"
}, {
  "code": "HU",
  "name": "Hungary"
}, {
  "code": "IS",
  "name": "Iceland"
}, {
  "code": "IN",
  "name": "India"
}, {
  "code": "ID",
  "name": "Indonesia"
}, {
  "code": "IR",
  "name": "Iran, Islamic Republic of"
}, {
  "code": "IQ",
  "name": "Iraq"
}, {
  "code": "IE",
  "name": "Ireland"
}, {
  "code": "IM",
  "name": "Isle of Man"
}, {
  "code": "IL",
  "name": "Israel"
}, {
  "code": "IT",
  "name": "Italy"
}, {
  "code": "JM",
  "name": "Jamaica"
}, {
  "code": "JP",
  "name": "Japan"
}, {
  "code": "JE",
  "name": "Jersey"
}, {
  "code": "JO",
  "name": "Jordan"
}, {
  "code": "KZ",
  "name": "Kazakhstan"
}, {
  "code": "KE",
  "name": "Kenya"
}, {
  "code": "KI",
  "name": "Kiribati"
}, {
  "code": "KP",
  "name": "Korea, Democratic People's Republic of"
}, {
  "code": "KR",
  "name": "Korea, Republic of"
}, {
  "code": "KW",
  "name": "Kuwait"
}, {
  "code": "KG",
  "name": "Kyrgyzstan"
}, {
  "code": "LA",
  "name": "Lao People's Democratic Republic"
}, {
  "code": "LV",
  "name": "Latvia"
}, {
  "code": "LB",
  "name": "Lebanon"
}, {
  "code": "LS",
  "name": "Lesotho"
}, {
  "code": "LR",
  "name": "Liberia"
}, {
  "code": "LY",
  "name": "Libya"
}, {
  "code": "LI",
  "name": "Liechtenstein"
}, {
  "code": "LT",
  "name": "Lithuania"
}, {
  "code": "LU",
  "name": "Luxembourg"
}, {
  "code": "MO",
  "name": "Macao"
}, {
  "code": "MK",
  "name": "Macedonia, the Former Yugoslav Republic of"
}, {
  "code": "MG",
  "name": "Madagascar"
}, {
  "code": "MW",
  "name": "Malawi"
}, {
  "code": "MY",
  "name": "Malaysia"
}, {
  "code": "MV",
  "name": "Maldives"
}, {
  "code": "ML",
  "name": "Mali"
}, {
  "code": "MT",
  "name": "Malta"
}, {
  "code": "MH",
  "name": "Marshall Islands"
}, {
  "code": "MQ",
  "name": "Martinique"
}, {
  "code": "MR",
  "name": "Mauritania"
}, {
  "code": "MU",
  "name": "Mauritius"
}, {
  "code": "YT",
  "name": "Mayotte"
}, {
  "code": "MX",
  "name": "Mexico"
}, {
  "code": "FM",
  "name": "Micronesia, Federated States of"
}, {
  "code": "MD",
  "name": "Moldova, Republic of"
}, {
  "code": "MC",
  "name": "Monaco"
}, {
  "code": "MN",
  "name": "Mongolia"
}, {
  "code": "ME",
  "name": "Montenegro"
}, {
  "code": "MS",
  "name": "Montserrat"
}, {
  "code": "MA",
  "name": "Morocco"
}, {
  "code": "MZ",
  "name": "Mozambique"
}, {
  "code": "MM",
  "name": "Myanmar"
}, {
  "code": "NA",
  "name": "Namibia"
}, {
  "code": "NR",
  "name": "Nauru"
}, {
  "code": "NP",
  "name": "Nepal"
}, {
  "code": "NL",
  "name": "Netherlands"
}, {
  "code": "NC",
  "name": "New Caledonia"
}, {
  "code": "NZ",
  "name": "New Zealand"
}, {
  "code": "NI",
  "name": "Nicaragua"
}, {
  "code": "NE",
  "name": "Niger"
}, {
  "code": "NG",
  "name": "Nigeria"
}, {
  "code": "NU",
  "name": "Niue"
}, {
  "code": "NF",
  "name": "Norfolk Island"
}, {
  "code": "MP",
  "name": "Northern Mariana Islands"
}, {
  "code": "NO",
  "name": "Norway"
}, {
  "code": "OM",
  "name": "Oman"
}, {
  "code": "PK",
  "name": "Pakistan"
}, {
  "code": "PW",
  "name": "Palau"
}, {
  "code": "PS",
  "name": "Palestine, State of"
}, {
  "code": "PA",
  "name": "Panama"
}, {
  "code": "PG",
  "name": "Papua New Guinea"
}, {
  "code": "PY",
  "name": "Paraguay"
}, {
  "code": "PE",
  "name": "Peru"
}, {
  "code": "PH",
  "name": "Philippines"
}, {
  "code": "PN",
  "name": "Pitcairn"
}, {
  "code": "PL",
  "name": "Poland"
}, {
  "code": "PT",
  "name": "Portugal"
}, {
  "code": "PR",
  "name": "Puerto Rico"
}, {
  "code": "QA",
  "name": "Qatar"
}, {
  "code": "RE",
  "name": "Réunion"
}, {
  "code": "RO",
  "name": "Romania"
}, {
  "code": "RU",
  "name": "Russian Federation"
}, {
  "code": "RW",
  "name": "Rwanda"
}, {
  "code": "BL",
  "name": "Saint Barthélemy"
}, {
  "code": "SH",
  "name": "Saint Helena, Ascension and Tristan da Cunha"
}, {
  "code": "KN",
  "name": "Saint Kitts and Nevis"
}, {
  "code": "LC",
  "name": "Saint Lucia"
}, {
  "code": "MF",
  "name": "Saint Martin (French part)"
}, {
  "code": "PM",
  "name": "Saint Pierre and Miquelon"
}, {
  "code": "VC",
  "name": "Saint Vincent and the Grenadines"
}, {
  "code": "WS",
  "name": "Samoa"
}, {
  "code": "SM",
  "name": "San Marino"
}, {
  "code": "ST",
  "name": "Sao Tome and Principe"
}, {
  "code": "SA",
  "name": "Saudi Arabia"
}, {
  "code": "SN",
  "name": "Senegal"
}, {
  "code": "RS",
  "name": "Serbia"
}, {
  "code": "SC",
  "name": "Seychelles"
}, {
  "code": "SL",
  "name": "Sierra Leone"
}, {
  "code": "SG",
  "name": "Singapore"
}, {
  "code": "SX",
  "name": "Sint Maarten (Dutch part)"
}, {
  "code": "SK",
  "name": "Slovakia"
}, {
  "code": "SI",
  "name": "Slovenia"
}, {
  "code": "SB",
  "name": "Solomon Islands"
}, {
  "code": "SO",
  "name": "Somalia"
}, {
  "code": "ZA",
  "name": "South Africa"
}, {
  "code": "GS",
  "name": "South Georgia and the South Sandwich Islands"
}, {
  "code": "SS",
  "name": "South Sudan"
}, {
  "code": "ES",
  "name": "Spain"
}, {
  "code": "LK",
  "name": "Sri Lanka"
}, {
  "code": "SD",
  "name": "Sudan"
}, {
  "code": "SR",
  "name": "Suriname"
}, {
  "code": "SJ",
  "name": "Svalbard and Jan Mayen"
}, {
  "code": "SZ",
  "name": "Swaziland"
}, {
  "code": "SE",
  "name": "Sweden"
}, {
  "code": "CH",
  "name": "Switzerland"
}, {
  "code": "SY",
  "name": "Syrian Arab Republic"
}, {
  "code": "TW",
  "name": "Taiwan, Province of China"
}, {
  "code": "TJ",
  "name": "Tajikistan"
}, {
  "code": "TZ",
  "name": "Tanzania, United Republic of"
}, {
  "code": "TH",
  "name": "Thailand"
}, {
  "code": "TL",
  "name": "Timor-Leste"
}, {
  "code": "TG",
  "name": "Togo"
}, {
  "code": "TK",
  "name": "Tokelau"
}, {
  "code": "TO",
  "name": "Tonga"
}, {
  "code": "TT",
  "name": "Trinidad and Tobago"
}, {
  "code": "TN",
  "name": "Tunisia"
}, {
  "code": "TR",
  "name": "Turkey"
}, {
  "code": "TM",
  "name": "Turkmenistan"
}, {
  "code": "TC",
  "name": "Turks and Caicos Islands"
}, {
  "code": "TV",
  "name": "Tuvalu"
}, {
  "code": "UG",
  "name": "Uganda"
}, {
  "code": "UA",
  "name": "Ukraine"
}, {
  "code": "AE",
  "name": "United Arab Emirates"
}, {
  "code": "GB",
  "name": "United Kingdom"
}, {
  "code": "US",
  "name": "United States"
}, {
  "code": "UM",
  "name": "United States Minor Outlying Islands"
}, {
  "code": "UY",
  "name": "Uruguay"
}, {
  "code": "UZ",
  "name": "Uzbekistan"
}, {
  "code": "VU",
  "name": "Vanuatu"
}, {
  "code": "VE",
  "name": "Venezuela, Bolivarian Republic of"
}, {
  "code": "VN",
  "name": "Viet Nam"
}, {
  "code": "VG",
  "name": "Virgin Islands, British"
}, {
  "code": "VI",
  "name": "Virgin Islands, U.S."
}, {
  "code": "WF",
  "name": "Wallis and Futuna"
}, {
  "code": "EH",
  "name": "Western Sahara"
}, {
  "code": "YE",
  "name": "Yemen"
}, {
  "code": "ZM",
  "name": "Zambia"
}, {
  "code": "ZW",
  "name": "Zimbabwe"
}];

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvY29uc3RhbnRzL2NoYW5uZWxzLmpzIiwiYXBwL2NvbnN0YW50cy9kYXRhYmFzZXMuanMiLCJhcHAvaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zZXJ2aWNlcy9kYi5zZXJ2aWNlLmpzIiwiYXBwL3V0aWxzL2NvdW50cnktbGlzdC51dGlsLmpzIiwiYXBwL3V0aWxzL2RvbS5nZW5lcmFsLnV0aWwuanMiLCJhcHAvdXRpbHMvZG9tLml0ZW0udXRpbC5qcyIsImFwcC91dGlscy9kb20ub3B0aW9uLnV0aWwuanMiLCJhcHAvdXRpbHMvZG9tLnRlbXBsYXRlLnV0aWwuanMiLCJhcHAvdXRpbHMvZnAudXRpbC5qcyIsImFwcC91dGlscy9sb2NhbC1zdG9yYWdlLnV0aWwuanMiLCJhcHAvdXRpbHMvcHJvbWlzaWZpZWQucmVxdWVzdC51dGlsLmpzIiwiYXBwL3V0aWxzL3RleHQudXRpbC5qcyIsImFwcC91dGlscy92YWxpZGF0b3IudXRpbC5qcyIsImFwcC92aWV3LWNvbnRyb2xsZXJzL2RlbGV0ZS1kaWFsb2cvY29udHJvbGxlci5qcyIsImFwcC92aWV3LWNvbnRyb2xsZXJzL2Zvcm0tZGlhbG9nL2NvbnRyb2xsZXIuanMiLCJhcHAvdmlldy1jb250cm9sbGVycy9saXN0L2NvbnRyb2xsZXIuanMiLCJsaWJzL2NvdW50cnktbGlzdC9jb3VudHJ5LWxpc3QuanMiLCJsaWJzL2NvdW50cnktbGlzdC9kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNBQTtBQUNPLElBQU0sc0NBQWUsY0FBckI7O0FBRVA7QUFDTyxJQUFNLG9DQUFjLGFBQXBCO0FBQ0EsSUFBTSwwQ0FBaUIsZ0JBQXZCOztBQUVQO0FBQ08sSUFBTSwwQ0FBaUIsZ0JBQXZCOztBQUVQO0FBQ08sSUFBTSwwQ0FBaUIsZ0JBQXZCO0FBQ0EsSUFBTSx3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ZSxDQUNiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBRGEsRUFLYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQUxhLEVBU2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FUYSxFQWFiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBYmEsRUFpQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqQmEsRUFxQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyQmEsRUF5QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6QmEsRUE2QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3QmEsRUFpQ2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqQ2EsRUFxQ2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyQ2EsRUF5Q2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6Q2EsRUE2Q2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3Q2EsRUFpRGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqRGEsRUFxRGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyRGEsRUF5RGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6RGEsRUE2RGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3RGEsRUFpRWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqRWEsRUFxRWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyRWEsRUF5RWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6RWEsRUE2RWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3RWEsRUFpRmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqRmEsRUFxRmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyRmEsRUF5RmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6RmEsRUE2RmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3RmEsRUFpR2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqR2EsRUFxR2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyR2EsRUF5R2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6R2EsRUE2R2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3R2EsRUFpSGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqSGEsRUFxSGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FySGEsRUF5SGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6SGEsRUE2SGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3SGEsRUFpSWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqSWEsRUFxSWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FySWEsRUF5SWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6SWEsRUE2SWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3SWEsRUFpSmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqSmEsRUFxSmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FySmEsRUF5SmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6SmEsRUE2SmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3SmEsRUFpS2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqS2EsRUFxS2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyS2EsRUF5S2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6S2EsRUE2S2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3S2EsRUFpTGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqTGEsRUFxTGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyTGEsRUF5TGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6TGEsRUE2TGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3TGEsRUFpTWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqTWEsRUFxTWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyTWEsRUF5TWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6TWEsRUE2TWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3TWEsRUFpTmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqTmEsRUFxTmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyTmEsRUF5TmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6TmEsRUE2TmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3TmEsRUFpT2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqT2EsRUFxT2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyT2EsRUF5T2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6T2EsRUE2T2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3T2EsRUFpUGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqUGEsRUFxUGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyUGEsRUF5UGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6UGEsRUE2UGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3UGEsRUFpUWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqUWEsRUFxUWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyUWEsRUF5UWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6UWEsRUE2UWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3UWEsRUFpUmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqUmEsRUFxUmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyUmEsRUF5UmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6UmEsRUE2UmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3UmEsRUFpU2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqU2EsRUFxU2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyU2EsRUF5U2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6U2EsRUE2U2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3U2EsRUFpVGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqVGEsRUFxVGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyVGEsRUF5VGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6VGEsRUE2VGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3VGEsRUFpVWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqVWEsRUFxVWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyVWEsRUF5VWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6VWEsRUE2VWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3VWEsRUFpVmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqVmEsRUFxVmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyVmEsRUF5VmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6VmEsRUE2VmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3VmEsRUFpV2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqV2EsRUFxV2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyV2EsRUF5V2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6V2EsRUE2V2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3V2EsRUFpWGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqWGEsRUFxWGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyWGEsRUF5WGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6WGEsRUE2WGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3WGEsRUFpWWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqWWEsRUFxWWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyWWEsRUF5WWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6WWEsRUE2WWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3WWEsRUFpWmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqWmEsRUFxWmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyWmEsRUF5WmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6WmEsRUE2WmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3WmEsRUFpYWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqYWEsRUFxYWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyYWEsRUF5YWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6YWEsRUE2YWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3YWEsRUFpYmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqYmEsRUFxYmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyYmEsRUF5YmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6YmEsRUE2YmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3YmEsRUFpY2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqY2EsRUFxY2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyY2EsRUF5Y2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6Y2EsRUE2Y2I7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3Y2EsRUFpZGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqZGEsRUFxZGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyZGEsRUF5ZGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6ZGEsRUE2ZGI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3ZGEsRUFpZWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqZWEsRUFxZWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyZWEsRUF5ZWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6ZWEsRUE2ZWI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3ZWEsRUFpZmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqZmEsRUFxZmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyZmEsRUF5ZmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6ZmEsRUE2ZmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3ZmEsRUFpZ0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFB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YSxFQTY1QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3NUJhLEVBaTZCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWo2QmEsRUFxNkJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcjZCYSxFQXk2QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6NkJhLEVBNjZCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTc2QmEsRUFpN0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBajdCYSxFQXE3QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyN0JhLEVBeTdCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXo3QmEsRUE2N0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBNzdCYSxFQWk4QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqOEJhLEVBcThCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXI4QmEsRUF5OEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBejhCYSxFQTY4QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3OEJhLEVBaTlCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWo5QmEsRUFxOUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcjlCYSxFQXk5QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6OUJhLEVBNjlCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTc5QmEsRUFpK0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBaitCYSxDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gbWFpbiAtPiBmb3JtXHJcbmV4cG9ydCBjb25zdCBFRElUX0NPTlRBQ1QgPSAnZWRpdC1jb250YWN0JztcclxuXHJcbi8vIGZvcm0gLT4gbWFpblxyXG5leHBvcnQgY29uc3QgTkVXX0NPTlRBQ1QgPSAnbmV3LWNvbnRhY3QnO1xyXG5leHBvcnQgY29uc3QgVVBEQVRFX0NPTlRBQ1QgPSAndXBkYXRlLWNvbnRhY3QnO1xyXG5cclxuLy8gbWFpbiAtPiBkZWxldGVcclxuZXhwb3J0IGNvbnN0IERFTEVURV9DT05UQUNUID0gJ2RlbGV0ZS1jb250YWN0JztcclxuXHJcbi8vIGRlbGV0ZSAtPiBtYWluXHJcbmV4cG9ydCBjb25zdCBERUxFVEVfQ09ORklSTSA9ICdkZWxldGUtY29uZmlybSc7XHJcbmV4cG9ydCBjb25zdCBERUxFVEVfQ0FOQ0VMID0gJ2RlbGV0ZS1jYW5jZWwnO1xyXG5cclxuLy8gbWFpbiAtPiBsaXN0XHJcbmV4cG9ydCBjb25zdCBJTklUX0xJU1QgPSAnaW5pdC1saXN0JztcclxuZXhwb3J0IGNvbnN0IEFERF9UT19MSVNUID0gJ2FkZC10by1saXN0JztcclxuZXhwb3J0IGNvbnN0IFVQREFURV9MSVNUID0gJ3VwZGF0ZS1saXN0JztcclxuZXhwb3J0IGNvbnN0IFJFTU9WRV9GUk9NX0xJU1QgPSAncmVtb3ZlLWZyb20tbGlzdCc7XHJcblxyXG4vLyBsaXN0IC0+IG1haW5cclxuZXhwb3J0IGNvbnN0IE5FV19SRVFVRVNUID0gJ25ldy1yZXF1ZXN0JztcclxuZXhwb3J0IGNvbnN0IFVQREFURV9SRVFVRVNUID0gJ3VwZGF0ZS1yZXF1ZXN0JztcclxuZXhwb3J0IGNvbnN0IERFTEVURV9SRVFVRVNUID0gJ2RlbGV0ZS1yZXF1ZXN0JzsiLCJleHBvcnQgY29uc3QgTEFTVF9JRCA9ICdsYXN0LWlkJztcclxuZXhwb3J0IGNvbnN0IEFERFJFU1NfQk9PSyA9ICdhZGRyZXNzLWJvb2snOyIsImltcG9ydCB7IGhhc1Byb3AgfSBmcm9tICcuLi91dGlscy9mcC51dGlsLmpzJztcclxuXHJcbmNvbnN0IHN1YnNjcmliZXJzID0ge307XHJcblxyXG5leHBvcnQgY29uc3Qgc3Vic2NyaWJlID0gKGNoYW5uZWwsIGZuKSA9PiB7XHJcbiAgICBpZiAoIWNoYW5uZWxFeGlzdHMoY2hhbm5lbCkpIHtcclxuICAgICAgICBzdWJzY3JpYmVyc1tjaGFubmVsXSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHN1YnNjcmliZXJzW2NoYW5uZWxdLnB1c2goZm4pO1xyXG4gICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdW5zdWJzY3JpYmUgPSAoY2hhbm5lbCwgZm4pID0+IHtcclxuICAgIGlmIChjaGFubmVsRXhpc3RzKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgc3Vic2NyaWJlcnNbY2hhbm5lbF0uc3BsaWNlKHN1YnNjcmliZXJzLmluZGV4T2YoZm4pLCAxKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBub3RpZnkgPSAoY2hhbm5lbCwgbWVzc2FnZSkgPT4ge1xyXG4gICAgaWYgKGNoYW5uZWxFeGlzdHMoY2hhbm5lbCkpIHtcclxuICAgICAgICBzdWJzY3JpYmVyc1tjaGFubmVsXS5mb3JFYWNoKChmbikgPT4ge1xyXG4gICAgICAgICAgICBmbihtZXNzYWdlKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gY2hhbm5lbEV4aXN0cyhjaGFubmVsKSB7XHJcbiAgICByZXR1cm4gaGFzUHJvcChzdWJzY3JpYmVycywgY2hhbm5lbCk7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgRURJVF9DT05UQUNULFxyXG4gICAgTkVXX0NPTlRBQ1QsXHJcbiAgICBVUERBVEVfQ09OVEFDVCxcclxuICAgIERFTEVURV9DT05UQUNULFxyXG4gICAgSU5JVF9MSVNULFxyXG4gICAgQUREX1RPX0xJU1QsXHJcbiAgICBVUERBVEVfTElTVCxcclxuICAgIFJFTU9WRV9GUk9NX0xJU1QsXHJcbiAgICBVUERBVEVfUkVRVUVTVCxcclxuICAgIERFTEVURV9SRVFVRVNULFxyXG4gICAgREVMRVRFX0NPTkZJUk0sXHJcbn0gZnJvbSAnLi9jb25zdGFudHMvY2hhbm5lbHMuanMnO1xyXG5cclxuaW1wb3J0IHsgQUREUkVTU19CT09LLCBMQVNUX0lEIH0gZnJvbSAnLi9jb25zdGFudHMvZGF0YWJhc2VzLmpzJztcclxuXHJcbmltcG9ydCB7IG5vdGlmeSwgc3Vic2NyaWJlIGFzIG9ic2VydmVNZXNzYWdlcyB9IGZyb20gJy4vaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMnO1xyXG5cclxuaW1wb3J0IHsgdXBkYXRlIGFzIHVwZGF0ZURiLCByZWFkIGFzIHJlYWREYiB9IGZyb20gJy4vc2VydmljZXMvZGIuc2VydmljZS5qcyc7XHJcblxyXG5pbXBvcnQgaW5pdExpc3QgZnJvbSAnLi92aWV3LWNvbnRyb2xsZXJzL2xpc3QvY29udHJvbGxlci5qcyc7XHJcbmltcG9ydCBpbml0Rm9ybURpYWxvZyBmcm9tICcuL3ZpZXctY29udHJvbGxlcnMvZm9ybS1kaWFsb2cvY29udHJvbGxlci5qcyc7XHJcbmltcG9ydCBpbml0RGVsZXRlRGlhbG9nIGZyb20gJy4vdmlldy1jb250cm9sbGVycy9kZWxldGUtZGlhbG9nL2NvbnRyb2xsZXIuanMnO1xyXG5cclxuaW1wb3J0IHsgYXBwZW5kQWxsIH0gZnJvbSAnLi91dGlscy9kb20uZ2VuZXJhbC51dGlsLmpzJztcclxuXHJcbi8vIG1vZHVsZSBkYXRhXHJcbmNvbnN0IGFkZHJlc3NCb29rID0gcmVhZERiKEFERFJFU1NfQk9PSywge30pO1xyXG5sZXQgbGFzdElkID0gcmVhZERiKExBU1RfSUQsIHt2YWx1ZTogMCB9KS52YWx1ZTtcclxuXHJcbi8vIGluaXRpYWxpemUgdmlldyBjb250cm9sbGVycywgYXBwZW5kIHRoZW0sIGFuZCBpbml0aWFsaXplIGxpc3QgY29udGVudHNcclxuUHJvbWlzZVxyXG4gICAgLmFsbChbXHJcbiAgICAgICAgaW5pdExpc3QoKSxcclxuICAgICAgICBpbml0Rm9ybURpYWxvZygpLFxyXG4gICAgICAgIGluaXREZWxldGVEaWFsb2coKSxcclxuICAgIF0pXHJcbiAgICAudGhlbigoZXZlcnl0aGluZykgPT4gZXZlcnl0aGluZy5yZWR1Y2UoXHJcbiAgICAgICAgKGZsYXRBcnJheSwgJHZpZXcpID0+IHtcclxuICAgICAgICAgICAgZmxhdEFycmF5LnB1c2goJHZpZXcpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmxhdEFycmF5O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW11cclxuICAgICkpXHJcbiAgICAudGhlbigodmlld3MpID0+IHtcclxuICAgICAgICBjb25zdCAkbWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qc01haW4nKTtcclxuXHJcbiAgICAgICAgYXBwZW5kQWxsKCRtYWluLCB2aWV3cyk7XHJcbiAgICB9KVxyXG4gICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIG5vdGlmeShJTklUX0xJU1QsIGFkZHJlc3NCb29rKTtcclxuICAgIH0pO1xyXG5cclxuLy8gbWVzc2FnZXM6IGZvcm0gLT4gbWFpblxyXG5vYnNlcnZlTWVzc2FnZXMoTkVXX0NPTlRBQ1QsICh7bmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWx9KSA9PiB7XHJcbiAgICBsYXN0SWQgKz0gMTtcclxuXHJcbiAgICBjb25zdCBuZXdDb250YWN0ID0ge1xyXG4gICAgICAgIGlkOiBsYXN0SWQsXHJcbiAgICAgICAgbmFtZSxcclxuICAgICAgICBzdXJuYW1lLFxyXG4gICAgICAgIGNvdW50cnksXHJcbiAgICAgICAgZW1haWwsXHJcbiAgICB9O1xyXG5cclxuICAgIGFkZHJlc3NCb29rW2xhc3RJZF0gPSBuZXdDb250YWN0O1xyXG5cclxuICAgIHVwZGF0ZURiKHsgbGFzdElkLCBhZGRyZXNzQm9vayB9KTtcclxuICAgIG5vdGlmeShBRERfVE9fTElTVCwgbmV3Q29udGFjdCk7XHJcbn0pO1xyXG5cclxub2JzZXJ2ZU1lc3NhZ2VzKFVQREFURV9DT05UQUNULCAoe2lkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbH0pID0+IHtcclxuICAgIGFkZHJlc3NCb29rW2lkXSA9IHsgaWQsIG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsIH07XHJcbiAgICB1cGRhdGVEYih7IGFkZHJlc3NCb29rIH0pO1xyXG4gICAgbm90aWZ5KFVQREFURV9MSVNULCB7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KTtcclxufSk7XHJcblxyXG4vLyBtZXNzYWdlczogZGVsZXRlIC0+IG1haW5cclxub2JzZXJ2ZU1lc3NhZ2VzKERFTEVURV9DT05GSVJNLCAoe2lkfSkgPT4ge1xyXG4gICAgZGVsZXRlIGFkZHJlc3NCb29rW2lkXTtcclxuICAgIHVwZGF0ZURiKHsgYWRkcmVzc0Jvb2sgfSk7XHJcbiAgICBub3RpZnkoUkVNT1ZFX0ZST01fTElTVCwgeyBpZCB9KTtcclxufSk7XHJcblxyXG4vLyBtZXNzYWdlczogbGlzdCAtPiBtYWluXHJcbm9ic2VydmVNZXNzYWdlcyhERUxFVEVfUkVRVUVTVCwgKHsgaWQgfSkgPT4ge1xyXG4gICAgbm90aWZ5KERFTEVURV9DT05UQUNULCB7IGlkLCBjb250YWN0OiBhZGRyZXNzQm9va1tpZF0gfSk7XHJcbn0pO1xyXG5cclxub2JzZXJ2ZU1lc3NhZ2VzKFVQREFURV9SRVFVRVNULCAoeyBpZCB9KSA9PiB7XHJcbiAgICBub3RpZnkoRURJVF9DT05UQUNULCBhZGRyZXNzQm9va1tpZF0pO1xyXG59KTsiLCJpbXBvcnQgeyBMQVNUX0lELCBBRERSRVNTX0JPT0sgfSBmcm9tICcuLi9jb25zdGFudHMvZGF0YWJhc2VzLmpzJztcclxuaW1wb3J0IHsgc2V0LCBnZXQgfSBmcm9tICcuLi91dGlscy9sb2NhbC1zdG9yYWdlLnV0aWwuanMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IHVwZGF0ZSA9ICh7bGFzdElkLCBhZGRyZXNzQm9va30pID0+IHtcclxuICAgIGlmIChsYXN0SWQpIHtcclxuICAgICAgICBzZXQoTEFTVF9JRCwgSlNPTi5zdHJpbmdpZnkoe3ZhbHVlOiBsYXN0SWR9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFkZHJlc3NCb29rKSB7XHJcbiAgICAgICAgc2V0KEFERFJFU1NfQk9PSywgSlNPTi5zdHJpbmdpZnkoYWRkcmVzc0Jvb2spKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCByZWFkID0gKGtleSwgZmFsbGJhY2sgPSBudWxsKSA9PiBnZXQoa2V5KSB8fCBmYWxsYmFjazsiLCJpbXBvcnQgQ291bnRyeUxpc3QgZnJvbSAnLi4vLi4vbGlicy9jb3VudHJ5LWxpc3QvY291bnRyeS1saXN0LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBDb3VudHJ5TGlzdCgpOyIsImV4cG9ydCBjb25zdCBzdHJpbmdUb0h0bWwgPSAoc3RyaW5nVGVtcGxhdGUpID0+IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHN0cmluZ1RlbXBsYXRlKTtcclxuXHJcbmV4cG9ydCBjb25zdCBhcHBlbmRBbGwgPSAoJHBhcmVudCwgY2hpbGRyZW4pID0+IHtcclxuICAgIFtdLmZvckVhY2guY2FsbChjaGlsZHJlbiwgKCRjaGlsZCkgPT4ge1xyXG4gICAgICAgICRwYXJlbnQuYXBwZW5kQ2hpbGQoJGNoaWxkKTtcclxuICAgIH0pO1xyXG59OyIsImltcG9ydCB7IGl0ZW1UZXh0IH0gZnJvbSAnLi4vdXRpbHMvdGV4dC51dGlsLmpzJztcclxuXHJcbmNvbnN0IGNyZWF0ZUxhYmVsID0gKG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsKSA9PlxyXG4gICAgT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSwge1xyXG4gICAgICAgIGNsYXNzTmFtZTogJ2l0ZW0tbGFiZWwnLFxyXG4gICAgICAgIHRleHRDb250ZW50OiBpdGVtVGV4dCh7IG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsIH0pLFxyXG4gICAgfSk7XHJcblxyXG5jb25zdCBjcmVhdGVCdXR0b24gPSAoY2xhc3NOYW1lLCB0ZXh0Q29udGVudCwgdHlwZSwgaWQpID0+IHtcclxuICAgIGNvbnN0ICRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuXHJcbiAgICAkYnV0dG9uLmN1c3RvbURhdGEgPSB7XHJcbiAgICAgICAgY29udGFjdElkOiBpZCxcclxuICAgICAgICBhY3Rpb246IHR5cGUsXHJcbiAgICB9O1xyXG5cclxuICAgICRidXR0b24uY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgJGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHRDb250ZW50O1xyXG5cclxuICAgIHJldHVybiAkYnV0dG9uO1xyXG59O1xyXG5cclxuY29uc3QgY3JlYXRlRWRpdEJ1dHRvbiA9IChpZCkgPT4gY3JlYXRlQnV0dG9uKCdpdGVtRWRpdCcsICdFZGl0JywgJ2VkaXQnLCBpZCk7XHJcblxyXG5jb25zdCBjcmVhdGVEZWxldGVCdXR0b24gPSAoaWQpID0+IGNyZWF0ZUJ1dHRvbignaXRlbURlbGV0ZScsICdEZWxldGUnLCAnZGVsZXRlJywgaWQpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZUl0ZW0gPSAoeyBpZCwgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSkgPT4ge1xyXG4gICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG5cclxuICAgIGxpLmNsYXNzTmFtZSA9ICdpdGVtJztcclxuXHJcbiAgICBsaS5hcHBlbmRDaGlsZChjcmVhdGVMYWJlbChuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCkpO1xyXG4gICAgbGkuYXBwZW5kQ2hpbGQoY3JlYXRlRWRpdEJ1dHRvbihpZCkpO1xyXG4gICAgbGkuYXBwZW5kQ2hpbGQoY3JlYXRlRGVsZXRlQnV0dG9uKGlkKSk7XHJcblxyXG4gICAgcmV0dXJuIGxpO1xyXG59O1xyXG4iLCJleHBvcnQgZGVmYXVsdCAoY29kZSwgbmFtZSkgPT4ge1xyXG4gICAgY29uc3QgJG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cclxuICAgICRvcHRpb24udmFsdWUgPSBjb2RlO1xyXG4gICAgJG9wdGlvbi50ZXh0Q29udGVudCA9IG5hbWU7XHJcblxyXG4gICAgcmV0dXJuICRvcHRpb247XHJcbn07IiwiaW1wb3J0IHsgZ2V0IGFzIGdldEZyb20gfSBmcm9tICcuL3Byb21pc2lmaWVkLnJlcXVlc3QudXRpbC5qcyc7XHJcbmltcG9ydCB7IHN0cmluZ1RvSHRtbCB9IGZyb20gJy4vZG9tLmdlbmVyYWwudXRpbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAodXJsKSA9PiBnZXRGcm9tKHVybCkudGhlbihzdHJpbmdUb0h0bWwpOyIsImV4cG9ydCBjb25zdCBjb21wb3NlID1cclxuICAgICguLi5mdW5jdGlvbnMpID0+ICguLi5pbml0aWFsKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gZnVuY3Rpb25zLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbnMucmVkdWNlUmlnaHQoXHJcbiAgICAgICAgICAgICh2YWx1ZSwgZm4sIGluZGV4KSA9PiBpbmRleCA9PT0gbGFzdEluZGV4ID8gZm4oLi4udmFsdWUpIDogZm4odmFsdWUpLFxyXG4gICAgICAgICAgICBpbml0aWFsXHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcblxyXG5leHBvcnQgY29uc3QgaGFzUHJvcCA9XHJcbiAgICAob2JqZWN0LCBwcm9wKSA9PiBvYmplY3QuaGFzT3duUHJvcGVydHkocHJvcCk7IiwiY29uc3QgeyBsb2NhbFN0b3JhZ2UgfSA9IHdpbmRvdztcclxuXHJcbmV4cG9ydCBjb25zdCBzZXQgPSAoa2V5LCB2YWx1ZSkgPT4ge1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0ID0gKGtleSkgPT4ge1xyXG4gICAgY29uc3Qgb2JqZWN0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcclxuXHJcbiAgICByZXR1cm4gb2JqZWN0ICE9IG51bGwgPyBKU09OLnBhcnNlKG9iamVjdCkgOiBudWxsO1xyXG59IiwiLy8gc291cmNlOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzAwMDgxMTUvNTY1ODcwMlxyXG5jb25zdCBnZW5lcmFsID0gKG1ldGhvZCwgdXJsKSA9PlxyXG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuICAgICAgICB4aHIub3BlbihtZXRob2QsIHVybCk7XHJcblxyXG4gICAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmVqZWN0KHtcclxuICAgICAgICAgICAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB4aHIuc2VuZCgpO1xyXG4gICAgfSk7XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0ID0gKHVybCkgPT4gZ2VuZXJhbCgnR0VUJywgdXJsKTtcclxuXHJcbmV4cG9ydCBjb25zdCBwb3N0ID0gKHVybCkgPT4gZ2VuZXJhbCgnUE9TVCcsIHVybCk7XHJcbiIsImltcG9ydCBjb3VudHJ5TGlzdCBmcm9tICcuL2NvdW50cnktbGlzdC51dGlsLmpzJztcclxuXHJcbmV4cG9ydCBjb25zdCBpdGVtVGV4dCA9XHJcbiAgICAgICh7IG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsIH0pID0+XHJcbiAgICAgICAgYCR7bmFtZX0gJHtzdXJuYW1lfSAoJHtjb3VudHJ5ICYmIGNvdW50cnlMaXN0LmdldE5hbWUoY291bnRyeSl9KSwgJHtlbWFpbH1gOyIsImltcG9ydCBjb3VudHJ5TGlzdCBmcm9tICcuL2NvdW50cnktbGlzdC51dGlsLmpzJztcclxuXHJcbi8vIG5vdGU6XHJcbi8vIHZhbGlkYXRvcnMgY291bGQgcHJvYmFibHkgYmUgaW1wcm92ZWQsXHJcbi8vIGFzIHRoZXkgYWxsb3cgZm9yIG5hbWVzIGxpa2Ug4oCcQCMkLSgp4oCdLFxyXG4vLyBidXQgdGhpcyBjb3VsZCB0YWtlIGhvdXJzLCBpZiBub3QgZGF5cyxcclxuLy8gc28gaXQgd2FzIGxlZnQgYXQgdGhlIHZlcnkgYmFzaWMgZnVuY3Rpb25hbGl0eVxyXG5cclxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlTmFtZSA9XHJcbiAgICAobmFtZSkgPT5cclxuICAgICAgICB0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJyAmJlxyXG4gICAgICAgIG5hbWUubGVuZ3RoID4gMCAmJlxyXG4gICAgICAgIC9bXFx3XSsvLnRlc3QobmFtZS5yZXBsYWNlKC9cXGQvZywgJycpKTtcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZGF0ZVN1cm5hbWUgPVxyXG4gICAgKHN1cm5hbWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHN1cm5hbWUgIT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmFtZVdpdGhvdXREaWdpdHMgPSBzdXJuYW1lLnJlcGxhY2UoL1xcZC9nLCAnJyk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdXJuYW1lID09PSAnJyB8fCAvW1xcd10rLy50ZXN0KG5hbWVXaXRob3V0RGlnaXRzKTtcclxuICAgIH07XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRhdGVDb3VudHJ5ID0gKGNvZGUpID0+IHtcclxuICAgIHJldHVybiBjb3VudHJ5TGlzdC5nZXROYW1lKGNvZGUpICE9PSB1bmRlZmluZWQ7XHJcbn07XHJcblxyXG4vLyBzb3VyY2U6IGh0dHBzOi8vd3d3LnJlZ3VsYXItZXhwcmVzc2lvbnMuaW5mby9lbWFpbC5odG1sXHJcbmNvbnN0IGVtYWlsUmVnZXggPSAvW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKyg/OlxcLlthLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSspKkAoPzpbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/XFwuKStbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/LztcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUVtYWlsID1cclxuICAgIChlbWFpbCkgPT5cclxuICAgICAgICB0eXBlb2YgZW1haWwgPT0gJ3N0cmluZycgJiZcclxuICAgICAgICBlbWFpbFJlZ2V4LnRlc3QoZW1haWwpOyIsImltcG9ydCB7XHJcbiAgICBERUxFVEVfQ09OVEFDVCxcclxuICAgIERFTEVURV9DT05GSVJNLFxyXG59IGZyb20gJy4uLy4uL2NvbnN0YW50cy9jaGFubmVscy5qcyc7XHJcblxyXG5pbXBvcnQgZ2V0VGVtcGxhdGUgZnJvbSAnLi4vLi4vdXRpbHMvZG9tLnRlbXBsYXRlLnV0aWwuanMnO1xyXG5pbXBvcnQgeyBub3RpZnksIHN1YnNjcmliZSBhcyBvYnNlcnZlTWVzc2FnZXMgfSBmcm9tICcuLi8uLi9oZWxwZXJzL21lc3NhZ2UtYnVzLmhlbHBlci5qcyc7XHJcbmltcG9ydCB7IGl0ZW1UZXh0IH0gZnJvbSAnLi4vLi4vdXRpbHMvdGV4dC51dGlsLmpzJztcclxuXHJcbi8vIGluaXQgZnVuY3Rpb25cclxuZXhwb3J0IGRlZmF1bHQgKCkgPT5cclxuICAgIGdldFRlbXBsYXRlKCcvYXBwL3ZpZXctY29udHJvbGxlcnMvZGVsZXRlLWRpYWxvZy92aWV3Lmh0bWwnKVxyXG4gICAgICAgIC50aGVuKCgkdmlldykgPT4ge1xyXG4gICAgICAgICAgICAvLyBkYXRhXHJcbiAgICAgICAgICAgIGxldCBfaWQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gZWxlbWVudHNcclxuICAgICAgICAgICAgY29uc3QgJGRpYWxvZyA9ICR2aWV3LnF1ZXJ5U2VsZWN0b3IoJy5qc0RpYWxvZycpO1xyXG4gICAgICAgICAgICBjb25zdCAkZm9ybSA9ICRkaWFsb2cucXVlcnlTZWxlY3RvcignLmpzRm9ybScpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgJGlkID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzSWQnKTtcclxuICAgICAgICAgICAgY29uc3QgJGRldGFpbHMgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuanNEZXRhaWxzJyk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCAkeWVzID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzWWVzJyk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRubyA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qc05vJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBtZXRob2RzIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVEZXRhaWxzID0gKGlkID0gJycsIGNvbnRhY3QgPSAnJykgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGlkLnZhbHVlID0gaWQ7XHJcbiAgICAgICAgICAgICAgICAkZGV0YWlscy50ZXh0Q29udGVudCA9IGl0ZW1UZXh0KGNvbnRhY3QpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdG9nZ2xlRGlhbG9nID0gKHN0YXR1cykgPT4gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRpYWxvZy5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnLCBzdGF0dXMpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBzaG93RGlhbG9nID0gdG9nZ2xlRGlhbG9nKHRydWUpO1xyXG4gICAgICAgICAgICBjb25zdCBoaWRlRGlhbG9nID0gdG9nZ2xlRGlhbG9nKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNsb3NlRGlhbG9nID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgX2lkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICRmb3JtLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVEZXRhaWxzKCk7XHJcbiAgICAgICAgICAgICAgICBoaWRlRGlhbG9nKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIG1lc3NhZ2UgYnVzIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgIG9ic2VydmVNZXNzYWdlcyhERUxFVEVfQ09OVEFDVCwgKHtpZCwgY29udGFjdH0pID0+IHtcclxuICAgICAgICAgICAgICAgIF9pZCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlRGV0YWlscyhpZCwgY29udGFjdCk7XHJcbiAgICAgICAgICAgICAgICBzaG93RGlhbG9nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gdXNlciBpbnRlcmFjdGlvbnMgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICAgICAgICAgICAgJHllcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIG5vdGlmeShERUxFVEVfQ09ORklSTSwgeyBpZDogX2lkIH0pO1xyXG4gICAgICAgICAgICAgICAgY2xvc2VEaWFsb2coKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkbm8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBjbG9zZURpYWxvZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkdmlldztcclxuICAgICAgICB9KTsiLCJpbXBvcnQge1xyXG4gICAgTkVXX0NPTlRBQ1QsXHJcbiAgICBFRElUX0NPTlRBQ1QsXHJcbiAgICBVUERBVEVfQ09OVEFDVCAsXHJcbiAgICBORVdfUkVRVUVTVCxcclxufSBmcm9tICcuLi8uLi9jb25zdGFudHMvY2hhbm5lbHMuanMnO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIHZhbGlkYXRlTmFtZSxcclxuICAgIHZhbGlkYXRlU3VybmFtZSxcclxuICAgIHZhbGlkYXRlQ291bnRyeSxcclxuICAgIHZhbGlkYXRlRW1haWwsXHJcbn0gZnJvbSAnLi4vLi4vLi4vYXBwL3V0aWxzL3ZhbGlkYXRvci51dGlsLmpzJztcclxuXHJcbmltcG9ydCB7IG5vdGlmeSwgc3Vic2NyaWJlIGFzIG9ic2VydmVNZXNzYWdlcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvbWVzc2FnZS1idXMuaGVscGVyLmpzJztcclxuaW1wb3J0IGdldFRlbXBsYXRlIGZyb20gJy4uLy4uL3V0aWxzL2RvbS50ZW1wbGF0ZS51dGlsLmpzJztcclxuaW1wb3J0IHsgY29tcG9zZSB9IGZyb20gJy4uLy4uL3V0aWxzL2ZwLnV0aWwuanMnO1xyXG5pbXBvcnQgY3JlYXRlT3B0aW9uIGZyb20gJy4uLy4uL3V0aWxzL2RvbS5vcHRpb24udXRpbC5qcyc7XHJcbmltcG9ydCBjb3VudHJ5TGlzdCBmcm9tICcuLi8uLi91dGlscy9jb3VudHJ5LWxpc3QudXRpbC5qcyc7XHJcblxyXG4vLyBpbml0IGZ1bmN0aW9uXHJcbmV4cG9ydCBkZWZhdWx0ICgpID0+XHJcbiAgICBnZXRUZW1wbGF0ZSgnL2FwcC92aWV3LWNvbnRyb2xsZXJzL2Zvcm0tZGlhbG9nL3ZpZXcuaHRtbCcpXHJcbiAgICAgICAgLnRoZW4oKCR2aWV3KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIG1haW4gZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCAkZGlhbG9nID0gJHZpZXcucXVlcnlTZWxlY3RvcignLmpzRGlhbG9nJyk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRmb3JtID0gJGRpYWxvZy5xdWVyeVNlbGVjdG9yKCcuanNGb3JtJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBjb250YWluZXJzXHJcbiAgICAgICAgICAgIGNvbnN0ICRuYW1lQ29udGFpbmVyID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzTmFtZUNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICBjb25zdCAkc3VybmFtZUNvbnRhaW5lciA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qc1N1cm5hbWVDb250YWluZXInKTtcclxuICAgICAgICAgICAgY29uc3QgJGNvdW50cnlDb250YWluZXIgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuanNDb3VudHJ5Q29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRlbWFpbENvbnRhaW5lciA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qc0VtYWlsQ29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBpbnB1dHNcclxuICAgICAgICAgICAgY29uc3QgJGlkID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzSWQnKTtcclxuICAgICAgICAgICAgY29uc3QgJG5hbWUgPSAkbmFtZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuanNOYW1lJyk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRzdXJuYW1lID0gJHN1cm5hbWVDb250YWluZXIucXVlcnlTZWxlY3RvcignLmpzU3VybmFtZScpO1xyXG4gICAgICAgICAgICBjb25zdCAkY291bnRyeSA9ICRjb3VudHJ5Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qc0NvdW50cnknKTtcclxuICAgICAgICAgICAgY29uc3QgJGVtYWlsID0gJGVtYWlsQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qc0VtYWlsJyk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCAkY2FuY2VsID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzQ2FuY2VsJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBtZXRob2RzIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgICAgICBjb25zdCB0b2dnbGVEaWFsb2cgPSAoc3RhdHVzKSA9PiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZGlhbG9nLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScsIHN0YXR1cyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IHNob3dEaWFsb2cgPSB0b2dnbGVEaWFsb2codHJ1ZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGhpZGVEaWFsb2cgPSB0b2dnbGVEaWFsb2coZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZmlsbEZvcm1GaWVsZHMgPSAoeyBpZCwgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGlkLnZhbHVlID0gaWQ7XHJcbiAgICAgICAgICAgICAgICAkbmFtZS52YWx1ZSA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAkc3VybmFtZS52YWx1ZSA9IHN1cm5hbWU7XHJcbiAgICAgICAgICAgICAgICAkY291bnRyeS52YWx1ZSA9IGNvdW50cnk7XHJcbiAgICAgICAgICAgICAgICAkZW1haWwudmFsdWUgPSBlbWFpbDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdldFZhbHVlcyA9ICgpID0+ICh7XHJcbiAgICAgICAgICAgICAgICBpZDogJGlkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogJG5hbWUudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBzdXJuYW1lOiAkc3VybmFtZS52YWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvdW50cnk6ICRjb3VudHJ5LnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgZW1haWw6ICRlbWFpbC52YWx1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkaXNtaXNzRm9ybSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGhpZGVEaWFsb2coKTtcclxuICAgICAgICAgICAgICAgICRpZC52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgJGZvcm0ucmVzZXQoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRlRm9ybSA9IChuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCkgPT4gKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IHZhbGlkYXRlTmFtZShuYW1lKSxcclxuICAgICAgICAgICAgICAgIHN1cm5hbWU6IHZhbGlkYXRlU3VybmFtZShzdXJuYW1lKSxcclxuICAgICAgICAgICAgICAgIGNvdW50cnk6IHZhbGlkYXRlQ291bnRyeShjb3VudHJ5KSxcclxuICAgICAgICAgICAgICAgIGVtYWlsOiB2YWxpZGF0ZUVtYWlsKGVtYWlsKSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0b2dnbGVFcnJvckNsYXNzID0gKCRmaWVsZCwgc3RhdHVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZmllbGQuY2xhc3NMaXN0LnRvZ2dsZSgnaGFzLWVycm9yJywgc3RhdHVzKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG1hcmtFcnJvcnMgPSAoeyBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVFcnJvckNsYXNzKCRuYW1lQ29udGFpbmVyLCAhbmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVFcnJvckNsYXNzKCRzdXJuYW1lQ29udGFpbmVyLCAhc3VybmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVFcnJvckNsYXNzKCRjb3VudHJ5Q29udGFpbmVyLCAhY291bnRyeSk7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVFcnJvckNsYXNzKCRlbWFpbENvbnRhaW5lciwgIWVtYWlsKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgY2hlY2tWYWxpZGl0eSA9IChyZXBvcnQpID0+IE9iamVjdC52YWx1ZXMocmVwb3J0KS5ldmVyeSgoZmllbGQpID0+IGZpZWxkID09IHRydWUpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgYWxsR29vZCA9IGNvbXBvc2UoY2hlY2tWYWxpZGl0eSwgbWFya0Vycm9ycywgdmFsaWRhdGVGb3JtKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG9uIGxvYWQgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvdW50cmllcyA9IGNvdW50cnlMaXN0LmdldENvZGVMaXN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgT2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgLmtleXMoY291bnRyaWVzKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGNvZGUpID0+IGNyZWF0ZU9wdGlvbihjb2RlLCBjb3VudHJpZXNbY29kZV0pKVxyXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKCgkb3B0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb3VudHJ5LmFwcGVuZENoaWxkKCRvcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIG1lc3NhZ2UgYnVzIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgIG9ic2VydmVNZXNzYWdlcyhORVdfUkVRVUVTVCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2hvd0RpYWxvZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG9ic2VydmVNZXNzYWdlcyhFRElUX0NPTlRBQ1QsICh7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmaWxsRm9ybUZpZWxkcyh7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KTtcclxuICAgICAgICAgICAgICAgIHNob3dEaWFsb2coKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyB1c2VyIGludGVyYWN0aW9ucyBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgICAgICAkZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBpZCwgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSA9IGdldFZhbHVlcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghYWxsR29vZChuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZ5KFVQREFURV9DT05UQUNULCB7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZ5KE5FV19DT05UQUNULCB7IG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRpc21pc3NGb3JtKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJGNhbmNlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRpc21pc3NGb3JtKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICR2aWV3O1xyXG4gICAgICAgIH0pOyIsImltcG9ydCB7XHJcbiAgICBJTklUX0xJU1QsXHJcbiAgICBBRERfVE9fTElTVCxcclxuICAgIFVQREFURV9MSVNULFxyXG4gICAgUkVNT1ZFX0ZST01fTElTVCxcclxuICAgIE5FV19SRVFVRVNULFxyXG4gICAgVVBEQVRFX1JFUVVFU1QsXHJcbiAgICBERUxFVEVfUkVRVUVTVCxcclxufSBmcm9tICcuLi8uLi9jb25zdGFudHMvY2hhbm5lbHMuanMnO1xyXG5cclxuaW1wb3J0IHsgbm90aWZ5LCBzdWJzY3JpYmUgYXMgb2JzZXJ2ZU1lc3NhZ2VzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMnO1xyXG5pbXBvcnQgeyBjb21wb3NlIH0gZnJvbSAnLi4vLi4vdXRpbHMvZnAudXRpbC5qcyc7XHJcbmltcG9ydCBnZXRUZW1wbGF0ZSBmcm9tICcuLi8uLi91dGlscy9kb20udGVtcGxhdGUudXRpbC5qcyc7XHJcbmltcG9ydCB7IGl0ZW1UZXh0IH0gZnJvbSAnLi4vLi4vdXRpbHMvdGV4dC51dGlsLmpzJztcclxuaW1wb3J0IHsgY3JlYXRlSXRlbSB9IGZyb20gJy4uLy4uL3V0aWxzL2RvbS5pdGVtLnV0aWwuanMnO1xyXG5cclxuLy8gaW5pdCBmdW5jdGlvblxyXG5leHBvcnQgZGVmYXVsdCAoKSA9PlxyXG4gICAgZ2V0VGVtcGxhdGUoJy9hcHAvdmlldy1jb250cm9sbGVycy9saXN0L3ZpZXcuaHRtbCcpXHJcbiAgICAgICAgLnRoZW4oKCR2aWV3KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIG1vZHVsZSBkYXRhXHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBlbGVtZW50c1xyXG4gICAgICAgICAgICBjb25zdCAkY29udGFjdHMgPSAkdmlldy5xdWVyeVNlbGVjdG9yKCcuanNDb250YWN0cycpO1xyXG4gICAgICAgICAgICBjb25zdCAkbmV3ID0gJGNvbnRhY3RzLnF1ZXJ5U2VsZWN0b3IoJy5qc05ldycpO1xyXG4gICAgICAgICAgICBjb25zdCAkbGlzdCA9ICRjb250YWN0cy5xdWVyeVNlbGVjdG9yKCcuanNDb250YWN0c0xpc3QnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG1ldGhvZHMgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgIGNvbnN0IGFkZEl0ZW0gPSAoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGxpc3QuYXBwZW5kQ2hpbGQoaXRlbSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhZGRTaW5nbGVJdGVtID0gKHtpZCwgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWx9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtID0gY3JlYXRlSXRlbSh7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtc1tpZF0gPSBuZXdJdGVtO1xyXG5cclxuICAgICAgICAgICAgICAgIGFkZEl0ZW0obmV3SXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUl0ZW0gPSAoaWQpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vdGlmeShVUERBVEVfUkVRVUVTVCwgeyBpZCB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRlbGV0ZUl0ZW0gPSAoaWQpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vdGlmeShERUxFVEVfUkVRVUVTVCwgeyBpZCB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIG1lc3NhZ2UgYnVzIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgIG9ic2VydmVNZXNzYWdlcyhJTklUX0xJU1QsIChhZGRyZXNzQm9vaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgLnZhbHVlcyhhZGRyZXNzQm9vaylcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChhZGRTaW5nbGVJdGVtKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBvYnNlcnZlTWVzc2FnZXMoQUREX1RPX0xJU1QsIGFkZFNpbmdsZUl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgb2JzZXJ2ZU1lc3NhZ2VzKFVQREFURV9MSVNULCAoe2lkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtc1tpZF0ucXVlcnlTZWxlY3RvcignLml0ZW0tbGFiZWwnKS50ZXh0Q29udGVudCA9IGl0ZW1UZXh0KHsgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgb2JzZXJ2ZU1lc3NhZ2VzKFJFTU9WRV9GUk9NX0xJU1QsICh7IGlkIH0pID0+IHtcclxuICAgICAgICAgICAgICAgICRsaXN0LnJlbW92ZUNoaWxkKGl0ZW1zW2lkXSk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgaXRlbXNbaWRdO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHVzZXIgaW50ZXJhY3Rpb25zIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgICRuZXcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBub3RpZnkoTkVXX1JFUVVFU1QsIHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRsaXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGFjdGlvbiwgY29udGFjdElkIH0gPSBldmVudC50YXJnZXQuY3VzdG9tRGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZWRpdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlSXRlbShjb250YWN0SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGVsZXRlJzpcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVJdGVtKGNvbnRhY3RJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICR2aWV3O1xyXG4gICAgICAgIH0pO1xyXG4iLCIvLyBzb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYW5uYXJzaC9jb3VudHJ5LWxpc3RcclxuLy8gdGhlIGZpbGUgaGFzIGJlZW4gbW9kdWxyaXplZCBidXQgYW55dGhpbmcgZWxzZSBpcyBhcyBpdCB3YXNcclxuXHJcbmltcG9ydCBkYXRhIGZyb20gJy4vZGF0YS5qcyc7XHJcblxyXG4vLyd1c2Ugc3RyaWN0J1xyXG4vL1xyXG4vL3ZhciBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzb24nKVxyXG5cclxuLyoqXHJcbiAqIFByZWNvbXB1dGUgbmFtZSBhbmQgY29kZSBsb29rdXBzLlxyXG4gKi9cclxudmFyIG5hbWVNYXAgPSB7fVxyXG52YXIgY29kZU1hcCA9IHt9XHJcblxyXG5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGNvdW50cnkpIHtcclxuICBuYW1lTWFwW2NvdW50cnkubmFtZS50b0xvd2VyQ2FzZSgpXSA9IGNvdW50cnkuY29kZVxyXG4gIGNvZGVNYXBbY291bnRyeS5jb2RlLnRvTG93ZXJDYXNlKCldID0gY291bnRyeS5uYW1lXHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gQ291bnRyeUxpc3QgKCkge1xyXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb3VudHJ5TGlzdCkpIHJldHVybiBuZXcgQ291bnRyeUxpc3QoKVxyXG59O1xyXG5cclxuQ291bnRyeUxpc3QucHJvdG90eXBlLmdldENvZGUgPSBmdW5jdGlvbiBnZXRDb2RlIChuYW1lKSB7XHJcbiAgcmV0dXJuIG5hbWVNYXBbbmFtZS50b0xvd2VyQ2FzZSgpXVxyXG59O1xyXG5cclxuQ291bnRyeUxpc3QucHJvdG90eXBlLmdldE5hbWUgPSBmdW5jdGlvbiBnZXROYW1lIChjb2RlKSB7XHJcbiAgcmV0dXJuIGNvZGVNYXBbY29kZS50b0xvd2VyQ2FzZSgpXVxyXG59O1xyXG5cclxuQ291bnRyeUxpc3QucHJvdG90eXBlLmdldE5hbWVzID0gZnVuY3Rpb24gZ2V0TmFtZXMgKCkge1xyXG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoY291bnRyeSkge1xyXG4gICAgcmV0dXJuIGNvdW50cnkubmFtZVxyXG4gIH0pXHJcbn07XHJcblxyXG5Db3VudHJ5TGlzdC5wcm90b3R5cGUuZ2V0Q29kZXMgPSBmdW5jdGlvbiBnZXRDb2RlcyAoKSB7XHJcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChjb3VudHJ5KSB7XHJcbiAgICByZXR1cm4gY291bnRyeS5jb2RlXHJcbiAgfSlcclxufTtcclxuXHJcbkNvdW50cnlMaXN0LnByb3RvdHlwZS5nZXRDb2RlTGlzdCA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gY29kZU1hcFxyXG59O1xyXG5cclxuQ291bnRyeUxpc3QucHJvdG90eXBlLmdldE5hbWVMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiBuYW1lTWFwXHJcbn07XHJcblxyXG5Db3VudHJ5TGlzdC5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uIGdldERhdGEgKCkge1xyXG4gIHJldHVybiBkYXRhXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb3VudHJ5TGlzdDsiLCIvLyBzb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYW5uYXJzaC9jb3VudHJ5LWxpc3RcclxuLy8gdGhpcyB3YXMgSlNPTiBmaWxlIGJ1dCBuYXRpdmUgbW9kdWxlcyBkaWRu4oCZdCB3YW50IHRvIHdvcmtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFtcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBRlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQWZnaGFuaXN0YW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQVhcIixcclxuICAgIFwibmFtZVwiOiBcIsOFbGFuZCBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkFMXCIsXHJcbiAgICBcIm5hbWVcIjogXCJBbGJhbmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkRaXCIsXHJcbiAgICBcIm5hbWVcIjogXCJBbGdlcmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkFTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJBbWVyaWNhbiBTYW1vYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBRFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQW5kb3JyYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBT1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQW5nb2xhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkFJXCIsXHJcbiAgICBcIm5hbWVcIjogXCJBbmd1aWxsYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBUVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQW50YXJjdGljYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBR1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQW50aWd1YSBhbmQgQmFyYnVkYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQXJnZW50aW5hXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkFNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJBcm1lbmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkFXXCIsXHJcbiAgICBcIm5hbWVcIjogXCJBcnViYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBVVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQXVzdHJhbGlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkFUXCIsXHJcbiAgICBcIm5hbWVcIjogXCJBdXN0cmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkFaXCIsXHJcbiAgICBcIm5hbWVcIjogXCJBemVyYmFpamFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCYWhhbWFzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJIXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCYWhyYWluXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJEXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCYW5nbGFkZXNoXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJCXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCYXJiYWRvc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCWVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmVsYXJ1c1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmVsZ2l1bVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmVsaXplXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJKXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCZW5pblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmVybXVkYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmh1dGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJPXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCb2xpdmlhLCBQbHVyaW5hdGlvbmFsIFN0YXRlIG9mXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJRXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCb25haXJlLCBTaW50IEV1c3RhdGl1cyBhbmQgU2FiYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQm9zbmlhIGFuZCBIZXJ6ZWdvdmluYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQm90c3dhbmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQlZcIixcclxuICAgIFwibmFtZVwiOiBcIkJvdXZldCBJc2xhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQlJcIixcclxuICAgIFwibmFtZVwiOiBcIkJyYXppbFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJJT1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQnJpdGlzaCBJbmRpYW4gT2NlYW4gVGVycml0b3J5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJOXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCcnVuZWkgRGFydXNzYWxhbVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCR1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQnVsZ2FyaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQkZcIixcclxuICAgIFwibmFtZVwiOiBcIkJ1cmtpbmEgRmFzb1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCSVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQnVydW5kaVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJLSFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ2FtYm9kaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ01cIixcclxuICAgIFwibmFtZVwiOiBcIkNhbWVyb29uXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNBXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDYW5hZGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ1ZcIixcclxuICAgIFwibmFtZVwiOiBcIkNhcGUgVmVyZGVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiS1lcIixcclxuICAgIFwibmFtZVwiOiBcIkNheW1hbiBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNGXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDZW50cmFsIEFmcmljYW4gUmVwdWJsaWNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVERcIixcclxuICAgIFwibmFtZVwiOiBcIkNoYWRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ0xcIixcclxuICAgIFwibmFtZVwiOiBcIkNoaWxlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNOXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDaGluYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDWFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ2hyaXN0bWFzIElzbGFuZFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDQ1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ29jb3MgKEtlZWxpbmcpIElzbGFuZHNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ09cIixcclxuICAgIFwibmFtZVwiOiBcIkNvbG9tYmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIktNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDb21vcm9zXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNHXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDb25nb1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDRFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ29uZ28sIHRoZSBEZW1vY3JhdGljIFJlcHVibGljIG9mIHRoZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDS1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ29vayBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNSXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDb3N0YSBSaWNhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNJXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDw7R0ZSBkJ0l2b2lyZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJIUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ3JvYXRpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDVVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ3ViYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ3VyYcOnYW9cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ1lcIixcclxuICAgIFwibmFtZVwiOiBcIkN5cHJ1c1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ3plY2ggUmVwdWJsaWNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiREtcIixcclxuICAgIFwibmFtZVwiOiBcIkRlbm1hcmtcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiREpcIixcclxuICAgIFwibmFtZVwiOiBcIkRqaWJvdXRpXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkRNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJEb21pbmljYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJET1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiRG9taW5pY2FuIFJlcHVibGljXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkVDXCIsXHJcbiAgICBcIm5hbWVcIjogXCJFY3VhZG9yXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkVHXCIsXHJcbiAgICBcIm5hbWVcIjogXCJFZ3lwdFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTVlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiRWwgU2FsdmFkb3JcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR1FcIixcclxuICAgIFwibmFtZVwiOiBcIkVxdWF0b3JpYWwgR3VpbmVhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkVSXCIsXHJcbiAgICBcIm5hbWVcIjogXCJFcml0cmVhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkVFXCIsXHJcbiAgICBcIm5hbWVcIjogXCJFc3RvbmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkVUXCIsXHJcbiAgICBcIm5hbWVcIjogXCJFdGhpb3BpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJGS1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiRmFsa2xhbmQgSXNsYW5kcyAoTWFsdmluYXMpXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkZPXCIsXHJcbiAgICBcIm5hbWVcIjogXCJGYXJvZSBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkZKXCIsXHJcbiAgICBcIm5hbWVcIjogXCJGaWppXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkZJXCIsXHJcbiAgICBcIm5hbWVcIjogXCJGaW5sYW5kXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkZSXCIsXHJcbiAgICBcIm5hbWVcIjogXCJGcmFuY2VcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR0ZcIixcclxuICAgIFwibmFtZVwiOiBcIkZyZW5jaCBHdWlhbmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUEZcIixcclxuICAgIFwibmFtZVwiOiBcIkZyZW5jaCBQb2x5bmVzaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVEZcIixcclxuICAgIFwibmFtZVwiOiBcIkZyZW5jaCBTb3V0aGVybiBUZXJyaXRvcmllc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJHQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiR2Fib25cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR01cIixcclxuICAgIFwibmFtZVwiOiBcIkdhbWJpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJHRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiR2VvcmdpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJERVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiR2VybWFueVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJHSFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiR2hhbmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR0lcIixcclxuICAgIFwibmFtZVwiOiBcIkdpYnJhbHRhclwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJHUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiR3JlZWNlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdMXCIsXHJcbiAgICBcIm5hbWVcIjogXCJHcmVlbmxhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR0RcIixcclxuICAgIFwibmFtZVwiOiBcIkdyZW5hZGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR1BcIixcclxuICAgIFwibmFtZVwiOiBcIkd1YWRlbG91cGVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR1VcIixcclxuICAgIFwibmFtZVwiOiBcIkd1YW1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR1RcIixcclxuICAgIFwibmFtZVwiOiBcIkd1YXRlbWFsYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJHR1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiR3Vlcm5zZXlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR05cIixcclxuICAgIFwibmFtZVwiOiBcIkd1aW5lYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJHV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiR3VpbmVhLUJpc3NhdVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJHWVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiR3V5YW5hXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkhUXCIsXHJcbiAgICBcIm5hbWVcIjogXCJIYWl0aVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJITVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSGVhcmQgSXNsYW5kIGFuZCBNY0RvbmFsZCBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlZBXCIsXHJcbiAgICBcIm5hbWVcIjogXCJIb2x5IFNlZSAoVmF0aWNhbiBDaXR5IFN0YXRlKVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJITlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSG9uZHVyYXNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSEtcIixcclxuICAgIFwibmFtZVwiOiBcIkhvbmcgS29uZ1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJIVVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSHVuZ2FyeVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJJU1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiSWNlbGFuZFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJJTlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSW5kaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSURcIixcclxuICAgIFwibmFtZVwiOiBcIkluZG9uZXNpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJJUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSXJhbiwgSXNsYW1pYyBSZXB1YmxpYyBvZlwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJJUVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSXJhcVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJJRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSXJlbGFuZFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJJTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSXNsZSBvZiBNYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSUxcIixcclxuICAgIFwibmFtZVwiOiBcIklzcmFlbFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJJVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSXRhbHlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSk1cIixcclxuICAgIFwibmFtZVwiOiBcIkphbWFpY2FcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSlBcIixcclxuICAgIFwibmFtZVwiOiBcIkphcGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkpFXCIsXHJcbiAgICBcIm5hbWVcIjogXCJKZXJzZXlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSk9cIixcclxuICAgIFwibmFtZVwiOiBcIkpvcmRhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJLWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiS2F6YWtoc3RhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJLRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiS2VueWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiS0lcIixcclxuICAgIFwibmFtZVwiOiBcIktpcmliYXRpXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIktQXCIsXHJcbiAgICBcIm5hbWVcIjogXCJLb3JlYSwgRGVtb2NyYXRpYyBQZW9wbGUncyBSZXB1YmxpYyBvZlwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJLUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiS29yZWEsIFJlcHVibGljIG9mXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIktXXCIsXHJcbiAgICBcIm5hbWVcIjogXCJLdXdhaXRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiS0dcIixcclxuICAgIFwibmFtZVwiOiBcIkt5cmd5enN0YW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTEFcIixcclxuICAgIFwibmFtZVwiOiBcIkxhbyBQZW9wbGUncyBEZW1vY3JhdGljIFJlcHVibGljXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxWXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMYXR2aWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTEJcIixcclxuICAgIFwibmFtZVwiOiBcIkxlYmFub25cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTFNcIixcclxuICAgIFwibmFtZVwiOiBcIkxlc290aG9cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTFJcIixcclxuICAgIFwibmFtZVwiOiBcIkxpYmVyaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTFlcIixcclxuICAgIFwibmFtZVwiOiBcIkxpYnlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxJXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMaWVjaHRlbnN0ZWluXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxUXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMaXRodWFuaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTFVcIixcclxuICAgIFwibmFtZVwiOiBcIkx1eGVtYm91cmdcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTU9cIixcclxuICAgIFwibmFtZVwiOiBcIk1hY2FvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1LXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNYWNlZG9uaWEsIHRoZSBGb3JtZXIgWXVnb3NsYXYgUmVwdWJsaWMgb2ZcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTUdcIixcclxuICAgIFwibmFtZVwiOiBcIk1hZGFnYXNjYXJcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTVdcIixcclxuICAgIFwibmFtZVwiOiBcIk1hbGF3aVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNWVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWFsYXlzaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTVZcIixcclxuICAgIFwibmFtZVwiOiBcIk1hbGRpdmVzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1MXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNYWxpXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1UXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNYWx0YVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNSFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWFyc2hhbGwgSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNUVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWFydGluaXF1ZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWF1cml0YW5pYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNVVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWF1cml0aXVzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIllUXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNYXlvdHRlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1YXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNZXhpY29cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiRk1cIixcclxuICAgIFwibmFtZVwiOiBcIk1pY3JvbmVzaWEsIEZlZGVyYXRlZCBTdGF0ZXMgb2ZcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTURcIixcclxuICAgIFwibmFtZVwiOiBcIk1vbGRvdmEsIFJlcHVibGljIG9mXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1DXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNb25hY29cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTU5cIixcclxuICAgIFwibmFtZVwiOiBcIk1vbmdvbGlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1FXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNb250ZW5lZ3JvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1TXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNb250c2VycmF0XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1BXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNb3JvY2NvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1aXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNb3phbWJpcXVlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1NXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNeWFubWFyXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk5BXCIsXHJcbiAgICBcIm5hbWVcIjogXCJOYW1pYmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk5SXCIsXHJcbiAgICBcIm5hbWVcIjogXCJOYXVydVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOUFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTmVwYWxcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTkxcIixcclxuICAgIFwibmFtZVwiOiBcIk5ldGhlcmxhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk5DXCIsXHJcbiAgICBcIm5hbWVcIjogXCJOZXcgQ2FsZWRvbmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk5aXCIsXHJcbiAgICBcIm5hbWVcIjogXCJOZXcgWmVhbGFuZFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOSVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTmljYXJhZ3VhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk5FXCIsXHJcbiAgICBcIm5hbWVcIjogXCJOaWdlclwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOR1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiTmlnZXJpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOVVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTml1ZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJORlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTm9yZm9sayBJc2xhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTVBcIixcclxuICAgIFwibmFtZVwiOiBcIk5vcnRoZXJuIE1hcmlhbmEgSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOT1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiTm9yd2F5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk9NXCIsXHJcbiAgICBcIm5hbWVcIjogXCJPbWFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBLXCIsXHJcbiAgICBcIm5hbWVcIjogXCJQYWtpc3RhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJQV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiUGFsYXVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUFNcIixcclxuICAgIFwibmFtZVwiOiBcIlBhbGVzdGluZSwgU3RhdGUgb2ZcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUEFcIixcclxuICAgIFwibmFtZVwiOiBcIlBhbmFtYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJQR1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiUGFwdWEgTmV3IEd1aW5lYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJQWVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiUGFyYWd1YXlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUEVcIixcclxuICAgIFwibmFtZVwiOiBcIlBlcnVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUEhcIixcclxuICAgIFwibmFtZVwiOiBcIlBoaWxpcHBpbmVzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBOXCIsXHJcbiAgICBcIm5hbWVcIjogXCJQaXRjYWlyblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJQTFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiUG9sYW5kXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBUXCIsXHJcbiAgICBcIm5hbWVcIjogXCJQb3J0dWdhbFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJQUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiUHVlcnRvIFJpY29cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUUFcIixcclxuICAgIFwibmFtZVwiOiBcIlFhdGFyXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlJFXCIsXHJcbiAgICBcIm5hbWVcIjogXCJSw6l1bmlvblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJST1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiUm9tYW5pYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJSVVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiUnVzc2lhbiBGZWRlcmF0aW9uXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlJXXCIsXHJcbiAgICBcIm5hbWVcIjogXCJSd2FuZGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQkxcIixcclxuICAgIFwibmFtZVwiOiBcIlNhaW50IEJhcnRow6lsZW15XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNIXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTYWludCBIZWxlbmEsIEFzY2Vuc2lvbiBhbmQgVHJpc3RhbiBkYSBDdW5oYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJLTlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2FpbnQgS2l0dHMgYW5kIE5ldmlzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxDXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTYWludCBMdWNpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNRlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2FpbnQgTWFydGluIChGcmVuY2ggcGFydClcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUE1cIixcclxuICAgIFwibmFtZVwiOiBcIlNhaW50IFBpZXJyZSBhbmQgTWlxdWVsb25cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVkNcIixcclxuICAgIFwibmFtZVwiOiBcIlNhaW50IFZpbmNlbnQgYW5kIHRoZSBHcmVuYWRpbmVzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIldTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTYW1vYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2FuIE1hcmlub1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2FvIFRvbWUgYW5kIFByaW5jaXBlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNBXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTYXVkaSBBcmFiaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU05cIixcclxuICAgIFwibmFtZVwiOiBcIlNlbmVnYWxcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUlNcIixcclxuICAgIFwibmFtZVwiOiBcIlNlcmJpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTQ1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2V5Y2hlbGxlc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTTFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2llcnJhIExlb25lXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNHXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTaW5nYXBvcmVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU1hcIixcclxuICAgIFwibmFtZVwiOiBcIlNpbnQgTWFhcnRlbiAoRHV0Y2ggcGFydClcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU0tcIixcclxuICAgIFwibmFtZVwiOiBcIlNsb3Zha2lhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNJXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTbG92ZW5pYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTQlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU29sb21vbiBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNPXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTb21hbGlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlpBXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTb3V0aCBBZnJpY2FcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR1NcIixcclxuICAgIFwibmFtZVwiOiBcIlNvdXRoIEdlb3JnaWEgYW5kIHRoZSBTb3V0aCBTYW5kd2ljaCBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTb3V0aCBTdWRhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJFU1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiU3BhaW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTEtcIixcclxuICAgIFwibmFtZVwiOiBcIlNyaSBMYW5rYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTRFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU3VkYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU1JcIixcclxuICAgIFwibmFtZVwiOiBcIlN1cmluYW1lXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNKXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTdmFsYmFyZCBhbmQgSmFuIE1heWVuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNaXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTd2F6aWxhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU0VcIixcclxuICAgIFwibmFtZVwiOiBcIlN3ZWRlblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDSFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU3dpdHplcmxhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU1lcIixcclxuICAgIFwibmFtZVwiOiBcIlN5cmlhbiBBcmFiIFJlcHVibGljXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRXXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUYWl3YW4sIFByb3ZpbmNlIG9mIENoaW5hXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRKXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUYWppa2lzdGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRaXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUYW56YW5pYSwgVW5pdGVkIFJlcHVibGljIG9mXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRIXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUaGFpbGFuZFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUTFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVGltb3ItTGVzdGVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVEdcIixcclxuICAgIFwibmFtZVwiOiBcIlRvZ29cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVEtcIixcclxuICAgIFwibmFtZVwiOiBcIlRva2VsYXVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVE9cIixcclxuICAgIFwibmFtZVwiOiBcIlRvbmdhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRUXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUcmluaWRhZCBhbmQgVG9iYWdvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlROXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUdW5pc2lhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRSXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUdXJrZXlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVE1cIixcclxuICAgIFwibmFtZVwiOiBcIlR1cmttZW5pc3RhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUQ1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiVHVya3MgYW5kIENhaWNvcyBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRWXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUdXZhbHVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVUdcIixcclxuICAgIFwibmFtZVwiOiBcIlVnYW5kYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJVQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVWtyYWluZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVW5pdGVkIEFyYWIgRW1pcmF0ZXNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR0JcIixcclxuICAgIFwibmFtZVwiOiBcIlVuaXRlZCBLaW5nZG9tXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlVTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJVbml0ZWQgU3RhdGVzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlVNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJVbml0ZWQgU3RhdGVzIE1pbm9yIE91dGx5aW5nIElzbGFuZHNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVVlcIixcclxuICAgIFwibmFtZVwiOiBcIlVydWd1YXlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVVpcIixcclxuICAgIFwibmFtZVwiOiBcIlV6YmVraXN0YW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVlVcIixcclxuICAgIFwibmFtZVwiOiBcIlZhbnVhdHVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVkVcIixcclxuICAgIFwibmFtZVwiOiBcIlZlbmV6dWVsYSwgQm9saXZhcmlhbiBSZXB1YmxpYyBvZlwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJWTlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVmlldCBOYW1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVkdcIixcclxuICAgIFwibmFtZVwiOiBcIlZpcmdpbiBJc2xhbmRzLCBCcml0aXNoXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlZJXCIsXHJcbiAgICBcIm5hbWVcIjogXCJWaXJnaW4gSXNsYW5kcywgVS5TLlwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJXRlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiV2FsbGlzIGFuZCBGdXR1bmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiRUhcIixcclxuICAgIFwibmFtZVwiOiBcIldlc3Rlcm4gU2FoYXJhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIllFXCIsXHJcbiAgICBcIm5hbWVcIjogXCJZZW1lblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJaTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiWmFtYmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlpXXCIsXHJcbiAgICBcIm5hbWVcIjogXCJaaW1iYWJ3ZVwiXHJcbiAgfVxyXG5dOyJdfQ==
