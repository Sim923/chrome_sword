class TokenHandler {
    // Gets token from local storage
    static getToken(cb) {
        chrome.storage.local.get({ token: '' }, function (r) {
            cb(r.token);
        });
    }

    // Saves token to local storage
    static setToken(token, cb) {
        // for safety purpose verified if token is object just replace it with emtpy string.
        if (typeof token === 'object') {
            token = '';
        }

        chrome.storage.local.set({ token: token }, cb);
    }
}