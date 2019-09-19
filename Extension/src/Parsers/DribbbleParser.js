
class DribbbleParser
{
    
    static isMyUrl(url)
    {
        return url.includes('dribbble.com/');
    }
    
    static isInKeywords(url)
    {
        let keywords = ["", "jobs", "teams", "designers", "shots", "stories", "hiring", "pro", "account"];
        let userid = DribbbleParser.getUserId(url);
        return keywords.includes(userid);
    }
    
    static parse(url, source, cb)
    {
        let info = {};
        
        info.valid = true;
        
        if(DribbbleParser.isInKeywords(url))
        {
            info.valid = false;
            cb(info);
            return;
        }
        
        info.url = url;
        info.source = "dribbble";
        info.cat = 13;
        
        if(source)
        {
            info.name = $(source).find('.profile-essentials a[rel="contact"]').first().text().trim();
            info.location = $(source).find('.location').first().text().trim();
            info.userid = DribbbleParser.getUserId(url);
            
            $(source).find("a[class^=elsewhere-]").each(function(){
                
                let clses = $(this).attr('class').split('-');
                let type = clses[clses.length-1];
                
                let title = $(this).attr('title');
                let pieces = title.split(' ');
                let id = pieces[0];
                
                info[type] = id;
                
            });
            
            
            // info.website = $(source).find('a.elsewhere-website').attr('href');
            // info.twitter = $(source).find('a.elsewhere-twitter').attr('href');
            // info.instagram = $(source).find('a.elsewhere-instagram').attr('href');
            // info.behance = $(source).find('a.elsewhere-behance').attr('href');
            // info.facebook = $(source).find('a.elsewhere-facebook').attr('href');
            // info.linkedin = $(source).find('a.elsewhere-linkedin').attr('href');
            // info.creative_market = $(source).find('a.elsewhere-creative_market').attr('href');
            // info.medium = $(source).find('a.elsewhere-medium').attr('href');
        }
        
        if(!info.name || !info.userid)
        {
            info.valid = false;
        }
        
        cb(info);
        
    }
    
    static getUserId(url)
    {
        let regex = /dribbble\.com\/([a-zA-Z0-9_-]+)\/?\??/;
        var matches = regex.exec(url);
        if (matches && matches.length > 1)
        {
            return matches[1];
        }
        return "";
    }
    
}