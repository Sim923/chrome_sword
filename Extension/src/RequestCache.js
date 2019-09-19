class RequestCache
{
    static _cache = {};
    static setCache(request, response)
    {
        let json = JSON.stringify(request);
        let hash = RequestCache.hash(json);
        
        if(!response)
            response = "pending";
        
        RequestCache._cache[hash] = {
            timestamp: Date.now(),
            data: response
        };
    }
    
    static getCache(request, cb)
    {
        let json = JSON.stringify(request);
        let hash = RequestCache.hash(json);
        
        if(RequestCache._cache.hasOwnProperty(hash))
        {
            if(RequestCache._cache[hash].data === 'pending')
            {
                console.log("Cache: request found but pending");
                waitTill(()=>{
                    return RequestCache._cache[hash] !== 'pending';
                }, 10*1000, (ret) => {
                    if(ret)
                    {
                        console.log("Cache: request found after wait");
                        cb(RequestCache._cache[hash].data);
                    }
                    else
                    {
                        console.log("Cache: request couldn't be found after wait");
                        cb(false);
                    }
                });
            }
            else
            {
                console.log("Cache: request found");
                if(RequestCache.isTooOld(hash))
                {
                    delete RequestCache._cache[hash];
                    cb(false);
                }
                else
                {
                    cb(RequestCache._cache[hash].data);
                }
            }
        }
        else
        {
            console.log("Cache: request NOT found");
            cb(false);
        }
        
        function waitTill(func, wait, cb)
        {
            let waitInterval = 500;
            let timeElapsed = 0;
            var intervalId = setInterval(function () {
                
                timeElapsed += waitInterval;
                
                if(func())
                {
                    clearInterval(intervalId);
                    cb(true);
                }
                else if(timeElapsed >= wait)
                {
                    clearInterval(intervalId);
                    cb(false);
                }
            }, waitInterval);
        }
    }

    static hash(str)
    {
        var hash = 0, i, chr;
        if (str.length === 0)
            return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
    
    static isTooOld(hash)
    {
        let threshold = 10 * 1000; // 10 seconds
        if(RequestCache._cache.hasOwnProperty(hash) && 
                RequestCache._cache[hash] !== 'pending' && 
                RequestCache._cache[hash].hasOwnProperty('timestamp'))
        {
            if(Date.now() - RequestCache._cache[hash].timestamp > threshold)
            {
                return true;
            }
        }
        
        return false;
    }
}