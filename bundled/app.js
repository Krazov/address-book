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

// overlay -> others
var OVERLAY_CLICKED = exports.OVERLAY_CLICKED = 'overlay-clicked';

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

var channelExists = function channelExists(channel) {
    return (0, _fpUtil.hasProp)(subscribers, channel);
};

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

var _controller7 = require('./view-controllers/overlay/controller.js');

var _controller8 = _interopRequireDefault(_controller7);

var _domGeneralUtil = require('./utils/dom.general.util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// module data
var addressBook = (0, _dbService.read)(_databases.ADDRESS_BOOK, {});
var lastId = (0, _dbService.read)(_databases.LAST_ID, { value: 0 }).value;

// initialize view controllers, append them, and initialize list contents
Promise.all([(0, _controller2.default)(), (0, _controller4.default)(), (0, _controller6.default)(), (0, _controller8.default)()]).then(function (everything) {
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

},{"./constants/channels.js":1,"./constants/databases.js":2,"./helpers/message-bus.helper.js":3,"./services/db.service.js":5,"./utils/dom.general.util.js":7,"./view-controllers/delete-dialog/controller.js":16,"./view-controllers/form-dialog/controller.js":17,"./view-controllers/list/controller.js":18,"./view-controllers/overlay/controller.js":19}],5:[function(require,module,exports){
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

},{"../../libs/country-list/country-list.js":20}],7:[function(require,module,exports){
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
exports.refreshItem = exports.itemCreator = undefined;

var _countryListUtil = require('./country-list.util.js');

var _countryListUtil2 = _interopRequireDefault(_countryListUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var itemCreator = exports.itemCreator = function itemCreator($template) {
    return function (_ref) {
        var id = _ref.id,
            name = _ref.name,
            surname = _ref.surname,
            country = _ref.country,
            email = _ref.email;

        var $item = $template.cloneNode(true);

        $item.querySelector('.jsName').textContent = name + ' ' + surname;
        $item.querySelector('.jsCountry').textContent = '' + (country && _countryListUtil2.default.getName(country));
        $item.querySelector('.jsEmail').textContent = '' + email;

        $item.querySelector('.jsEdit').customData = {
            contactId: id,
            action: 'edit'
        };

        $item.querySelector('.jsDelete').customData = {
            contactId: id,
            action: 'delete'
        };

        return $item;
    };
};

var refreshItem = exports.refreshItem = function refreshItem($item, _ref2) {
    var name = _ref2.name,
        surname = _ref2.surname,
        country = _ref2.country,
        email = _ref2.email;

    $item.querySelector('.jsName').textContent = name + ' ' + surname;
    $item.querySelector('.jsCountry').textContent = '' + (country && _countryListUtil2.default.getName(country));
    $item.querySelector('.jsEmail').textContent = '' + email;
};

},{"./country-list.util.js":6}],9:[function(require,module,exports){
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

var pipe = exports.pipe = function pipe() {
    for (var _len3 = arguments.length, functions = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        functions[_key3] = arguments[_key3];
    }

    return function () {
        for (var _len4 = arguments.length, initial = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            initial[_key4] = arguments[_key4];
        }

        return functions.reduce(function (value, fn, index) {
            return index === 0 ? fn.apply(undefined, _toConsumableArray(value)) : fn(value);
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

                        (0, _messageBusHelper.subscribe)(_channels.NEW_REQUEST, hideDialog);
                        (0, _messageBusHelper.subscribe)(_channels.UPDATE_REQUEST, hideDialog);
                        (0, _messageBusHelper.subscribe)(_channels.OVERLAY_CLICKED, hideDialog);

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
                        var $title = $dialog.querySelector('.jsTitle');
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

                        var setTitle = function setTitle(title) {
                                    return function () {
                                                $title.textContent = title;
                                    };
                        };
                        var setTitleForNew = setTitle('New contact');
                        var setTitleForEdit = setTitle('Edit contact');

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

                        var markGood = function markGood() {
                                    return markErrors({
                                                name: true,
                                                surname: true,
                                                country: true,
                                                email: true
                                    });
                        };

                        var checkValidity = function checkValidity(report) {
                                    return Object.values(report).every(function (field) {
                                                return field == true;
                                    });
                        };

                        var allGood = (0, _fpUtil.compose)(checkValidity, markErrors, validateForm);

                        var restartForm = (0, _fpUtil.pipe)(dismissForm, setTitleForNew, showDialog);

                        var startEditingForm = (0, _fpUtil.pipe)(fillFormFields, markGood, setTitleForEdit, showDialog);

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
                        (0, _messageBusHelper.subscribe)(_channels.NEW_REQUEST, restartForm);
                        (0, _messageBusHelper.subscribe)(_channels.DELETE_REQUEST, dismissForm);
                        (0, _messageBusHelper.subscribe)(_channels.OVERLAY_CLICKED, dismissForm);
                        (0, _messageBusHelper.subscribe)(_channels.EDIT_CONTACT, startEditingForm);

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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
    return Promise.all([(0, _domTemplateUtil2.default)('/app/view-controllers/list/view.html'), (0, _domTemplateUtil2.default)('/app/view-controllers/list/item.html')]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            $view = _ref2[0],
            $item = _ref2[1];

        // module data
        var items = {};

        // elements
        var $contacts = $view.querySelector('.jsContacts');
        var $new = $contacts.querySelector('.jsNew');
        var $list = $contacts.querySelector('.jsContactsList');

        // methods ________________________________________________________________________________________________
        var addItem = function addItem($item) {
            $list.appendChild($item);
        };

        var createItem = (0, _domItemUtil.itemCreator)($item.children[0]);

        var addSingleItem = function addSingleItem(_ref3) {
            var id = _ref3.id,
                name = _ref3.name,
                surname = _ref3.surname,
                country = _ref3.country,
                email = _ref3.email;

            var newItem = createItem({ id: id, name: name, surname: surname, country: country, email: email });

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

        (0, _messageBusHelper.subscribe)(_channels.UPDATE_LIST, function (_ref4) {
            var id = _ref4.id,
                name = _ref4.name,
                surname = _ref4.surname,
                country = _ref4.country,
                email = _ref4.email;

            (0, _domItemUtil.refreshItem)(items[id], { name: name, surname: surname, country: country, email: email });
        });

        (0, _messageBusHelper.subscribe)(_channels.REMOVE_FROM_LIST, function (_ref5) {
            var id = _ref5.id;

            $list.removeChild(items[id]);
            delete items[id];
        });

        // user interactions ______________________________________________________________________________________
        $new.addEventListener('click', function () {
            (0, _messageBusHelper.notify)(_channels.NEW_REQUEST, true);
        });

        $list.addEventListener('click', function (event) {
            var _event$target$customD = event.target.customData;
            _event$target$customD = _event$target$customD === undefined ? {} : _event$target$customD;
            var action = _event$target$customD.action,
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

var _channels = require('../../constants/channels.js');

var _domTemplateUtil = require('../../utils/dom.template.util.js');

var _domTemplateUtil2 = _interopRequireDefault(_domTemplateUtil);

var _messageBusHelper = require('../../helpers/message-bus.helper.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// init function
exports.default = function () {
    return (0, _domTemplateUtil2.default)('/app/view-controllers/overlay/view.html').then(function ($view) {
        var $overlay = $view.querySelector('.jsOverlay');

        // user interaction _______________________________________________________________________________________
        $overlay.addEventListener('click', function () {
            (0, _messageBusHelper.notify)(_channels.OVERLAY_CLICKED, true);
        });

        return $view;
    });
};

},{"../../constants/channels.js":1,"../../helpers/message-bus.helper.js":3,"../../utils/dom.template.util.js":10}],20:[function(require,module,exports){
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

},{"./data.js":21}],21:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvY29uc3RhbnRzL2NoYW5uZWxzLmpzIiwiYXBwL2NvbnN0YW50cy9kYXRhYmFzZXMuanMiLCJhcHAvaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zZXJ2aWNlcy9kYi5zZXJ2aWNlLmpzIiwiYXBwL3V0aWxzL2NvdW50cnktbGlzdC51dGlsLmpzIiwiYXBwL3V0aWxzL2RvbS5nZW5lcmFsLnV0aWwuanMiLCJhcHAvdXRpbHMvZG9tLml0ZW0udXRpbC5qcyIsImFwcC91dGlscy9kb20ub3B0aW9uLnV0aWwuanMiLCJhcHAvdXRpbHMvZG9tLnRlbXBsYXRlLnV0aWwuanMiLCJhcHAvdXRpbHMvZnAudXRpbC5qcyIsImFwcC91dGlscy9sb2NhbC1zdG9yYWdlLnV0aWwuanMiLCJhcHAvdXRpbHMvcHJvbWlzaWZpZWQucmVxdWVzdC51dGlsLmpzIiwiYXBwL3V0aWxzL3RleHQudXRpbC5qcyIsImFwcC91dGlscy92YWxpZGF0b3IudXRpbC5qcyIsImFwcC92aWV3LWNvbnRyb2xsZXJzL2RlbGV0ZS1kaWFsb2cvY29udHJvbGxlci5qcyIsImFwcC92aWV3LWNvbnRyb2xsZXJzL2Zvcm0tZGlhbG9nL2NvbnRyb2xsZXIuanMiLCJhcHAvdmlldy1jb250cm9sbGVycy9saXN0L2NvbnRyb2xsZXIuanMiLCJhcHAvdmlldy1jb250cm9sbGVycy9vdmVybGF5L2NvbnRyb2xsZXIuanMiLCJsaWJzL2NvdW50cnktbGlzdC9jb3VudHJ5LWxpc3QuanMiLCJsaWJzL2NvdW50cnktbGlzdC9kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNBQTtBQUNPLElBQU0sc0NBQWUsY0FBckI7O0FBRVA7QUFDTyxJQUFNLG9DQUFjLGFBQXBCO0FBQ0EsSUFBTSwwQ0FBaUIsZ0JBQXZCOztBQUVQO0FBQ08sSUFBTSwwQ0FBaUIsZ0JB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VixDQTdFYSxFQWlGYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpGYSxFQXFGYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJGYSxFQXlGYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpGYSxFQTZGYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdGYSxFQWlHYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpHYSxFQXFHYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJHYSxFQXlHYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpHYSxFQTZHYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdHYSxFQWlIYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpIYSxFQXFIYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJIYSxFQXlIYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpIYSxFQTZIYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdIYSxFQWlJYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpJYSxFQXFJYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJJYSxFQXlJYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpJYSxFQTZJYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdJYSxFQWlKYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpKYSxFQXFKYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJKYSxFQXlKYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpKYSxFQTZKYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdKYSxFQWlLYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpLYSxFQXFLYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJLYSxFQXlLYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpLYSxFQTZLYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdLYSxFQWlMYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpMYSxFQXFMYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJMYSxFQXlMYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpMYSxFQTZMYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdMYSxFQWlNYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpNYSxFQXFNYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJNYSxFQXlNYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpNYSxFQTZNYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdNYSxFQWlOYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpOYSxFQXFOYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJOYSxFQXlOYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpOYSxFQTZOYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdOYSxFQWlPYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpPYSxFQXFPYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJPYSxFQXlPYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpPYSxFQTZPYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdPYSxFQWlQYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpQYSxFQXFQYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJQYSxFQXlQYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpQYSxFQTZQYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdQYSxFQWlRYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpRYSxFQXFRYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJRYSxFQXlRYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpRYSxFQTZRYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdRYSxFQWlSYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpSYSxFQXFSYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJSYSxFQXlSYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpSYSxFQTZSYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdSYSxFQWlTYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpTYSxFQXFTYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJTYSxFQXlTYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpTYSxFQTZTYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdTYSxFQWlUYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpUYSxFQXFUYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJUYSxFQXlUYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpUYSxFQTZUYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdUYSxFQWlVYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpVYSxFQXFVYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJVYSxFQXlVYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpVYSxFQTZVYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdVYSxFQWlWYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpWYSxFQXFWYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJWYSxFQXlWYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpWYSxFQTZWYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdWYSxFQWlXYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpXYSxFQXFXYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJXYSxFQXlXYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpXYSxFQTZXYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdXYSxFQWlYYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpYYSxFQXFYYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJYYSxFQXlYYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpYYSxFQTZYYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdYYSxFQWlZYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpZYSxFQXFZYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJZYSxFQXlZYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpZYSxFQTZZYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdZYSxFQWlaYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpaYSxFQXFaYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJaYSxFQXlaYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpaYSxFQTZaYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdaYSxFQWlhYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWphYSxFQXFhYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJhYSxFQXlhYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXphYSxFQTZhYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdhYSxFQWliYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpiYSxFQXFiYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJiYSxFQXliYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpiYSxFQTZiYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdiYSxFQWljYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpjYSxFQXFjYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJjYSxFQXljYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpjYSxFQTZjYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdjYSxFQWlkYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpkYSxFQXFkYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJkYSxFQXlkYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpkYSxFQTZkYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdkYSxFQWllYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWplYSxFQXFlYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJlYSxFQXllYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXplYSxFQTZlYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdlYSxFQWlmYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpmYSxFQXFmYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJmYSxFQXlmYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpmYSxFQTZmYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdmYSxFQWlnQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqZ0JhLEVBcWdCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJnQmEsRUF5Z0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBemdCYSxFQTZnQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3Z0JhLEVBaWhCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpoQmEsRUFxaEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcmhCYSxFQXloQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6aEJhLEVBNmhCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdoQmEsRUFpaUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBamlCYSxFQXFpQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyaUJhLEVBeWlCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXppQmEsRUE2aUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBN2lCYSxFQWlqQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqakJhLEVBcWpCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJqQmEsRUF5akJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBempCYSxFQTZqQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3akJhLEVBaWtCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWprQmEsRUFxa0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcmtCYSxFQXlrQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6a0JhLEVBNmtCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdrQmEsRUFpbEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBamxCYSxFQXFsQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FybEJhLEVBeWxCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpsQmEsRUE2bEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBN2xCYSxFQWltQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqbUJhLEVBcW1CYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJtQmEsRUF5bUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBem1CYSxFQTZtQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3bUJhLEVBaW5CYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpuQmEsRUFxbkJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcm5CYSxFQXluQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6bkJhLEVBNm5CYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTduQmEsRUFpb0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBam9CYSxFQXFvQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0Fyb0JhLEVBeW9CYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpvQmEsRUE2b0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBN29CYSxFQWlwQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqcEJhLEVBcXBCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJwQmEsRUF5cEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBenBCYSxFQTZwQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3cEJhLEVBaXFCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWpxQmEsRUFxcUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcnFCYSxFQXlxQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6cUJhLEVBNnFCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTdxQmEsRUFpckJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBanJCYSxFQXFyQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyckJhLEVBeXJCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXpyQmEsRUE2ckJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBN3JCYSxFQWlzQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0Fqc0JhLEVBcXNCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJzQmEsRUF5c0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBenNCYSxFQTZzQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3c0JhLEVBaXRCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWp0QmEsRUFxdEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcnRCYSxFQXl0QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6dEJhLEVBNnRCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTd0QmEsRUFpdUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBanVCYSxFQXF1QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FydUJhLEVBeXVCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXp1QmEsRUE2dUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBN3VCYSxFQWl2QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqdkJhLEVBcXZCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJ2QmEsRUF5dkJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBenZCYSxFQTZ2QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3dkJhLEVBaXdCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWp3QmEsRUFxd0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcndCYSxFQXl3QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6d0JhLEVBNndCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTd3QmEsRUFpeEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBanhCYSxFQXF4QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyeEJhLEVBeXhCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXp4QmEsRUE2eEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBN3hCYSxFQWl5QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqeUJhLEVBcXlCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXJ5QmEsRUF5eUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBenlCYSxFQTZ5QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3eUJhLEVBaXpCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWp6QmEsRUFxekJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcnpCYSxFQXl6QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6ekJhLEVBNnpCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTd6QmEsRUFpMEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBajBCYSxFQXEwQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyMEJhLEVBeTBCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXowQmEsRUE2MEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBNzBCYSxFQWkxQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqMUJhLEVBcTFCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXIxQmEsRUF5MUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBejFCYSxFQTYxQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3MUJhLEVBaTJCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWoyQmEsRUFxMkJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcjJCYSxFQXkyQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6MkJhLEVBNjJCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTcyQmEsRUFpM0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBajNCYSxFQXEzQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyM0JhLEVBeTNCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXozQmEsRUE2M0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBNzNCYSxFQWk0QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqNEJhLEVBcTRCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXI0QmEsRUF5NEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBejRCYSxFQTY0QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3NEJhLEVBaTVCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWo1QmEsRUFxNUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcjVCYSxFQXk1QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6NUJhLEVBNjVCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTc1QmEsRUFpNkJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBajZCYSxFQXE2QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyNkJhLEVBeTZCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXo2QmEsRUE2NkJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBNzZCYSxFQWk3QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqN0JhLEVBcTdCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXI3QmEsRUF5N0JiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBejdCYSxFQTY3QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0E3N0JhLEVBaThCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQWo4QmEsRUFxOEJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBcjhCYSxFQXk4QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0F6OEJhLEVBNjhCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQTc4QmEsRUFpOUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBajlCYSxFQXE5QmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FyOUJhLEVBeTlCYjtBQUNFLFVBQVEsSUFEVjtBQUVFLFVBQVE7QUFGVixDQXo5QmEsRUE2OUJiO0FBQ0UsVUFBUSxJQURWO0FBRUUsVUFBUTtBQUZWLENBNzlCYSxFQWkrQmI7QUFDRSxVQUFRLElBRFY7QUFFRSxVQUFRO0FBRlYsQ0FqK0JhLEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBtYWluIC0+IGZvcm1cclxuZXhwb3J0IGNvbnN0IEVESVRfQ09OVEFDVCA9ICdlZGl0LWNvbnRhY3QnO1xyXG5cclxuLy8gZm9ybSAtPiBtYWluXHJcbmV4cG9ydCBjb25zdCBORVdfQ09OVEFDVCA9ICduZXctY29udGFjdCc7XHJcbmV4cG9ydCBjb25zdCBVUERBVEVfQ09OVEFDVCA9ICd1cGRhdGUtY29udGFjdCc7XHJcblxyXG4vLyBtYWluIC0+IGRlbGV0ZVxyXG5leHBvcnQgY29uc3QgREVMRVRFX0NPTlRBQ1QgPSAnZGVsZXRlLWNvbnRhY3QnO1xyXG5cclxuLy8gZGVsZXRlIC0+IG1haW5cclxuZXhwb3J0IGNvbnN0IERFTEVURV9DT05GSVJNID0gJ2RlbGV0ZS1jb25maXJtJztcclxuZXhwb3J0IGNvbnN0IERFTEVURV9DQU5DRUwgPSAnZGVsZXRlLWNhbmNlbCc7XHJcblxyXG4vLyBtYWluIC0+IGxpc3RcclxuZXhwb3J0IGNvbnN0IElOSVRfTElTVCA9ICdpbml0LWxpc3QnO1xyXG5leHBvcnQgY29uc3QgQUREX1RPX0xJU1QgPSAnYWRkLXRvLWxpc3QnO1xyXG5leHBvcnQgY29uc3QgVVBEQVRFX0xJU1QgPSAndXBkYXRlLWxpc3QnO1xyXG5leHBvcnQgY29uc3QgUkVNT1ZFX0ZST01fTElTVCA9ICdyZW1vdmUtZnJvbS1saXN0JztcclxuXHJcbi8vIGxpc3QgLT4gbWFpblxyXG5leHBvcnQgY29uc3QgTkVXX1JFUVVFU1QgPSAnbmV3LXJlcXVlc3QnO1xyXG5leHBvcnQgY29uc3QgVVBEQVRFX1JFUVVFU1QgPSAndXBkYXRlLXJlcXVlc3QnO1xyXG5leHBvcnQgY29uc3QgREVMRVRFX1JFUVVFU1QgPSAnZGVsZXRlLXJlcXVlc3QnO1xyXG5cclxuLy8gb3ZlcmxheSAtPiBvdGhlcnNcclxuZXhwb3J0IGNvbnN0IE9WRVJMQVlfQ0xJQ0tFRCA9ICdvdmVybGF5LWNsaWNrZWQnOyIsImV4cG9ydCBjb25zdCBMQVNUX0lEID0gJ2xhc3QtaWQnO1xyXG5leHBvcnQgY29uc3QgQUREUkVTU19CT09LID0gJ2FkZHJlc3MtYm9vayc7IiwiaW1wb3J0IHsgaGFzUHJvcCB9IGZyb20gJy4uL3V0aWxzL2ZwLnV0aWwuanMnO1xyXG5cclxuY29uc3Qgc3Vic2NyaWJlcnMgPSB7fTtcclxuXHJcbmNvbnN0IGNoYW5uZWxFeGlzdHMgPSAoY2hhbm5lbCkgPT4gaGFzUHJvcChzdWJzY3JpYmVycywgY2hhbm5lbCk7XHJcblxyXG5leHBvcnQgY29uc3Qgc3Vic2NyaWJlID0gKGNoYW5uZWwsIGZuKSA9PiB7XHJcbiAgICBpZiAoIWNoYW5uZWxFeGlzdHMoY2hhbm5lbCkpIHtcclxuICAgICAgICBzdWJzY3JpYmVyc1tjaGFubmVsXSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHN1YnNjcmliZXJzW2NoYW5uZWxdLnB1c2goZm4pO1xyXG4gICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdW5zdWJzY3JpYmUgPSAoY2hhbm5lbCwgZm4pID0+IHtcclxuICAgIGlmIChjaGFubmVsRXhpc3RzKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgc3Vic2NyaWJlcnNbY2hhbm5lbF0uc3BsaWNlKHN1YnNjcmliZXJzLmluZGV4T2YoZm4pLCAxKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBub3RpZnkgPSAoY2hhbm5lbCwgbWVzc2FnZSkgPT4ge1xyXG4gICAgaWYgKGNoYW5uZWxFeGlzdHMoY2hhbm5lbCkpIHtcclxuICAgICAgICBzdWJzY3JpYmVyc1tjaGFubmVsXS5mb3JFYWNoKChmbikgPT4ge1xyXG4gICAgICAgICAgICBmbihtZXNzYWdlKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59OyIsImltcG9ydCB7XHJcbiAgICBFRElUX0NPTlRBQ1QsXHJcbiAgICBORVdfQ09OVEFDVCxcclxuICAgIFVQREFURV9DT05UQUNULFxyXG4gICAgREVMRVRFX0NPTlRBQ1QsXHJcbiAgICBJTklUX0xJU1QsXHJcbiAgICBBRERfVE9fTElTVCxcclxuICAgIFVQREFURV9MSVNULFxyXG4gICAgUkVNT1ZFX0ZST01fTElTVCxcclxuICAgIFVQREFURV9SRVFVRVNULFxyXG4gICAgREVMRVRFX1JFUVVFU1QsXHJcbiAgICBERUxFVEVfQ09ORklSTSxcclxufSBmcm9tICcuL2NvbnN0YW50cy9jaGFubmVscy5qcyc7XHJcblxyXG5pbXBvcnQgeyBBRERSRVNTX0JPT0ssIExBU1RfSUQgfSBmcm9tICcuL2NvbnN0YW50cy9kYXRhYmFzZXMuanMnO1xyXG5cclxuaW1wb3J0IHsgbm90aWZ5LCBzdWJzY3JpYmUgYXMgb2JzZXJ2ZU1lc3NhZ2VzIH0gZnJvbSAnLi9oZWxwZXJzL21lc3NhZ2UtYnVzLmhlbHBlci5qcyc7XHJcblxyXG5pbXBvcnQgeyB1cGRhdGUgYXMgdXBkYXRlRGIsIHJlYWQgYXMgcmVhZERiIH0gZnJvbSAnLi9zZXJ2aWNlcy9kYi5zZXJ2aWNlLmpzJztcclxuXHJcbmltcG9ydCBpbml0TGlzdCBmcm9tICcuL3ZpZXctY29udHJvbGxlcnMvbGlzdC9jb250cm9sbGVyLmpzJztcclxuaW1wb3J0IGluaXRGb3JtRGlhbG9nIGZyb20gJy4vdmlldy1jb250cm9sbGVycy9mb3JtLWRpYWxvZy9jb250cm9sbGVyLmpzJztcclxuaW1wb3J0IGluaXREZWxldGVEaWFsb2cgZnJvbSAnLi92aWV3LWNvbnRyb2xsZXJzL2RlbGV0ZS1kaWFsb2cvY29udHJvbGxlci5qcyc7XHJcbmltcG9ydCBpbml0T3ZlcmxheSBmcm9tICcuL3ZpZXctY29udHJvbGxlcnMvb3ZlcmxheS9jb250cm9sbGVyLmpzJztcclxuXHJcbmltcG9ydCB7IGFwcGVuZEFsbCB9IGZyb20gJy4vdXRpbHMvZG9tLmdlbmVyYWwudXRpbC5qcyc7XHJcblxyXG4vLyBtb2R1bGUgZGF0YVxyXG5jb25zdCBhZGRyZXNzQm9vayA9IHJlYWREYihBRERSRVNTX0JPT0ssIHt9KTtcclxubGV0IGxhc3RJZCA9IHJlYWREYihMQVNUX0lELCB7dmFsdWU6IDAgfSkudmFsdWU7XHJcblxyXG4vLyBpbml0aWFsaXplIHZpZXcgY29udHJvbGxlcnMsIGFwcGVuZCB0aGVtLCBhbmQgaW5pdGlhbGl6ZSBsaXN0IGNvbnRlbnRzXHJcblByb21pc2VcclxuICAgIC5hbGwoW1xyXG4gICAgICAgIGluaXRMaXN0KCksXHJcbiAgICAgICAgaW5pdEZvcm1EaWFsb2coKSxcclxuICAgICAgICBpbml0RGVsZXRlRGlhbG9nKCksXHJcbiAgICAgICAgaW5pdE92ZXJsYXkoKSxcclxuICAgIF0pXHJcbiAgICAudGhlbigoZXZlcnl0aGluZykgPT4gZXZlcnl0aGluZy5yZWR1Y2UoXHJcbiAgICAgICAgKGZsYXRBcnJheSwgJHZpZXcpID0+IHtcclxuICAgICAgICAgICAgZmxhdEFycmF5LnB1c2goJHZpZXcpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmxhdEFycmF5O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW11cclxuICAgICkpXHJcbiAgICAudGhlbigodmlld3MpID0+IHtcclxuICAgICAgICBjb25zdCAkbWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qc01haW4nKTtcclxuXHJcbiAgICAgICAgYXBwZW5kQWxsKCRtYWluLCB2aWV3cyk7XHJcbiAgICB9KVxyXG4gICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIG5vdGlmeShJTklUX0xJU1QsIGFkZHJlc3NCb29rKTtcclxuICAgIH0pO1xyXG5cclxuLy8gbWVzc2FnZXM6IGZvcm0gLT4gbWFpblxyXG5vYnNlcnZlTWVzc2FnZXMoTkVXX0NPTlRBQ1QsICh7bmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWx9KSA9PiB7XHJcbiAgICBsYXN0SWQgKz0gMTtcclxuXHJcbiAgICBjb25zdCBuZXdDb250YWN0ID0ge1xyXG4gICAgICAgIGlkOiBsYXN0SWQsXHJcbiAgICAgICAgbmFtZSxcclxuICAgICAgICBzdXJuYW1lLFxyXG4gICAgICAgIGNvdW50cnksXHJcbiAgICAgICAgZW1haWwsXHJcbiAgICB9O1xyXG5cclxuICAgIGFkZHJlc3NCb29rW2xhc3RJZF0gPSBuZXdDb250YWN0O1xyXG5cclxuICAgIHVwZGF0ZURiKHsgbGFzdElkLCBhZGRyZXNzQm9vayB9KTtcclxuICAgIG5vdGlmeShBRERfVE9fTElTVCwgbmV3Q29udGFjdCk7XHJcbn0pO1xyXG5cclxub2JzZXJ2ZU1lc3NhZ2VzKFVQREFURV9DT05UQUNULCAoe2lkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbH0pID0+IHtcclxuICAgIGFkZHJlc3NCb29rW2lkXSA9IHsgaWQsIG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsIH07XHJcbiAgICB1cGRhdGVEYih7IGFkZHJlc3NCb29rIH0pO1xyXG4gICAgbm90aWZ5KFVQREFURV9MSVNULCB7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KTtcclxufSk7XHJcblxyXG4vLyBtZXNzYWdlczogZGVsZXRlIC0+IG1haW5cclxub2JzZXJ2ZU1lc3NhZ2VzKERFTEVURV9DT05GSVJNLCAoe2lkfSkgPT4ge1xyXG4gICAgZGVsZXRlIGFkZHJlc3NCb29rW2lkXTtcclxuICAgIHVwZGF0ZURiKHsgYWRkcmVzc0Jvb2sgfSk7XHJcbiAgICBub3RpZnkoUkVNT1ZFX0ZST01fTElTVCwgeyBpZCB9KTtcclxufSk7XHJcblxyXG4vLyBtZXNzYWdlczogbGlzdCAtPiBtYWluXHJcbm9ic2VydmVNZXNzYWdlcyhERUxFVEVfUkVRVUVTVCwgKHsgaWQgfSkgPT4ge1xyXG4gICAgbm90aWZ5KERFTEVURV9DT05UQUNULCB7IGlkLCBjb250YWN0OiBhZGRyZXNzQm9va1tpZF0gfSk7XHJcbn0pO1xyXG5cclxub2JzZXJ2ZU1lc3NhZ2VzKFVQREFURV9SRVFVRVNULCAoeyBpZCB9KSA9PiB7XHJcbiAgICBub3RpZnkoRURJVF9DT05UQUNULCBhZGRyZXNzQm9va1tpZF0pO1xyXG59KTsiLCJpbXBvcnQgeyBMQVNUX0lELCBBRERSRVNTX0JPT0sgfSBmcm9tICcuLi9jb25zdGFudHMvZGF0YWJhc2VzLmpzJztcclxuaW1wb3J0IHsgc2V0LCBnZXQgfSBmcm9tICcuLi91dGlscy9sb2NhbC1zdG9yYWdlLnV0aWwuanMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IHVwZGF0ZSA9ICh7bGFzdElkLCBhZGRyZXNzQm9va30pID0+IHtcclxuICAgIGlmIChsYXN0SWQpIHtcclxuICAgICAgICBzZXQoTEFTVF9JRCwgSlNPTi5zdHJpbmdpZnkoe3ZhbHVlOiBsYXN0SWR9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFkZHJlc3NCb29rKSB7XHJcbiAgICAgICAgc2V0KEFERFJFU1NfQk9PSywgSlNPTi5zdHJpbmdpZnkoYWRkcmVzc0Jvb2spKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCByZWFkID0gKGtleSwgZmFsbGJhY2sgPSBudWxsKSA9PiBnZXQoa2V5KSB8fCBmYWxsYmFjazsiLCJpbXBvcnQgQ291bnRyeUxpc3QgZnJvbSAnLi4vLi4vbGlicy9jb3VudHJ5LWxpc3QvY291bnRyeS1saXN0LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBDb3VudHJ5TGlzdCgpOyIsImV4cG9ydCBjb25zdCBzdHJpbmdUb0h0bWwgPSAoc3RyaW5nVGVtcGxhdGUpID0+IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHN0cmluZ1RlbXBsYXRlKTtcclxuXHJcbmV4cG9ydCBjb25zdCBhcHBlbmRBbGwgPSAoJHBhcmVudCwgY2hpbGRyZW4pID0+IHtcclxuICAgIFtdLmZvckVhY2guY2FsbChjaGlsZHJlbiwgKCRjaGlsZCkgPT4ge1xyXG4gICAgICAgICRwYXJlbnQuYXBwZW5kQ2hpbGQoJGNoaWxkKTtcclxuICAgIH0pO1xyXG59OyIsImltcG9ydCBjb3VudHJ5TGlzdCBmcm9tICcuL2NvdW50cnktbGlzdC51dGlsLmpzJztcclxuXHJcbmV4cG9ydCBjb25zdCBpdGVtQ3JlYXRvciA9ICgkdGVtcGxhdGUpID0+ICh7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KSA9PiB7XHJcbiAgICBjb25zdCAkaXRlbSA9ICR0ZW1wbGF0ZS5jbG9uZU5vZGUodHJ1ZSk7XHJcblxyXG4gICAgJGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzTmFtZScpLnRleHRDb250ZW50ID0gYCR7bmFtZX0gJHtzdXJuYW1lfWA7XHJcbiAgICAkaXRlbS5xdWVyeVNlbGVjdG9yKCcuanNDb3VudHJ5JykudGV4dENvbnRlbnQgPSBgJHtjb3VudHJ5ICYmIGNvdW50cnlMaXN0LmdldE5hbWUoY291bnRyeSl9YDtcclxuICAgICRpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qc0VtYWlsJykudGV4dENvbnRlbnQgPSBgJHtlbWFpbH1gO1xyXG5cclxuICAgICRpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qc0VkaXQnKS5jdXN0b21EYXRhID0ge1xyXG4gICAgICAgIGNvbnRhY3RJZDogaWQsXHJcbiAgICAgICAgYWN0aW9uOiAnZWRpdCcsXHJcbiAgICB9O1xyXG5cclxuICAgICRpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qc0RlbGV0ZScpLmN1c3RvbURhdGEgPSB7XHJcbiAgICAgICAgY29udGFjdElkOiBpZCxcclxuICAgICAgICBhY3Rpb246ICdkZWxldGUnLFxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gJGl0ZW07XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgcmVmcmVzaEl0ZW0gPSAoJGl0ZW0sIHsgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSkgPT4ge1xyXG4gICAgJGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzTmFtZScpLnRleHRDb250ZW50ID0gYCR7bmFtZX0gJHtzdXJuYW1lfWA7XHJcbiAgICAkaXRlbS5xdWVyeVNlbGVjdG9yKCcuanNDb3VudHJ5JykudGV4dENvbnRlbnQgPSBgJHtjb3VudHJ5ICYmIGNvdW50cnlMaXN0LmdldE5hbWUoY291bnRyeSl9YDtcclxuICAgICRpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qc0VtYWlsJykudGV4dENvbnRlbnQgPSBgJHtlbWFpbH1gO1xyXG59OyIsImV4cG9ydCBkZWZhdWx0IChjb2RlLCBuYW1lKSA9PiB7XHJcbiAgICBjb25zdCAkb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcblxyXG4gICAgJG9wdGlvbi52YWx1ZSA9IGNvZGU7XHJcbiAgICAkb3B0aW9uLnRleHRDb250ZW50ID0gbmFtZTtcclxuXHJcbiAgICByZXR1cm4gJG9wdGlvbjtcclxufTsiLCJpbXBvcnQgeyBnZXQgYXMgZ2V0RnJvbSB9IGZyb20gJy4vcHJvbWlzaWZpZWQucmVxdWVzdC51dGlsLmpzJztcclxuaW1wb3J0IHsgc3RyaW5nVG9IdG1sIH0gZnJvbSAnLi9kb20uZ2VuZXJhbC51dGlsLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICh1cmwpID0+IGdldEZyb20odXJsKS50aGVuKHN0cmluZ1RvSHRtbCk7IiwiZXhwb3J0IGNvbnN0IGNvbXBvc2UgPVxyXG4gICAgKC4uLmZ1bmN0aW9ucykgPT4gKC4uLmluaXRpYWwpID0+IHtcclxuICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBmdW5jdGlvbnMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9ucy5yZWR1Y2VSaWdodChcclxuICAgICAgICAgICAgKHZhbHVlLCBmbiwgaW5kZXgpID0+IGluZGV4ID09PSBsYXN0SW5kZXggPyBmbiguLi52YWx1ZSkgOiBmbih2YWx1ZSksXHJcbiAgICAgICAgICAgIGluaXRpYWxcclxuICAgICAgICApO1xyXG4gICAgfTtcclxuXHJcbmV4cG9ydCBjb25zdCBwaXBlID1cclxuICAgICguLi5mdW5jdGlvbnMpID0+ICguLi5pbml0aWFsKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9ucy5yZWR1Y2UoXHJcbiAgICAgICAgICAgICh2YWx1ZSwgZm4sIGluZGV4KSA9PiBpbmRleCA9PT0gMCA/IGZuKC4uLnZhbHVlKSA6IGZuKHZhbHVlKSxcclxuICAgICAgICAgICAgaW5pdGlhbFxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhc1Byb3AgPVxyXG4gICAgKG9iamVjdCwgcHJvcCkgPT4gb2JqZWN0Lmhhc093blByb3BlcnR5KHByb3ApOyIsImNvbnN0IHsgbG9jYWxTdG9yYWdlIH0gPSB3aW5kb3c7XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0ID0gKGtleSwgdmFsdWUpID0+IHtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldCA9IChrZXkpID0+IHtcclxuICAgIGNvbnN0IG9iamVjdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcblxyXG4gICAgcmV0dXJuIG9iamVjdCAhPSBudWxsID8gSlNPTi5wYXJzZShvYmplY3QpIDogbnVsbDtcclxufSIsIi8vIHNvdXJjZTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMwMDA4MTE1LzU2NTg3MDJcclxuY29uc3QgZ2VuZXJhbCA9IChtZXRob2QsIHVybCkgPT5cclxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHJcbiAgICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwpO1xyXG5cclxuICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHhoci5yZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJlamVjdCh7XHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgeGhyLnNlbmQoKTtcclxuICAgIH0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldCA9ICh1cmwpID0+IGdlbmVyYWwoJ0dFVCcsIHVybCk7XHJcblxyXG5leHBvcnQgY29uc3QgcG9zdCA9ICh1cmwpID0+IGdlbmVyYWwoJ1BPU1QnLCB1cmwpO1xyXG4iLCJpbXBvcnQgY291bnRyeUxpc3QgZnJvbSAnLi9jb3VudHJ5LWxpc3QudXRpbC5qcyc7XHJcblxyXG5leHBvcnQgY29uc3QgaXRlbVRleHQgPVxyXG4gICAgICAoeyBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KSA9PlxyXG4gICAgICAgIGAke25hbWV9ICR7c3VybmFtZX0gKCR7Y291bnRyeSAmJiBjb3VudHJ5TGlzdC5nZXROYW1lKGNvdW50cnkpfSksICR7ZW1haWx9YDsiLCJpbXBvcnQgY291bnRyeUxpc3QgZnJvbSAnLi9jb3VudHJ5LWxpc3QudXRpbC5qcyc7XHJcblxyXG4vLyBub3RlOlxyXG4vLyB2YWxpZGF0b3JzIGNvdWxkIHByb2JhYmx5IGJlIGltcHJvdmVkLFxyXG4vLyBhcyB0aGV5IGFsbG93IGZvciBuYW1lcyBsaWtlIOKAnEAjJC0oKeKAnSxcclxuLy8gYnV0IHRoaXMgY291bGQgdGFrZSBob3VycywgaWYgbm90IGRheXMsXHJcbi8vIHNvIGl0IHdhcyBsZWZ0IGF0IHRoZSB2ZXJ5IGJhc2ljIGZ1bmN0aW9uYWxpdHlcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZGF0ZU5hbWUgPVxyXG4gICAgKG5hbWUpID0+XHJcbiAgICAgICAgdHlwZW9mIG5hbWUgPT0gJ3N0cmluZycgJiZcclxuICAgICAgICBuYW1lLmxlbmd0aCA+IDAgJiZcclxuICAgICAgICAvW1xcd10rLy50ZXN0KG5hbWUucmVwbGFjZSgvXFxkL2csICcnKSk7XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRhdGVTdXJuYW1lID1cclxuICAgIChzdXJuYW1lKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzdXJuYW1lICE9ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5hbWVXaXRob3V0RGlnaXRzID0gc3VybmFtZS5yZXBsYWNlKC9cXGQvZywgJycpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3VybmFtZSA9PT0gJycgfHwgL1tcXHddKy8udGVzdChuYW1lV2l0aG91dERpZ2l0cyk7XHJcbiAgICB9O1xyXG5cclxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlQ291bnRyeSA9IChjb2RlKSA9PiB7XHJcbiAgICByZXR1cm4gY291bnRyeUxpc3QuZ2V0TmFtZShjb2RlKSAhPT0gdW5kZWZpbmVkO1xyXG59O1xyXG5cclxuLy8gc291cmNlOiBodHRwczovL3d3dy5yZWd1bGFyLWV4cHJlc3Npb25zLmluZm8vZW1haWwuaHRtbFxyXG5jb25zdCBlbWFpbFJlZ2V4ID0gL1thLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSsoPzpcXC5bYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKSpAKD86W2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pP1xcLikrW2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pPy87XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRhdGVFbWFpbCA9XHJcbiAgICAoZW1haWwpID0+XHJcbiAgICAgICAgdHlwZW9mIGVtYWlsID09ICdzdHJpbmcnICYmXHJcbiAgICAgICAgZW1haWxSZWdleC50ZXN0KGVtYWlsKTsiLCJpbXBvcnQge1xyXG4gICAgTkVXX1JFUVVFU1QsXHJcbiAgICBVUERBVEVfUkVRVUVTVCxcclxuICAgIERFTEVURV9DT05UQUNULFxyXG4gICAgREVMRVRFX0NPTkZJUk0sXHJcbiAgICBPVkVSTEFZX0NMSUNLRUQsXHJcbn0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL2NoYW5uZWxzLmpzJztcclxuXHJcbmltcG9ydCBnZXRUZW1wbGF0ZSBmcm9tICcuLi8uLi91dGlscy9kb20udGVtcGxhdGUudXRpbC5qcyc7XHJcbmltcG9ydCB7IG5vdGlmeSwgc3Vic2NyaWJlIGFzIG9ic2VydmVNZXNzYWdlcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvbWVzc2FnZS1idXMuaGVscGVyLmpzJztcclxuaW1wb3J0IHsgaXRlbVRleHQgfSBmcm9tICcuLi8uLi91dGlscy90ZXh0LnV0aWwuanMnO1xyXG5cclxuLy8gaW5pdCBmdW5jdGlvblxyXG5leHBvcnQgZGVmYXVsdCAoKSA9PlxyXG4gICAgZ2V0VGVtcGxhdGUoJy9hcHAvdmlldy1jb250cm9sbGVycy9kZWxldGUtZGlhbG9nL3ZpZXcuaHRtbCcpXHJcbiAgICAgICAgLnRoZW4oKCR2aWV3KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGRhdGFcclxuICAgICAgICAgICAgbGV0IF9pZCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBlbGVtZW50c1xyXG4gICAgICAgICAgICBjb25zdCAkZGlhbG9nID0gJHZpZXcucXVlcnlTZWxlY3RvcignLmpzRGlhbG9nJyk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRmb3JtID0gJGRpYWxvZy5xdWVyeVNlbGVjdG9yKCcuanNGb3JtJyk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCAkaWQgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuanNJZCcpO1xyXG4gICAgICAgICAgICBjb25zdCAkZGV0YWlscyA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qc0RldGFpbHMnKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0ICR5ZXMgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuanNZZXMnKTtcclxuICAgICAgICAgICAgY29uc3QgJG5vID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzTm8nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG1ldGhvZHMgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZURldGFpbHMgPSAoaWQgPSAnJywgY29udGFjdCA9ICcnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkaWQudmFsdWUgPSBpZDtcclxuICAgICAgICAgICAgICAgICRkZXRhaWxzLnRleHRDb250ZW50ID0gaXRlbVRleHQoY29udGFjdCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0b2dnbGVEaWFsb2cgPSAoc3RhdHVzKSA9PiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZGlhbG9nLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScsIHN0YXR1cyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IHNob3dEaWFsb2cgPSB0b2dnbGVEaWFsb2codHJ1ZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGhpZGVEaWFsb2cgPSB0b2dnbGVEaWFsb2coZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgY2xvc2VEaWFsb2cgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBfaWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgJGZvcm0ucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZURldGFpbHMoKTtcclxuICAgICAgICAgICAgICAgIGhpZGVEaWFsb2coKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gbWVzc2FnZSBidXMgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICAgICAgICAgICAgb2JzZXJ2ZU1lc3NhZ2VzKERFTEVURV9DT05UQUNULCAoe2lkLCBjb250YWN0fSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgX2lkID0gaWQ7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVEZXRhaWxzKGlkLCBjb250YWN0KTtcclxuICAgICAgICAgICAgICAgIHNob3dEaWFsb2coKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBvYnNlcnZlTWVzc2FnZXMoTkVXX1JFUVVFU1QsIGhpZGVEaWFsb2cpO1xyXG4gICAgICAgICAgICBvYnNlcnZlTWVzc2FnZXMoVVBEQVRFX1JFUVVFU1QsIGhpZGVEaWFsb2cpO1xyXG4gICAgICAgICAgICBvYnNlcnZlTWVzc2FnZXMoT1ZFUkxBWV9DTElDS0VELCBoaWRlRGlhbG9nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHVzZXIgaW50ZXJhY3Rpb25zIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgICR5ZXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBub3RpZnkoREVMRVRFX0NPTkZJUk0sIHsgaWQ6IF9pZCB9KTtcclxuICAgICAgICAgICAgICAgIGNsb3NlRGlhbG9nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJG5vLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgY2xvc2VEaWFsb2coKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJHZpZXc7XHJcbiAgICAgICAgfSk7IiwiaW1wb3J0IHtcclxuICAgIE5FV19DT05UQUNULFxyXG4gICAgRURJVF9DT05UQUNULFxyXG4gICAgVVBEQVRFX0NPTlRBQ1QgLFxyXG4gICAgTkVXX1JFUVVFU1QsXHJcbiAgICBVUERBVEVfUkVRVUVTVCxcclxuICAgIERFTEVURV9SRVFVRVNULFxyXG4gICAgT1ZFUkxBWV9DTElDS0VELFxyXG59IGZyb20gJy4uLy4uL2NvbnN0YW50cy9jaGFubmVscy5qcyc7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgdmFsaWRhdGVOYW1lLFxyXG4gICAgdmFsaWRhdGVTdXJuYW1lLFxyXG4gICAgdmFsaWRhdGVDb3VudHJ5LFxyXG4gICAgdmFsaWRhdGVFbWFpbCxcclxufSBmcm9tICcuLi8uLi8uLi9hcHAvdXRpbHMvdmFsaWRhdG9yLnV0aWwuanMnO1xyXG5cclxuaW1wb3J0IHsgbm90aWZ5LCBzdWJzY3JpYmUgYXMgb2JzZXJ2ZU1lc3NhZ2VzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMnO1xyXG5pbXBvcnQgZ2V0VGVtcGxhdGUgZnJvbSAnLi4vLi4vdXRpbHMvZG9tLnRlbXBsYXRlLnV0aWwuanMnO1xyXG5pbXBvcnQgeyBjb21wb3NlLCBwaXBlIH0gZnJvbSAnLi4vLi4vdXRpbHMvZnAudXRpbC5qcyc7XHJcbmltcG9ydCBjcmVhdGVPcHRpb24gZnJvbSAnLi4vLi4vdXRpbHMvZG9tLm9wdGlvbi51dGlsLmpzJztcclxuaW1wb3J0IGNvdW50cnlMaXN0IGZyb20gJy4uLy4uL3V0aWxzL2NvdW50cnktbGlzdC51dGlsLmpzJztcclxuXHJcbi8vIGluaXQgZnVuY3Rpb25cclxuZXhwb3J0IGRlZmF1bHQgKCkgPT5cclxuICAgIGdldFRlbXBsYXRlKCcvYXBwL3ZpZXctY29udHJvbGxlcnMvZm9ybS1kaWFsb2cvdmlldy5odG1sJylcclxuICAgICAgICAudGhlbigoJHZpZXcpID0+IHtcclxuICAgICAgICAgICAgLy8gbWFpbiBlbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0ICRkaWFsb2cgPSAkdmlldy5xdWVyeVNlbGVjdG9yKCcuanNEaWFsb2cnKTtcclxuICAgICAgICAgICAgY29uc3QgJHRpdGxlID0gJGRpYWxvZy5xdWVyeVNlbGVjdG9yKCcuanNUaXRsZScpO1xyXG4gICAgICAgICAgICBjb25zdCAkZm9ybSA9ICRkaWFsb2cucXVlcnlTZWxlY3RvcignLmpzRm9ybScpO1xyXG5cclxuICAgICAgICAgICAgLy8gY29udGFpbmVyc1xyXG4gICAgICAgICAgICBjb25zdCAkbmFtZUNvbnRhaW5lciA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qc05hbWVDb250YWluZXInKTtcclxuICAgICAgICAgICAgY29uc3QgJHN1cm5hbWVDb250YWluZXIgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuanNTdXJuYW1lQ29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRjb3VudHJ5Q29udGFpbmVyID0gJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzQ291bnRyeUNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICBjb25zdCAkZW1haWxDb250YWluZXIgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCcuanNFbWFpbENvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgLy8gaW5wdXRzXHJcbiAgICAgICAgICAgIGNvbnN0ICRpZCA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qc0lkJyk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRuYW1lID0gJG5hbWVDb250YWluZXIucXVlcnlTZWxlY3RvcignLmpzTmFtZScpO1xyXG4gICAgICAgICAgICBjb25zdCAkc3VybmFtZSA9ICRzdXJuYW1lQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qc1N1cm5hbWUnKTtcclxuICAgICAgICAgICAgY29uc3QgJGNvdW50cnkgPSAkY291bnRyeUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuanNDb3VudHJ5Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRlbWFpbCA9ICRlbWFpbENvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuanNFbWFpbCcpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgJGNhbmNlbCA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qc0NhbmNlbCcpO1xyXG5cclxuICAgICAgICAgICAgLy8gbWV0aG9kcyBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICAgICAgICAgICAgY29uc3QgdG9nZ2xlRGlhbG9nID0gKHN0YXR1cykgPT4gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRpYWxvZy5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnLCBzdGF0dXMpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBzaG93RGlhbG9nID0gdG9nZ2xlRGlhbG9nKHRydWUpO1xyXG4gICAgICAgICAgICBjb25zdCBoaWRlRGlhbG9nID0gdG9nZ2xlRGlhbG9nKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNldFRpdGxlID0gKHRpdGxlKSA9PiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkdGl0bGUudGV4dENvbnRlbnQgPSB0aXRsZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzZXRUaXRsZUZvck5ldyA9IHNldFRpdGxlKCdOZXcgY29udGFjdCcpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXRUaXRsZUZvckVkaXQgPSBzZXRUaXRsZSgnRWRpdCBjb250YWN0Jyk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmaWxsRm9ybUZpZWxkcyA9ICh7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkaWQudmFsdWUgPSBpZDtcclxuICAgICAgICAgICAgICAgICRuYW1lLnZhbHVlID0gbmFtZTtcclxuICAgICAgICAgICAgICAgICRzdXJuYW1lLnZhbHVlID0gc3VybmFtZTtcclxuICAgICAgICAgICAgICAgICRjb3VudHJ5LnZhbHVlID0gY291bnRyeTtcclxuICAgICAgICAgICAgICAgICRlbWFpbC52YWx1ZSA9IGVtYWlsO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZ2V0VmFsdWVzID0gKCkgPT4gKHtcclxuICAgICAgICAgICAgICAgIGlkOiAkaWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiAkbmFtZS52YWx1ZSxcclxuICAgICAgICAgICAgICAgIHN1cm5hbWU6ICRzdXJuYW1lLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY291bnRyeTogJGNvdW50cnkudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBlbWFpbDogJGVtYWlsLnZhbHVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRpc21pc3NGb3JtID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaGlkZURpYWxvZygpO1xyXG4gICAgICAgICAgICAgICAgJGlkLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgICAgICAkZm9ybS5yZXNldCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdmFsaWRhdGVGb3JtID0gKG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogdmFsaWRhdGVOYW1lKG5hbWUpLFxyXG4gICAgICAgICAgICAgICAgc3VybmFtZTogdmFsaWRhdGVTdXJuYW1lKHN1cm5hbWUpLFxyXG4gICAgICAgICAgICAgICAgY291bnRyeTogdmFsaWRhdGVDb3VudHJ5KGNvdW50cnkpLFxyXG4gICAgICAgICAgICAgICAgZW1haWw6IHZhbGlkYXRlRW1haWwoZW1haWwpLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHRvZ2dsZUVycm9yQ2xhc3MgPSAoJGZpZWxkLCBzdGF0dXMpID0+IHtcclxuICAgICAgICAgICAgICAgICRmaWVsZC5jbGFzc0xpc3QudG9nZ2xlKCdoYXMtZXJyb3InLCBzdGF0dXMpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbWFya0Vycm9ycyA9ICh7IG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsIH0pID0+IHtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUVycm9yQ2xhc3MoJG5hbWVDb250YWluZXIsICFuYW1lKTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUVycm9yQ2xhc3MoJHN1cm5hbWVDb250YWluZXIsICFzdXJuYW1lKTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUVycm9yQ2xhc3MoJGNvdW50cnlDb250YWluZXIsICFjb3VudHJ5KTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUVycm9yQ2xhc3MoJGVtYWlsQ29udGFpbmVyLCAhZW1haWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7IG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsIH07XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb25zdCBtYXJrR29vZCA9ICgpID0+IG1hcmtFcnJvcnMoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN1cm5hbWU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZW1haWw6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjaGVja1ZhbGlkaXR5ID0gKHJlcG9ydCkgPT4gT2JqZWN0LnZhbHVlcyhyZXBvcnQpLmV2ZXJ5KChmaWVsZCkgPT4gZmllbGQgPT0gdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhbGxHb29kID0gY29tcG9zZShjaGVja1ZhbGlkaXR5LCBtYXJrRXJyb3JzLCB2YWxpZGF0ZUZvcm0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVzdGFydEZvcm0gPSBwaXBlKGRpc21pc3NGb3JtLCBzZXRUaXRsZUZvck5ldywgc2hvd0RpYWxvZyk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzdGFydEVkaXRpbmdGb3JtID0gcGlwZShmaWxsRm9ybUZpZWxkcywgbWFya0dvb2QsIHNldFRpdGxlRm9yRWRpdCwgc2hvd0RpYWxvZyk7XHJcblxyXG4gICAgICAgICAgICAvLyBvbiBsb2FkIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb3VudHJpZXMgPSBjb3VudHJ5TGlzdC5nZXRDb2RlTGlzdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIE9iamVjdFxyXG4gICAgICAgICAgICAgICAgICAgIC5rZXlzKGNvdW50cmllcylcclxuICAgICAgICAgICAgICAgICAgICAubWFwKChjb2RlKSA9PiBjcmVhdGVPcHRpb24oY29kZSwgY291bnRyaWVzW2NvZGVdKSlcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgoJG9wdGlvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY291bnRyeS5hcHBlbmRDaGlsZCgkb3B0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBtZXNzYWdlIGJ1cyBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgICAgICBvYnNlcnZlTWVzc2FnZXMoTkVXX1JFUVVFU1QsIHJlc3RhcnRGb3JtKTtcclxuICAgICAgICAgICAgb2JzZXJ2ZU1lc3NhZ2VzKERFTEVURV9SRVFVRVNULCBkaXNtaXNzRm9ybSk7XHJcbiAgICAgICAgICAgIG9ic2VydmVNZXNzYWdlcyhPVkVSTEFZX0NMSUNLRUQsIGRpc21pc3NGb3JtKTtcclxuICAgICAgICAgICAgb2JzZXJ2ZU1lc3NhZ2VzKEVESVRfQ09OVEFDVCwgc3RhcnRFZGl0aW5nRm9ybSk7XHJcblxyXG4gICAgICAgICAgICAvLyB1c2VyIGludGVyYWN0aW9ucyBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgICAgICAkZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBpZCwgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSA9IGdldFZhbHVlcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghYWxsR29vZChuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZ5KFVQREFURV9DT05UQUNULCB7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZ5KE5FV19DT05UQUNULCB7IG5hbWUsIHN1cm5hbWUsIGNvdW50cnksIGVtYWlsIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRpc21pc3NGb3JtKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJGNhbmNlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRpc21pc3NGb3JtKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICR2aWV3O1xyXG4gICAgICAgIH0pOyIsImltcG9ydCB7XHJcbiAgICBJTklUX0xJU1QsXHJcbiAgICBBRERfVE9fTElTVCxcclxuICAgIFVQREFURV9MSVNULFxyXG4gICAgUkVNT1ZFX0ZST01fTElTVCxcclxuICAgIE5FV19SRVFVRVNULFxyXG4gICAgVVBEQVRFX1JFUVVFU1QsXHJcbiAgICBERUxFVEVfUkVRVUVTVCxcclxufSBmcm9tICcuLi8uLi9jb25zdGFudHMvY2hhbm5lbHMuanMnO1xyXG5cclxuaW1wb3J0IHsgbm90aWZ5LCBzdWJzY3JpYmUgYXMgb2JzZXJ2ZU1lc3NhZ2VzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMnO1xyXG5pbXBvcnQgeyBjb21wb3NlIH0gZnJvbSAnLi4vLi4vdXRpbHMvZnAudXRpbC5qcyc7XHJcbmltcG9ydCBnZXRUZW1wbGF0ZSBmcm9tICcuLi8uLi91dGlscy9kb20udGVtcGxhdGUudXRpbC5qcyc7XHJcbmltcG9ydCB7IGl0ZW1UZXh0IH0gZnJvbSAnLi4vLi4vdXRpbHMvdGV4dC51dGlsLmpzJztcclxuaW1wb3J0IHsgaXRlbUNyZWF0b3IsIHJlZnJlc2hJdGVtIH0gZnJvbSAnLi4vLi4vdXRpbHMvZG9tLml0ZW0udXRpbC5qcyc7XHJcblxyXG4vLyBpbml0IGZ1bmN0aW9uXHJcbmV4cG9ydCBkZWZhdWx0ICgpID0+XHJcbiAgICBQcm9taXNlXHJcbiAgICAgICAgLmFsbChbXHJcbiAgICAgICAgICAgIGdldFRlbXBsYXRlKCcvYXBwL3ZpZXctY29udHJvbGxlcnMvbGlzdC92aWV3Lmh0bWwnKSxcclxuICAgICAgICAgICAgZ2V0VGVtcGxhdGUoJy9hcHAvdmlldy1jb250cm9sbGVycy9saXN0L2l0ZW0uaHRtbCcpLFxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgLnRoZW4oKFskdmlldywgJGl0ZW1dKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIG1vZHVsZSBkYXRhXHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBlbGVtZW50c1xyXG4gICAgICAgICAgICBjb25zdCAkY29udGFjdHMgPSAkdmlldy5xdWVyeVNlbGVjdG9yKCcuanNDb250YWN0cycpO1xyXG4gICAgICAgICAgICBjb25zdCAkbmV3ID0gJGNvbnRhY3RzLnF1ZXJ5U2VsZWN0b3IoJy5qc05ldycpO1xyXG4gICAgICAgICAgICBjb25zdCAkbGlzdCA9ICRjb250YWN0cy5xdWVyeVNlbGVjdG9yKCcuanNDb250YWN0c0xpc3QnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG1ldGhvZHMgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgIGNvbnN0IGFkZEl0ZW0gPSAoJGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICRsaXN0LmFwcGVuZENoaWxkKCRpdGVtKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZUl0ZW0gPSBpdGVtQ3JlYXRvcigkaXRlbS5jaGlsZHJlblswXSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhZGRTaW5nbGVJdGVtID0gKHtpZCwgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWx9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtID0gY3JlYXRlSXRlbSh7IGlkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtc1tpZF0gPSBuZXdJdGVtO1xyXG5cclxuICAgICAgICAgICAgICAgIGFkZEl0ZW0obmV3SXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUl0ZW0gPSAoaWQpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vdGlmeShVUERBVEVfUkVRVUVTVCwgeyBpZCB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRlbGV0ZUl0ZW0gPSAoaWQpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vdGlmeShERUxFVEVfUkVRVUVTVCwgeyBpZCB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIG1lc3NhZ2UgYnVzIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgIG9ic2VydmVNZXNzYWdlcyhJTklUX0xJU1QsIChhZGRyZXNzQm9vaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgLnZhbHVlcyhhZGRyZXNzQm9vaylcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChhZGRTaW5nbGVJdGVtKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBvYnNlcnZlTWVzc2FnZXMoQUREX1RPX0xJU1QsIGFkZFNpbmdsZUl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgb2JzZXJ2ZU1lc3NhZ2VzKFVQREFURV9MSVNULCAoe2lkLCBuYW1lLCBzdXJuYW1lLCBjb3VudHJ5LCBlbWFpbCB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWZyZXNoSXRlbShpdGVtc1tpZF0sIHsgbmFtZSwgc3VybmFtZSwgY291bnRyeSwgZW1haWwgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgb2JzZXJ2ZU1lc3NhZ2VzKFJFTU9WRV9GUk9NX0xJU1QsICh7IGlkIH0pID0+IHtcclxuICAgICAgICAgICAgICAgICRsaXN0LnJlbW92ZUNoaWxkKGl0ZW1zW2lkXSk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgaXRlbXNbaWRdO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHVzZXIgaW50ZXJhY3Rpb25zIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICAgICRuZXcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBub3RpZnkoTkVXX1JFUVVFU1QsIHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRsaXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGN1c3RvbURhdGE6IHsgYWN0aW9uLCBjb250YWN0SWQgfSA9IHt9IH0gPSBldmVudC50YXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VkaXQnOlxyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUl0ZW0oY29udGFjdElkKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlSXRlbShjb250YWN0SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkdmlldztcclxuICAgICAgICB9KTtcclxuIiwiaW1wb3J0IHtcclxuICAgIE9WRVJMQVlfQ0xJQ0tFRCxcclxufSBmcm9tICcuLi8uLi9jb25zdGFudHMvY2hhbm5lbHMuanMnO1xyXG5cclxuaW1wb3J0IGdldFRlbXBsYXRlIGZyb20gJy4uLy4uL3V0aWxzL2RvbS50ZW1wbGF0ZS51dGlsLmpzJztcclxuaW1wb3J0IHsgbm90aWZ5LCBzdWJzY3JpYmUgYXMgb2JzZXJ2ZU1lc3NhZ2VzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9tZXNzYWdlLWJ1cy5oZWxwZXIuanMnO1xyXG5cclxuLy8gaW5pdCBmdW5jdGlvblxyXG5leHBvcnQgZGVmYXVsdCAoKSA9PlxyXG4gICAgZ2V0VGVtcGxhdGUoJy9hcHAvdmlldy1jb250cm9sbGVycy9vdmVybGF5L3ZpZXcuaHRtbCcpXHJcbiAgICAgICAgLnRoZW4oKCR2aWV3KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0ICRvdmVybGF5ID0gJHZpZXcucXVlcnlTZWxlY3RvcignLmpzT3ZlcmxheScpO1xyXG5cclxuICAgICAgICAgICAgLy8gdXNlciBpbnRlcmFjdGlvbiBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICAgICAgICAgICAgJG92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBub3RpZnkoT1ZFUkxBWV9DTElDS0VELCB0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJHZpZXc7XHJcbiAgICAgICAgfSk7IiwiLy8gc291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vZmFubmFyc2gvY291bnRyeS1saXN0XHJcbi8vIHRoZSBmaWxlIGhhcyBiZWVuIG1vZHVscml6ZWQgYnV0IGFueXRoaW5nIGVsc2UgaXMgYXMgaXQgd2FzXHJcblxyXG5pbXBvcnQgZGF0YSBmcm9tICcuL2RhdGEuanMnO1xyXG5cclxuLy8ndXNlIHN0cmljdCdcclxuLy9cclxuLy92YXIgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qc29uJylcclxuXHJcbi8qKlxyXG4gKiBQcmVjb21wdXRlIG5hbWUgYW5kIGNvZGUgbG9va3Vwcy5cclxuICovXHJcbnZhciBuYW1lTWFwID0ge31cclxudmFyIGNvZGVNYXAgPSB7fVxyXG5cclxuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChjb3VudHJ5KSB7XHJcbiAgbmFtZU1hcFtjb3VudHJ5Lm5hbWUudG9Mb3dlckNhc2UoKV0gPSBjb3VudHJ5LmNvZGVcclxuICBjb2RlTWFwW2NvdW50cnkuY29kZS50b0xvd2VyQ2FzZSgpXSA9IGNvdW50cnkubmFtZVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIENvdW50cnlMaXN0ICgpIHtcclxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ291bnRyeUxpc3QpKSByZXR1cm4gbmV3IENvdW50cnlMaXN0KClcclxufTtcclxuXHJcbkNvdW50cnlMaXN0LnByb3RvdHlwZS5nZXRDb2RlID0gZnVuY3Rpb24gZ2V0Q29kZSAobmFtZSkge1xyXG4gIHJldHVybiBuYW1lTWFwW25hbWUudG9Mb3dlckNhc2UoKV1cclxufTtcclxuXHJcbkNvdW50cnlMaXN0LnByb3RvdHlwZS5nZXROYW1lID0gZnVuY3Rpb24gZ2V0TmFtZSAoY29kZSkge1xyXG4gIHJldHVybiBjb2RlTWFwW2NvZGUudG9Mb3dlckNhc2UoKV1cclxufTtcclxuXHJcbkNvdW50cnlMaXN0LnByb3RvdHlwZS5nZXROYW1lcyA9IGZ1bmN0aW9uIGdldE5hbWVzICgpIHtcclxuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGNvdW50cnkpIHtcclxuICAgIHJldHVybiBjb3VudHJ5Lm5hbWVcclxuICB9KVxyXG59O1xyXG5cclxuQ291bnRyeUxpc3QucHJvdG90eXBlLmdldENvZGVzID0gZnVuY3Rpb24gZ2V0Q29kZXMgKCkge1xyXG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoY291bnRyeSkge1xyXG4gICAgcmV0dXJuIGNvdW50cnkuY29kZVxyXG4gIH0pXHJcbn07XHJcblxyXG5Db3VudHJ5TGlzdC5wcm90b3R5cGUuZ2V0Q29kZUxpc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIGNvZGVNYXBcclxufTtcclxuXHJcbkNvdW50cnlMaXN0LnByb3RvdHlwZS5nZXROYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gbmFtZU1hcFxyXG59O1xyXG5cclxuQ291bnRyeUxpc3QucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbiBnZXREYXRhICgpIHtcclxuICByZXR1cm4gZGF0YVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ291bnRyeUxpc3Q7IiwiLy8gc291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vZmFubmFyc2gvY291bnRyeS1saXN0XHJcbi8vIHRoaXMgd2FzIEpTT04gZmlsZSBidXQgbmF0aXZlIG1vZHVsZXMgZGlkbuKAmXQgd2FudCB0byB3b3JrXHJcblxyXG5leHBvcnQgZGVmYXVsdCBbXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQUZcIixcclxuICAgIFwibmFtZVwiOiBcIkFmZ2hhbmlzdGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkFYXCIsXHJcbiAgICBcIm5hbWVcIjogXCLDhWxhbmQgSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBTFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQWxiYW5pYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJEWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQWxnZXJpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBU1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQW1lcmljYW4gU2Ftb2FcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQURcIixcclxuICAgIFwibmFtZVwiOiBcIkFuZG9ycmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQU9cIixcclxuICAgIFwibmFtZVwiOiBcIkFuZ29sYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBSVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQW5ndWlsbGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQVFcIixcclxuICAgIFwibmFtZVwiOiBcIkFudGFyY3RpY2FcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQUdcIixcclxuICAgIFwibmFtZVwiOiBcIkFudGlndWEgYW5kIEJhcmJ1ZGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQVJcIixcclxuICAgIFwibmFtZVwiOiBcIkFyZ2VudGluYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQXJtZW5pYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQXJ1YmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQVVcIixcclxuICAgIFwibmFtZVwiOiBcIkF1c3RyYWxpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQXVzdHJpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJBWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQXplcmJhaWphblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCU1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmFoYW1hc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCSFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmFocmFpblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCRFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmFuZ2xhZGVzaFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCQlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmFyYmFkb3NcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQllcIixcclxuICAgIFwibmFtZVwiOiBcIkJlbGFydXNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQkVcIixcclxuICAgIFwibmFtZVwiOiBcIkJlbGdpdW1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQlpcIixcclxuICAgIFwibmFtZVwiOiBcIkJlbGl6ZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCSlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQmVuaW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQk1cIixcclxuICAgIFwibmFtZVwiOiBcIkJlcm11ZGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQlRcIixcclxuICAgIFwibmFtZVwiOiBcIkJodXRhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCT1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQm9saXZpYSwgUGx1cmluYXRpb25hbCBTdGF0ZSBvZlwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCUVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQm9uYWlyZSwgU2ludCBFdXN0YXRpdXMgYW5kIFNhYmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQkFcIixcclxuICAgIFwibmFtZVwiOiBcIkJvc25pYSBhbmQgSGVyemVnb3ZpbmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQldcIixcclxuICAgIFwibmFtZVwiOiBcIkJvdHN3YW5hXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJWXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCb3V2ZXQgSXNsYW5kXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJSXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCcmF6aWxcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSU9cIixcclxuICAgIFwibmFtZVwiOiBcIkJyaXRpc2ggSW5kaWFuIE9jZWFuIFRlcnJpdG9yeVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJCTlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQnJ1bmVpIERhcnVzc2FsYW1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQkdcIixcclxuICAgIFwibmFtZVwiOiBcIkJ1bGdhcmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJGXCIsXHJcbiAgICBcIm5hbWVcIjogXCJCdXJraW5hIEZhc29cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQklcIixcclxuICAgIFwibmFtZVwiOiBcIkJ1cnVuZGlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiS0hcIixcclxuICAgIFwibmFtZVwiOiBcIkNhbWJvZGlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDYW1lcm9vblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ2FuYWRhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNWXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDYXBlIFZlcmRlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIktZXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDYXltYW4gSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDRlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ2VudHJhbCBBZnJpY2FuIFJlcHVibGljXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlREXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDaGFkXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNMXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDaGlsZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDTlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ2hpbmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ1hcIixcclxuICAgIFwibmFtZVwiOiBcIkNocmlzdG1hcyBJc2xhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ0NcIixcclxuICAgIFwibmFtZVwiOiBcIkNvY29zIChLZWVsaW5nKSBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNPXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDb2xvbWJpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJLTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ29tb3Jvc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDR1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ29uZ29cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ0RcIixcclxuICAgIFwibmFtZVwiOiBcIkNvbmdvLCB0aGUgRGVtb2NyYXRpYyBSZXB1YmxpYyBvZiB0aGVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ0tcIixcclxuICAgIFwibmFtZVwiOiBcIkNvb2sgSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ29zdGEgUmljYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJDSVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiQ8O0dGUgZCdJdm9pcmVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSFJcIixcclxuICAgIFwibmFtZVwiOiBcIkNyb2F0aWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ1VcIixcclxuICAgIFwibmFtZVwiOiBcIkN1YmFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ1dcIixcclxuICAgIFwibmFtZVwiOiBcIkN1cmHDp2FvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkNZXCIsXHJcbiAgICBcIm5hbWVcIjogXCJDeXBydXNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ1pcIixcclxuICAgIFwibmFtZVwiOiBcIkN6ZWNoIFJlcHVibGljXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkRLXCIsXHJcbiAgICBcIm5hbWVcIjogXCJEZW5tYXJrXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkRKXCIsXHJcbiAgICBcIm5hbWVcIjogXCJEamlib3V0aVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJETVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiRG9taW5pY2FcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiRE9cIixcclxuICAgIFwibmFtZVwiOiBcIkRvbWluaWNhbiBSZXB1YmxpY1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJFQ1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiRWN1YWRvclwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJFR1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiRWd5cHRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU1ZcIixcclxuICAgIFwibmFtZVwiOiBcIkVsIFNhbHZhZG9yXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdRXCIsXHJcbiAgICBcIm5hbWVcIjogXCJFcXVhdG9yaWFsIEd1aW5lYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJFUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiRXJpdHJlYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJFRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiRXN0b25pYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJFVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiRXRoaW9waWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiRktcIixcclxuICAgIFwibmFtZVwiOiBcIkZhbGtsYW5kIElzbGFuZHMgKE1hbHZpbmFzKVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJGT1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiRmFyb2UgSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJGSlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiRmlqaVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJGSVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiRmlubGFuZFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJGUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiRnJhbmNlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdGXCIsXHJcbiAgICBcIm5hbWVcIjogXCJGcmVuY2ggR3VpYW5hXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBGXCIsXHJcbiAgICBcIm5hbWVcIjogXCJGcmVuY2ggUG9seW5lc2lhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRGXCIsXHJcbiAgICBcIm5hbWVcIjogXCJGcmVuY2ggU291dGhlcm4gVGVycml0b3JpZXNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR0FcIixcclxuICAgIFwibmFtZVwiOiBcIkdhYm9uXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJHYW1iaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR0VcIixcclxuICAgIFwibmFtZVwiOiBcIkdlb3JnaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiREVcIixcclxuICAgIFwibmFtZVwiOiBcIkdlcm1hbnlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR0hcIixcclxuICAgIFwibmFtZVwiOiBcIkdoYW5hXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdJXCIsXHJcbiAgICBcIm5hbWVcIjogXCJHaWJyYWx0YXJcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR1JcIixcclxuICAgIFwibmFtZVwiOiBcIkdyZWVjZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJHTFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiR3JlZW5sYW5kXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdEXCIsXHJcbiAgICBcIm5hbWVcIjogXCJHcmVuYWRhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdQXCIsXHJcbiAgICBcIm5hbWVcIjogXCJHdWFkZWxvdXBlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdVXCIsXHJcbiAgICBcIm5hbWVcIjogXCJHdWFtXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdUXCIsXHJcbiAgICBcIm5hbWVcIjogXCJHdWF0ZW1hbGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR0dcIixcclxuICAgIFwibmFtZVwiOiBcIkd1ZXJuc2V5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdOXCIsXHJcbiAgICBcIm5hbWVcIjogXCJHdWluZWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR1dcIixcclxuICAgIFwibmFtZVwiOiBcIkd1aW5lYS1CaXNzYXVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiR1lcIixcclxuICAgIFwibmFtZVwiOiBcIkd1eWFuYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJIVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSGFpdGlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSE1cIixcclxuICAgIFwibmFtZVwiOiBcIkhlYXJkIElzbGFuZCBhbmQgTWNEb25hbGQgSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJWQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSG9seSBTZWUgKFZhdGljYW4gQ2l0eSBTdGF0ZSlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSE5cIixcclxuICAgIFwibmFtZVwiOiBcIkhvbmR1cmFzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkhLXCIsXHJcbiAgICBcIm5hbWVcIjogXCJIb25nIEtvbmdcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSFVcIixcclxuICAgIFwibmFtZVwiOiBcIkh1bmdhcnlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSVNcIixcclxuICAgIFwibmFtZVwiOiBcIkljZWxhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSU5cIixcclxuICAgIFwibmFtZVwiOiBcIkluZGlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIklEXCIsXHJcbiAgICBcIm5hbWVcIjogXCJJbmRvbmVzaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSVJcIixcclxuICAgIFwibmFtZVwiOiBcIklyYW4sIElzbGFtaWMgUmVwdWJsaWMgb2ZcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSVFcIixcclxuICAgIFwibmFtZVwiOiBcIklyYXFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSUVcIixcclxuICAgIFwibmFtZVwiOiBcIklyZWxhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSU1cIixcclxuICAgIFwibmFtZVwiOiBcIklzbGUgb2YgTWFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIklMXCIsXHJcbiAgICBcIm5hbWVcIjogXCJJc3JhZWxcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiSVRcIixcclxuICAgIFwibmFtZVwiOiBcIkl0YWx5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkpNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJKYW1haWNhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkpQXCIsXHJcbiAgICBcIm5hbWVcIjogXCJKYXBhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJKRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiSmVyc2V5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkpPXCIsXHJcbiAgICBcIm5hbWVcIjogXCJKb3JkYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiS1pcIixcclxuICAgIFwibmFtZVwiOiBcIkthemFraHN0YW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiS0VcIixcclxuICAgIFwibmFtZVwiOiBcIktlbnlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIktJXCIsXHJcbiAgICBcIm5hbWVcIjogXCJLaXJpYmF0aVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJLUFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiS29yZWEsIERlbW9jcmF0aWMgUGVvcGxlJ3MgUmVwdWJsaWMgb2ZcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiS1JcIixcclxuICAgIFwibmFtZVwiOiBcIktvcmVhLCBSZXB1YmxpYyBvZlwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJLV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiS3V3YWl0XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIktHXCIsXHJcbiAgICBcIm5hbWVcIjogXCJLeXJneXpzdGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxBXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMYW8gUGVvcGxlJ3MgRGVtb2NyYXRpYyBSZXB1YmxpY1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJMVlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTGF0dmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxCXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMZWJhbm9uXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMZXNvdGhvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxSXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMaWJlcmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxZXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMaWJ5YVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJMSVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTGllY2h0ZW5zdGVpblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJMVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTGl0aHVhbmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxVXCIsXHJcbiAgICBcIm5hbWVcIjogXCJMdXhlbWJvdXJnXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1PXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNYWNhb1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNS1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWFjZWRvbmlhLCB0aGUgRm9ybWVyIFl1Z29zbGF2IFJlcHVibGljIG9mXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1HXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNYWRhZ2FzY2FyXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1XXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNYWxhd2lcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTVlcIixcclxuICAgIFwibmFtZVwiOiBcIk1hbGF5c2lhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1WXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNYWxkaXZlc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNTFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWFsaVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWFsdGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTUhcIixcclxuICAgIFwibmFtZVwiOiBcIk1hcnNoYWxsIElzbGFuZHNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTVFcIixcclxuICAgIFwibmFtZVwiOiBcIk1hcnRpbmlxdWVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTVJcIixcclxuICAgIFwibmFtZVwiOiBcIk1hdXJpdGFuaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTVVcIixcclxuICAgIFwibmFtZVwiOiBcIk1hdXJpdGl1c1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJZVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWF5b3R0ZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNWFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTWV4aWNvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkZNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNaWNyb25lc2lhLCBGZWRlcmF0ZWQgU3RhdGVzIG9mXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1EXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNb2xkb3ZhLCBSZXB1YmxpYyBvZlwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNQ1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiTW9uYWNvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1OXCIsXHJcbiAgICBcIm5hbWVcIjogXCJNb25nb2xpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTW9udGVuZWdyb1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNU1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiTW9udHNlcnJhdFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTW9yb2Njb1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTW96YW1iaXF1ZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJNTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTXlhbm1hclwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTmFtaWJpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTmF1cnVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTlBcIixcclxuICAgIFwibmFtZVwiOiBcIk5lcGFsXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk5MXCIsXHJcbiAgICBcIm5hbWVcIjogXCJOZXRoZXJsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOQ1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiTmV3IENhbGVkb25pYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJOWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTmV3IFplYWxhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTklcIixcclxuICAgIFwibmFtZVwiOiBcIk5pY2FyYWd1YVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJORVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiTmlnZXJcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTkdcIixcclxuICAgIFwibmFtZVwiOiBcIk5pZ2VyaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTlVcIixcclxuICAgIFwibmFtZVwiOiBcIk5pdWVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTkZcIixcclxuICAgIFwibmFtZVwiOiBcIk5vcmZvbGsgSXNsYW5kXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIk1QXCIsXHJcbiAgICBcIm5hbWVcIjogXCJOb3J0aGVybiBNYXJpYW5hIElzbGFuZHNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTk9cIixcclxuICAgIFwibmFtZVwiOiBcIk5vcndheVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJPTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiT21hblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJQS1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiUGFraXN0YW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUFdcIixcclxuICAgIFwibmFtZVwiOiBcIlBhbGF1XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJQYWxlc3RpbmUsIFN0YXRlIG9mXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBBXCIsXHJcbiAgICBcIm5hbWVcIjogXCJQYW5hbWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUEdcIixcclxuICAgIFwibmFtZVwiOiBcIlBhcHVhIE5ldyBHdWluZWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUFlcIixcclxuICAgIFwibmFtZVwiOiBcIlBhcmFndWF5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBFXCIsXHJcbiAgICBcIm5hbWVcIjogXCJQZXJ1XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBIXCIsXHJcbiAgICBcIm5hbWVcIjogXCJQaGlsaXBwaW5lc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJQTlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiUGl0Y2Fpcm5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUExcIixcclxuICAgIFwibmFtZVwiOiBcIlBvbGFuZFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJQVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiUG9ydHVnYWxcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUFJcIixcclxuICAgIFwibmFtZVwiOiBcIlB1ZXJ0byBSaWNvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlFBXCIsXHJcbiAgICBcIm5hbWVcIjogXCJRYXRhclwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJSRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiUsOpdW5pb25cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUk9cIixcclxuICAgIFwibmFtZVwiOiBcIlJvbWFuaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiUlVcIixcclxuICAgIFwibmFtZVwiOiBcIlJ1c3NpYW4gRmVkZXJhdGlvblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJSV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiUndhbmRhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkJMXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTYWludCBCYXJ0aMOpbGVteVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTSFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2FpbnQgSGVsZW5hLCBBc2NlbnNpb24gYW5kIFRyaXN0YW4gZGEgQ3VuaGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiS05cIixcclxuICAgIFwibmFtZVwiOiBcIlNhaW50IEtpdHRzIGFuZCBOZXZpc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJMQ1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2FpbnQgTHVjaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiTUZcIixcclxuICAgIFwibmFtZVwiOiBcIlNhaW50IE1hcnRpbiAoRnJlbmNoIHBhcnQpXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlBNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTYWludCBQaWVycmUgYW5kIE1pcXVlbG9uXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlZDXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTYWludCBWaW5jZW50IGFuZCB0aGUgR3JlbmFkaW5lc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJXU1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2Ftb2FcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU01cIixcclxuICAgIFwibmFtZVwiOiBcIlNhbiBNYXJpbm9cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU1RcIixcclxuICAgIFwibmFtZVwiOiBcIlNhbyBUb21lIGFuZCBQcmluY2lwZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2F1ZGkgQXJhYmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNOXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTZW5lZ2FsXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlJTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTZXJiaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU0NcIixcclxuICAgIFwibmFtZVwiOiBcIlNleWNoZWxsZXNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU0xcIixcclxuICAgIFwibmFtZVwiOiBcIlNpZXJyYSBMZW9uZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTR1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2luZ2Fwb3JlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNYXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTaW50IE1hYXJ0ZW4gKER1dGNoIHBhcnQpXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNLXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTbG92YWtpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTSVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU2xvdmVuaWFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU0JcIixcclxuICAgIFwibmFtZVwiOiBcIlNvbG9tb24gSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTT1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiU29tYWxpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJaQVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU291dGggQWZyaWNhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdTXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTb3V0aCBHZW9yZ2lhIGFuZCB0aGUgU291dGggU2FuZHdpY2ggSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTU1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiU291dGggU3VkYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiRVNcIixcclxuICAgIFwibmFtZVwiOiBcIlNwYWluXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkxLXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTcmkgTGFua2FcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiU0RcIixcclxuICAgIFwibmFtZVwiOiBcIlN1ZGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNSXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTdXJpbmFtZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTSlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU3ZhbGJhcmQgYW5kIEphbiBNYXllblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJTWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiU3dhemlsYW5kXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNFXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTd2VkZW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQ0hcIixcclxuICAgIFwibmFtZVwiOiBcIlN3aXR6ZXJsYW5kXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlNZXCIsXHJcbiAgICBcIm5hbWVcIjogXCJTeXJpYW4gQXJhYiBSZXB1YmxpY1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiVGFpd2FuLCBQcm92aW5jZSBvZiBDaGluYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUSlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVGFqaWtpc3RhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUWlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVGFuemFuaWEsIFVuaXRlZCBSZXB1YmxpYyBvZlwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUSFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVGhhaWxhbmRcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVExcIixcclxuICAgIFwibmFtZVwiOiBcIlRpbW9yLUxlc3RlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRHXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUb2dvXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRLXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUb2tlbGF1XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRPXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUb25nYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUVFwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVHJpbmlkYWQgYW5kIFRvYmFnb1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUTlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVHVuaXNpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUUlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVHVya2V5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlRNXCIsXHJcbiAgICBcIm5hbWVcIjogXCJUdXJrbWVuaXN0YW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVENcIixcclxuICAgIFwibmFtZVwiOiBcIlR1cmtzIGFuZCBDYWljb3MgSXNsYW5kc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJUVlwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVHV2YWx1XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlVHXCIsXHJcbiAgICBcIm5hbWVcIjogXCJVZ2FuZGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVUFcIixcclxuICAgIFwibmFtZVwiOiBcIlVrcmFpbmVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiQUVcIixcclxuICAgIFwibmFtZVwiOiBcIlVuaXRlZCBBcmFiIEVtaXJhdGVzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkdCXCIsXHJcbiAgICBcIm5hbWVcIjogXCJVbml0ZWQgS2luZ2RvbVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJVU1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiVW5pdGVkIFN0YXRlc1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJVTVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVW5pdGVkIFN0YXRlcyBNaW5vciBPdXRseWluZyBJc2xhbmRzXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlVZXCIsXHJcbiAgICBcIm5hbWVcIjogXCJVcnVndWF5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlVaXCIsXHJcbiAgICBcIm5hbWVcIjogXCJVemJla2lzdGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlZVXCIsXHJcbiAgICBcIm5hbWVcIjogXCJWYW51YXR1XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlZFXCIsXHJcbiAgICBcIm5hbWVcIjogXCJWZW5lenVlbGEsIEJvbGl2YXJpYW4gUmVwdWJsaWMgb2ZcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiVk5cIixcclxuICAgIFwibmFtZVwiOiBcIlZpZXQgTmFtXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIlZHXCIsXHJcbiAgICBcIm5hbWVcIjogXCJWaXJnaW4gSXNsYW5kcywgQnJpdGlzaFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJWSVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiVmlyZ2luIElzbGFuZHMsIFUuUy5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiV0ZcIixcclxuICAgIFwibmFtZVwiOiBcIldhbGxpcyBhbmQgRnV0dW5hXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwiY29kZVwiOiBcIkVIXCIsXHJcbiAgICBcIm5hbWVcIjogXCJXZXN0ZXJuIFNhaGFyYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJZRVwiLFxyXG4gICAgXCJuYW1lXCI6IFwiWWVtZW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJjb2RlXCI6IFwiWk1cIixcclxuICAgIFwibmFtZVwiOiBcIlphbWJpYVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcImNvZGVcIjogXCJaV1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiWmltYmFid2VcIlxyXG4gIH1cclxuXTsiXX0=
