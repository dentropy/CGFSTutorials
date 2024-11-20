(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PackagedBrowserLevel = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":2,"ieee754":4}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}],4:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(require,module,exports){
const PackagedBrowserLevel = require('browser-level')
module.exports=PackagedBrowserLevel

},{"browser-level":18}],6:[function(require,module,exports){
'use strict'

const { fromCallback } = require('catering')
const ModuleError = require('module-error')
const { getCallback, getOptions } = require('./lib/common')

const kPromise = Symbol('promise')
const kStatus = Symbol('status')
const kOperations = Symbol('operations')
const kFinishClose = Symbol('finishClose')
const kCloseCallbacks = Symbol('closeCallbacks')

class AbstractChainedBatch {
  constructor (db) {
    if (typeof db !== 'object' || db === null) {
      const hint = db === null ? 'null' : typeof db
      throw new TypeError(`The first argument must be an abstract-level database, received ${hint}`)
    }

    this[kOperations] = []
    this[kCloseCallbacks] = []
    this[kStatus] = 'open'
    this[kFinishClose] = this[kFinishClose].bind(this)

    this.db = db
    this.db.attachResource(this)
    this.nextTick = db.nextTick
  }

  get length () {
    return this[kOperations].length
  }

  put (key, value, options) {
    if (this[kStatus] !== 'open') {
      throw new ModuleError('Batch is not open: cannot call put() after write() or close()', {
        code: 'LEVEL_BATCH_NOT_OPEN'
      })
    }

    const err = this.db._checkKey(key) || this.db._checkValue(value)
    if (err) throw err

    const db = options && options.sublevel != null ? options.sublevel : this.db
    const original = options
    const keyEncoding = db.keyEncoding(options && options.keyEncoding)
    const valueEncoding = db.valueEncoding(options && options.valueEncoding)
    const keyFormat = keyEncoding.format

    // Forward encoding options
    options = { ...options, keyEncoding: keyFormat, valueEncoding: valueEncoding.format }

    // Prevent double prefixing
    if (db !== this.db) {
      options.sublevel = null
    }

    const mappedKey = db.prefixKey(keyEncoding.encode(key), keyFormat)
    const mappedValue = valueEncoding.encode(value)

    this._put(mappedKey, mappedValue, options)
    this[kOperations].push({ ...original, type: 'put', key, value })

    return this
  }

  _put (key, value, options) {}

  del (key, options) {
    if (this[kStatus] !== 'open') {
      throw new ModuleError('Batch is not open: cannot call del() after write() or close()', {
        code: 'LEVEL_BATCH_NOT_OPEN'
      })
    }

    const err = this.db._checkKey(key)
    if (err) throw err

    const db = options && options.sublevel != null ? options.sublevel : this.db
    const original = options
    const keyEncoding = db.keyEncoding(options && options.keyEncoding)
    const keyFormat = keyEncoding.format

    // Forward encoding options
    options = { ...options, keyEncoding: keyFormat }

    // Prevent double prefixing
    if (db !== this.db) {
      options.sublevel = null
    }

    this._del(db.prefixKey(keyEncoding.encode(key), keyFormat), options)
    this[kOperations].push({ ...original, type: 'del', key })

    return this
  }

  _del (key, options) {}

  clear () {
    if (this[kStatus] !== 'open') {
      throw new ModuleError('Batch is not open: cannot call clear() after write() or close()', {
        code: 'LEVEL_BATCH_NOT_OPEN'
      })
    }

    this._clear()
    this[kOperations] = []

    return this
  }

  _clear () {}

  write (options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)
    options = getOptions(options)

    if (this[kStatus] !== 'open') {
      this.nextTick(callback, new ModuleError('Batch is not open: cannot call write() after write() or close()', {
        code: 'LEVEL_BATCH_NOT_OPEN'
      }))
    } else if (this.length === 0) {
      this.close(callback)
    } else {
      this[kStatus] = 'writing'
      this._write(options, (err) => {
        this[kStatus] = 'closing'
        this[kCloseCallbacks].push(() => callback(err))

        // Emit after setting 'closing' status, because event may trigger a
        // db close which in turn triggers (idempotently) closing this batch.
        if (!err) this.db.emit('batch', this[kOperations])

        this._close(this[kFinishClose])
      })
    }

    return callback[kPromise]
  }

  _write (options, callback) {}

  close (callback) {
    callback = fromCallback(callback, kPromise)

    if (this[kStatus] === 'closing') {
      this[kCloseCallbacks].push(callback)
    } else if (this[kStatus] === 'closed') {
      this.nextTick(callback)
    } else {
      this[kCloseCallbacks].push(callback)

      if (this[kStatus] !== 'writing') {
        this[kStatus] = 'closing'
        this._close(this[kFinishClose])
      }
    }

    return callback[kPromise]
  }

  _close (callback) {
    this.nextTick(callback)
  }

  [kFinishClose] () {
    this[kStatus] = 'closed'
    this.db.detachResource(this)

    const callbacks = this[kCloseCallbacks]
    this[kCloseCallbacks] = []

    for (const cb of callbacks) {
      cb()
    }
  }
}

exports.AbstractChainedBatch = AbstractChainedBatch

},{"./lib/common":12,"catering":23,"module-error":31}],7:[function(require,module,exports){
'use strict'

const { fromCallback } = require('catering')
const ModuleError = require('module-error')
const { getOptions, getCallback } = require('./lib/common')

const kPromise = Symbol('promise')
const kCallback = Symbol('callback')
const kWorking = Symbol('working')
const kHandleOne = Symbol('handleOne')
const kHandleMany = Symbol('handleMany')
const kAutoClose = Symbol('autoClose')
const kFinishWork = Symbol('finishWork')
const kReturnMany = Symbol('returnMany')
const kClosing = Symbol('closing')
const kHandleClose = Symbol('handleClose')
const kClosed = Symbol('closed')
const kCloseCallbacks = Symbol('closeCallbacks')
const kKeyEncoding = Symbol('keyEncoding')
const kValueEncoding = Symbol('valueEncoding')
const kAbortOnClose = Symbol('abortOnClose')
const kLegacy = Symbol('legacy')
const kKeys = Symbol('keys')
const kValues = Symbol('values')
const kLimit = Symbol('limit')
const kCount = Symbol('count')

const emptyOptions = Object.freeze({})
const noop = () => {}
let warnedEnd = false

// This class is an internal utility for common functionality between AbstractIterator,
// AbstractKeyIterator and AbstractValueIterator. It's not exported.
class CommonIterator {
  constructor (db, options, legacy) {
    if (typeof db !== 'object' || db === null) {
      const hint = db === null ? 'null' : typeof db
      throw new TypeError(`The first argument must be an abstract-level database, received ${hint}`)
    }

    if (typeof options !== 'object' || options === null) {
      throw new TypeError('The second argument must be an options object')
    }

    this[kClosed] = false
    this[kCloseCallbacks] = []
    this[kWorking] = false
    this[kClosing] = false
    this[kAutoClose] = false
    this[kCallback] = null
    this[kHandleOne] = this[kHandleOne].bind(this)
    this[kHandleMany] = this[kHandleMany].bind(this)
    this[kHandleClose] = this[kHandleClose].bind(this)
    this[kKeyEncoding] = options[kKeyEncoding]
    this[kValueEncoding] = options[kValueEncoding]
    this[kLegacy] = legacy
    this[kLimit] = Number.isInteger(options.limit) && options.limit >= 0 ? options.limit : Infinity
    this[kCount] = 0

    // Undocumented option to abort pending work on close(). Used by the
    // many-level module as a temporary solution to a blocked close().
    // TODO (next major): consider making this the default behavior. Native
    // implementations should have their own logic to safely close iterators.
    this[kAbortOnClose] = !!options.abortOnClose

    this.db = db
    this.db.attachResource(this)
    this.nextTick = db.nextTick
  }

  get count () {
    return this[kCount]
  }

  get limit () {
    return this[kLimit]
  }

  next (callback) {
    let promise

    if (callback === undefined) {
      promise = new Promise((resolve, reject) => {
        callback = (err, key, value) => {
          if (err) reject(err)
          else if (!this[kLegacy]) resolve(key)
          else if (key === undefined && value === undefined) resolve()
          else resolve([key, value])
        }
      })
    } else if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function')
    }

    if (this[kClosing]) {
      this.nextTick(callback, new ModuleError('Iterator is not open: cannot call next() after close()', {
        code: 'LEVEL_ITERATOR_NOT_OPEN'
      }))
    } else if (this[kWorking]) {
      this.nextTick(callback, new ModuleError('Iterator is busy: cannot call next() until previous call has completed', {
        code: 'LEVEL_ITERATOR_BUSY'
      }))
    } else {
      this[kWorking] = true
      this[kCallback] = callback

      if (this[kCount] >= this[kLimit]) this.nextTick(this[kHandleOne], null)
      else this._next(this[kHandleOne])
    }

    return promise
  }

  _next (callback) {
    this.nextTick(callback)
  }

  nextv (size, options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)
    options = getOptions(options, emptyOptions)

    if (!Number.isInteger(size)) {
      this.nextTick(callback, new TypeError("The first argument 'size' must be an integer"))
      return callback[kPromise]
    }

    if (this[kClosing]) {
      this.nextTick(callback, new ModuleError('Iterator is not open: cannot call nextv() after close()', {
        code: 'LEVEL_ITERATOR_NOT_OPEN'
      }))
    } else if (this[kWorking]) {
      this.nextTick(callback, new ModuleError('Iterator is busy: cannot call nextv() until previous call has completed', {
        code: 'LEVEL_ITERATOR_BUSY'
      }))
    } else {
      if (size < 1) size = 1
      if (this[kLimit] < Infinity) size = Math.min(size, this[kLimit] - this[kCount])

      this[kWorking] = true
      this[kCallback] = callback

      if (size <= 0) this.nextTick(this[kHandleMany], null, [])
      else this._nextv(size, options, this[kHandleMany])
    }

    return callback[kPromise]
  }

  _nextv (size, options, callback) {
    const acc = []
    const onnext = (err, key, value) => {
      if (err) {
        return callback(err)
      } else if (this[kLegacy] ? key === undefined && value === undefined : key === undefined) {
        return callback(null, acc)
      }

      acc.push(this[kLegacy] ? [key, value] : key)

      if (acc.length === size) {
        callback(null, acc)
      } else {
        this._next(onnext)
      }
    }

    this._next(onnext)
  }

  all (options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)
    options = getOptions(options, emptyOptions)

    if (this[kClosing]) {
      this.nextTick(callback, new ModuleError('Iterator is not open: cannot call all() after close()', {
        code: 'LEVEL_ITERATOR_NOT_OPEN'
      }))
    } else if (this[kWorking]) {
      this.nextTick(callback, new ModuleError('Iterator is busy: cannot call all() until previous call has completed', {
        code: 'LEVEL_ITERATOR_BUSY'
      }))
    } else {
      this[kWorking] = true
      this[kCallback] = callback
      this[kAutoClose] = true

      if (this[kCount] >= this[kLimit]) this.nextTick(this[kHandleMany], null, [])
      else this._all(options, this[kHandleMany])
    }

    return callback[kPromise]
  }

  _all (options, callback) {
    // Must count here because we're directly calling _nextv()
    let count = this[kCount]
    const acc = []

    const nextv = () => {
      // Not configurable, because implementations should optimize _all().
      const size = this[kLimit] < Infinity ? Math.min(1e3, this[kLimit] - count) : 1e3

      if (size <= 0) {
        this.nextTick(callback, null, acc)
      } else {
        this._nextv(size, emptyOptions, onnextv)
      }
    }

    const onnextv = (err, items) => {
      if (err) {
        callback(err)
      } else if (items.length === 0) {
        callback(null, acc)
      } else {
        acc.push.apply(acc, items)
        count += items.length
        nextv()
      }
    }

    nextv()
  }

  [kFinishWork] () {
    const cb = this[kCallback]

    // Callback will be null if work was aborted on close
    if (this[kAbortOnClose] && cb === null) return noop

    this[kWorking] = false
    this[kCallback] = null

    if (this[kClosing]) this._close(this[kHandleClose])

    return cb
  }

  [kReturnMany] (cb, err, items) {
    if (this[kAutoClose]) {
      this.close(cb.bind(null, err, items))
    } else {
      cb(err, items)
    }
  }

  seek (target, options) {
    options = getOptions(options, emptyOptions)

    if (this[kClosing]) {
      // Don't throw here, to be kind to implementations that wrap
      // another db and don't necessarily control when the db is closed
    } else if (this[kWorking]) {
      throw new ModuleError('Iterator is busy: cannot call seek() until next() has completed', {
        code: 'LEVEL_ITERATOR_BUSY'
      })
    } else {
      const keyEncoding = this.db.keyEncoding(options.keyEncoding || this[kKeyEncoding])
      const keyFormat = keyEncoding.format

      if (options.keyEncoding !== keyFormat) {
        options = { ...options, keyEncoding: keyFormat }
      }

      const mapped = this.db.prefixKey(keyEncoding.encode(target), keyFormat)
      this._seek(mapped, options)
    }
  }

  _seek (target, options) {
    throw new ModuleError('Iterator does not support seek()', {
      code: 'LEVEL_NOT_SUPPORTED'
    })
  }

  close (callback) {
    callback = fromCallback(callback, kPromise)

    if (this[kClosed]) {
      this.nextTick(callback)
    } else if (this[kClosing]) {
      this[kCloseCallbacks].push(callback)
    } else {
      this[kClosing] = true
      this[kCloseCallbacks].push(callback)

      if (!this[kWorking]) {
        this._close(this[kHandleClose])
      } else if (this[kAbortOnClose]) {
        // Don't wait for work to finish. Subsequently ignore the result.
        const cb = this[kFinishWork]()

        cb(new ModuleError('Aborted on iterator close()', {
          code: 'LEVEL_ITERATOR_NOT_OPEN'
        }))
      }
    }

    return callback[kPromise]
  }

  _close (callback) {
    this.nextTick(callback)
  }

  [kHandleClose] () {
    this[kClosed] = true
    this.db.detachResource(this)

    const callbacks = this[kCloseCallbacks]
    this[kCloseCallbacks] = []

    for (const cb of callbacks) {
      cb()
    }
  }

  async * [Symbol.asyncIterator] () {
    try {
      let item

      while ((item = (await this.next())) !== undefined) {
        yield item
      }
    } finally {
      if (!this[kClosed]) await this.close()
    }
  }
}

// For backwards compatibility this class is not (yet) called AbstractEntryIterator.
class AbstractIterator extends CommonIterator {
  constructor (db, options) {
    super(db, options, true)
    this[kKeys] = options.keys !== false
    this[kValues] = options.values !== false
  }

  [kHandleOne] (err, key, value) {
    const cb = this[kFinishWork]()
    if (err) return cb(err)

    try {
      key = this[kKeys] && key !== undefined ? this[kKeyEncoding].decode(key) : undefined
      value = this[kValues] && value !== undefined ? this[kValueEncoding].decode(value) : undefined
    } catch (err) {
      return cb(new IteratorDecodeError('entry', err))
    }

    if (!(key === undefined && value === undefined)) {
      this[kCount]++
    }

    cb(null, key, value)
  }

  [kHandleMany] (err, entries) {
    const cb = this[kFinishWork]()
    if (err) return this[kReturnMany](cb, err)

    try {
      for (const entry of entries) {
        const key = entry[0]
        const value = entry[1]

        entry[0] = this[kKeys] && key !== undefined ? this[kKeyEncoding].decode(key) : undefined
        entry[1] = this[kValues] && value !== undefined ? this[kValueEncoding].decode(value) : undefined
      }
    } catch (err) {
      return this[kReturnMany](cb, new IteratorDecodeError('entries', err))
    }

    this[kCount] += entries.length
    this[kReturnMany](cb, null, entries)
  }

  end (callback) {
    if (!warnedEnd && typeof console !== 'undefined') {
      warnedEnd = true
      console.warn(new ModuleError(
        'The iterator.end() method was renamed to close() and end() is an alias that will be removed in a future version',
        { code: 'LEVEL_LEGACY' }
      ))
    }

    return this.close(callback)
  }
}

class AbstractKeyIterator extends CommonIterator {
  constructor (db, options) {
    super(db, options, false)
  }

  [kHandleOne] (err, key) {
    const cb = this[kFinishWork]()
    if (err) return cb(err)

    try {
      key = key !== undefined ? this[kKeyEncoding].decode(key) : undefined
    } catch (err) {
      return cb(new IteratorDecodeError('key', err))
    }

    if (key !== undefined) this[kCount]++
    cb(null, key)
  }

  [kHandleMany] (err, keys) {
    const cb = this[kFinishWork]()
    if (err) return this[kReturnMany](cb, err)

    try {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        keys[i] = key !== undefined ? this[kKeyEncoding].decode(key) : undefined
      }
    } catch (err) {
      return this[kReturnMany](cb, new IteratorDecodeError('keys', err))
    }

    this[kCount] += keys.length
    this[kReturnMany](cb, null, keys)
  }
}

class AbstractValueIterator extends CommonIterator {
  constructor (db, options) {
    super(db, options, false)
  }

  [kHandleOne] (err, value) {
    const cb = this[kFinishWork]()
    if (err) return cb(err)

    try {
      value = value !== undefined ? this[kValueEncoding].decode(value) : undefined
    } catch (err) {
      return cb(new IteratorDecodeError('value', err))
    }

    if (value !== undefined) this[kCount]++
    cb(null, value)
  }

  [kHandleMany] (err, values) {
    const cb = this[kFinishWork]()
    if (err) return this[kReturnMany](cb, err)

    try {
      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        values[i] = value !== undefined ? this[kValueEncoding].decode(value) : undefined
      }
    } catch (err) {
      return this[kReturnMany](cb, new IteratorDecodeError('values', err))
    }

    this[kCount] += values.length
    this[kReturnMany](cb, null, values)
  }
}

// Internal utility, not typed or exported
class IteratorDecodeError extends ModuleError {
  constructor (subject, cause) {
    super(`Iterator could not decode ${subject}`, {
      code: 'LEVEL_DECODE_ERROR',
      cause
    })
  }
}

// To help migrating to abstract-level
for (const k of ['_ended property', '_nexting property', '_end method']) {
  Object.defineProperty(AbstractIterator.prototype, k.split(' ')[0], {
    get () { throw new ModuleError(`The ${k} has been removed`, { code: 'LEVEL_LEGACY' }) },
    set () { throw new ModuleError(`The ${k} has been removed`, { code: 'LEVEL_LEGACY' }) }
  })
}

// Exposed so that AbstractLevel can set these options
AbstractIterator.keyEncoding = kKeyEncoding
AbstractIterator.valueEncoding = kValueEncoding

exports.AbstractIterator = AbstractIterator
exports.AbstractKeyIterator = AbstractKeyIterator
exports.AbstractValueIterator = AbstractValueIterator

},{"./lib/common":12,"catering":23,"module-error":31}],8:[function(require,module,exports){
'use strict'

const { supports } = require('level-supports')
const { Transcoder } = require('level-transcoder')
const { EventEmitter } = require('events')
const { fromCallback } = require('catering')
const ModuleError = require('module-error')
const { AbstractIterator } = require('./abstract-iterator')
const { DefaultKeyIterator, DefaultValueIterator } = require('./lib/default-kv-iterator')
const { DeferredIterator, DeferredKeyIterator, DeferredValueIterator } = require('./lib/deferred-iterator')
const { DefaultChainedBatch } = require('./lib/default-chained-batch')
const { getCallback, getOptions } = require('./lib/common')
const rangeOptions = require('./lib/range-options')

const kPromise = Symbol('promise')
const kLanded = Symbol('landed')
const kResources = Symbol('resources')
const kCloseResources = Symbol('closeResources')
const kOperations = Symbol('operations')
const kUndefer = Symbol('undefer')
const kDeferOpen = Symbol('deferOpen')
const kOptions = Symbol('options')
const kStatus = Symbol('status')
const kDefaultOptions = Symbol('defaultOptions')
const kTranscoder = Symbol('transcoder')
const kKeyEncoding = Symbol('keyEncoding')
const kValueEncoding = Symbol('valueEncoding')
const noop = () => {}

class AbstractLevel extends EventEmitter {
  constructor (manifest, options) {
    super()

    if (typeof manifest !== 'object' || manifest === null) {
      throw new TypeError("The first argument 'manifest' must be an object")
    }

    options = getOptions(options)
    const { keyEncoding, valueEncoding, passive, ...forward } = options

    this[kResources] = new Set()
    this[kOperations] = []
    this[kDeferOpen] = true
    this[kOptions] = forward
    this[kStatus] = 'opening'

    this.supports = supports(manifest, {
      status: true,
      promises: true,
      clear: true,
      getMany: true,
      deferredOpen: true,

      // TODO (next major): add seek
      snapshots: manifest.snapshots !== false,
      permanence: manifest.permanence !== false,

      // TODO: remove from level-supports because it's always supported
      keyIterator: true,
      valueIterator: true,
      iteratorNextv: true,
      iteratorAll: true,

      encodings: manifest.encodings || {},
      events: Object.assign({}, manifest.events, {
        opening: true,
        open: true,
        closing: true,
        closed: true,
        put: true,
        del: true,
        batch: true,
        clear: true
      })
    })

    this[kTranscoder] = new Transcoder(formats(this))
    this[kKeyEncoding] = this[kTranscoder].encoding(keyEncoding || 'utf8')
    this[kValueEncoding] = this[kTranscoder].encoding(valueEncoding || 'utf8')

    // Add custom and transcoder encodings to manifest
    for (const encoding of this[kTranscoder].encodings()) {
      if (!this.supports.encodings[encoding.commonName]) {
        this.supports.encodings[encoding.commonName] = true
      }
    }

    this[kDefaultOptions] = {
      empty: Object.freeze({}),
      entry: Object.freeze({
        keyEncoding: this[kKeyEncoding].commonName,
        valueEncoding: this[kValueEncoding].commonName
      }),
      key: Object.freeze({
        keyEncoding: this[kKeyEncoding].commonName
      })
    }

    // Let subclass finish its constructor
    this.nextTick(() => {
      if (this[kDeferOpen]) {
        this.open({ passive: false }, noop)
      }
    })
  }

  get status () {
    return this[kStatus]
  }

  keyEncoding (encoding) {
    return this[kTranscoder].encoding(encoding != null ? encoding : this[kKeyEncoding])
  }

  valueEncoding (encoding) {
    return this[kTranscoder].encoding(encoding != null ? encoding : this[kValueEncoding])
  }

  open (options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)

    options = { ...this[kOptions], ...getOptions(options) }

    options.createIfMissing = options.createIfMissing !== false
    options.errorIfExists = !!options.errorIfExists

    const maybeOpened = (err) => {
      if (this[kStatus] === 'closing' || this[kStatus] === 'opening') {
        // Wait until pending state changes are done
        this.once(kLanded, err ? () => maybeOpened(err) : maybeOpened)
      } else if (this[kStatus] !== 'open') {
        callback(new ModuleError('Database is not open', {
          code: 'LEVEL_DATABASE_NOT_OPEN',
          cause: err
        }))
      } else {
        callback()
      }
    }

    if (options.passive) {
      if (this[kStatus] === 'opening') {
        this.once(kLanded, maybeOpened)
      } else {
        this.nextTick(maybeOpened)
      }
    } else if (this[kStatus] === 'closed' || this[kDeferOpen]) {
      this[kDeferOpen] = false
      this[kStatus] = 'opening'
      this.emit('opening')

      this._open(options, (err) => {
        if (err) {
          this[kStatus] = 'closed'

          // Resources must be safe to close in any db state
          this[kCloseResources](() => {
            this.emit(kLanded)
            maybeOpened(err)
          })

          this[kUndefer]()
          return
        }

        this[kStatus] = 'open'
        this[kUndefer]()
        this.emit(kLanded)

        // Only emit public event if pending state changes are done
        if (this[kStatus] === 'open') this.emit('open')

        // TODO (next major): remove this alias
        if (this[kStatus] === 'open') this.emit('ready')

        maybeOpened()
      })
    } else if (this[kStatus] === 'open') {
      this.nextTick(maybeOpened)
    } else {
      this.once(kLanded, () => this.open(options, callback))
    }

    return callback[kPromise]
  }

  _open (options, callback) {
    this.nextTick(callback)
  }

  close (callback) {
    callback = fromCallback(callback, kPromise)

    const maybeClosed = (err) => {
      if (this[kStatus] === 'opening' || this[kStatus] === 'closing') {
        // Wait until pending state changes are done
        this.once(kLanded, err ? maybeClosed(err) : maybeClosed)
      } else if (this[kStatus] !== 'closed') {
        callback(new ModuleError('Database is not closed', {
          code: 'LEVEL_DATABASE_NOT_CLOSED',
          cause: err
        }))
      } else {
        callback()
      }
    }

    if (this[kStatus] === 'open') {
      this[kStatus] = 'closing'
      this.emit('closing')

      const cancel = (err) => {
        this[kStatus] = 'open'
        this[kUndefer]()
        this.emit(kLanded)
        maybeClosed(err)
      }

      this[kCloseResources](() => {
        this._close((err) => {
          if (err) return cancel(err)

          this[kStatus] = 'closed'
          this[kUndefer]()
          this.emit(kLanded)

          // Only emit public event if pending state changes are done
          if (this[kStatus] === 'closed') this.emit('closed')

          maybeClosed()
        })
      })
    } else if (this[kStatus] === 'closed') {
      this.nextTick(maybeClosed)
    } else {
      this.once(kLanded, () => this.close(callback))
    }

    return callback[kPromise]
  }

  [kCloseResources] (callback) {
    if (this[kResources].size === 0) {
      return this.nextTick(callback)
    }

    let pending = this[kResources].size
    let sync = true

    const next = () => {
      if (--pending === 0) {
        // We don't have tests for generic resources, so dezalgo
        if (sync) this.nextTick(callback)
        else callback()
      }
    }

    // In parallel so that all resources know they are closed
    for (const resource of this[kResources]) {
      resource.close(next)
    }

    sync = false
    this[kResources].clear()
  }

  _close (callback) {
    this.nextTick(callback)
  }

  get (key, options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)
    options = getOptions(options, this[kDefaultOptions].entry)

    if (this[kStatus] === 'opening') {
      this.defer(() => this.get(key, options, callback))
      return callback[kPromise]
    }

    if (maybeError(this, callback)) {
      return callback[kPromise]
    }

    const err = this._checkKey(key)

    if (err) {
      this.nextTick(callback, err)
      return callback[kPromise]
    }

    const keyEncoding = this.keyEncoding(options.keyEncoding)
    const valueEncoding = this.valueEncoding(options.valueEncoding)
    const keyFormat = keyEncoding.format
    const valueFormat = valueEncoding.format

    // Forward encoding options to the underlying store
    if (options.keyEncoding !== keyFormat || options.valueEncoding !== valueFormat) {
      // Avoid spread operator because of https://bugs.chromium.org/p/chromium/issues/detail?id=1204540
      options = Object.assign({}, options, { keyEncoding: keyFormat, valueEncoding: valueFormat })
    }

    this._get(this.prefixKey(keyEncoding.encode(key), keyFormat), options, (err, value) => {
      if (err) {
        // Normalize not found error for backwards compatibility with abstract-leveldown and level(up)
        if (err.code === 'LEVEL_NOT_FOUND' || err.notFound || /NotFound/i.test(err)) {
          if (!err.code) err.code = 'LEVEL_NOT_FOUND' // Preferred way going forward
          if (!err.notFound) err.notFound = true // Same as level-errors
          if (!err.status) err.status = 404 // Same as level-errors
        }

        return callback(err)
      }

      try {
        value = valueEncoding.decode(value)
      } catch (err) {
        return callback(new ModuleError('Could not decode value', {
          code: 'LEVEL_DECODE_ERROR',
          cause: err
        }))
      }

      callback(null, value)
    })

    return callback[kPromise]
  }

  _get (key, options, callback) {
    this.nextTick(callback, new Error('NotFound'))
  }

  getMany (keys, options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)
    options = getOptions(options, this[kDefaultOptions].entry)

    if (this[kStatus] === 'opening') {
      this.defer(() => this.getMany(keys, options, callback))
      return callback[kPromise]
    }

    if (maybeError(this, callback)) {
      return callback[kPromise]
    }

    if (!Array.isArray(keys)) {
      this.nextTick(callback, new TypeError("The first argument 'keys' must be an array"))
      return callback[kPromise]
    }

    if (keys.length === 0) {
      this.nextTick(callback, null, [])
      return callback[kPromise]
    }

    const keyEncoding = this.keyEncoding(options.keyEncoding)
    const valueEncoding = this.valueEncoding(options.valueEncoding)
    const keyFormat = keyEncoding.format
    const valueFormat = valueEncoding.format

    // Forward encoding options
    if (options.keyEncoding !== keyFormat || options.valueEncoding !== valueFormat) {
      options = Object.assign({}, options, { keyEncoding: keyFormat, valueEncoding: valueFormat })
    }

    const mappedKeys = new Array(keys.length)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const err = this._checkKey(key)

      if (err) {
        this.nextTick(callback, err)
        return callback[kPromise]
      }

      mappedKeys[i] = this.prefixKey(keyEncoding.encode(key), keyFormat)
    }

    this._getMany(mappedKeys, options, (err, values) => {
      if (err) return callback(err)

      try {
        for (let i = 0; i < values.length; i++) {
          if (values[i] !== undefined) {
            values[i] = valueEncoding.decode(values[i])
          }
        }
      } catch (err) {
        return callback(new ModuleError(`Could not decode one or more of ${values.length} value(s)`, {
          code: 'LEVEL_DECODE_ERROR',
          cause: err
        }))
      }

      callback(null, values)
    })

    return callback[kPromise]
  }

  _getMany (keys, options, callback) {
    this.nextTick(callback, null, new Array(keys.length).fill(undefined))
  }

  put (key, value, options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)
    options = getOptions(options, this[kDefaultOptions].entry)

    if (this[kStatus] === 'opening') {
      this.defer(() => this.put(key, value, options, callback))
      return callback[kPromise]
    }

    if (maybeError(this, callback)) {
      return callback[kPromise]
    }

    const err = this._checkKey(key) || this._checkValue(value)

    if (err) {
      this.nextTick(callback, err)
      return callback[kPromise]
    }

    const keyEncoding = this.keyEncoding(options.keyEncoding)
    const valueEncoding = this.valueEncoding(options.valueEncoding)
    const keyFormat = keyEncoding.format
    const valueFormat = valueEncoding.format

    // Forward encoding options
    if (options.keyEncoding !== keyFormat || options.valueEncoding !== valueFormat) {
      options = Object.assign({}, options, { keyEncoding: keyFormat, valueEncoding: valueFormat })
    }

    const mappedKey = this.prefixKey(keyEncoding.encode(key), keyFormat)
    const mappedValue = valueEncoding.encode(value)

    this._put(mappedKey, mappedValue, options, (err) => {
      if (err) return callback(err)
      this.emit('put', key, value)
      callback()
    })

    return callback[kPromise]
  }

  _put (key, value, options, callback) {
    this.nextTick(callback)
  }

  del (key, options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)
    options = getOptions(options, this[kDefaultOptions].key)

    if (this[kStatus] === 'opening') {
      this.defer(() => this.del(key, options, callback))
      return callback[kPromise]
    }

    if (maybeError(this, callback)) {
      return callback[kPromise]
    }

    const err = this._checkKey(key)

    if (err) {
      this.nextTick(callback, err)
      return callback[kPromise]
    }

    const keyEncoding = this.keyEncoding(options.keyEncoding)
    const keyFormat = keyEncoding.format

    // Forward encoding options
    if (options.keyEncoding !== keyFormat) {
      options = Object.assign({}, options, { keyEncoding: keyFormat })
    }

    this._del(this.prefixKey(keyEncoding.encode(key), keyFormat), options, (err) => {
      if (err) return callback(err)
      this.emit('del', key)
      callback()
    })

    return callback[kPromise]
  }

  _del (key, options, callback) {
    this.nextTick(callback)
  }

  batch (operations, options, callback) {
    if (!arguments.length) {
      if (this[kStatus] === 'opening') return new DefaultChainedBatch(this)
      if (this[kStatus] !== 'open') {
        throw new ModuleError('Database is not open', {
          code: 'LEVEL_DATABASE_NOT_OPEN'
        })
      }
      return this._chainedBatch()
    }

    if (typeof operations === 'function') callback = operations
    else callback = getCallback(options, callback)

    callback = fromCallback(callback, kPromise)
    options = getOptions(options, this[kDefaultOptions].empty)

    if (this[kStatus] === 'opening') {
      this.defer(() => this.batch(operations, options, callback))
      return callback[kPromise]
    }

    if (maybeError(this, callback)) {
      return callback[kPromise]
    }

    if (!Array.isArray(operations)) {
      this.nextTick(callback, new TypeError("The first argument 'operations' must be an array"))
      return callback[kPromise]
    }

    if (operations.length === 0) {
      this.nextTick(callback)
      return callback[kPromise]
    }

    const mapped = new Array(operations.length)
    const { keyEncoding: ke, valueEncoding: ve, ...forward } = options

    for (let i = 0; i < operations.length; i++) {
      if (typeof operations[i] !== 'object' || operations[i] === null) {
        this.nextTick(callback, new TypeError('A batch operation must be an object'))
        return callback[kPromise]
      }

      const op = Object.assign({}, operations[i])

      if (op.type !== 'put' && op.type !== 'del') {
        this.nextTick(callback, new TypeError("A batch operation must have a type property that is 'put' or 'del'"))
        return callback[kPromise]
      }

      const err = this._checkKey(op.key)

      if (err) {
        this.nextTick(callback, err)
        return callback[kPromise]
      }

      const db = op.sublevel != null ? op.sublevel : this
      const keyEncoding = db.keyEncoding(op.keyEncoding || ke)
      const keyFormat = keyEncoding.format

      op.key = db.prefixKey(keyEncoding.encode(op.key), keyFormat)
      op.keyEncoding = keyFormat

      if (op.type === 'put') {
        const valueErr = this._checkValue(op.value)

        if (valueErr) {
          this.nextTick(callback, valueErr)
          return callback[kPromise]
        }

        const valueEncoding = db.valueEncoding(op.valueEncoding || ve)

        op.value = valueEncoding.encode(op.value)
        op.valueEncoding = valueEncoding.format
      }

      // Prevent double prefixing
      if (db !== this) {
        op.sublevel = null
      }

      mapped[i] = op
    }

    this._batch(mapped, forward, (err) => {
      if (err) return callback(err)
      this.emit('batch', operations)
      callback()
    })

    return callback[kPromise]
  }

  _batch (operations, options, callback) {
    this.nextTick(callback)
  }

  sublevel (name, options) {
    return this._sublevel(name, AbstractSublevel.defaults(options))
  }

  _sublevel (name, options) {
    return new AbstractSublevel(this, name, options)
  }

  prefixKey (key, keyFormat) {
    return key
  }

  clear (options, callback) {
    callback = getCallback(options, callback)
    callback = fromCallback(callback, kPromise)
    options = getOptions(options, this[kDefaultOptions].empty)

    if (this[kStatus] === 'opening') {
      this.defer(() => this.clear(options, callback))
      return callback[kPromise]
    }

    if (maybeError(this, callback)) {
      return callback[kPromise]
    }

    const original = options
    const keyEncoding = this.keyEncoding(options.keyEncoding)

    options = rangeOptions(options, keyEncoding)
    options.keyEncoding = keyEncoding.format

    if (options.limit === 0) {
      this.nextTick(callback)
    } else {
      this._clear(options, (err) => {
        if (err) return callback(err)
        this.emit('clear', original)
        callback()
      })
    }

    return callback[kPromise]
  }

  _clear (options, callback) {
    this.nextTick(callback)
  }

  iterator (options) {
    const keyEncoding = this.keyEncoding(options && options.keyEncoding)
    const valueEncoding = this.valueEncoding(options && options.valueEncoding)

    options = rangeOptions(options, keyEncoding)
    options.keys = options.keys !== false
    options.values = options.values !== false

    // We need the original encoding options in AbstractIterator in order to decode data
    options[AbstractIterator.keyEncoding] = keyEncoding
    options[AbstractIterator.valueEncoding] = valueEncoding

    // Forward encoding options to private API
    options.keyEncoding = keyEncoding.format
    options.valueEncoding = valueEncoding.format

    if (this[kStatus] === 'opening') {
      return new DeferredIterator(this, options)
    } else if (this[kStatus] !== 'open') {
      throw new ModuleError('Database is not open', {
        code: 'LEVEL_DATABASE_NOT_OPEN'
      })
    }

    return this._iterator(options)
  }

  _iterator (options) {
    return new AbstractIterator(this, options)
  }

  keys (options) {
    // Also include valueEncoding (though unused) because we may fallback to _iterator()
    const keyEncoding = this.keyEncoding(options && options.keyEncoding)
    const valueEncoding = this.valueEncoding(options && options.valueEncoding)

    options = rangeOptions(options, keyEncoding)

    // We need the original encoding options in AbstractKeyIterator in order to decode data
    options[AbstractIterator.keyEncoding] = keyEncoding
    options[AbstractIterator.valueEncoding] = valueEncoding

    // Forward encoding options to private API
    options.keyEncoding = keyEncoding.format
    options.valueEncoding = valueEncoding.format

    if (this[kStatus] === 'opening') {
      return new DeferredKeyIterator(this, options)
    } else if (this[kStatus] !== 'open') {
      throw new ModuleError('Database is not open', {
        code: 'LEVEL_DATABASE_NOT_OPEN'
      })
    }

    return this._keys(options)
  }

  _keys (options) {
    return new DefaultKeyIterator(this, options)
  }

  values (options) {
    const keyEncoding = this.keyEncoding(options && options.keyEncoding)
    const valueEncoding = this.valueEncoding(options && options.valueEncoding)

    options = rangeOptions(options, keyEncoding)

    // We need the original encoding options in AbstractValueIterator in order to decode data
    options[AbstractIterator.keyEncoding] = keyEncoding
    options[AbstractIterator.valueEncoding] = valueEncoding

    // Forward encoding options to private API
    options.keyEncoding = keyEncoding.format
    options.valueEncoding = valueEncoding.format

    if (this[kStatus] === 'opening') {
      return new DeferredValueIterator(this, options)
    } else if (this[kStatus] !== 'open') {
      throw new ModuleError('Database is not open', {
        code: 'LEVEL_DATABASE_NOT_OPEN'
      })
    }

    return this._values(options)
  }

  _values (options) {
    return new DefaultValueIterator(this, options)
  }

  defer (fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('The first argument must be a function')
    }

    this[kOperations].push(fn)
  }

  [kUndefer] () {
    if (this[kOperations].length === 0) {
      return
    }

    const operations = this[kOperations]
    this[kOperations] = []

    for (const op of operations) {
      op()
    }
  }

  // TODO: docs and types
  attachResource (resource) {
    if (typeof resource !== 'object' || resource === null ||
      typeof resource.close !== 'function') {
      throw new TypeError('The first argument must be a resource object')
    }

    this[kResources].add(resource)
  }

  // TODO: docs and types
  detachResource (resource) {
    this[kResources].delete(resource)
  }

  _chainedBatch () {
    return new DefaultChainedBatch(this)
  }

  _checkKey (key) {
    if (key === null || key === undefined) {
      return new ModuleError('Key cannot be null or undefined', {
        code: 'LEVEL_INVALID_KEY'
      })
    }
  }

  _checkValue (value) {
    if (value === null || value === undefined) {
      return new ModuleError('Value cannot be null or undefined', {
        code: 'LEVEL_INVALID_VALUE'
      })
    }
  }
}

// Expose browser-compatible nextTick for dependents
// TODO: after we drop node 10, also use queueMicrotask in node
AbstractLevel.prototype.nextTick = require('./lib/next-tick')

const { AbstractSublevel } = require('./lib/abstract-sublevel')({ AbstractLevel })

exports.AbstractLevel = AbstractLevel
exports.AbstractSublevel = AbstractSublevel

const maybeError = function (db, callback) {
  if (db[kStatus] !== 'open') {
    db.nextTick(callback, new ModuleError('Database is not open', {
      code: 'LEVEL_DATABASE_NOT_OPEN'
    }))
    return true
  }

  return false
}

const formats = function (db) {
  return Object.keys(db.supports.encodings)
    .filter(k => !!db.supports.encodings[k])
}

},{"./abstract-iterator":7,"./lib/abstract-sublevel":11,"./lib/common":12,"./lib/default-chained-batch":13,"./lib/default-kv-iterator":14,"./lib/deferred-iterator":15,"./lib/next-tick":16,"./lib/range-options":17,"catering":23,"events":3,"level-supports":25,"level-transcoder":26,"module-error":31}],9:[function(require,module,exports){
'use strict'

exports.AbstractLevel = require('./abstract-level').AbstractLevel
exports.AbstractSublevel = require('./abstract-level').AbstractSublevel
exports.AbstractIterator = require('./abstract-iterator').AbstractIterator
exports.AbstractKeyIterator = require('./abstract-iterator').AbstractKeyIterator
exports.AbstractValueIterator = require('./abstract-iterator').AbstractValueIterator
exports.AbstractChainedBatch = require('./abstract-chained-batch').AbstractChainedBatch

},{"./abstract-chained-batch":6,"./abstract-iterator":7,"./abstract-level":8}],10:[function(require,module,exports){
'use strict'

const { AbstractIterator, AbstractKeyIterator, AbstractValueIterator } = require('../abstract-iterator')

const kUnfix = Symbol('unfix')
const kIterator = Symbol('iterator')
const kHandleOne = Symbol('handleOne')
const kHandleMany = Symbol('handleMany')
const kCallback = Symbol('callback')

// TODO: unfix natively if db supports it
class AbstractSublevelIterator extends AbstractIterator {
  constructor (db, options, iterator, unfix) {
    super(db, options)

    this[kIterator] = iterator
    this[kUnfix] = unfix
    this[kHandleOne] = this[kHandleOne].bind(this)
    this[kHandleMany] = this[kHandleMany].bind(this)
    this[kCallback] = null
  }

  [kHandleOne] (err, key, value) {
    const callback = this[kCallback]
    if (err) return callback(err)
    if (key !== undefined) key = this[kUnfix](key)
    callback(err, key, value)
  }

  [kHandleMany] (err, entries) {
    const callback = this[kCallback]
    if (err) return callback(err)

    for (const entry of entries) {
      const key = entry[0]
      if (key !== undefined) entry[0] = this[kUnfix](key)
    }

    callback(err, entries)
  }
}

class AbstractSublevelKeyIterator extends AbstractKeyIterator {
  constructor (db, options, iterator, unfix) {
    super(db, options)

    this[kIterator] = iterator
    this[kUnfix] = unfix
    this[kHandleOne] = this[kHandleOne].bind(this)
    this[kHandleMany] = this[kHandleMany].bind(this)
    this[kCallback] = null
  }

  [kHandleOne] (err, key) {
    const callback = this[kCallback]
    if (err) return callback(err)
    if (key !== undefined) key = this[kUnfix](key)
    callback(err, key)
  }

  [kHandleMany] (err, keys) {
    const callback = this[kCallback]
    if (err) return callback(err)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (key !== undefined) keys[i] = this[kUnfix](key)
    }

    callback(err, keys)
  }
}

class AbstractSublevelValueIterator extends AbstractValueIterator {
  constructor (db, options, iterator) {
    super(db, options)
    this[kIterator] = iterator
  }
}

for (const Iterator of [AbstractSublevelIterator, AbstractSublevelKeyIterator]) {
  Iterator.prototype._next = function (callback) {
    this[kCallback] = callback
    this[kIterator].next(this[kHandleOne])
  }

  Iterator.prototype._nextv = function (size, options, callback) {
    this[kCallback] = callback
    this[kIterator].nextv(size, options, this[kHandleMany])
  }

  Iterator.prototype._all = function (options, callback) {
    this[kCallback] = callback
    this[kIterator].all(options, this[kHandleMany])
  }
}

for (const Iterator of [AbstractSublevelValueIterator]) {
  Iterator.prototype._next = function (callback) {
    this[kIterator].next(callback)
  }

  Iterator.prototype._nextv = function (size, options, callback) {
    this[kIterator].nextv(size, options, callback)
  }

  Iterator.prototype._all = function (options, callback) {
    this[kIterator].all(options, callback)
  }
}

for (const Iterator of [AbstractSublevelIterator, AbstractSublevelKeyIterator, AbstractSublevelValueIterator]) {
  Iterator.prototype._seek = function (target, options) {
    this[kIterator].seek(target, options)
  }

  Iterator.prototype._close = function (callback) {
    this[kIterator].close(callback)
  }
}

exports.AbstractSublevelIterator = AbstractSublevelIterator
exports.AbstractSublevelKeyIterator = AbstractSublevelKeyIterator
exports.AbstractSublevelValueIterator = AbstractSublevelValueIterator

},{"../abstract-iterator":7}],11:[function(require,module,exports){
'use strict'

const ModuleError = require('module-error')
const { Buffer } = require('buffer') || {}
const {
  AbstractSublevelIterator,
  AbstractSublevelKeyIterator,
  AbstractSublevelValueIterator
} = require('./abstract-sublevel-iterator')

const kPrefix = Symbol('prefix')
const kUpperBound = Symbol('upperBound')
const kPrefixRange = Symbol('prefixRange')
const kParent = Symbol('parent')
const kUnfix = Symbol('unfix')

const textEncoder = new TextEncoder()
const defaults = { separator: '!' }

// Wrapped to avoid circular dependency
module.exports = function ({ AbstractLevel }) {
  class AbstractSublevel extends AbstractLevel {
    static defaults (options) {
      // To help migrating from subleveldown to abstract-level
      if (typeof options === 'string') {
        throw new ModuleError('The subleveldown string shorthand for { separator } has been removed', {
          code: 'LEVEL_LEGACY'
        })
      } else if (options && options.open) {
        throw new ModuleError('The subleveldown open option has been removed', {
          code: 'LEVEL_LEGACY'
        })
      }

      if (options == null) {
        return defaults
      } else if (!options.separator) {
        return { ...options, separator: '!' }
      } else {
        return options
      }
    }

    // TODO: add autoClose option, which if true, does parent.attachResource(this)
    constructor (db, name, options) {
      // Don't forward AbstractSublevel options to AbstractLevel
      const { separator, manifest, ...forward } = AbstractSublevel.defaults(options)
      name = trim(name, separator)

      // Reserve one character between separator and name to give us an upper bound
      const reserved = separator.charCodeAt(0) + 1
      const parent = db[kParent] || db

      // Keys should sort like ['!a!', '!a!!a!', '!a"', '!aa!', '!b!'].
      // Use ASCII for consistent length between string, Buffer and Uint8Array
      if (!textEncoder.encode(name).every(x => x > reserved && x < 127)) {
        throw new ModuleError(`Prefix must use bytes > ${reserved} < ${127}`, {
          code: 'LEVEL_INVALID_PREFIX'
        })
      }

      super(mergeManifests(parent, manifest), forward)

      const prefix = (db.prefix || '') + separator + name + separator
      const upperBound = prefix.slice(0, -1) + String.fromCharCode(reserved)

      this[kParent] = parent
      this[kPrefix] = new MultiFormat(prefix)
      this[kUpperBound] = new MultiFormat(upperBound)
      this[kUnfix] = new Unfixer()

      this.nextTick = parent.nextTick
    }

    prefixKey (key, keyFormat) {
      if (keyFormat === 'utf8') {
        return this[kPrefix].utf8 + key
      } else if (key.byteLength === 0) {
        // Fast path for empty key (no copy)
        return this[kPrefix][keyFormat]
      } else if (keyFormat === 'view') {
        const view = this[kPrefix].view
        const result = new Uint8Array(view.byteLength + key.byteLength)

        result.set(view, 0)
        result.set(key, view.byteLength)

        return result
      } else {
        const buffer = this[kPrefix].buffer
        return Buffer.concat([buffer, key], buffer.byteLength + key.byteLength)
      }
    }

    // Not exposed for now.
    [kPrefixRange] (range, keyFormat) {
      if (range.gte !== undefined) {
        range.gte = this.prefixKey(range.gte, keyFormat)
      } else if (range.gt !== undefined) {
        range.gt = this.prefixKey(range.gt, keyFormat)
      } else {
        range.gte = this[kPrefix][keyFormat]
      }

      if (range.lte !== undefined) {
        range.lte = this.prefixKey(range.lte, keyFormat)
      } else if (range.lt !== undefined) {
        range.lt = this.prefixKey(range.lt, keyFormat)
      } else {
        range.lte = this[kUpperBound][keyFormat]
      }
    }

    get prefix () {
      return this[kPrefix].utf8
    }

    get db () {
      return this[kParent]
    }

    _open (options, callback) {
      // The parent db must open itself or be (re)opened by the user because
      // a sublevel should not initiate state changes on the rest of the db.
      this[kParent].open({ passive: true }, callback)
    }

    _put (key, value, options, callback) {
      this[kParent].put(key, value, options, callback)
    }

    _get (key, options, callback) {
      this[kParent].get(key, options, callback)
    }

    _getMany (keys, options, callback) {
      this[kParent].getMany(keys, options, callback)
    }

    _del (key, options, callback) {
      this[kParent].del(key, options, callback)
    }

    _batch (operations, options, callback) {
      this[kParent].batch(operations, options, callback)
    }

    _clear (options, callback) {
      // TODO (refactor): move to AbstractLevel
      this[kPrefixRange](options, options.keyEncoding)
      this[kParent].clear(options, callback)
    }

    _iterator (options) {
      // TODO (refactor): move to AbstractLevel
      this[kPrefixRange](options, options.keyEncoding)
      const iterator = this[kParent].iterator(options)
      const unfix = this[kUnfix].get(this[kPrefix].utf8.length, options.keyEncoding)
      return new AbstractSublevelIterator(this, options, iterator, unfix)
    }

    _keys (options) {
      this[kPrefixRange](options, options.keyEncoding)
      const iterator = this[kParent].keys(options)
      const unfix = this[kUnfix].get(this[kPrefix].utf8.length, options.keyEncoding)
      return new AbstractSublevelKeyIterator(this, options, iterator, unfix)
    }

    _values (options) {
      this[kPrefixRange](options, options.keyEncoding)
      const iterator = this[kParent].values(options)
      return new AbstractSublevelValueIterator(this, options, iterator)
    }
  }

  return { AbstractSublevel }
}

const mergeManifests = function (parent, manifest) {
  return {
    // Inherit manifest of parent db
    ...parent.supports,

    // Disable unsupported features
    createIfMissing: false,
    errorIfExists: false,

    // Unset additional events because we're not forwarding them
    events: {},

    // Unset additional methods (like approximateSize) which we can't support here unless
    // the AbstractSublevel class is overridden by an implementation of `abstract-level`.
    additionalMethods: {},

    // Inherit manifest of custom AbstractSublevel subclass. Such a class is not
    // allowed to override encodings.
    ...manifest,

    encodings: {
      utf8: supportsEncoding(parent, 'utf8'),
      buffer: supportsEncoding(parent, 'buffer'),
      view: supportsEncoding(parent, 'view')
    }
  }
}

const supportsEncoding = function (parent, encoding) {
  // Prefer a non-transcoded encoding for optimal performance
  return parent.supports.encodings[encoding]
    ? parent.keyEncoding(encoding).name === encoding
    : false
}

class MultiFormat {
  constructor (key) {
    this.utf8 = key
    this.view = textEncoder.encode(key)
    this.buffer = Buffer ? Buffer.from(this.view.buffer, 0, this.view.byteLength) : {}
  }
}

class Unfixer {
  constructor () {
    this.cache = new Map()
  }

  get (prefixLength, keyFormat) {
    let unfix = this.cache.get(keyFormat)

    if (unfix === undefined) {
      if (keyFormat === 'view') {
        unfix = function (prefixLength, key) {
          // Avoid Uint8Array#slice() because it copies
          return key.subarray(prefixLength)
        }.bind(null, prefixLength)
      } else {
        unfix = function (prefixLength, key) {
          // Avoid Buffer#subarray() because it's slow
          return key.slice(prefixLength)
        }.bind(null, prefixLength)
      }

      this.cache.set(keyFormat, unfix)
    }

    return unfix
  }
}

const trim = function (str, char) {
  let start = 0
  let end = str.length

  while (start < end && str[start] === char) start++
  while (end > start && str[end - 1] === char) end--

  return str.slice(start, end)
}

},{"./abstract-sublevel-iterator":10,"buffer":2,"module-error":31}],12:[function(require,module,exports){
'use strict'

exports.getCallback = function (options, callback) {
  return typeof options === 'function' ? options : callback
}

exports.getOptions = function (options, def) {
  if (typeof options === 'object' && options !== null) {
    return options
  }

  if (def !== undefined) {
    return def
  }

  return {}
}

},{}],13:[function(require,module,exports){
'use strict'

const { AbstractChainedBatch } = require('../abstract-chained-batch')
const ModuleError = require('module-error')
const kEncoded = Symbol('encoded')

// Functional default for chained batch, with support of deferred open
class DefaultChainedBatch extends AbstractChainedBatch {
  constructor (db) {
    super(db)
    this[kEncoded] = []
  }

  _put (key, value, options) {
    this[kEncoded].push({ ...options, type: 'put', key, value })
  }

  _del (key, options) {
    this[kEncoded].push({ ...options, type: 'del', key })
  }

  _clear () {
    this[kEncoded] = []
  }

  // Assumes this[kEncoded] cannot change after write()
  _write (options, callback) {
    if (this.db.status === 'opening') {
      this.db.defer(() => this._write(options, callback))
    } else if (this.db.status === 'open') {
      if (this[kEncoded].length === 0) this.nextTick(callback)
      else this.db._batch(this[kEncoded], options, callback)
    } else {
      this.nextTick(callback, new ModuleError('Batch is not open: cannot call write() after write() or close()', {
        code: 'LEVEL_BATCH_NOT_OPEN'
      }))
    }
  }
}

exports.DefaultChainedBatch = DefaultChainedBatch

},{"../abstract-chained-batch":6,"module-error":31}],14:[function(require,module,exports){
'use strict'

const { AbstractKeyIterator, AbstractValueIterator } = require('../abstract-iterator')

const kIterator = Symbol('iterator')
const kCallback = Symbol('callback')
const kHandleOne = Symbol('handleOne')
const kHandleMany = Symbol('handleMany')

class DefaultKeyIterator extends AbstractKeyIterator {
  constructor (db, options) {
    super(db, options)

    this[kIterator] = db.iterator({ ...options, keys: true, values: false })
    this[kHandleOne] = this[kHandleOne].bind(this)
    this[kHandleMany] = this[kHandleMany].bind(this)
  }
}

class DefaultValueIterator extends AbstractValueIterator {
  constructor (db, options) {
    super(db, options)

    this[kIterator] = db.iterator({ ...options, keys: false, values: true })
    this[kHandleOne] = this[kHandleOne].bind(this)
    this[kHandleMany] = this[kHandleMany].bind(this)
  }
}

for (const Iterator of [DefaultKeyIterator, DefaultValueIterator]) {
  const keys = Iterator === DefaultKeyIterator
  const mapEntry = keys ? (entry) => entry[0] : (entry) => entry[1]

  Iterator.prototype._next = function (callback) {
    this[kCallback] = callback
    this[kIterator].next(this[kHandleOne])
  }

  Iterator.prototype[kHandleOne] = function (err, key, value) {
    const callback = this[kCallback]
    if (err) callback(err)
    else callback(null, keys ? key : value)
  }

  Iterator.prototype._nextv = function (size, options, callback) {
    this[kCallback] = callback
    this[kIterator].nextv(size, options, this[kHandleMany])
  }

  Iterator.prototype._all = function (options, callback) {
    this[kCallback] = callback
    this[kIterator].all(options, this[kHandleMany])
  }

  Iterator.prototype[kHandleMany] = function (err, entries) {
    const callback = this[kCallback]
    if (err) callback(err)
    else callback(null, entries.map(mapEntry))
  }

  Iterator.prototype._seek = function (target, options) {
    this[kIterator].seek(target, options)
  }

  Iterator.prototype._close = function (callback) {
    this[kIterator].close(callback)
  }
}

// Internal utilities, should be typed as AbstractKeyIterator and AbstractValueIterator
exports.DefaultKeyIterator = DefaultKeyIterator
exports.DefaultValueIterator = DefaultValueIterator

},{"../abstract-iterator":7}],15:[function(require,module,exports){
'use strict'

const { AbstractIterator, AbstractKeyIterator, AbstractValueIterator } = require('../abstract-iterator')
const ModuleError = require('module-error')

const kNut = Symbol('nut')
const kUndefer = Symbol('undefer')
const kFactory = Symbol('factory')

class DeferredIterator extends AbstractIterator {
  constructor (db, options) {
    super(db, options)

    this[kNut] = null
    this[kFactory] = () => db.iterator(options)

    this.db.defer(() => this[kUndefer]())
  }
}

class DeferredKeyIterator extends AbstractKeyIterator {
  constructor (db, options) {
    super(db, options)

    this[kNut] = null
    this[kFactory] = () => db.keys(options)

    this.db.defer(() => this[kUndefer]())
  }
}

class DeferredValueIterator extends AbstractValueIterator {
  constructor (db, options) {
    super(db, options)

    this[kNut] = null
    this[kFactory] = () => db.values(options)

    this.db.defer(() => this[kUndefer]())
  }
}

for (const Iterator of [DeferredIterator, DeferredKeyIterator, DeferredValueIterator]) {
  Iterator.prototype[kUndefer] = function () {
    if (this.db.status === 'open') {
      this[kNut] = this[kFactory]()
    }
  }

  Iterator.prototype._next = function (callback) {
    if (this[kNut] !== null) {
      this[kNut].next(callback)
    } else if (this.db.status === 'opening') {
      this.db.defer(() => this._next(callback))
    } else {
      this.nextTick(callback, new ModuleError('Iterator is not open: cannot call next() after close()', {
        code: 'LEVEL_ITERATOR_NOT_OPEN'
      }))
    }
  }

  Iterator.prototype._nextv = function (size, options, callback) {
    if (this[kNut] !== null) {
      this[kNut].nextv(size, options, callback)
    } else if (this.db.status === 'opening') {
      this.db.defer(() => this._nextv(size, options, callback))
    } else {
      this.nextTick(callback, new ModuleError('Iterator is not open: cannot call nextv() after close()', {
        code: 'LEVEL_ITERATOR_NOT_OPEN'
      }))
    }
  }

  Iterator.prototype._all = function (options, callback) {
    if (this[kNut] !== null) {
      this[kNut].all(callback)
    } else if (this.db.status === 'opening') {
      this.db.defer(() => this._all(options, callback))
    } else {
      this.nextTick(callback, new ModuleError('Iterator is not open: cannot call all() after close()', {
        code: 'LEVEL_ITERATOR_NOT_OPEN'
      }))
    }
  }

  Iterator.prototype._seek = function (target, options) {
    if (this[kNut] !== null) {
      // TODO: explain why we need _seek() rather than seek() here
      this[kNut]._seek(target, options)
    } else if (this.db.status === 'opening') {
      this.db.defer(() => this._seek(target, options))
    }
  }

  Iterator.prototype._close = function (callback) {
    if (this[kNut] !== null) {
      this[kNut].close(callback)
    } else if (this.db.status === 'opening') {
      this.db.defer(() => this._close(callback))
    } else {
      this.nextTick(callback)
    }
  }
}

exports.DeferredIterator = DeferredIterator
exports.DeferredKeyIterator = DeferredKeyIterator
exports.DeferredValueIterator = DeferredValueIterator

},{"../abstract-iterator":7,"module-error":31}],16:[function(require,module,exports){
'use strict'

const queueMicrotask = require('queue-microtask')

module.exports = function (fn, ...args) {
  if (args.length === 0) {
    queueMicrotask(fn)
  } else {
    queueMicrotask(() => fn(...args))
  }
}

},{"queue-microtask":32}],17:[function(require,module,exports){
'use strict'

const ModuleError = require('module-error')
const hasOwnProperty = Object.prototype.hasOwnProperty
const rangeOptions = new Set(['lt', 'lte', 'gt', 'gte'])

module.exports = function (options, keyEncoding) {
  const result = {}

  for (const k in options) {
    if (!hasOwnProperty.call(options, k)) continue
    if (k === 'keyEncoding' || k === 'valueEncoding') continue

    if (k === 'start' || k === 'end') {
      throw new ModuleError(`The legacy range option '${k}' has been removed`, {
        code: 'LEVEL_LEGACY'
      })
    } else if (k === 'encoding') {
      // To help migrating to abstract-level
      throw new ModuleError("The levelup-style 'encoding' alias has been removed, use 'valueEncoding' instead", {
        code: 'LEVEL_LEGACY'
      })
    }

    if (rangeOptions.has(k)) {
      // Note that we don't reject nullish and empty options here. While
      // those types are invalid as keys, they are valid as range options.
      result[k] = keyEncoding.encode(options[k])
    } else {
      result[k] = options[k]
    }
  }

  result.reverse = !!result.reverse
  result.limit = Number.isInteger(result.limit) && result.limit >= 0 ? result.limit : -1

  return result
}

},{"module-error":31}],18:[function(require,module,exports){
/* global indexedDB */

'use strict'

const { AbstractLevel } = require('abstract-level')
const ModuleError = require('module-error')
const parallel = require('run-parallel-limit')
const { fromCallback } = require('catering')
const { Iterator } = require('./iterator')
const deserialize = require('./util/deserialize')
const clear = require('./util/clear')
const createKeyRange = require('./util/key-range')

// Keep as-is for compatibility with existing level-js databases
const DEFAULT_PREFIX = 'level-js-'

const kIDB = Symbol('idb')
const kNamePrefix = Symbol('namePrefix')
const kLocation = Symbol('location')
const kVersion = Symbol('version')
const kStore = Symbol('store')
const kOnComplete = Symbol('onComplete')
const kPromise = Symbol('promise')

class BrowserLevel extends AbstractLevel {
  constructor (location, options, _) {
    // To help migrating to abstract-level
    if (typeof options === 'function' || typeof _ === 'function') {
      throw new ModuleError('The levelup-style callback argument has been removed', {
        code: 'LEVEL_LEGACY'
      })
    }

    const { prefix, version, ...forward } = options || {}

    super({
      encodings: { view: true },
      snapshots: false,
      createIfMissing: false,
      errorIfExists: false,
      seek: true
    }, forward)

    if (typeof location !== 'string') {
      throw new Error('constructor requires a location string argument')
    }

    // TODO (next major): remove default prefix
    this[kLocation] = location
    this[kNamePrefix] = prefix == null ? DEFAULT_PREFIX : prefix
    this[kVersion] = parseInt(version || 1, 10)
    this[kIDB] = null
  }

  get location () {
    return this[kLocation]
  }

  get namePrefix () {
    return this[kNamePrefix]
  }

  get version () {
    return this[kVersion]
  }

  // Exposed for backwards compat and unit tests
  get db () {
    return this[kIDB]
  }

  get type () {
    return 'browser-level'
  }

  _open (options, callback) {
    const req = indexedDB.open(this[kNamePrefix] + this[kLocation], this[kVersion])

    req.onerror = function () {
      callback(req.error || new Error('unknown error'))
    }

    req.onsuccess = () => {
      this[kIDB] = req.result
      callback()
    }

    req.onupgradeneeded = (ev) => {
      const db = ev.target.result

      if (!db.objectStoreNames.contains(this[kLocation])) {
        db.createObjectStore(this[kLocation])
      }
    }
  }

  [kStore] (mode) {
    const transaction = this[kIDB].transaction([this[kLocation]], mode)
    return transaction.objectStore(this[kLocation])
  }

  [kOnComplete] (request, callback) {
    const transaction = request.transaction

    // Take advantage of the fact that a non-canceled request error aborts
    // the transaction. I.e. no need to listen for "request.onerror".
    transaction.onabort = function () {
      callback(transaction.error || new Error('aborted by user'))
    }

    transaction.oncomplete = function () {
      callback(null, request.result)
    }
  }

  _get (key, options, callback) {
    const store = this[kStore]('readonly')
    let req

    try {
      req = store.get(key)
    } catch (err) {
      return this.nextTick(callback, err)
    }

    this[kOnComplete](req, function (err, value) {
      if (err) return callback(err)

      if (value === undefined) {
        return callback(new ModuleError('Entry not found', {
          code: 'LEVEL_NOT_FOUND'
        }))
      }

      callback(null, deserialize(value))
    })
  }

  _getMany (keys, options, callback) {
    const store = this[kStore]('readonly')
    const tasks = keys.map((key) => (next) => {
      let request

      try {
        request = store.get(key)
      } catch (err) {
        return next(err)
      }

      request.onsuccess = () => {
        const value = request.result
        next(null, value === undefined ? value : deserialize(value))
      }

      request.onerror = (ev) => {
        ev.stopPropagation()
        next(request.error)
      }
    })

    parallel(tasks, 16, callback)
  }

  _del (key, options, callback) {
    const store = this[kStore]('readwrite')
    let req

    try {
      req = store.delete(key)
    } catch (err) {
      return this.nextTick(callback, err)
    }

    this[kOnComplete](req, callback)
  }

  _put (key, value, options, callback) {
    const store = this[kStore]('readwrite')
    let req

    try {
      // Will throw a DataError or DataCloneError if the environment
      // does not support serializing the key or value respectively.
      req = store.put(value, key)
    } catch (err) {
      return this.nextTick(callback, err)
    }

    this[kOnComplete](req, callback)
  }

  // TODO: implement key and value iterators
  _iterator (options) {
    return new Iterator(this, this[kLocation], options)
  }

  _batch (operations, options, callback) {
    const store = this[kStore]('readwrite')
    const transaction = store.transaction
    let index = 0
    let error

    transaction.onabort = function () {
      callback(error || transaction.error || new Error('aborted by user'))
    }

    transaction.oncomplete = function () {
      callback()
    }

    // Wait for a request to complete before making the next, saving CPU.
    function loop () {
      const op = operations[index++]
      const key = op.key

      let req

      try {
        req = op.type === 'del' ? store.delete(key) : store.put(op.value, key)
      } catch (err) {
        error = err
        transaction.abort()
        return
      }

      if (index < operations.length) {
        req.onsuccess = loop
      } else if (typeof transaction.commit === 'function') {
        // Commit now instead of waiting for auto-commit
        transaction.commit()
      }
    }

    loop()
  }

  _clear (options, callback) {
    let keyRange
    let req

    try {
      keyRange = createKeyRange(options)
    } catch (e) {
      // The lower key is greater than the upper key.
      // IndexedDB throws an error, but we'll just do nothing.
      return this.nextTick(callback)
    }

    if (options.limit >= 0) {
      // IDBObjectStore#delete(range) doesn't have such an option.
      // Fall back to cursor-based implementation.
      return clear(this, this[kLocation], keyRange, options, callback)
    }

    try {
      const store = this[kStore]('readwrite')
      req = keyRange ? store.delete(keyRange) : store.clear()
    } catch (err) {
      return this.nextTick(callback, err)
    }

    this[kOnComplete](req, callback)
  }

  _close (callback) {
    this[kIDB].close()
    this.nextTick(callback)
  }
}

BrowserLevel.destroy = function (location, prefix, callback) {
  if (typeof prefix === 'function') {
    callback = prefix
    prefix = DEFAULT_PREFIX
  }

  callback = fromCallback(callback, kPromise)
  const request = indexedDB.deleteDatabase(prefix + location)

  request.onsuccess = function () {
    callback()
  }

  request.onerror = function (err) {
    callback(err)
  }

  return callback[kPromise]
}

exports.BrowserLevel = BrowserLevel

},{"./iterator":19,"./util/clear":20,"./util/deserialize":21,"./util/key-range":22,"abstract-level":9,"catering":23,"module-error":31,"run-parallel-limit":33}],19:[function(require,module,exports){
'use strict'

const { AbstractIterator } = require('abstract-level')
const createKeyRange = require('./util/key-range')
const deserialize = require('./util/deserialize')

const kCache = Symbol('cache')
const kFinished = Symbol('finished')
const kOptions = Symbol('options')
const kCurrentOptions = Symbol('currentOptions')
const kPosition = Symbol('position')
const kLocation = Symbol('location')
const kFirst = Symbol('first')
const emptyOptions = {}

class Iterator extends AbstractIterator {
  constructor (db, location, options) {
    super(db, options)

    this[kCache] = []
    this[kFinished] = this.limit === 0
    this[kOptions] = options
    this[kCurrentOptions] = { ...options }
    this[kPosition] = undefined
    this[kLocation] = location
    this[kFirst] = true
  }

  // Note: if called by _all() then size can be Infinity. This is an internal
  // detail; by design AbstractIterator.nextv() does not support Infinity.
  _nextv (size, options, callback) {
    this[kFirst] = false

    if (this[kFinished]) {
      return this.nextTick(callback, null, [])
    } else if (this[kCache].length > 0) {
      // TODO: mixing next and nextv is not covered by test suite
      size = Math.min(size, this[kCache].length)
      return this.nextTick(callback, null, this[kCache].splice(0, size))
    }

    // Adjust range by what we already visited
    if (this[kPosition] !== undefined) {
      if (this[kOptions].reverse) {
        this[kCurrentOptions].lt = this[kPosition]
        this[kCurrentOptions].lte = undefined
      } else {
        this[kCurrentOptions].gt = this[kPosition]
        this[kCurrentOptions].gte = undefined
      }
    }

    let keyRange

    try {
      keyRange = createKeyRange(this[kCurrentOptions])
    } catch (_) {
      // The lower key is greater than the upper key.
      // IndexedDB throws an error, but we'll just return 0 results.
      this[kFinished] = true
      return this.nextTick(callback, null, [])
    }

    const transaction = this.db.db.transaction([this[kLocation]], 'readonly')
    const store = transaction.objectStore(this[kLocation])
    const entries = []

    if (!this[kOptions].reverse) {
      let keys
      let values

      const complete = () => {
        // Wait for both requests to complete
        if (keys === undefined || values === undefined) return

        const length = Math.max(keys.length, values.length)

        if (length === 0 || size === Infinity) {
          this[kFinished] = true
        } else {
          this[kPosition] = keys[length - 1]
        }

        // Resize
        entries.length = length

        // Merge keys and values
        for (let i = 0; i < length; i++) {
          const key = keys[i]
          const value = values[i]

          entries[i] = [
            this[kOptions].keys && key !== undefined ? deserialize(key) : undefined,
            this[kOptions].values && value !== undefined ? deserialize(value) : undefined
          ]
        }

        maybeCommit(transaction)
      }

      // If keys were not requested and size is Infinity, we don't have to keep
      // track of position and can thus skip getting keys.
      if (this[kOptions].keys || size < Infinity) {
        store.getAllKeys(keyRange, size < Infinity ? size : undefined).onsuccess = (ev) => {
          keys = ev.target.result
          complete()
        }
      } else {
        keys = []
        this.nextTick(complete)
      }

      if (this[kOptions].values) {
        store.getAll(keyRange, size < Infinity ? size : undefined).onsuccess = (ev) => {
          values = ev.target.result
          complete()
        }
      } else {
        values = []
        this.nextTick(complete)
      }
    } else {
      // Can't use getAll() in reverse, so use a slower cursor that yields one item at a time
      // TODO: test if all target browsers support openKeyCursor
      const method = !this[kOptions].values && store.openKeyCursor ? 'openKeyCursor' : 'openCursor'

      store[method](keyRange, 'prev').onsuccess = (ev) => {
        const cursor = ev.target.result

        if (cursor) {
          const { key, value } = cursor
          this[kPosition] = key

          entries.push([
            this[kOptions].keys && key !== undefined ? deserialize(key) : undefined,
            this[kOptions].values && value !== undefined ? deserialize(value) : undefined
          ])

          if (entries.length < size) {
            cursor.continue()
          } else {
            maybeCommit(transaction)
          }
        } else {
          this[kFinished] = true
        }
      }
    }

    // If an error occurs (on the request), the transaction will abort.
    transaction.onabort = () => {
      callback(transaction.error || new Error('aborted by user'))
      callback = null
    }

    transaction.oncomplete = () => {
      callback(null, entries)
      callback = null
    }
  }

  _next (callback) {
    if (this[kCache].length > 0) {
      const [key, value] = this[kCache].shift()
      this.nextTick(callback, null, key, value)
    } else if (this[kFinished]) {
      this.nextTick(callback)
    } else {
      let size = Math.min(100, this.limit - this.count)

      if (this[kFirst]) {
        // It's common to only want one entry initially or after a seek()
        this[kFirst] = false
        size = 1
      }

      this._nextv(size, emptyOptions, (err, entries) => {
        if (err) return callback(err)
        this[kCache] = entries
        this._next(callback)
      })
    }
  }

  _all (options, callback) {
    this[kFirst] = false

    // TODO: mixing next and all is not covered by test suite
    const cache = this[kCache].splice(0, this[kCache].length)
    const size = this.limit - this.count - cache.length

    if (size <= 0) {
      return this.nextTick(callback, null, cache)
    }

    this._nextv(size, emptyOptions, (err, entries) => {
      if (err) return callback(err)
      if (cache.length > 0) entries = cache.concat(entries)
      callback(null, entries)
    })
  }

  _seek (target, options) {
    this[kFirst] = true
    this[kCache] = []
    this[kFinished] = false
    this[kPosition] = undefined

    // TODO: not covered by test suite
    this[kCurrentOptions] = { ...this[kOptions] }

    let keyRange

    try {
      keyRange = createKeyRange(this[kOptions])
    } catch (_) {
      this[kFinished] = true
      return
    }

    if (keyRange !== null && !keyRange.includes(target)) {
      this[kFinished] = true
    } else if (this[kOptions].reverse) {
      this[kCurrentOptions].lte = target
    } else {
      this[kCurrentOptions].gte = target
    }
  }
}

exports.Iterator = Iterator

function maybeCommit (transaction) {
  // Commit (meaning close) now instead of waiting for auto-commit
  if (typeof transaction.commit === 'function') {
    transaction.commit()
  }
}

},{"./util/deserialize":21,"./util/key-range":22,"abstract-level":9}],20:[function(require,module,exports){
'use strict'

module.exports = function clear (db, location, keyRange, options, callback) {
  if (options.limit === 0) return db.nextTick(callback)

  const transaction = db.db.transaction([location], 'readwrite')
  const store = transaction.objectStore(location)
  let count = 0

  transaction.oncomplete = function () {
    callback()
  }

  transaction.onabort = function () {
    callback(transaction.error || new Error('aborted by user'))
  }

  // A key cursor is faster (skips reading values) but not supported by IE
  // TODO: we no longer support IE. Test others
  const method = store.openKeyCursor ? 'openKeyCursor' : 'openCursor'
  const direction = options.reverse ? 'prev' : 'next'

  store[method](keyRange, direction).onsuccess = function (ev) {
    const cursor = ev.target.result

    if (cursor) {
      // Wait for a request to complete before continuing, saving CPU.
      store.delete(cursor.key).onsuccess = function () {
        if (options.limit <= 0 || ++count < options.limit) {
          cursor.continue()
        }
      }
    }
  }
}

},{}],21:[function(require,module,exports){
'use strict'

const textEncoder = new TextEncoder()

module.exports = function (data) {
  if (data instanceof Uint8Array) {
    return data
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data)
  } else {
    // Non-binary data stored with an old version (level-js < 5.0.0)
    return textEncoder.encode(data)
  }
}

},{}],22:[function(require,module,exports){
/* global IDBKeyRange */

'use strict'

module.exports = function createKeyRange (options) {
  const lower = options.gte !== undefined ? options.gte : options.gt !== undefined ? options.gt : undefined
  const upper = options.lte !== undefined ? options.lte : options.lt !== undefined ? options.lt : undefined
  const lowerExclusive = options.gte === undefined
  const upperExclusive = options.lte === undefined

  if (lower !== undefined && upper !== undefined) {
    return IDBKeyRange.bound(lower, upper, lowerExclusive, upperExclusive)
  } else if (lower !== undefined) {
    return IDBKeyRange.lowerBound(lower, lowerExclusive)
  } else if (upper !== undefined) {
    return IDBKeyRange.upperBound(upper, upperExclusive)
  } else {
    return null
  }
}

},{}],23:[function(require,module,exports){
'use strict'

var nextTick = require('./next-tick')

exports.fromCallback = function (callback, symbol) {
  if (callback === undefined) {
    var promise = new Promise(function (resolve, reject) {
      callback = function (err, res) {
        if (err) reject(err)
        else resolve(res)
      }
    })

    callback[symbol !== undefined ? symbol : 'promise'] = promise
  } else if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function')
  }

  return callback
}

exports.fromPromise = function (promise, callback) {
  if (callback === undefined) return promise

  promise
    .then(function (res) { nextTick(() => callback(null, res)) })
    .catch(function (err) { nextTick(() => callback(err)) })
}

},{"./next-tick":24}],24:[function(require,module,exports){
module.exports = typeof queueMicrotask === 'function' ? queueMicrotask : (fn) => Promise.resolve().then(fn)

},{}],25:[function(require,module,exports){
'use strict'

exports.supports = function supports (...manifests) {
  const manifest = manifests.reduce((acc, m) => Object.assign(acc, m), {})

  return Object.assign(manifest, {
    snapshots: manifest.snapshots || false,
    permanence: manifest.permanence || false,
    seek: manifest.seek || false,
    clear: manifest.clear || false,
    getMany: manifest.getMany || false,
    keyIterator: manifest.keyIterator || false,
    valueIterator: manifest.valueIterator || false,
    iteratorNextv: manifest.iteratorNextv || false,
    iteratorAll: manifest.iteratorAll || false,
    status: manifest.status || false,
    createIfMissing: manifest.createIfMissing || false,
    errorIfExists: manifest.errorIfExists || false,
    deferredOpen: manifest.deferredOpen || false,
    promises: manifest.promises || false,
    streams: manifest.streams || false,
    encodings: Object.assign({}, manifest.encodings),
    events: Object.assign({}, manifest.events),
    additionalMethods: Object.assign({}, manifest.additionalMethods)
  })
}

},{}],26:[function(require,module,exports){
'use strict'

const ModuleError = require('module-error')
const encodings = require('./lib/encodings')
const { Encoding } = require('./lib/encoding')
const { BufferFormat, ViewFormat, UTF8Format } = require('./lib/formats')

const kFormats = Symbol('formats')
const kEncodings = Symbol('encodings')
const validFormats = new Set(['buffer', 'view', 'utf8'])

/** @template T */
class Transcoder {
  /**
   * @param {Array<'buffer'|'view'|'utf8'>} formats
   */
  constructor (formats) {
    if (!Array.isArray(formats)) {
      throw new TypeError("The first argument 'formats' must be an array")
    } else if (!formats.every(f => validFormats.has(f))) {
      // Note: we only only support aliases in key- and valueEncoding options (where we already did)
      throw new TypeError("Format must be one of 'buffer', 'view', 'utf8'")
    }

    /** @type {Map<string|MixedEncoding<any, any, any>, Encoding<any, any, any>>} */
    this[kEncodings] = new Map()
    this[kFormats] = new Set(formats)

    // Register encodings (done early in order to populate encodings())
    for (const k in encodings) {
      try {
        this.encoding(k)
      } catch (err) {
        /* istanbul ignore if: assertion */
        if (err.code !== 'LEVEL_ENCODING_NOT_SUPPORTED') throw err
      }
    }
  }

  /**
   * @returns {Array<Encoding<any,T,any>>}
   */
  encodings () {
    return Array.from(new Set(this[kEncodings].values()))
  }

  /**
   * @param {string|MixedEncoding<any, any, any>} encoding
   * @returns {Encoding<any, T, any>}
   */
  encoding (encoding) {
    let resolved = this[kEncodings].get(encoding)

    if (resolved === undefined) {
      if (typeof encoding === 'string' && encoding !== '') {
        resolved = lookup[encoding]

        if (!resolved) {
          throw new ModuleError(`Encoding '${encoding}' is not found`, {
            code: 'LEVEL_ENCODING_NOT_FOUND'
          })
        }
      } else if (typeof encoding !== 'object' || encoding === null) {
        throw new TypeError("First argument 'encoding' must be a string or object")
      } else {
        resolved = from(encoding)
      }

      const { name, format } = resolved

      if (!this[kFormats].has(format)) {
        if (this[kFormats].has('view')) {
          resolved = resolved.createViewTranscoder()
        } else if (this[kFormats].has('buffer')) {
          resolved = resolved.createBufferTranscoder()
        } else if (this[kFormats].has('utf8')) {
          resolved = resolved.createUTF8Transcoder()
        } else {
          throw new ModuleError(`Encoding '${name}' cannot be transcoded`, {
            code: 'LEVEL_ENCODING_NOT_SUPPORTED'
          })
        }
      }

      for (const k of [encoding, name, resolved.name, resolved.commonName]) {
        this[kEncodings].set(k, resolved)
      }
    }

    return resolved
  }
}

exports.Transcoder = Transcoder

/**
 * @param {MixedEncoding<any, any, any>} options
 * @returns {Encoding<any, any, any>}
 */
function from (options) {
  if (options instanceof Encoding) {
    return options
  }

  // Loosely typed for ecosystem compatibility
  const maybeType = 'type' in options && typeof options.type === 'string' ? options.type : undefined
  const name = options.name || maybeType || `anonymous-${anonymousCount++}`

  switch (detectFormat(options)) {
    case 'view': return new ViewFormat({ ...options, name })
    case 'utf8': return new UTF8Format({ ...options, name })
    case 'buffer': return new BufferFormat({ ...options, name })
    default: {
      throw new TypeError("Format must be one of 'buffer', 'view', 'utf8'")
    }
  }
}

/**
 * If format is not provided, fallback to detecting `level-codec`
 * or `multiformats` encodings, else assume a format of buffer.
 * @param {MixedEncoding<any, any, any>} options
 * @returns {string}
 */
function detectFormat (options) {
  if ('format' in options && options.format !== undefined) {
    return options.format
  } else if ('buffer' in options && typeof options.buffer === 'boolean') {
    return options.buffer ? 'buffer' : 'utf8' // level-codec
  } else if ('code' in options && Number.isInteger(options.code)) {
    return 'view' // multiformats
  } else {
    return 'buffer'
  }
}

/**
 * @typedef {import('./lib/encoding').MixedEncoding<TIn,TFormat,TOut>} MixedEncoding
 * @template TIn, TFormat, TOut
 */

/**
 * @type {Object.<string, Encoding<any, any, any>>}
 */
const aliases = {
  binary: encodings.buffer,
  'utf-8': encodings.utf8
}

/**
 * @type {Object.<string, Encoding<any, any, any>>}
 */
const lookup = {
  ...encodings,
  ...aliases
}

let anonymousCount = 0

},{"./lib/encoding":27,"./lib/encodings":28,"./lib/formats":29,"module-error":31}],27:[function(require,module,exports){
'use strict'

const ModuleError = require('module-error')
const formats = new Set(['buffer', 'view', 'utf8'])

/**
 * @template TIn, TFormat, TOut
 * @abstract
 */
class Encoding {
  /**
   * @param {IEncoding<TIn,TFormat,TOut>} options
   */
  constructor (options) {
    /** @type {(data: TIn) => TFormat} */
    this.encode = options.encode || this.encode

    /** @type {(data: TFormat) => TOut} */
    this.decode = options.decode || this.decode

    /** @type {string} */
    this.name = options.name || this.name

    /** @type {string} */
    this.format = options.format || this.format

    if (typeof this.encode !== 'function') {
      throw new TypeError("The 'encode' property must be a function")
    }

    if (typeof this.decode !== 'function') {
      throw new TypeError("The 'decode' property must be a function")
    }

    this.encode = this.encode.bind(this)
    this.decode = this.decode.bind(this)

    if (typeof this.name !== 'string' || this.name === '') {
      throw new TypeError("The 'name' property must be a string")
    }

    if (typeof this.format !== 'string' || !formats.has(this.format)) {
      throw new TypeError("The 'format' property must be one of 'buffer', 'view', 'utf8'")
    }

    if (options.createViewTranscoder) {
      this.createViewTranscoder = options.createViewTranscoder
    }

    if (options.createBufferTranscoder) {
      this.createBufferTranscoder = options.createBufferTranscoder
    }

    if (options.createUTF8Transcoder) {
      this.createUTF8Transcoder = options.createUTF8Transcoder
    }
  }

  get commonName () {
    return /** @type {string} */ (this.name.split('+')[0])
  }

  /** @return {BufferFormat<TIn,TOut>} */
  createBufferTranscoder () {
    throw new ModuleError(`Encoding '${this.name}' cannot be transcoded to 'buffer'`, {
      code: 'LEVEL_ENCODING_NOT_SUPPORTED'
    })
  }

  /** @return {ViewFormat<TIn,TOut>} */
  createViewTranscoder () {
    throw new ModuleError(`Encoding '${this.name}' cannot be transcoded to 'view'`, {
      code: 'LEVEL_ENCODING_NOT_SUPPORTED'
    })
  }

  /** @return {UTF8Format<TIn,TOut>} */
  createUTF8Transcoder () {
    throw new ModuleError(`Encoding '${this.name}' cannot be transcoded to 'utf8'`, {
      code: 'LEVEL_ENCODING_NOT_SUPPORTED'
    })
  }
}

exports.Encoding = Encoding

/**
 * @typedef {import('./encoding').IEncoding<TIn,TFormat,TOut>} IEncoding
 * @template TIn, TFormat, TOut
 */

/**
 * @typedef {import('./formats').BufferFormat<TIn,TOut>} BufferFormat
 * @template TIn, TOut
 */

/**
 * @typedef {import('./formats').ViewFormat<TIn,TOut>} ViewFormat
 * @template TIn, TOut
 */

/**
 * @typedef {import('./formats').UTF8Format<TIn,TOut>} UTF8Format
 * @template TIn, TOut
 */

},{"module-error":31}],28:[function(require,module,exports){
'use strict'

const { Buffer } = require('buffer') || { Buffer: { isBuffer: () => false } }
const { textEncoder, textDecoder } = require('./text-endec')()
const { BufferFormat, ViewFormat, UTF8Format } = require('./formats')

/** @type {<T>(v: T) => v} */
const identity = (v) => v

/**
 * @type {typeof import('./encodings').utf8}
 */
exports.utf8 = new UTF8Format({
  encode: function (data) {
    // On node 16.9.1 buffer.toString() is 5x faster than TextDecoder
    return Buffer.isBuffer(data)
      ? data.toString('utf8')
      : ArrayBuffer.isView(data)
        ? textDecoder.decode(data)
        : String(data)
  },
  decode: identity,
  name: 'utf8',
  createViewTranscoder () {
    return new ViewFormat({
      encode: function (data) {
        return ArrayBuffer.isView(data) ? data : textEncoder.encode(data)
      },
      decode: function (data) {
        return textDecoder.decode(data)
      },
      name: `${this.name}+view`
    })
  },
  createBufferTranscoder () {
    return new BufferFormat({
      encode: function (data) {
        return Buffer.isBuffer(data)
          ? data
          : ArrayBuffer.isView(data)
            ? Buffer.from(data.buffer, data.byteOffset, data.byteLength)
            : Buffer.from(String(data), 'utf8')
      },
      decode: function (data) {
        return data.toString('utf8')
      },
      name: `${this.name}+buffer`
    })
  }
})

/**
 * @type {typeof import('./encodings').json}
 */
exports.json = new UTF8Format({
  encode: JSON.stringify,
  decode: JSON.parse,
  name: 'json'
})

/**
 * @type {typeof import('./encodings').buffer}
 */
exports.buffer = new BufferFormat({
  encode: function (data) {
    return Buffer.isBuffer(data)
      ? data
      : ArrayBuffer.isView(data)
        ? Buffer.from(data.buffer, data.byteOffset, data.byteLength)
        : Buffer.from(String(data), 'utf8')
  },
  decode: identity,
  name: 'buffer',
  createViewTranscoder () {
    return new ViewFormat({
      encode: function (data) {
        return ArrayBuffer.isView(data) ? data : Buffer.from(String(data), 'utf8')
      },
      decode: function (data) {
        return Buffer.from(data.buffer, data.byteOffset, data.byteLength)
      },
      name: `${this.name}+view`
    })
  }
})

/**
 * @type {typeof import('./encodings').view}
 */
exports.view = new ViewFormat({
  encode: function (data) {
    return ArrayBuffer.isView(data) ? data : textEncoder.encode(data)
  },
  decode: identity,
  name: 'view',
  createBufferTranscoder () {
    return new BufferFormat({
      encode: function (data) {
        return Buffer.isBuffer(data)
          ? data
          : ArrayBuffer.isView(data)
            ? Buffer.from(data.buffer, data.byteOffset, data.byteLength)
            : Buffer.from(String(data), 'utf8')
      },
      decode: identity,
      name: `${this.name}+buffer`
    })
  }
})

/**
 * @type {typeof import('./encodings').hex}
 */
exports.hex = new BufferFormat({
  encode: function (data) {
    return Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'hex')
  },
  decode: function (buffer) {
    return buffer.toString('hex')
  },
  name: 'hex'
})

/**
 * @type {typeof import('./encodings').base64}
 */
exports.base64 = new BufferFormat({
  encode: function (data) {
    return Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'base64')
  },
  decode: function (buffer) {
    return buffer.toString('base64')
  },
  name: 'base64'
})

},{"./formats":29,"./text-endec":30,"buffer":2}],29:[function(require,module,exports){
'use strict'

const { Buffer } = require('buffer') || {}
const { Encoding } = require('./encoding')
const textEndec = require('./text-endec')

/**
 * @template TIn, TOut
 * @extends {Encoding<TIn,Buffer,TOut>}
 */
class BufferFormat extends Encoding {
  /**
   * @param {Omit<IEncoding<TIn, Buffer, TOut>, 'format'>} options
   */
  constructor (options) {
    super({ ...options, format: 'buffer' })
  }

  /** @override */
  createViewTranscoder () {
    return new ViewFormat({
      encode: this.encode, // Buffer is a view (UInt8Array)
      decode: (data) => this.decode(
        Buffer.from(data.buffer, data.byteOffset, data.byteLength)
      ),
      name: `${this.name}+view`
    })
  }

  /** @override */
  createBufferTranscoder () {
    return this
  }
}

/**
 * @extends {Encoding<TIn,Uint8Array,TOut>}
 * @template TIn, TOut
 */
class ViewFormat extends Encoding {
  /**
   * @param {Omit<IEncoding<TIn, Uint8Array, TOut>, 'format'>} options
   */
  constructor (options) {
    super({ ...options, format: 'view' })
  }

  /** @override */
  createBufferTranscoder () {
    return new BufferFormat({
      encode: (data) => {
        const view = this.encode(data)
        return Buffer.from(view.buffer, view.byteOffset, view.byteLength)
      },
      decode: this.decode, // Buffer is a view (UInt8Array)
      name: `${this.name}+buffer`
    })
  }

  /** @override */
  createViewTranscoder () {
    return this
  }
}

/**
 * @extends {Encoding<TIn,string,TOut>}
 * @template TIn, TOut
 */
class UTF8Format extends Encoding {
  /**
   * @param {Omit<IEncoding<TIn, string, TOut>, 'format'>} options
   */
  constructor (options) {
    super({ ...options, format: 'utf8' })
  }

  /** @override */
  createBufferTranscoder () {
    return new BufferFormat({
      encode: (data) => Buffer.from(this.encode(data), 'utf8'),
      decode: (data) => this.decode(data.toString('utf8')),
      name: `${this.name}+buffer`
    })
  }

  /** @override */
  createViewTranscoder () {
    const { textEncoder, textDecoder } = textEndec()

    return new ViewFormat({
      encode: (data) => textEncoder.encode(this.encode(data)),
      decode: (data) => this.decode(textDecoder.decode(data)),
      name: `${this.name}+view`
    })
  }

  /** @override */
  createUTF8Transcoder () {
    return this
  }
}

exports.BufferFormat = BufferFormat
exports.ViewFormat = ViewFormat
exports.UTF8Format = UTF8Format

/**
 * @typedef {import('./encoding').IEncoding<TIn,TFormat,TOut>} IEncoding
 * @template TIn, TFormat, TOut
 */

},{"./encoding":27,"./text-endec":30,"buffer":2}],30:[function(require,module,exports){
'use strict'

/** @type {{ textEncoder: TextEncoder, textDecoder: TextDecoder }|null} */
let lazy = null

/**
 * Get semi-global instances of TextEncoder and TextDecoder.
 * @returns {{ textEncoder: TextEncoder, textDecoder: TextDecoder }}
 */
module.exports = function () {
  if (lazy === null) {
    lazy = {
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    }
  }

  return lazy
}

},{}],31:[function(require,module,exports){
'use strict'

module.exports = class ModuleError extends Error {
  /**
   * @param {string} message Error message
   * @param {{ code?: string, cause?: Error, expected?: boolean, transient?: boolean }} [options]
   */
  constructor (message, options) {
    super(message || '')

    if (typeof options === 'object' && options !== null) {
      if (options.code) this.code = String(options.code)
      if (options.expected) this.expected = true
      if (options.transient) this.transient = true
      if (options.cause) this.cause = options.cause
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

},{}],32:[function(require,module,exports){
(function (global){(function (){
/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let promise

module.exports = typeof queueMicrotask === 'function'
  ? queueMicrotask.bind(typeof window !== 'undefined' ? window : global)
  // reuse resolved promise, and allocate it lazily
  : cb => (promise || (promise = Promise.resolve()))
    .then(cb)
    .catch(err => setTimeout(() => { throw err }, 0))

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
/*! run-parallel-limit. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
module.exports = runParallelLimit

const queueMicrotask = require('queue-microtask')

function runParallelLimit (tasks, limit, cb) {
  if (typeof limit !== 'number') throw new Error('second argument must be a Number')
  let results, len, pending, keys, isErrored
  let isSync = true
  let next

  if (Array.isArray(tasks)) {
    results = []
    pending = len = tasks.length
  } else {
    keys = Object.keys(tasks)
    results = {}
    pending = len = keys.length
  }

  function done (err) {
    function end () {
      if (cb) cb(err, results)
      cb = null
    }
    if (isSync) queueMicrotask(end)
    else end()
  }

  function each (i, err, result) {
    results[i] = result
    if (err) isErrored = true
    if (--pending === 0 || err) {
      done(err)
    } else if (!isErrored && next < len) {
      let key
      if (keys) {
        key = keys[next]
        next += 1
        tasks[key](function (err, result) { each(key, err, result) })
      } else {
        key = next
        next += 1
        tasks[key](function (err, result) { each(key, err, result) })
      }
    }
  }

  next = limit
  if (!pending) {
    // empty
    done(null)
  } else if (keys) {
    // object
    keys.some(function (key, i) {
      tasks[key](function (err, result) { each(key, err, result) })
      if (i === limit - 1) return true // early return
      return false
    })
  } else {
    // array
    tasks.some(function (task, i) {
      task(function (err, result) { each(i, err, result) })
      if (i === limit - 1) return true // early return
      return false
    })
  }

  isSync = false
}

},{"queue-microtask":32}]},{},[5])(5)
});
