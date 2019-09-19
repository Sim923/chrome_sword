class FacebookParser
{
    static isMyUrl(url)
    {
        return (url.indexOf('.facebook.') > -1);
    }
    
    static isSearchURL(url)
    {
        return url.includes('facebook.com/search/people/');
    }
    
    static getFacebookUsername(url)
    {
        var regex = /facebook\.com\/([a-zA-Z0-9\.]*)/;

        if (url.includes('/people/'))
        {
            regex = /\/people\/[A-Za-z\-]+\/(\d+)/;
        }

        if (url.includes('profile.php'))
        {
            regex = /\/profile\.php\?id=(\d+)/;
        }

        var m = regex.exec(url);
        if (m.length > 1)
        {
            var username = m[1];

            var common_names = ["search", "messages", "marketplace", "events", "groups", "pages", "bookmarks", "fundraisers", "games", "oculus", "memories",
                "saved", "live", "jobs"];

            if (common_names.includes(username))
                return false;
            return username;
        } else
            return false;
    }
    
    static parse(url, source, cb) {
        
        let info = {};
        info.valid = true;
        info.facebook_id = FacebookParser.getFacebookUsername(url);
        info.cat = 1;
        info.source = "facebook";
        info.profile = url;

        info.name = $(source).find("#fb-timeline-cover-name").text().trim()

        let regex = /&quot;profile_owner&quot;:&quot;(\d+)&quot;/;

        let matches = regex.exec(source);
        if (matches && matches.length > 1)
        {
            info.numeric_id = matches[1];
        } else
        {
            info.numeric_id = null;
        }
        
        info.companies = [];
        
        // Location magic
        $(source).find('#intro_container_id').find('.textContent').each(function(){
            let text = $(this).text();
            if(text.includes('From'))
            {
                info.hometown = $(this).find('a').first().text().trim();
            }
            else if(text.includes('Lives in'))
            {
                info.location = $(this).find('a').first().text().trim();
            }
            else if(text.includes(' at '))
            {
                if(text.includes('Studies') || text.includes('Studied'))
                {
                    // do nothing for studies
                }
                else
                {
                    let company = $(this).find('a').first().text().trim();
                    let company_url = $(this).find('a').first().attr('href');
                    info.companies.push({name: company, url: company_url});
                }
            }
        });
        
        if(info.companies.length)
        {
            info.company = info.companies[0].name;
            info.company_url = info.companies[0].url;
        }
        
        if(!info.location)
        {
            info.location = info.hometown;
        }
        
        info.url = url;
        
        if(!info.name || !info.numeric_id || !info.facebook_id)
        {
            info.valid = false;
        }

        cb(info);
    }
    
    static getSearchResults(source)
    {
        let results = [];
        $(source).find('#initial_browse_result').find("div[data-xt-vimp]").each(function(){
            
            let name = $(this).find('span').first().text().trim();
            let link = $(this).find('a').last().attr('href');
            let photo = $(this).find('img').first().attr('src');            
            
            if (!photo)
            {
                photo = chrome.runtime.getURL('inject/img/user.png');
            }
            
            if(name.includes("Loading"))
            {
                return;
            }
            
            results.push({
                cat: 1,
                name: name,
                url: link,
                photo: photo
            });
            
        });
        
        return results;
    }
}