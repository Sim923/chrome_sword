
class BingParser
{
    
    static isBingSearchPage(url)
    {
        return url.includes('.bing.');
    }
    
    static getLastClickedURL(cb)
    {
        chrome.storage.local.get({
            bingLastClickedURL: null,
            additionalData: {}
        }, function(r){
            cb(r.bingLastClickedURL, r.additionalData);
        });
    }
    
    static setLastClickedURL(url, additionalData, cb)
    {
        chrome.storage.local.set({
            bingLastClickedURL: url,
            additionalData: additionalData
        }, cb);
    }
    
}