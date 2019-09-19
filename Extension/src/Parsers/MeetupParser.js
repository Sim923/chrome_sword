
class MeetupParser
{
    
    static isMyUrl(url)
    {
        return url.includes('meetup.com');
    }
    
    static parse(url, source, cb)
    {
        let info = {};
        
        info.valid = true;
        
        info.url = url;
        info.source = "meetup";
        info.cat = 10;
        
        info.name = $(source).find('.memName').text();
        info.location = $(source).find('.locality').first().text();
        info.social_profiles = [];
        
        $(source).find('.D_memberProfileSocial a').each(function(){
            info.social_profiles.push($(this).attr('href'));
        });
        
        info.avatar = $(source).find('.D_memberProfilePhoto').attr('src');
        
        if(!info.name || !info.avatar)
        {
            info.valid = false;
        }
        
        cb(info);
    }
    
}