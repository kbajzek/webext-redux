"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _constants = require("../constants");

var _serialization = require("../serialization");

var _util = require("../util");

var _diff = _interopRequireDefault(require("../strategies/shallowDiff/diff"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * Responder for promisified results
 * @param  {object} dispatchResult The result from `store.dispatch()`
 * @param  {function} send         The function used to respond to original message
 * @return {undefined}
 */
var promiseResponder = function promiseResponder(dispatchResult, send) {
  Promise.resolve(dispatchResult).then(function (res) {
    send({
      error: null,
      value: res
    });
  }).catch(function (err) {
    console.error('error dispatching result:', err);
    send({
      error: err.message,
      value: null
    });
  });
};

var defaultOpts = {
  portName: _constants.DEFAULT_PORT_NAME,
  dispatchResponder: promiseResponder,
  serializer: _serialization.noop,
  deserializer: _serialization.noop,
  diffStrategy: _diff.default
};
/**
 * Wraps a Redux store so that proxy stores can connect to it.
 * @param {Object} store A Redux store
 * @param {Object} options An object of form {portName, dispatchResponder, serializer, deserializer}, where `portName` is a required string and defines the name of the port for state transition changes, `dispatchResponder` is a function that takes the result of a store dispatch and optionally implements custom logic for responding to the original dispatch message,`serializer` is a function to serialize outgoing message payloads (default is passthrough), `deserializer` is a function to deserialize incoming message payloads (default is passthrough), and diffStrategy is one of the included diffing strategies (default is shallow diff) or a custom diffing function.
 */

var _default = function _default(store) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOpts,
      _ref$portName = _ref.portName,
      portName = _ref$portName === void 0 ? defaultOpts.portName : _ref$portName,
      _ref$dispatchResponde = _ref.dispatchResponder,
      dispatchResponder = _ref$dispatchResponde === void 0 ? defaultOpts.dispatchResponder : _ref$dispatchResponde,
      _ref$serializer = _ref.serializer,
      serializer = _ref$serializer === void 0 ? defaultOpts.serializer : _ref$serializer,
      _ref$deserializer = _ref.deserializer,
      deserializer = _ref$deserializer === void 0 ? defaultOpts.deserializer : _ref$deserializer,
      _ref$diffStrategy = _ref.diffStrategy,
      diffStrategy = _ref$diffStrategy === void 0 ? defaultOpts.diffStrategy : _ref$diffStrategy;

  if (!portName) {
    throw new Error('portName is required in options');
  }

  if (typeof serializer !== 'function') {
    throw new Error('serializer must be a function');
  }

  if (typeof deserializer !== 'function') {
    throw new Error('deserializer must be a function');
  }

  if (typeof diffStrategy !== 'function') {
    throw new Error('diffStrategy must be one of the included diffing strategies or a custom diff function');
  }

  var browserAPI = (0, _util.getBrowserAPI)();
  /**
   * Respond to dispatches from UI components
   */

  var dispatchResponse =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(request, sender, sendResponse) {
      var action, dispatchResult;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(request.type === _constants.DISPATCH_TYPE && request.portName === portName)) {
                _context.next = 16;
                break;
              }

              action = Object.assign({}, request.payload, {
                _sender: sender
              });
              dispatchResult = null;
              _context.prev = 3;
              _context.next = 6;
              return store();

            case 6:
              _context.t0 = action;
              dispatchResult = _context.sent.dispatch(_context.t0);
              _context.next = 14;
              break;

            case 10:
              _context.prev = 10;
              _context.t1 = _context["catch"](3);
              dispatchResult = Promise.reject(_context.t1.message);
              console.error(_context.t1);

            case 14:
              dispatchResponder(dispatchResult, sendResponse);
              return _context.abrupt("return", true);

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[3, 10]]);
    }));

    return function dispatchResponse(_x, _x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();
  /**
  * Setup for state updates
  */


  var connectState =
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(port) {
      var createdStore, serializedMessagePoster, prevState, patchState, unsubscribe;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return store();

            case 2:
              createdStore = _context2.sent;

              if (!(port.name !== portName)) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt("return");

            case 5:
              serializedMessagePoster = (0, _serialization.withSerializer)(serializer)(function () {
                return port.postMessage.apply(port, arguments);
              });
              prevState = createdStore.getState();

              patchState = function patchState() {
                var state = createdStore.getState();
                var diff = diffStrategy(prevState, state);

                if (diff.length) {
                  prevState = state;
                  serializedMessagePoster({
                    type: _constants.PATCH_STATE_TYPE,
                    payload: diff
                  });
                }
              }; // Send patched state down connected port on every redux store state change


              _context2.next = 10;
              return store();

            case 10:
              _context2.t0 = patchState;
              unsubscribe = _context2.sent.subscribe(_context2.t0);
              // when the port disconnects, unsubscribe the sendState listener
              port.onDisconnect.addListener(unsubscribe); // Send store's initial state through port

              serializedMessagePoster({
                type: _constants.STATE_TYPE,
                payload: prevState
              });

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function connectState(_x4) {
      return _ref3.apply(this, arguments);
    };
  }();

  var withPayloadDeserializer = (0, _serialization.withDeserializer)(deserializer);

  var shouldDeserialize = function shouldDeserialize(request) {
    return request.type === _constants.DISPATCH_TYPE && request.portName === portName;
  };
  /**
   * Setup action handler
   */


  withPayloadDeserializer(function () {
    var _browserAPI$runtime$o;

    return (_browserAPI$runtime$o = browserAPI.runtime.onMessage).addListener.apply(_browserAPI$runtime$o, arguments);
  })(dispatchResponse, shouldDeserialize);
  /**
   * Setup external action handler
   */

  if (browserAPI.runtime.onMessageExternal) {
    withPayloadDeserializer(function () {
      var _browserAPI$runtime$o2;

      return (_browserAPI$runtime$o2 = browserAPI.runtime.onMessageExternal).addListener.apply(_browserAPI$runtime$o2, arguments);
    })(dispatchResponse, shouldDeserialize);
  } else {
    console.warn('runtime.onMessageExternal is not supported');
  }
  /**
   * Setup extended connection
   */


  browserAPI.runtime.onConnect.addListener(connectState);
  /**
   * Setup extended external connection
   */

  if (browserAPI.runtime.onConnectExternal) {
    browserAPI.runtime.onConnectExternal.addListener(connectState);
  } else {
    console.warn('runtime.onConnectExternal is not supported');
  }
  /**
   * Safety message to tabs for content scripts
   */


  browserAPI.tabs.query({}, function (tabs) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = tabs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var tab = _step.value;
        browserAPI.tabs.sendMessage(tab.id, {
          action: 'storeReady',
          portName: portName
        }, function () {
          if (chrome.runtime.lastError) {// do nothing - errors can be present
            // if no content script exists on reciever
          }
        });
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }); // For non-tab based
  // TODO: Find use case for this. Ommiting until then.
  // browserAPI.runtime.sendMessage(null, {action: 'storeReady'});
};

exports.default = _default;