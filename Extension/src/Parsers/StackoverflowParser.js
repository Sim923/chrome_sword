
class StackoverflowParser
{
    
    static isMyUrl(url)
    {
        return url.includes('stackoverflow.com/users/') && !url.includes('?');
    }
    
    static parse(url, source, cb)
    {
        let info = {};
        
        info.valid = true;
        
        info.url = url;
        info.source = "stackoverflow";
        info.cat = 11;
        
        if(source)
        {
            info.name = $(source).find('.profile-user--name').first().find('div').first().text();
            info.location = $(source).find('.iconLocation').parent('div').next('div').first().text();
            info.github = $(source).find('.iconGitHub').parent('div').next('div').find('a').first().attr('href');
            info.website = $(source).find('.iconLink').parent('div').next('div').find('a').first().attr('href');
            info.twitter = $(source).find('.iconTwitter').parent('div').next('div').find('a').first().attr('href');
        }
        
        // If GitHub profile found, hand the request over to GitHub parser
        if(info.github)
        {
            $.get(info.github, (source) => {
                source = cleanHTML(source);
                GithubParser.parse(info.github, source, function(gResults){
                    
                    for (var p in gResults) {
                        if (gResults.hasOwnProperty(p)) {
                            
                            if(p !== 'cat' && p !== 'source')
                            {
                                info[p] = gResults[p];
                            }
                        }
                    }
                    
                    if(!info.name)
                    {
                        info.valid = false;
                    }
                    
                    cb(info);
                    
                });
            }, 'text');
            return;
        }
        else
        {
            if(!info.name)
            {
                info.valid = false;
            }

            cb(info);
        }
    }
    
}