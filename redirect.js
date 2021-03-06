// Redirect a function
var Redirect = function(orig, callback, identifier) {
    // Identifier defaults to a random string
    identifier = identifier || Math.random().toString(32);

    // Default to CDECL
    var convention = CallConvention.CDECLCALL;

    // Defer to the bare address
    if (orig instanceof Find || orig instanceof Ptr) {
        orig = orig.address;
        convention = orig.convention;
    }

    // Create the redirection
    var redirect = new cpp_redirect();
    redirect.init(orig, callback.length, identifier, convention, callback.bind(redirect));

    // Save it
    Redirect.active.push(redirect);

    return redirect;
};

Redirect.active = [];
Redirect.restoreAll = function() {
    Redirect.active.forEach(function(r) { r.restore(); });
    Redirect.active = [];
};
