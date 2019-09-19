
class GoogleParser
{
    
    static isGoogleSearchPage(url)
    {
        return url.includes('.google.');
    }
    
    static getLastClickedURL(cb)
    {
        chrome.storage.local.get({
            googleLastClickedURL: null,
            additionalData: {}
        }, function(r){
            cb(r.googleLastClickedURL, r.additionalData);
        });
    }
    
    static setLastClickedURL(url, additionalData, cb)
    {
        chrome.storage.local.set({
            googleLastClickedURL: url,
            additionalData: additionalData
        }, cb);
    }
    
}