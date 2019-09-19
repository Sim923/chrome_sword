class RecuiterParser
{
    static isMyUrl(url)
    {
        return url.includes('.linkedin.com/recruiter/profile/');
    }
    
    static isSearchURL(url)
    {
        return url.includes('linkedin.com/recruiter/smartsearch');
    }
    
    static getMemberIdFromRecuiterURL(url)
    {
        let regex = /recruiter\/profile\/(\d+),/;
        let match = regex.exec(url);
        if(match && match.length > 1)
        {
            return match[1];
        }
        return false;
    }
    
    static parse(url, source, cb)
    {
        let info = {};
        info.valid = true;
        info.cat = 6;
        info.source = "recuiter";

        if (source)
        {
            info.public_profile = $(source).find('.public-profile a').first().attr('href');
        }

        let memberId = RecuiterParser.getMemberIdFromRecuiterURL(url);
        if (memberId)
        {
            info.member_id = memberId;
        }
        
        if (!memberId && !source)
        {
            info.valid = false;
        }

        cb(info);
    }
    
    static getSearchResults(source)
    {
        let results = [];
        
        $(source).find('li.search-result').each(function(){
            let name = $(this).find('.search-result-profile-link').text().trim();
            let link = $(this).find('.search-result-profile-link').attr('href');
            let photo = $(this).find('img.profile-img').attr('src');
            
            if(link)
            {
                link = 'https://www.linkedin.com' + link;
            }
            
            results.push({
                cat: 6,
                name: name,
                url: link,
                photo: photo
            });
        });
        
        return results;
    }
    
    static parseAsync(url, source, info, cb)
    {
        RecuiterParser.parse(url, source, function(newInfo){
            for(let x in newInfo)
            {
                if(newInfo.hasOwnProperty(x))
                {
                    info[x] = newInfo[x];
                }
            }
            
            cb(info);
        });
    }
}