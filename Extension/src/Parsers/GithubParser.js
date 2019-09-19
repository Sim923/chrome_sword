
class GithubParser{
    
    static isMyUrl(url) {
        let blacklist = ["search", "login", "", "pricing", "join", "topics"];
        let username = GithubParser.getUsername(url);
        
        return url.includes('github.com') && !blacklist.includes(username);
    }
    
    static getUsername(url){
        
        let regex = /github\.com\/([a-zA-Z0-9]+)\/?/;
        let m = regex.exec(url);
        
        if(m && m.length > 1)
        {
            let username = m[1];
            return username;
        }
    }
    
    static parse(url, source, cb)
    {
        let info = {};
        
        info.valid = true;
        
        info.username = GithubParser.getUsername(url);
        info.url = url;
        info.source = "github";
        info.cat = 9;
        
        info.emails = extractEmailsFromSource(source);
        
        info.website = $(source).find('li[data-test-selector="profile-website-url"] a').first().attr('href');
        info.location = $(source).find('li[itemprop="homeLocation"]').first().text().trim();
        info.email = $(source).find('li[itemprop="email"]').first().text().trim();
        info.name = $(source).find('.vcard-fullname').first().text().trim();
        info.company = $(source).find('li[itemprop="worksFor"]').first().text().trim();
        
        if(!GithubParser.validateEmail(info.email))
        {
            delete info.email;
        }
        
        if(!info.name)
        {
            info.valid = false;
        }
        
        cb(info);
    }
    
    static validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
}