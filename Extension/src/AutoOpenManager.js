class AutoOpenManager
{
    
    static set(val, cb)
    {
        chrome.storage.local.set({
            autoopen: val
        }, ()=>{
            if(typeof cb == 'function')
            {
                cb();
            }
        });
    }
    
    static get(cb)
    {
        chrome.storage.local.get({
            autoopen: true
        }, function (r) {
            cb(r.autoopen);
        });
    }
    
    static shouldOpen = function(url, cb)
    {
        AutoOpenManager.get((autoopen)=>{
            cb(autoopen && !AutoOpenManager.isInAutoOpenBlackList(url));
        });
    }
    
    static isInAutoOpenBlackList(url)
    {
        let list = [
            ".google.",
            ".bing."
        ];

        for(let l of list)
        {
            if(url.includes(l))
            {
                return true;
            }
        }
        return false;
    }
    
    /*
     * openFrame: function to open frame
     */
    autoOpen(openFrame, dataChecker)
    {
        AutoOpenManager.shouldOpen(window.location.href, (should)=>{
            if(should)
            {
                dataChecker((foundData)=>{
                    if(foundData)
                    {
                        openFrame(true);
                    }
                });
                
            }
        });
    }
}