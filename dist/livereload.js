(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],2:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":21,"./_wks":66}],3:[function(require,module,exports){
'use strict';
var at = require('./_string-at')(true);

 // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};

},{"./_string-at":56}],4:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":27}],5:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":57,"./_to-iobject":59,"./_to-length":60}],6:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":7,"./_wks":66}],7:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],8:[function(require,module,exports){
var core = module.exports = { version: '2.6.0' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],9:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":1}],10:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],11:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":16}],12:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":19,"./_is-object":27}],13:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],14:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":41,"./_object-keys":44,"./_object-pie":45}],15:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":8,"./_ctx":9,"./_global":19,"./_hide":21,"./_redefine":47}],16:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],17:[function(require,module,exports){
'use strict';
require('./es6.regexp.exec');
var redefine = require('./_redefine');
var hide = require('./_hide');
var fails = require('./_fails');
var defined = require('./_defined');
var wks = require('./_wks');
var regexpExec = require('./_regexp-exec');

var SPECIES = wks('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
})();

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
    }
    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(
      defined,
      SYMBOL,
      ''[KEY],
      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      }
    );
    var strfn = fns[0];
    var rxfn = fns[1];

    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};

},{"./_defined":10,"./_fails":16,"./_hide":21,"./_redefine":47,"./_regexp-exec":49,"./_wks":66,"./es6.regexp.exec":69}],18:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"./_an-object":4}],19:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],20:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],21:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":11,"./_object-dp":36,"./_property-desc":46}],22:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":19}],23:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":11,"./_dom-create":12,"./_fails":16}],24:[function(require,module,exports){
var isObject = require('./_is-object');
var setPrototypeOf = require('./_set-proto').set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

},{"./_is-object":27,"./_set-proto":50}],25:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":7}],26:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":7}],27:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],28:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = require('./_is-object');
var cof = require('./_cof');
var MATCH = require('./_wks')('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};

},{"./_cof":7,"./_is-object":27,"./_wks":66}],29:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":21,"./_object-create":35,"./_property-desc":46,"./_set-to-string-tag":52,"./_wks":66}],30:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":15,"./_hide":21,"./_iter-create":29,"./_iterators":32,"./_library":33,"./_object-gpo":42,"./_redefine":47,"./_set-to-string-tag":52,"./_wks":66}],31:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],32:[function(require,module,exports){
module.exports = {};

},{}],33:[function(require,module,exports){
module.exports = false;

},{}],34:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":16,"./_has":20,"./_is-object":27,"./_object-dp":36,"./_uid":63}],35:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":4,"./_dom-create":12,"./_enum-bug-keys":13,"./_html":22,"./_object-dps":37,"./_shared-key":53}],36:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":4,"./_descriptors":11,"./_ie8-dom-define":23,"./_to-primitive":62}],37:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":4,"./_descriptors":11,"./_object-dp":36,"./_object-keys":44}],38:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":11,"./_has":20,"./_ie8-dom-define":23,"./_object-pie":45,"./_property-desc":46,"./_to-iobject":59,"./_to-primitive":62}],39:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":40,"./_to-iobject":59}],40:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":13,"./_object-keys-internal":43}],41:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],42:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":20,"./_shared-key":53,"./_to-object":61}],43:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":5,"./_has":20,"./_shared-key":53,"./_to-iobject":59}],44:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":13,"./_object-keys-internal":43}],45:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],46:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],47:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":8,"./_global":19,"./_has":20,"./_hide":21,"./_uid":63}],48:[function(require,module,exports){
'use strict';

var classof = require('./_classof');
var builtinExec = RegExp.prototype.exec;

 // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }
  if (classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }
  return builtinExec.call(R, S);
};

},{"./_classof":6}],49:[function(require,module,exports){
'use strict';

var regexpFlags = require('./_flags');

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/,
      re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;

},{"./_flags":18}],50:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":4,"./_ctx":9,"./_is-object":27,"./_object-gopd":38}],51:[function(require,module,exports){
'use strict';
var global = require('./_global');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_descriptors":11,"./_global":19,"./_object-dp":36,"./_wks":66}],52:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":20,"./_object-dp":36,"./_wks":66}],53:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":54,"./_uid":63}],54:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":8,"./_global":19,"./_library":33}],55:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":1,"./_an-object":4,"./_wks":66}],56:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":10,"./_to-integer":58}],57:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":58}],58:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],59:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":10,"./_iobject":25}],60:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":58}],61:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":10}],62:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":27}],63:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],64:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":8,"./_global":19,"./_library":33,"./_object-dp":36,"./_wks-ext":65}],65:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":66}],66:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":19,"./_shared":54,"./_uid":63}],67:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":2,"./_iter-define":30,"./_iter-step":31,"./_iterators":32,"./_to-iobject":59}],68:[function(require,module,exports){
var global = require('./_global');
var inheritIfRequired = require('./_inherit-if-required');
var dP = require('./_object-dp').f;
var gOPN = require('./_object-gopn').f;
var isRegExp = require('./_is-regexp');
var $flags = require('./_flags');
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (require('./_descriptors') && (!CORRECT_NEW || require('./_fails')(function () {
  re2[require('./_wks')('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  require('./_redefine')(global, 'RegExp', $RegExp);
}

require('./_set-species')('RegExp');

},{"./_descriptors":11,"./_fails":16,"./_flags":18,"./_global":19,"./_inherit-if-required":24,"./_is-regexp":28,"./_object-dp":36,"./_object-gopn":40,"./_redefine":47,"./_set-species":51,"./_wks":66}],69:[function(require,module,exports){
'use strict';
var regexpExec = require('./_regexp-exec');
require('./_export')({
  target: 'RegExp',
  proto: true,
  forced: regexpExec !== /./.exec
}, {
  exec: regexpExec
});

},{"./_export":15,"./_regexp-exec":49}],70:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var toLength = require('./_to-length');
var advanceStringIndex = require('./_advance-string-index');
var regExpExec = require('./_regexp-exec-abstract');

// @@match logic
require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[MATCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative($match, regexp, this);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      if (!rx.global) return regExpExec(rx, S);
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

},{"./_advance-string-index":3,"./_an-object":4,"./_fix-re-wks":17,"./_regexp-exec-abstract":48,"./_to-length":60}],71:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var toInteger = require('./_to-integer');
var advanceStringIndex = require('./_advance-string-index');
var regExpExec = require('./_regexp-exec-abstract');
var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, O, replaceValue)
        : $replace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative($replace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }
      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

    // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return ch;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return ch;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return ch;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});

},{"./_advance-string-index":3,"./_an-object":4,"./_fix-re-wks":17,"./_regexp-exec-abstract":48,"./_to-integer":58,"./_to-length":60,"./_to-object":61}],72:[function(require,module,exports){
'use strict';

var isRegExp = require('./_is-regexp');
var anObject = require('./_an-object');
var speciesConstructor = require('./_species-constructor');
var advanceStringIndex = require('./_advance-string-index');
var toLength = require('./_to-length');
var callRegExpExec = require('./_regexp-exec-abstract');
var regexpExec = require('./_regexp-exec');
var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX = 'lastIndex';

// eslint-disable-next-line no-empty
var SUPPORTS_Y = !!(function () { try { return new RegExp('x', 'y'); } catch (e) {} })();

// @@split logic
require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit = $split;
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  }

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = defined(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                    (rx.multiline ? 'm' : '') +
                    (rx.unicode ? 'u' : '') +
                    (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? 0xffffffff : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = $min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
});

},{"./_advance-string-index":3,"./_an-object":4,"./_fix-re-wks":17,"./_is-regexp":28,"./_regexp-exec":49,"./_regexp-exec-abstract":48,"./_species-constructor":55,"./_to-length":60}],73:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":4,"./_descriptors":11,"./_enum-keys":14,"./_export":15,"./_fails":16,"./_global":19,"./_has":20,"./_hide":21,"./_is-array":26,"./_is-object":27,"./_library":33,"./_meta":34,"./_object-create":35,"./_object-dp":36,"./_object-gopd":38,"./_object-gopn":40,"./_object-gopn-ext":39,"./_object-gops":41,"./_object-keys":44,"./_object-pie":45,"./_property-desc":46,"./_redefine":47,"./_set-to-string-tag":52,"./_shared":54,"./_to-iobject":59,"./_to-primitive":62,"./_uid":63,"./_wks":66,"./_wks-define":64,"./_wks-ext":65}],74:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":64}],75:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":19,"./_hide":21,"./_iterators":32,"./_object-keys":44,"./_redefine":47,"./_wks":66,"./es6.array.iterator":67}],76:[function(require,module,exports){
"use strict";

const _require = require('./protocol'),
      Parser = _require.Parser,
      PROTOCOL_6 = _require.PROTOCOL_6,
      PROTOCOL_7 = _require.PROTOCOL_7;

const VERSION = "2.4.0";

class Connector {
  constructor(options, WebSocket, Timer, handlers) {
    this.options = options;
    this.WebSocket = WebSocket;
    this.Timer = Timer;
    this.handlers = handlers;
    const path = this.options.path ? `${this.options.path}` : 'livereload';
    this._uri = `ws${this.options.https ? 's' : ''}://${this.options.host}:${this.options.port}/${path}`;
    this._nextDelay = this.options.mindelay;
    this._connectionDesired = false;
    this.protocol = 0;
    this.protocolParser = new Parser({
      connected: protocol => {
        this.protocol = protocol;

        this._handshakeTimeout.stop();

        this._nextDelay = this.options.mindelay;
        this._disconnectionReason = 'broken';
        return this.handlers.connected(this.protocol);
      },
      error: e => {
        this.handlers.error(e);
        return this._closeOnError();
      },
      message: _message => {
        return this.handlers.message(_message);
      }
    });
    this._handshakeTimeout = new this.Timer(() => {
      if (!this._isSocketConnected()) {
        return;
      }

      this._disconnectionReason = 'handshake-timeout';
      return this.socket.close();
    });
    this._reconnectTimer = new this.Timer(() => {
      if (!this._connectionDesired) {
        return;
      } // shouldn't hit this, but just in case


      return this.connect();
    });
    this.connect();
  }

  _isSocketConnected() {
    return this.socket && this.socket.readyState === this.WebSocket.OPEN;
  }

  connect() {
    this._connectionDesired = true;

    if (this._isSocketConnected()) {
      return;
    } // prepare for a new connection


    this._reconnectTimer.stop();

    this._disconnectionReason = 'cannot-connect';
    this.protocolParser.reset();
    this.handlers.connecting();
    this.socket = new this.WebSocket(this._uri);

    this.socket.onopen = e => this._onopen(e);

    this.socket.onclose = e => this._onclose(e);

    this.socket.onmessage = e => this._onmessage(e);

    this.socket.onerror = e => this._onerror(e);
  }

  disconnect() {
    this._connectionDesired = false;

    this._reconnectTimer.stop(); // in case it was running


    if (!this._isSocketConnected()) {
      return;
    }

    this._disconnectionReason = 'manual';
    return this.socket.close();
  }

  _scheduleReconnection() {
    if (!this._connectionDesired) {
      return;
    } // don't reconnect after manual disconnection


    if (!this._reconnectTimer.running) {
      this._reconnectTimer.start(this._nextDelay);

      this._nextDelay = Math.min(this.options.maxdelay, this._nextDelay * 2);
    }
  }

  sendCommand(command) {
    if (!this.protocol) {
      return;
    }

    return this._sendCommand(command);
  }

  _sendCommand(command) {
    return this.socket.send(JSON.stringify(command));
  }

  _closeOnError() {
    this._handshakeTimeout.stop();

    this._disconnectionReason = 'error';
    return this.socket.close();
  }

  _onopen(e) {
    this.handlers.socketConnected();
    this._disconnectionReason = 'handshake-failed'; // start handshake

    const hello = {
      command: 'hello',
      protocols: [PROTOCOL_6, PROTOCOL_7]
    };
    hello.ver = VERSION;

    if (this.options.ext) {
      hello.ext = this.options.ext;
    }

    if (this.options.extver) {
      hello.extver = this.options.extver;
    }

    if (this.options.snipver) {
      hello.snipver = this.options.snipver;
    }

    this._sendCommand(hello);

    return this._handshakeTimeout.start(this.options.handshake_timeout);
  }

  _onclose(e) {
    this.protocol = 0;
    this.handlers.disconnected(this._disconnectionReason, this._nextDelay);
    return this._scheduleReconnection();
  }

  _onerror(e) {}

  _onmessage(e) {
    return this.protocolParser.process(e.data);
  }

}

;
exports.Connector = Connector;

},{"./protocol":81}],77:[function(require,module,exports){
"use strict";

const CustomEvents = {
  bind(element, eventName, handler) {
    if (element.addEventListener) {
      return element.addEventListener(eventName, handler, false);
    } else if (element.attachEvent) {
      element[eventName] = 1;
      return element.attachEvent('onpropertychange', function (event) {
        if (event.propertyName === eventName) {
          return handler();
        }
      });
    } else {
      throw new Error(`Attempt to attach custom event ${eventName} to something which isn't a DOMElement`);
    }
  },

  fire(element, eventName) {
    if (element.addEventListener) {
      const event = document.createEvent('HTMLEvents');
      event.initEvent(eventName, true, true);
      return document.dispatchEvent(event);
    } else if (element.attachEvent) {
      if (element[eventName]) {
        return element[eventName]++;
      }
    } else {
      throw new Error(`Attempt to fire custom event ${eventName} on something which isn't a DOMElement`);
    }
  }

};
exports.bind = CustomEvents.bind;
exports.fire = CustomEvents.fire;

},{}],78:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.match");

class LessPlugin {
  constructor(window, host) {
    this.window = window;
    this.host = host;
  }

  reload(path, options) {
    if (this.window.less && this.window.less.refresh) {
      if (path.match(/\.less$/i)) {
        return this.reloadLess(path);
      }

      if (options.originalPath.match(/\.less$/i)) {
        return this.reloadLess(options.originalPath);
      }
    }

    return false;
  }

  reloadLess(path) {
    let link;

    const links = (() => {
      const result = [];

      for (link of Array.from(document.getElementsByTagName('link'))) {
        if (link.href && link.rel.match(/^stylesheet\/less$/i) || link.rel.match(/stylesheet/i) && link.type.match(/^text\/(x-)?less$/i)) {
          result.push(link);
        }
      }

      return result;
    })();

    if (links.length === 0) {
      return false;
    }

    for (link of Array.from(links)) {
      link.href = this.host.generateCacheBustUrl(link.href);
    }

    this.host.console.log('LiveReload is asking LESS to recompile all stylesheets');
    this.window.less.refresh(true);
    return true;
  }

  analyze() {
    return {
      disable: !!(this.window.less && this.window.less.refresh)
    };
  }

}

;
LessPlugin.identifier = 'less';
LessPlugin.version = '1.0';
module.exports = LessPlugin;

},{"core-js/modules/es6.regexp.match":70}],79:[function(require,module,exports){
"use strict";

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.regexp.match");

/* global alert */
const _require = require('./connector'),
      Connector = _require.Connector;

const _require2 = require('./timer'),
      Timer = _require2.Timer;

const _require3 = require('./options'),
      Options = _require3.Options;

const _require4 = require('./reloader'),
      Reloader = _require4.Reloader;

const _require5 = require('./protocol'),
      ProtocolError = _require5.ProtocolError;

class LiveReload {
  constructor(window) {
    this.window = window;
    this.listeners = {};
    this.plugins = [];
    this.pluginIdentifiers = {}; // i can haz console?

    this.console = this.window.console && this.window.console.log && this.window.console.error ? this.window.location.href.match(/LR-verbose/) ? this.window.console : {
      log() {},

      error: this.window.console.error.bind(this.window.console)
    } : {
      log() {},

      error() {}

    }; // i can haz sockets?

    if (!(this.WebSocket = this.window.WebSocket || this.window.MozWebSocket)) {
      this.console.error('LiveReload disabled because the browser does not seem to support web sockets');
      return;
    } // i can haz options?


    if ('LiveReloadOptions' in window) {
      this.options = new Options();

      for (let k of Object.keys(window['LiveReloadOptions'] || {})) {
        const v = window['LiveReloadOptions'][k];
        this.options.set(k, v);
      }
    } else {
      this.options = Options.extract(this.window.document);

      if (!this.options) {
        this.console.error('LiveReload disabled because it could not find its own <SCRIPT> tag');
        return;
      }
    } // i can haz reloader?


    this.reloader = new Reloader(this.window, this.console, Timer); // i can haz connection?

    this.connector = new Connector(this.options, this.WebSocket, Timer, {
      connecting: () => {},
      socketConnected: () => {},
      connected: protocol => {
        if (typeof this.listeners.connect === 'function') {
          this.listeners.connect();
        }

        this.log(`LiveReload is connected to ${this.options.host}:${this.options.port} (protocol v${protocol}).`);
        return this.analyze();
      },
      error: e => {
        if (e instanceof ProtocolError) {
          if (typeof console !== 'undefined' && console !== null) {
            return console.log(`${e.message}.`);
          }
        } else {
          if (typeof console !== 'undefined' && console !== null) {
            return console.log(`LiveReload internal error: ${e.message}`);
          }
        }
      },
      disconnected: (reason, nextDelay) => {
        if (typeof this.listeners.disconnect === 'function') {
          this.listeners.disconnect();
        }

        switch (reason) {
          case 'cannot-connect':
            return this.log(`LiveReload cannot connect to ${this.options.host}:${this.options.port}, will retry in ${nextDelay} sec.`);

          case 'broken':
            return this.log(`LiveReload disconnected from ${this.options.host}:${this.options.port}, reconnecting in ${nextDelay} sec.`);

          case 'handshake-timeout':
            return this.log(`LiveReload cannot connect to ${this.options.host}:${this.options.port} (handshake timeout), will retry in ${nextDelay} sec.`);

          case 'handshake-failed':
            return this.log(`LiveReload cannot connect to ${this.options.host}:${this.options.port} (handshake failed), will retry in ${nextDelay} sec.`);

          case 'manual': // nop

          case 'error': // nop

          default:
            return this.log(`LiveReload disconnected from ${this.options.host}:${this.options.port} (${reason}), reconnecting in ${nextDelay} sec.`);
        }
      },
      message: _message => {
        switch (_message.command) {
          case 'reload':
            return this.performReload(_message);

          case 'alert':
            return this.performAlert(_message);
        }
      }
    });
    this.initialized = true;
  }

  on(eventName, handler) {
    this.listeners[eventName] = handler;
  }

  log(message) {
    return this.console.log(`${message}`);
  }

  performReload(message) {
    this.log(`LiveReload received reload request: ${JSON.stringify(message, null, 2)}`);
    return this.reloader.reload(message.path, {
      liveCSS: message.liveCSS != null ? message.liveCSS : true,
      liveImg: message.liveImg != null ? message.liveImg : true,
      reloadMissingCSS: message.reloadMissingCSS != null ? message.reloadMissingCSS : true,
      originalPath: message.originalPath || '',
      overrideURL: message.overrideURL || '',
      serverURL: `http://${this.options.host}:${this.options.port}`
    });
  }

  performAlert(message) {
    return alert(message.message);
  }

  shutDown() {
    if (!this.initialized) {
      return;
    }

    this.connector.disconnect();
    this.log('LiveReload disconnected.');
    return typeof this.listeners.shutdown === 'function' ? this.listeners.shutdown() : undefined;
  }

  hasPlugin(identifier) {
    return !!this.pluginIdentifiers[identifier];
  }

  addPlugin(PluginClass) {
    if (!this.initialized) {
      return;
    }

    if (this.hasPlugin(PluginClass.identifier)) {
      return;
    }

    this.pluginIdentifiers[PluginClass.identifier] = true;
    const plugin = new PluginClass(this.window, {
      // expose internal objects for those who know what they're doing
      // (note that these are private APIs and subject to change at any time!)
      _livereload: this,
      _reloader: this.reloader,
      _connector: this.connector,
      // official API
      console: this.console,
      Timer,
      generateCacheBustUrl: url => this.reloader.generateCacheBustUrl(url)
    }); // API that PluginClass can/must provide:
    //
    // string PluginClass.identifier
    //   -- required, globally-unique name of this plugin
    //
    // string PluginClass.version
    //   -- required, plugin version number (format %d.%d or %d.%d.%d)
    //
    // plugin = new PluginClass(window, officialLiveReloadAPI)
    //   -- required, plugin constructor
    //
    // bool plugin.reload(string path, { bool liveCSS, bool liveImg })
    //   -- optional, attemp to reload the given path, return true if handled
    //
    // object plugin.analyze()
    //   -- optional, returns plugin-specific information about the current document (to send to the connected server)
    //      (LiveReload 2 server currently only defines 'disable' key in this object; return {disable:true} to disable server-side
    //       compilation of a matching plugin's files)

    this.plugins.push(plugin);
    this.reloader.addPlugin(plugin);
  }

  analyze() {
    if (!this.initialized) {
      return;
    }

    if (!(this.connector.protocol >= 7)) {
      return;
    }

    const pluginsData = {};

    for (let plugin of this.plugins) {
      var pluginData = (typeof plugin.analyze === 'function' ? plugin.analyze() : undefined) || {};
      pluginsData[plugin.constructor.identifier] = pluginData;
      pluginData.version = plugin.constructor.version;
    }

    this.connector.sendCommand({
      command: 'info',
      plugins: pluginsData,
      url: this.window.location.href
    });
  }

}

;
exports.LiveReload = LiveReload;

},{"./connector":76,"./options":80,"./protocol":81,"./reloader":82,"./timer":84,"core-js/modules/es6.regexp.match":70,"core-js/modules/web.dom.iterable":75}],80:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.match");

class Options {
  constructor() {
    this.https = false;
    this.host = null;
    this.port = 35729;
    this.snipver = null;
    this.ext = null;
    this.extver = null;
    this.mindelay = 1000;
    this.maxdelay = 60000;
    this.handshake_timeout = 5000;
  }

  set(name, value) {
    if (typeof value === 'undefined') {
      return;
    }

    if (!isNaN(+value)) {
      value = +value;
    }

    this[name] = value;
  }

}

Options.extract = function (document) {
  for (let element of Array.from(document.getElementsByTagName('script'))) {
    var m, src;

    if ((src = element.src) && (m = src.match(new RegExp(`^[^:]+://(.*)/z?livereload\\.js(?:\\?(.*))?$`)))) {
      var mm;
      const options = new Options();
      options.https = src.indexOf('https') === 0;

      if (mm = m[1].match(new RegExp(`^([^/:]+)(?::(\\d+))?(\\/+.*)?$`))) {
        options.host = mm[1];

        if (mm[2]) {
          options.port = parseInt(mm[2], 10);
        }
      }

      if (m[2]) {
        for (let pair of Array.from(m[2].split('&'))) {
          var keyAndValue;

          if ((keyAndValue = pair.split('=')).length > 1) {
            options.set(keyAndValue[0].replace(/-/g, '_'), keyAndValue.slice(1).join('='));
          }
        }
      }

      return options;
    }
  }

  return null;
};

exports.Options = Options;

},{"core-js/modules/es6.regexp.constructor":68,"core-js/modules/es6.regexp.match":70,"core-js/modules/es6.regexp.replace":71,"core-js/modules/es6.regexp.split":72}],81:[function(require,module,exports){
"use strict";

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.match");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

let PROTOCOL_6, PROTOCOL_7;
exports.PROTOCOL_6 = PROTOCOL_6 = 'http://livereload.com/protocols/official-6';
exports.PROTOCOL_7 = PROTOCOL_7 = 'http://livereload.com/protocols/official-7';

class ProtocolError {
  constructor(reason, data) {
    this.message = `LiveReload protocol error (${reason}) after receiving data: "${data}".`;
  }

}

;

class Parser {
  constructor(handlers) {
    this.handlers = handlers;
    this.reset();
  }

  reset() {
    this.protocol = null;
  }

  process(data) {
    try {
      let message;

      if (!this.protocol) {
        if (data.match(new RegExp(`^!!ver:([\\d.]+)$`))) {
          this.protocol = 6;
        } else if (message = this._parseMessage(data, ['hello'])) {
          if (!message.protocols.length) {
            throw new ProtocolError('no protocols specified in handshake message');
          } else if (Array.from(message.protocols).includes(PROTOCOL_7)) {
            this.protocol = 7;
          } else if (Array.from(message.protocols).includes(PROTOCOL_6)) {
            this.protocol = 6;
          } else {
            throw new ProtocolError('no supported protocols found');
          }
        }

        return this.handlers.connected(this.protocol);
      } else if (this.protocol === 6) {
        message = JSON.parse(data);

        if (!message.length) {
          throw new ProtocolError('protocol 6 messages must be arrays');
        }

        const _Array$from = Array.from(message),
              _Array$from2 = _slicedToArray(_Array$from, 2),
              command = _Array$from2[0],
              options = _Array$from2[1];

        if (command !== 'refresh') {
          throw new ProtocolError('unknown protocol 6 command');
        }

        return this.handlers.message({
          command: 'reload',
          path: options.path,
          liveCSS: options.apply_css_live != null ? options.apply_css_live : true
        });
      } else {
        message = this._parseMessage(data, ['reload', 'alert']);
        return this.handlers.message(message);
      }
    } catch (e) {
      if (e instanceof ProtocolError) {
        return this.handlers.error(e);
      } else {
        throw e;
      }
    }
  }

  _parseMessage(data, validCommands) {
    let message;

    try {
      message = JSON.parse(data);
    } catch (e) {
      throw new ProtocolError('unparsable JSON', data);
    }

    if (!message.command) {
      throw new ProtocolError('missing "command" key', data);
    }

    if (!validCommands.includes(message.command)) {
      throw new ProtocolError(`invalid command '${message.command}', only valid commands are: ${validCommands.join(', ')})`, data);
    }

    return message;
  }

}

;
exports.ProtocolError = ProtocolError;
exports.Parser = Parser;

},{"core-js/modules/es6.regexp.constructor":68,"core-js/modules/es6.regexp.match":70,"core-js/modules/es6.symbol":73,"core-js/modules/es7.symbol.async-iterator":74,"core-js/modules/web.dom.iterable":75}],82:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.replace");

/* global CSSRule */
const splitUrl = function splitUrl(url) {
  let hash, index, params;

  if ((index = url.indexOf('#')) >= 0) {
    hash = url.slice(index);
    url = url.slice(0, index);
  } else {
    hash = '';
  } // http://your.domain.com/path/to/combo/??file1.css,file2,css


  const comboSign = url.indexOf('??');

  if (comboSign >= 0) {
    if (comboSign + 1 !== url.lastIndexOf('?')) {
      index = url.lastIndexOf('?');
    }
  } else {
    index = url.indexOf('?');
  }

  if (index >= 0) {
    params = url.slice(index);
    url = url.slice(0, index);
  } else {
    params = '';
  }

  return {
    url,
    params,
    hash
  };
};

const pathFromUrl = function pathFromUrl(url) {
  let path;

  var _splitUrl = splitUrl(url);

  url = _splitUrl.url;

  if (url.indexOf('file://') === 0) {
    path = url.replace(new RegExp(`^file://(localhost)?`), '');
  } else {
    //                        http  :   // hostname  :8080  /
    path = url.replace(new RegExp(`^([^:]+:)?//([^:/]+)(:\\d*)?/`), '/');
  } // decodeURI has special handling of stuff like semicolons, so use decodeURIComponent


  return decodeURIComponent(path);
};

const pickBestMatch = function pickBestMatch(path, objects, pathFunc) {
  let score;
  let bestMatch = {
    score: 0
  };

  for (let object of objects) {
    score = numberOfMatchingSegments(path, pathFunc(object));

    if (score > bestMatch.score) {
      bestMatch = {
        object,
        score
      };
    }
  }

  if (bestMatch.score === 0) {
    return null;
  }

  return bestMatch;
};

var numberOfMatchingSegments = function numberOfMatchingSegments(path1, path2) {
  // get rid of leading slashes and normalize to lower case
  path1 = path1.replace(/^\/+/, '').toLowerCase();
  path2 = path2.replace(/^\/+/, '').toLowerCase();

  if (path1 === path2) {
    return 10000;
  }

  const comps1 = path1.split('/').reverse();
  const comps2 = path2.split('/').reverse();
  const len = Math.min(comps1.length, comps2.length);
  let eqCount = 0;

  while (eqCount < len && comps1[eqCount] === comps2[eqCount]) {
    ++eqCount;
  }

  return eqCount;
};

const pathsMatch = (path1, path2) => numberOfMatchingSegments(path1, path2) > 0;

const IMAGE_STYLES = [{
  selector: 'background',
  styleNames: ['backgroundImage']
}, {
  selector: 'border',
  styleNames: ['borderImage', 'webkitBorderImage', 'MozBorderImage']
}];

class Reloader {
  constructor(window, console, Timer) {
    this.window = window;
    this.console = console;
    this.Timer = Timer;
    this.document = this.window.document;
    this.importCacheWaitPeriod = 200;
    this.plugins = [];
  }

  addPlugin(plugin) {
    return this.plugins.push(plugin);
  }

  analyze(callback) {}

  reload(path, options) {
    this.options = options; // avoid passing it through all the funcs

    if (!this.options.stylesheetReloadTimeout) {
      this.options.stylesheetReloadTimeout = 15000;
    }

    for (let plugin of Array.from(this.plugins)) {
      if (plugin.reload && plugin.reload(path, options)) {
        return;
      }
    }

    if (options.liveCSS && path.match(/\.css(?:\.map)?$/i)) {
      if (this.reloadStylesheet(path)) {
        return;
      }
    }

    if (options.liveImg && path.match(/\.(jpe?g|png|gif)$/i)) {
      this.reloadImages(path);
      return;
    }

    if (options.isChromeExtension) {
      this.reloadChromeExtension();
      return;
    }

    return this.reloadPage();
  }

  reloadPage() {
    return this.window.document.location.reload();
  }

  reloadChromeExtension() {
    return this.window.chrome.runtime.reload();
  }

  reloadImages(path) {
    let img;
    const expando = this.generateUniqueString();

    for (img of Array.from(this.document.images)) {
      if (pathsMatch(path, pathFromUrl(img.src))) {
        img.src = this.generateCacheBustUrl(img.src, expando);
      }
    }

    if (this.document.querySelectorAll) {
      for (let _ref of IMAGE_STYLES) {
        let selector = _ref.selector;
        let styleNames = _ref.styleNames;

        for (img of Array.from(this.document.querySelectorAll(`[style*=${selector}]`))) {
          this.reloadStyleImages(img.style, styleNames, path, expando);
        }
      }
    }

    if (this.document.styleSheets) {
      return Array.from(this.document.styleSheets).map(styleSheet => this.reloadStylesheetImages(styleSheet, path, expando));
    }
  }

  reloadStylesheetImages(styleSheet, path, expando) {
    let rules;

    try {
      rules = (styleSheet || {}).cssRules;
    } catch (e) {}

    if (!rules) {
      return;
    }

    for (let rule of Array.from(rules)) {
      switch (rule.type) {
        case CSSRule.IMPORT_RULE:
          this.reloadStylesheetImages(rule.styleSheet, path, expando);
          break;

        case CSSRule.STYLE_RULE:
          for (let _ref2 of IMAGE_STYLES) {
            let styleNames = _ref2.styleNames;
            this.reloadStyleImages(rule.style, styleNames, path, expando);
          }

          break;

        case CSSRule.MEDIA_RULE:
          this.reloadStylesheetImages(rule, path, expando);
          break;
      }
    }
  }

  reloadStyleImages(style, styleNames, path, expando) {
    for (let styleName of styleNames) {
      const value = style[styleName];

      if (typeof value === 'string') {
        const newValue = value.replace(new RegExp(`\\burl\\s*\\(([^)]*)\\)`), (match, src) => {
          if (pathsMatch(path, pathFromUrl(src))) {
            return `url(${this.generateCacheBustUrl(src, expando)})`;
          } else {
            return match;
          }
        });

        if (newValue !== value) {
          style[styleName] = newValue;
        }
      }
    }
  }

  reloadStylesheet(path) {
    // has to be a real array, because DOMNodeList will be modified
    let style;
    let link;

    const links = (() => {
      const result = [];

      for (link of Array.from(this.document.getElementsByTagName('link'))) {
        if (link.rel.match(/^stylesheet$/i) && !link.__LiveReload_pendingRemoval) {
          result.push(link);
        }
      }

      return result;
    })(); // find all imported stylesheets


    const imported = [];

    for (style of Array.from(this.document.getElementsByTagName('style'))) {
      if (style.sheet) {
        this.collectImportedStylesheets(style, style.sheet, imported);
      }
    }

    for (link of Array.from(links)) {
      this.collectImportedStylesheets(link, link.sheet, imported);
    } // handle prefixfree


    if (this.window.StyleFix && this.document.querySelectorAll) {
      for (style of Array.from(this.document.querySelectorAll('style[data-href]'))) {
        links.push(style);
      }
    }

    this.console.log(`LiveReload found ${links.length} LINKed stylesheets, ${imported.length} @imported stylesheets`);
    const match = pickBestMatch(path, links.concat(imported), l => pathFromUrl(this.linkHref(l)));

    if (match) {
      if (match.object.rule) {
        this.console.log(`LiveReload is reloading imported stylesheet: ${match.object.href}`);
        this.reattachImportedRule(match.object);
      } else {
        this.console.log(`LiveReload is reloading stylesheet: ${this.linkHref(match.object)}`);
        this.reattachStylesheetLink(match.object);
      }
    } else {
      if (this.options.reloadMissingCSS) {
        this.console.log(`LiveReload will reload all stylesheets because path '${path}' did not match any specific one. \
To disable this behavior, set 'options.reloadMissingCSS' to 'false'.`);

        for (link of Array.from(links)) {
          this.reattachStylesheetLink(link);
        }
      } else {
        this.console.log(`LiveReload will not reload path '${path}' because the stylesheet was not found on the page \
and 'options.reloadMissingCSS' was set to 'false'.`);
      }
    }

    return true;
  }

  collectImportedStylesheets(link, styleSheet, result) {
    // in WebKit, styleSheet.cssRules is null for inaccessible stylesheets;
    // Firefox/Opera may throw exceptions
    let rules;

    try {
      rules = (styleSheet || {}).cssRules;
    } catch (e) {}

    if (rules && rules.length) {
      for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];

        switch (rule.type) {
          case CSSRule.CHARSET_RULE:
            continue;
          // do nothing

          case CSSRule.IMPORT_RULE:
            result.push({
              link,
              rule,
              index,
              href: rule.href
            });
            this.collectImportedStylesheets(link, rule.styleSheet, result);
            break;

          default:
            break;
          // import rules can only be preceded by charset rules
        }
      }
    }
  }

  waitUntilCssLoads(clone, func) {
    let callbackExecuted = false;

    const executeCallback = () => {
      if (callbackExecuted) {
        return;
      }

      callbackExecuted = true;
      return func();
    }; // supported by Chrome 19+, Safari 5.2+, Firefox 9+, Opera 9+, IE6+
    // http://www.zachleat.com/web/load-css-dynamically/
    // http://pieisgood.org/test/script-link-events/


    clone.onload = () => {
      this.console.log('LiveReload: the new stylesheet has finished loading');
      this.knownToSupportCssOnLoad = true;
      return executeCallback();
    };

    if (!this.knownToSupportCssOnLoad) {
      // polling
      let poll;
      (poll = () => {
        if (clone.sheet) {
          this.console.log('LiveReload is polling until the new CSS finishes loading...');
          return executeCallback();
        } else {
          return this.Timer.start(50, poll);
        }
      })();
    } // fail safe


    return this.Timer.start(this.options.stylesheetReloadTimeout, executeCallback);
  }

  linkHref(link) {
    // prefixfree uses data-href when it turns LINK into STYLE
    return link.href || link.getAttribute('data-href');
  }

  reattachStylesheetLink(link) {
    // ignore LINKs that will be removed by LR soon
    let clone;

    if (link.__LiveReload_pendingRemoval) {
      return;
    }

    link.__LiveReload_pendingRemoval = true;

    if (link.tagName === 'STYLE') {
      // prefixfree
      clone = this.document.createElement('link');
      clone.rel = 'stylesheet';
      clone.media = link.media;
      clone.disabled = link.disabled;
    } else {
      clone = link.cloneNode(false);
    }

    clone.href = this.generateCacheBustUrl(this.linkHref(link)); // insert the new LINK before the old one

    const parent = link.parentNode;

    if (parent.lastChild === link) {
      parent.appendChild(clone);
    } else {
      parent.insertBefore(clone, link.nextSibling);
    }

    return this.waitUntilCssLoads(clone, () => {
      let additionalWaitingTime;

      if (/AppleWebKit/.test(navigator.userAgent)) {
        additionalWaitingTime = 5;
      } else {
        additionalWaitingTime = 200;
      }

      return this.Timer.start(additionalWaitingTime, () => {
        if (!link.parentNode) {
          return;
        }

        link.parentNode.removeChild(link);
        clone.onreadystatechange = null;
        return this.window.StyleFix ? this.window.StyleFix.link(clone) : undefined;
      });
    }); // prefixfree
  }

  reattachImportedRule(_ref3) {
    let rule = _ref3.rule,
        index = _ref3.index,
        link = _ref3.link;
    const parent = rule.parentStyleSheet;
    const href = this.generateCacheBustUrl(rule.href);
    const media = rule.media.length ? [].join.call(rule.media, ', ') : '';
    const newRule = `@import url("${href}") ${media};`; // used to detect if reattachImportedRule has been called again on the same rule

    rule.__LiveReload_newHref = href; // WORKAROUND FOR WEBKIT BUG: WebKit resets all styles if we add @import'ed
    // stylesheet that hasn't been cached yet. Workaround is to pre-cache the
    // stylesheet by temporarily adding it as a LINK tag.

    const tempLink = this.document.createElement('link');
    tempLink.rel = 'stylesheet';
    tempLink.href = href;
    tempLink.__LiveReload_pendingRemoval = true; // exclude from path matching

    if (link.parentNode) {
      link.parentNode.insertBefore(tempLink, link);
    } // wait for it to load


    return this.Timer.start(this.importCacheWaitPeriod, () => {
      if (tempLink.parentNode) {
        tempLink.parentNode.removeChild(tempLink);
      } // if another reattachImportedRule call is in progress, abandon this one


      if (rule.__LiveReload_newHref !== href) {
        return;
      }

      parent.insertRule(newRule, index);
      parent.deleteRule(index + 1); // save the new rule, so that we can detect another reattachImportedRule call

      rule = parent.cssRules[index];
      rule.__LiveReload_newHref = href; // repeat again for good measure

      return this.Timer.start(this.importCacheWaitPeriod, () => {
        // if another reattachImportedRule call is in progress, abandon this one
        if (rule.__LiveReload_newHref !== href) {
          return;
        }

        parent.insertRule(newRule, index);
        return parent.deleteRule(index + 1);
      });
    });
  }

  generateUniqueString() {
    return `livereload=${Date.now()}`;
  }

  generateCacheBustUrl(url, expando) {
    let hash, oldParams;

    if (!expando) {
      expando = this.generateUniqueString();
    }

    var _splitUrl2 = splitUrl(url);

    url = _splitUrl2.url;
    hash = _splitUrl2.hash;
    oldParams = _splitUrl2.params;

    if (this.options.overrideURL) {
      if (url.indexOf(this.options.serverURL) < 0) {
        const originalUrl = url;
        url = this.options.serverURL + this.options.overrideURL + '?url=' + encodeURIComponent(url);
        this.console.log(`LiveReload is overriding source URL ${originalUrl} with ${url}`);
      }
    }

    let params = oldParams.replace(/(\?|&)livereload=(\d+)/, (match, sep) => `${sep}${expando}`);

    if (params === oldParams) {
      if (oldParams.length === 0) {
        params = `?${expando}`;
      } else {
        params = `${oldParams}&${expando}`;
      }
    }

    return url + params + hash;
  }

}

;
exports.Reloader = Reloader;

},{"core-js/modules/es6.regexp.constructor":68,"core-js/modules/es6.regexp.match":70,"core-js/modules/es6.regexp.replace":71,"core-js/modules/es6.regexp.split":72}],83:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.match");

const CustomEvents = require('./customevents');

const LiveReload = window.LiveReload = new (require('./livereload').LiveReload)(window);

for (let k in window) {
  if (k.match(/^LiveReloadPlugin/)) {
    LiveReload.addPlugin(window[k]);
  }
}

LiveReload.addPlugin(require('./less'));
LiveReload.on('shutdown', () => delete window.LiveReload);
LiveReload.on('connect', () => CustomEvents.fire(document, 'LiveReloadConnect'));
LiveReload.on('disconnect', () => CustomEvents.fire(document, 'LiveReloadDisconnect'));
CustomEvents.bind(document, 'LiveReloadShutDown', () => LiveReload.shutDown());

},{"./customevents":77,"./less":78,"./livereload":79,"core-js/modules/es6.regexp.match":70}],84:[function(require,module,exports){
"use strict";

class Timer {
  constructor(func) {
    this.func = func;
    this.running = false;
    this.id = null;

    this._handler = () => {
      this.running = false;
      this.id = null;
      return this.func();
    };
  }

  start(timeout) {
    if (this.running) {
      clearTimeout(this.id);
    }

    this.id = setTimeout(this._handler, timeout);
    this.running = true;
  }

  stop() {
    if (this.running) {
      clearTimeout(this.id);
      this.running = false;
      this.id = null;
    }
  }

}

;

Timer.start = (timeout, func) => setTimeout(func, timeout);

exports.Timer = Timer;

},{}]},{},[83]);
