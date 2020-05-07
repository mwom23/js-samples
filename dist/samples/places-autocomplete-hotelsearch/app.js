(function(exports) {
  "use strict";

  var fails = function(exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty

  var descriptors = !fails(function() {
    return (
      Object.defineProperty({}, 1, {
        get: function() {
          return 7;
        }
      })[1] != 7
    );
  });

  var commonjsGlobal =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
      ? global
      : typeof self !== "undefined"
      ? self
      : {};

  function createCommonjsModule(fn, module) {
    return (
      (module = { exports: {} }), fn(module, module.exports), module.exports
    );
  }

  var check = function(it) {
    return it && it.Math == Math && it;
  }; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028

  var global_1 = // eslint-disable-next-line no-undef
    check(typeof globalThis == "object" && globalThis) ||
    check(typeof window == "object" && window) ||
    check(typeof self == "object" && self) ||
    check(typeof commonjsGlobal == "object" && commonjsGlobal) || // eslint-disable-next-line no-new-func
    Function("return this")();

  var isObject = function(it) {
    return typeof it === "object" ? it !== null : typeof it === "function";
  };

  var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

  var EXISTS = isObject(document$1) && isObject(document$1.createElement);

  var documentCreateElement = function(it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  // Thank's IE8 for his funny defineProperty

  var ie8DomDefine =
    !descriptors &&
    !fails(function() {
      return (
        Object.defineProperty(documentCreateElement("div"), "a", {
          get: function() {
            return 7;
          }
        }).a != 7
      );
    });

  var anObject = function(it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + " is not an object");
    }

    return it;
  };

  // `ToPrimitive` abstract operation
  // https://tc39.github.io/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string

  var toPrimitive = function(input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (
      PREFERRED_STRING &&
      typeof (fn = input.toString) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    if (
      typeof (fn = input.valueOf) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    if (
      !PREFERRED_STRING &&
      typeof (fn = input.toString) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty

  var f = descriptors
    ? nativeDefineProperty
    : function defineProperty(O, P, Attributes) {
        anObject(O);
        P = toPrimitive(P, true);
        anObject(Attributes);
        if (ie8DomDefine)
          try {
            return nativeDefineProperty(O, P, Attributes);
          } catch (error) {
            /* empty */
          }
        if ("get" in Attributes || "set" in Attributes)
          throw TypeError("Accessors not supported");
        if ("value" in Attributes) O[P] = Attributes.value;
        return O;
      };

  var objectDefineProperty = {
    f: f
  };

  var defineProperty = objectDefineProperty.f;

  var FunctionPrototype = Function.prototype;
  var FunctionPrototypeToString = FunctionPrototype.toString;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = "name"; // Function instances `.name` property
  // https://tc39.github.io/ecma262/#sec-function-instances-name

  if (descriptors && !(NAME in FunctionPrototype)) {
    defineProperty(FunctionPrototype, NAME, {
      configurable: true,
      get: function() {
        try {
          return FunctionPrototypeToString.call(this).match(nameRE)[1];
        } catch (error) {
          return "";
        }
      }
    });
  }

  var replacement = /#|\.prototype\./;

  var isForced = function(feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL
      ? true
      : value == NATIVE
      ? false
      : typeof detection == "function"
      ? fails(detection)
      : !!detection;
  };

  var normalize = (isForced.normalize = function(string) {
    return String(string)
      .replace(replacement, ".")
      .toLowerCase();
  });

  var data = (isForced.data = {});
  var NATIVE = (isForced.NATIVE = "N");
  var POLYFILL = (isForced.POLYFILL = "P");
  var isForced_1 = isForced;

  var aPossiblePrototype = function(it) {
    if (!isObject(it) && it !== null) {
      throw TypeError("Can't set " + String(it) + " as a prototype");
    }

    return it;
  };

  // `Object.setPrototypeOf` method
  // https://tc39.github.io/ecma262/#sec-object.setprototypeof
  // Works with __proto__ only. Old v8 can't work with null proto objects.

  /* eslint-disable no-proto */

  var objectSetPrototypeOf =
    Object.setPrototypeOf ||
    ("__proto__" in {}
      ? (function() {
          var CORRECT_SETTER = false;
          var test = {};
          var setter;

          try {
            setter = Object.getOwnPropertyDescriptor(
              Object.prototype,
              "__proto__"
            ).set;
            setter.call(test, []);
            CORRECT_SETTER = test instanceof Array;
          } catch (error) {
            /* empty */
          }

          return function setPrototypeOf(O, proto) {
            anObject(O);
            aPossiblePrototype(proto);
            if (CORRECT_SETTER) setter.call(O, proto);
            else O.__proto__ = proto;
            return O;
          };
        })()
      : undefined);

  // makes subclassing work correct for wrapped built-ins

  var inheritIfRequired = function($this, dummy, Wrapper) {
    var NewTarget, NewTargetPrototype;
    if (
      // it can work only with native `setPrototypeOf`
      objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
      typeof (NewTarget = dummy.constructor) == "function" &&
      NewTarget !== Wrapper &&
      isObject((NewTargetPrototype = NewTarget.prototype)) &&
      NewTargetPrototype !== Wrapper.prototype
    )
      objectSetPrototypeOf($this, NewTargetPrototype);
    return $this;
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function(it, key) {
    return hasOwnProperty.call(it, key);
  };

  var toString = {}.toString;

  var classofRaw = function(it) {
    return toString.call(it).slice(8, -1);
  };

  var split = "".split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

  var indexedObject = fails(function() {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object("z").propertyIsEnumerable(0);
  })
    ? function(it) {
        return classofRaw(it) == "String" ? split.call(it, "") : Object(it);
      }
    : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function(it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  // toObject with fallback for non-array-like ES3 strings

  var toIndexedObject = function(it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var ceil = Math.ceil;
  var floor = Math.floor; // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger

  var toInteger = function(argument) {
    return isNaN((argument = +argument))
      ? 0
      : (argument > 0 ? floor : ceil)(argument);
  };

  var min = Math.min; // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength

  var toLength = function(argument) {
    return argument > 0 ? min(toInteger(argument), 0x1fffffffffffff) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min; // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

  var toAbsoluteIndex = function(index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  // `Array.prototype.{ indexOf, includes }` methods implementation

  var createMethod = function(IS_INCLUDES) {
    return function($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el)
        while (length > index) {
          value = O[index++]; // eslint-disable-next-line no-self-compare

          if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
        }
      else
        for (; length > index; index++) {
          if ((IS_INCLUDES || index in O) && O[index] === el)
            return IS_INCLUDES || index || 0;
        }
      return !IS_INCLUDES && -1;
    };
  };

  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    includes: createMethod(true),
    // `Array.prototype.indexOf` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod(false)
  };

  var hiddenKeys = {};

  var indexOf = arrayIncludes.indexOf;

  var objectKeysInternal = function(object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys

    while (names.length > i)
      if (has(O, (key = names[i++]))) {
        ~indexOf(result, key) || result.push(key);
      }

    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = [
    "constructor",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
    "toString",
    "valueOf"
  ];

  var hiddenKeys$1 = enumBugKeys.concat("length", "prototype"); // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames

  var f$1 =
    Object.getOwnPropertyNames ||
    function getOwnPropertyNames(O) {
      return objectKeysInternal(O, hiddenKeys$1);
    };

  var objectGetOwnPropertyNames = {
    f: f$1
  };

  var createPropertyDescriptor = function(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var createNonEnumerableProperty = descriptors
    ? function(object, key, value) {
        return objectDefineProperty.f(
          object,
          key,
          createPropertyDescriptor(1, value)
        );
      }
    : function(object, key, value) {
        object[key] = value;
        return object;
      };

  var setGlobal = function(key, value) {
    try {
      createNonEnumerableProperty(global_1, key, value);
    } catch (error) {
      global_1[key] = value;
    }

    return value;
  };

  var SHARED = "__core-js_shared__";
  var store = global_1[SHARED] || setGlobal(SHARED, {});
  var sharedStore = store;

  var shared = createCommonjsModule(function(module) {
    (module.exports = function(key, value) {
      return (
        sharedStore[key] ||
        (sharedStore[key] = value !== undefined ? value : {})
      );
    })("versions", []).push({
      version: "3.6.5",
      mode: "global",
      copyright: "© 2020 Denis Pushkarev (zloirock.ru)"
    });
  });

  var id = 0;
  var postfix = Math.random();

  var uid = function(key) {
    return (
      "Symbol(" +
      String(key === undefined ? "" : key) +
      ")_" +
      (++id + postfix).toString(36)
    );
  };

  var nativeSymbol =
    !!Object.getOwnPropertySymbols &&
    !fails(function() {
      // Chrome 38 Symbol has incorrect toString conversion
      // eslint-disable-next-line no-undef
      return !String(Symbol());
    });

  var useSymbolAsUid =
    nativeSymbol && // eslint-disable-next-line no-undef
    !Symbol.sham && // eslint-disable-next-line no-undef
    typeof Symbol.iterator == "symbol";

  var WellKnownSymbolsStore = shared("wks");
  var Symbol$1 = global_1.Symbol;
  var createWellKnownSymbol = useSymbolAsUid
    ? Symbol$1
    : (Symbol$1 && Symbol$1.withoutSetter) || uid;

  var wellKnownSymbol = function(name) {
    if (!has(WellKnownSymbolsStore, name)) {
      if (nativeSymbol && has(Symbol$1, name))
        WellKnownSymbolsStore[name] = Symbol$1[name];
      else
        WellKnownSymbolsStore[name] = createWellKnownSymbol("Symbol." + name);
    }

    return WellKnownSymbolsStore[name];
  };

  var MATCH = wellKnownSymbol("match"); // `IsRegExp` abstract operation
  // https://tc39.github.io/ecma262/#sec-isregexp

  var isRegexp = function(it) {
    var isRegExp;
    return (
      isObject(it) &&
      ((isRegExp = it[MATCH]) !== undefined
        ? !!isRegExp
        : classofRaw(it) == "RegExp")
    );
  };

  // `RegExp.prototype.flags` getter implementation
  // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags

  var regexpFlags = function() {
    var that = anObject(this);
    var result = "";
    if (that.global) result += "g";
    if (that.ignoreCase) result += "i";
    if (that.multiline) result += "m";
    if (that.dotAll) result += "s";
    if (that.unicode) result += "u";
    if (that.sticky) result += "y";
    return result;
  };

  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
  // so we use an intermediate function.

  function RE(s, f) {
    return RegExp(s, f);
  }

  var UNSUPPORTED_Y = fails(function() {
    // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
    var re = RE("a", "y");
    re.lastIndex = 2;
    return re.exec("abcd") != null;
  });
  var BROKEN_CARET = fails(function() {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
    var re = RE("^r", "gy");
    re.lastIndex = 2;
    return re.exec("str") != null;
  });

  var regexpStickyHelpers = {
    UNSUPPORTED_Y: UNSUPPORTED_Y,
    BROKEN_CARET: BROKEN_CARET
  };

  var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

  if (typeof sharedStore.inspectSource != "function") {
    sharedStore.inspectSource = function(it) {
      return functionToString.call(it);
    };
  }

  var inspectSource = sharedStore.inspectSource;

  var WeakMap = global_1.WeakMap;
  var nativeWeakMap =
    typeof WeakMap === "function" && /native code/.test(inspectSource(WeakMap));

  var keys = shared("keys");

  var sharedKey = function(key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var WeakMap$1 = global_1.WeakMap;
  var set, get, has$1;

  var enforce = function(it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function(TYPE) {
    return function(it) {
      var state;

      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError("Incompatible receiver, " + TYPE + " required");
      }

      return state;
    };
  };

  if (nativeWeakMap) {
    var store$1 = new WeakMap$1();
    var wmget = store$1.get;
    var wmhas = store$1.has;
    var wmset = store$1.set;

    set = function(it, metadata) {
      wmset.call(store$1, it, metadata);
      return metadata;
    };

    get = function(it) {
      return wmget.call(store$1, it) || {};
    };

    has$1 = function(it) {
      return wmhas.call(store$1, it);
    };
  } else {
    var STATE = sharedKey("state");
    hiddenKeys[STATE] = true;

    set = function(it, metadata) {
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };

    get = function(it) {
      return has(it, STATE) ? it[STATE] : {};
    };

    has$1 = function(it) {
      return has(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var redefine = createCommonjsModule(function(module) {
    var getInternalState = internalState.get;
    var enforceInternalState = internalState.enforce;
    var TEMPLATE = String(String).split("String");
    (module.exports = function(O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;

      if (typeof value == "function") {
        if (typeof key == "string" && !has(value, "name"))
          createNonEnumerableProperty(value, "name", key);
        enforceInternalState(value).source = TEMPLATE.join(
          typeof key == "string" ? key : ""
        );
      }

      if (O === global_1) {
        if (simple) O[key] = value;
        else setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }

      if (simple) O[key] = value;
      else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, "toString", function toString() {
      return (
        (typeof this == "function" && getInternalState(this).source) ||
        inspectSource(this)
      );
    });
  });

  var path = global_1;

  var aFunction = function(variable) {
    return typeof variable == "function" ? variable : undefined;
  };

  var getBuiltIn = function(namespace, method) {
    return arguments.length < 2
      ? aFunction(path[namespace]) || aFunction(global_1[namespace])
      : (path[namespace] && path[namespace][method]) ||
          (global_1[namespace] && global_1[namespace][method]);
  };

  var SPECIES = wellKnownSymbol("species");

  var setSpecies = function(CONSTRUCTOR_NAME) {
    var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
    var defineProperty = objectDefineProperty.f;

    if (descriptors && Constructor && !Constructor[SPECIES]) {
      defineProperty(Constructor, SPECIES, {
        configurable: true,
        get: function() {
          return this;
        }
      });
    }
  };

  var defineProperty$1 = objectDefineProperty.f;

  var getOwnPropertyNames = objectGetOwnPropertyNames.f;

  var setInternalState = internalState.set;

  var MATCH$1 = wellKnownSymbol("match");
  var NativeRegExp = global_1.RegExp;
  var RegExpPrototype = NativeRegExp.prototype;
  var re1 = /a/g;
  var re2 = /a/g; // "new" should create a new object, old webkit bug

  var CORRECT_NEW = new NativeRegExp(re1) !== re1;
  var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y;
  var FORCED =
    descriptors &&
    isForced_1(
      "RegExp",
      !CORRECT_NEW ||
        UNSUPPORTED_Y$1 ||
        fails(function() {
          re2[MATCH$1] = false; // RegExp constructor can alter flags and IsRegExp works correct with @@match

          return (
            NativeRegExp(re1) != re1 ||
            NativeRegExp(re2) == re2 ||
            NativeRegExp(re1, "i") != "/a/i"
          );
        })
    ); // `RegExp` constructor
  // https://tc39.github.io/ecma262/#sec-regexp-constructor

  if (FORCED) {
    var RegExpWrapper = function RegExp(pattern, flags) {
      var thisIsRegExp = this instanceof RegExpWrapper;
      var patternIsRegExp = isRegexp(pattern);
      var flagsAreUndefined = flags === undefined;
      var sticky;

      if (
        !thisIsRegExp &&
        patternIsRegExp &&
        pattern.constructor === RegExpWrapper &&
        flagsAreUndefined
      ) {
        return pattern;
      }

      if (CORRECT_NEW) {
        if (patternIsRegExp && !flagsAreUndefined) pattern = pattern.source;
      } else if (pattern instanceof RegExpWrapper) {
        if (flagsAreUndefined) flags = regexpFlags.call(pattern);
        pattern = pattern.source;
      }

      if (UNSUPPORTED_Y$1) {
        sticky = !!flags && flags.indexOf("y") > -1;
        if (sticky) flags = flags.replace(/y/g, "");
      }

      var result = inheritIfRequired(
        CORRECT_NEW
          ? new NativeRegExp(pattern, flags)
          : NativeRegExp(pattern, flags),
        thisIsRegExp ? this : RegExpPrototype,
        RegExpWrapper
      );
      if (UNSUPPORTED_Y$1 && sticky)
        setInternalState(result, {
          sticky: sticky
        });
      return result;
    };

    var proxy = function(key) {
      key in RegExpWrapper ||
        defineProperty$1(RegExpWrapper, key, {
          configurable: true,
          get: function() {
            return NativeRegExp[key];
          },
          set: function(it) {
            NativeRegExp[key] = it;
          }
        });
    };

    var keys$1 = getOwnPropertyNames(NativeRegExp);
    var index = 0;

    while (keys$1.length > index) proxy(keys$1[index++]);

    RegExpPrototype.constructor = RegExpWrapper;
    RegExpWrapper.prototype = RegExpPrototype;
    redefine(global_1, "RegExp", RegExpWrapper);
  } // https://tc39.github.io/ecma262/#sec-get-regexp-@@species

  setSpecies("RegExp");

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

  var NASHORN_BUG =
    getOwnPropertyDescriptor &&
    !nativePropertyIsEnumerable.call(
      {
        1: 2
      },
      1
    ); // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

  var f$2 = NASHORN_BUG
    ? function propertyIsEnumerable(V) {
        var descriptor = getOwnPropertyDescriptor(this, V);
        return !!descriptor && descriptor.enumerable;
      }
    : nativePropertyIsEnumerable;

  var objectPropertyIsEnumerable = {
    f: f$2
  };

  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

  var f$3 = descriptors
    ? nativeGetOwnPropertyDescriptor
    : function getOwnPropertyDescriptor(O, P) {
        O = toIndexedObject(O);
        P = toPrimitive(P, true);
        if (ie8DomDefine)
          try {
            return nativeGetOwnPropertyDescriptor(O, P);
          } catch (error) {
            /* empty */
          }
        if (has(O, P))
          return createPropertyDescriptor(
            !objectPropertyIsEnumerable.f.call(O, P),
            O[P]
          );
      };

  var objectGetOwnPropertyDescriptor = {
    f: f$3
  };

  var f$4 = Object.getOwnPropertySymbols;

  var objectGetOwnPropertySymbols = {
    f: f$4
  };

  // all object keys, includes non-enumerable and symbols

  var ownKeys =
    getBuiltIn("Reflect", "ownKeys") ||
    function ownKeys(it) {
      var keys = objectGetOwnPropertyNames.f(anObject(it));
      var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
      return getOwnPropertySymbols
        ? keys.concat(getOwnPropertySymbols(it))
        : keys;
    };

  var copyConstructorProperties = function(target, source) {
    var keys = ownKeys(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key))
        defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;

  /*
    options.target      - name of the target object
    options.global      - target is the global object
    options.stat        - export as static methods of target
    options.proto       - export as prototype methods of target
    options.real        - real prototype method for the `pure` version
    options.forced      - export even if the native feature is available
    options.bind        - bind methods to the target, required for the `pure` version
    options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe      - use the simple assignment of property instead of delete + defineProperty
    options.sham        - add a flag to not completely full polyfills
    options.enumerable  - export as enumerable property
    options.noTargetGet - prevent calling a getter on target
  */

  var _export = function(options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;

    if (GLOBAL) {
      target = global_1;
    } else if (STATIC) {
      target = global_1[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global_1[TARGET] || {}).prototype;
    }

    if (target)
      for (key in source) {
        sourceProperty = source[key];

        if (options.noTargetGet) {
          descriptor = getOwnPropertyDescriptor$1(target, key);
          targetProperty = descriptor && descriptor.value;
        } else targetProperty = target[key];

        FORCED = isForced_1(
          GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key,
          options.forced
        ); // contained in target

        if (!FORCED && targetProperty !== undefined) {
          if (typeof sourceProperty === typeof targetProperty) continue;
          copyConstructorProperties(sourceProperty, targetProperty);
        } // add a flag to not completely full polyfills

        if (options.sham || (targetProperty && targetProperty.sham)) {
          createNonEnumerableProperty(sourceProperty, "sham", true);
        } // extend global

        redefine(target, key, sourceProperty, options);
      }
  };

  var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.

  var nativeReplace = String.prototype.replace;
  var patchedExec = nativeExec;

  var UPDATES_LAST_INDEX_WRONG = (function() {
    var re1 = /a/;
    var re2 = /b*/g;
    nativeExec.call(re1, "a");
    nativeExec.call(re2, "a");
    return re1.lastIndex !== 0 || re2.lastIndex !== 0;
  })();

  var UNSUPPORTED_Y$2 =
    regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET; // nonparticipating capturing group, copied from es5-shim's String#split patch.

  var NPCG_INCLUDED = /()??/.exec("")[1] !== undefined;
  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;
      var sticky = UNSUPPORTED_Y$2 && re.sticky;
      var flags = regexpFlags.call(re);
      var source = re.source;
      var charsAdded = 0;
      var strCopy = str;

      if (sticky) {
        flags = flags.replace("y", "");

        if (flags.indexOf("g") === -1) {
          flags += "g";
        }

        strCopy = String(str).slice(re.lastIndex); // Support anchored sticky behavior.

        if (
          re.lastIndex > 0 &&
          (!re.multiline || (re.multiline && str[re.lastIndex - 1] !== "\n"))
        ) {
          source = "(?: " + source + ")";
          strCopy = " " + strCopy;
          charsAdded++;
        } // ^(? + rx + ) is needed, in combination with some str slicing, to
        // simulate the 'y' flag.

        reCopy = new RegExp("^(?:" + source + ")", flags);
      }

      if (NPCG_INCLUDED) {
        reCopy = new RegExp("^" + source + "$(?!\\s)", flags);
      }

      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
      match = nativeExec.call(sticky ? reCopy : re, strCopy);

      if (sticky) {
        if (match) {
          match.input = match.input.slice(charsAdded);
          match[0] = match[0].slice(charsAdded);
          match.index = re.lastIndex;
          re.lastIndex += match[0].length;
        } else re.lastIndex = 0;
      } else if (UPDATES_LAST_INDEX_WRONG && match) {
        re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
      }

      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        nativeReplace.call(match[0], reCopy, function() {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var regexpExec = patchedExec;

  _export(
    {
      target: "RegExp",
      proto: true,
      forced: /./.exec !== regexpExec
    },
    {
      exec: regexpExec
    }
  );

  var TO_STRING = "toString";
  var RegExpPrototype$1 = RegExp.prototype;
  var nativeToString = RegExpPrototype$1[TO_STRING];
  var NOT_GENERIC = fails(function() {
    return (
      nativeToString.call({
        source: "a",
        flags: "b"
      }) != "/a/b"
    );
  }); // FF44- RegExp#toString has a wrong name

  var INCORRECT_NAME = nativeToString.name != TO_STRING; // `RegExp.prototype.toString` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring

  if (NOT_GENERIC || INCORRECT_NAME) {
    redefine(
      RegExp.prototype,
      TO_STRING,
      function toString() {
        var R = anObject(this);
        var p = String(R.source);
        var rf = R.flags;
        var f = String(
          rf === undefined &&
            R instanceof RegExp &&
            !("flags" in RegExpPrototype$1)
            ? regexpFlags.call(R)
            : rf
        );
        return "/" + p + "/" + f;
      },
      {
        unsafe: true
      }
    );
  }

  /*
   * Copyright 2019 Google LLC. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  // [START maps_places_autocomplete_hotelsearch]
  // This example uses the autocomplete feature of the Google Places API.
  // It allows the user to find all hotels in a given place, within a given
  // country. It then displays markers for all the hotels returned,
  // with on-click details for each hotel.
  // This example requires the Places library. Include the libraries=places
  // parameter when you first load the API. For example:
  // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
  var places, infoWindow;
  exports.markers = [];

  var countryRestrict = {
    country: "us"
  };
  var MARKER_PATH =
    "https://developers.google.com/maps/documentation/javascript/images/marker_green";
  var hostnameRegexp = new RegExp("^https?://.+?/");
  var countries = {
    au: {
      center: {
        lat: -25.3,
        lng: 133.8
      },
      zoom: 4
    },
    br: {
      center: {
        lat: -14.2,
        lng: -51.9
      },
      zoom: 3
    },
    ca: {
      center: {
        lat: 62,
        lng: -110.0
      },
      zoom: 3
    },
    fr: {
      center: {
        lat: 46.2,
        lng: 2.2
      },
      zoom: 5
    },
    de: {
      center: {
        lat: 51.2,
        lng: 10.4
      },
      zoom: 5
    },
    mx: {
      center: {
        lat: 23.6,
        lng: -102.5
      },
      zoom: 4
    },
    nz: {
      center: {
        lat: -40.9,
        lng: 174.9
      },
      zoom: 5
    },
    it: {
      center: {
        lat: 41.9,
        lng: 12.6
      },
      zoom: 5
    },
    za: {
      center: {
        lat: -30.6,
        lng: 22.9
      },
      zoom: 5
    },
    es: {
      center: {
        lat: 40.5,
        lng: -3.7
      },
      zoom: 5
    },
    pt: {
      center: {
        lat: 39.4,
        lng: -8.2
      },
      zoom: 6
    },
    us: {
      center: {
        lat: 37.1,
        lng: -95.7
      },
      zoom: 3
    },
    uk: {
      center: {
        lat: 54.8,
        lng: -4.6
      },
      zoom: 5
    }
  };

  function initMap() {
    exports.map = new google.maps.Map(document.getElementById("map"), {
      zoom: countries["us"].zoom,
      center: countries["us"].center,
      mapTypeControl: false,
      panControl: false,
      zoomControl: false,
      streetViewControl: false
    });
    infoWindow = new google.maps.InfoWindow({
      content: document.getElementById("info-content")
    }); // Create the autocomplete object and associate it with the UI input control.
    // Restrict the search to the default country, and to place type "cities".

    exports.autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */
      document.getElementById("autocomplete"),
      {
        types: ["(cities)"],
        componentRestrictions: countryRestrict
      }
    );
    places = new google.maps.places.PlacesService(exports.map);
    exports.autocomplete.addListener("place_changed", onPlaceChanged); // Add a DOM event listener to react when the user selects a country.

    document
      .getElementById("country")
      .addEventListener("change", setAutocompleteCountry);
  } // When the user selects a city, get the place details for the city and
  // zoom the map in on the city.

  function onPlaceChanged() {
    var place = exports.autocomplete.getPlace();

    if (place.geometry) {
      exports.map.panTo(place.geometry.location);
      exports.map.setZoom(15);
      search();
    } else {
      document.getElementById("autocomplete").placeholder = "Enter a city";
    }
  } // Search for hotels in the selected city, within the viewport of the map.

  function search() {
    var search = {
      bounds: exports.map.getBounds(),
      types: ["lodging"]
    };
    places.nearbySearch(search, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        clearResults();
        clearMarkers(); // Create a marker for each hotel found, and
        // assign a letter of the alphabetic to each marker icon.

        for (var i = 0; i < results.length; i++) {
          var markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
          var markerIcon = MARKER_PATH + markerLetter + ".png"; // Use marker animation to drop the icons incrementally on the map.

          exports.markers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon
          }); // If the user clicks a hotel marker, show the details of that hotel
          // in an info window.

          exports.markers[i].placeResult = results[i];
          google.maps.event.addListener(
            exports.markers[i],
            "click",
            showInfoWindow
          );
          setTimeout(dropMarker(i), i * 100);
          addResult(results[i], i);
        }
      }
    });
  }

  function clearMarkers() {
    for (var i = 0; i < exports.markers.length; i++) {
      if (exports.markers[i]) {
        exports.markers[i].setMap(null);
      }
    }

    exports.markers = [];
  } // [START maps_places_autocomplete_hotelsearch]
  // Set the country restriction based on user input.
  // Also center and zoom the map on the given country.

  function setAutocompleteCountry() {
    var country = document.getElementById("country").value;

    if (country == "all") {
      exports.autocomplete.setComponentRestrictions({
        country: []
      });
      exports.map.setCenter({
        lat: 15,
        lng: 0
      });
      exports.map.setZoom(2);
    } else {
      exports.autocomplete.setComponentRestrictions({
        country: country
      });
      exports.map.setCenter(countries[country].center);
      exports.map.setZoom(countries[country].zoom);
    }

    clearResults();
    clearMarkers();
  } // [END maps_places_autocomplete_hotelsearch]

  function dropMarker(i) {
    return function() {
      exports.markers[i].setMap(exports.map);
    };
  }

  function addResult(result, i) {
    var results = document.getElementById("results");
    var markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + ".png";
    var tr = document.createElement("tr");
    tr.style.backgroundColor = i % 2 === 0 ? "#F0F0F0" : "#FFFFFF";

    tr.onclick = function() {
      google.maps.event.trigger(exports.markers[i], "click");
    };

    var iconTd = document.createElement("td");
    var nameTd = document.createElement("td");
    var icon = document.createElement("img");
    icon.src = markerIcon;
    icon.setAttribute("class", "placeIcon");
    icon.setAttribute("className", "placeIcon");
    var name = document.createTextNode(result.name);
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    results.appendChild(tr);
  }

  function clearResults() {
    var results = document.getElementById("results");

    while (results.childNodes[0]) {
      results.removeChild(results.childNodes[0]);
    }
  } // Get the place details for a hotel. Show the information in an info window,
  // anchored on the marker for the hotel that the user selected.

  function showInfoWindow() {
    var marker = this;
    places.getDetails(
      {
        placeId: marker.placeResult.place_id
      },
      function(place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }

        infoWindow.open(exports.map, marker);
        buildIWContent(place);
      }
    );
  } // Load the place information into the HTML elements used by the info window.

  function buildIWContent(place) {
    document.getElementById("iw-icon").innerHTML =
      '<img class="hotelIcon" ' + 'src="' + place.icon + '"/>';
    document.getElementById("iw-url").innerHTML =
      '<b><a href="' + place.url + '">' + place.name + "</a></b>";
    document.getElementById("iw-address").textContent = place.vicinity;

    if (place.formatted_phone_number) {
      document.getElementById("iw-phone-row").style.display = "";
      document.getElementById("iw-phone").textContent =
        place.formatted_phone_number;
    } else {
      document.getElementById("iw-phone-row").style.display = "none";
    } // Assign a five-star rating to the hotel, using a black star ('&#10029;')
    // to indicate the rating the hotel has earned, and a white star ('&#10025;')
    // for the rating points not achieved.

    if (place.rating) {
      var ratingHtml = "";

      for (var i = 0; i < 5; i++) {
        if (place.rating < i + 0.5) {
          ratingHtml += "&#10025;";
        } else {
          ratingHtml += "&#10029;";
        }

        document.getElementById("iw-rating-row").style.display = "";
        document.getElementById("iw-rating").innerHTML = ratingHtml;
      }
    } else {
      document.getElementById("iw-rating-row").style.display = "none";
    } // The regexp isolates the first part of the URL (domain plus subdomain)
    // to give a short URL for displaying in the info window.

    if (place.website) {
      var fullUrl = place.website;
      var website = hostnameRegexp.exec(place.website);

      if (website === null) {
        website = "http://" + place.website + "/";
        fullUrl = website;
      }

      document.getElementById("iw-website-row").style.display = "";
      document.getElementById("iw-website").textContent = website;
    } else {
      document.getElementById("iw-website-row").style.display = "none";
    }
  } // [END maps_places_autocomplete_hotelsearch]

  exports.MARKER_PATH = MARKER_PATH;
  exports.addResult = addResult;
  exports.buildIWContent = buildIWContent;
  exports.clearMarkers = clearMarkers;
  exports.clearResults = clearResults;
  exports.countries = countries;
  exports.countryRestrict = countryRestrict;
  exports.dropMarker = dropMarker;
  exports.hostnameRegexp = hostnameRegexp;
  exports.initMap = initMap;
  exports.onPlaceChanged = onPlaceChanged;
  exports.search = search;
  exports.setAutocompleteCountry = setAutocompleteCountry;
  exports.showInfoWindow = showInfoWindow;
})((this.window = this.window || {}));
