// Wraps a pointer
function Ptr(orig, offset, convention) {
    // Make sure it is using "new"
    if (!(this instanceof Ptr)) {
        return new Ptr(orig, offset, convention);
    }

    if (orig instanceof Ptr || orig instanceof Duktape.Pointer) {
        orig = orig.value;
    }

    // Save address
    this.address = orig;
    this.offset = offset || 0;

    // If no convention has been specified or AUTO was used
    this.convention = convention >= 0 ? convention : (
        ptrSize == 4 ? CallConvention.CDECLCALL : CallConvention.FASTCALL);
};

// Conversions
var unsigned = function(x) { return x >>> 0; }
var uint8 = function(x) { return unsigned(x) & 0xFF; }
var uint16 = function(x) { return unsigned(x) & 0xFFFF; }
var uint32 = function(x) { return unsigned(x) & 0xFFFFFFFF; }
var char = function(x) { return String.fromCharCode(uint8(x)); }


// General
String.prototype.charCodeAt = function(idx) {
    return cpp_charCodeAt(this, idx);
}


// Override methods on Ptr
Ptr.prototype.get = function() {
    if (typeof this.address == "string") {
        alert("Trying to use get() on a string Ptr");
    }
    return this.address + this.offset;
};


// Override methods on Pointer
Object.defineProperty(Duktape.Pointer.prototype, 'address', {
    get: function() { return this.valueOf(); }
});

Object.defineProperty(Duktape.Pointer.prototype, 'offset', {
    get: function() { return 0; }
});

Duktape.Pointer.prototype.get = function() {
    if (this.toString() == "null") {
        return 0;
    }
    return parseInt(this.valueOf(), 16);
};


// Common
Duktape.Pointer.prototype.string = Ptr.prototype.string = function(len) {
    if (len) {
        return cpp_readString(this.address, this.offset, len);
    }
    return cpp_readString(this.address, this.offset);
};

Duktape.Pointer.prototype.read = Ptr.prototype.read = function(offset) {
    return cpp_readMemory(this.address, offset || this.offset);
};

var valueProp = {
    get: function() { return cpp_readMemory(this.address, this.offset); },
    set: function(newValue) { cpp_writeMemory(this.address, this.offset, newValue); }
};
Object.defineProperty(Ptr.prototype, 'value', valueProp);
Object.defineProperty(Duktape.Pointer.prototype, 'value', valueProp);
