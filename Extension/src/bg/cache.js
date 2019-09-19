var Cache = function () {

    var cache_ = {};

    this.set = function (url, isExpanded, result)
    {
        // always set cleaned url (to avoid hashes and stuff)
        url = cleanURL(url);
        
        cache_[url] = {
            isExpanded: isExpanded,
            result: result
        };
    }

    this.get = function (url) {
        
        // always get cleaned url (to avoid hashes and stuff)
        url = cleanURL(url);
        
        if (cache_.hasOwnProperty(url))
        {
            return cache_[url];
        }
        return false;
    }
    
    function cleanURL(url)
    {
        return cleanLinkedInURL(url);
    }
}