
class TestParser
{
    
    static isMyUrl(url)
    {
        return url.includes('localhost/swordfishTestServer');
    }
    
    static parse(url, source, cb)
    {
        let info = {};
        
        info.valid = true;
        
        info.url = url;
        info.source = "localhost";
        info.cat = 0;
        
        cb(info);
    }
    
}