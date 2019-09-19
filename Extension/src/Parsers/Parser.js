class Parser
{
    static parsers = [TestParser, SalesNavParser, RecuiterParser, LinkedinParser,
                FacebookParser, TwitterParser, GithubParser,
                MeetupParser, StackoverflowParser, XingParser, DribbbleParser];
    
    static isParsable(url)
    {
        for(let p of Parser.parsers)
        {
            if(p.isMyUrl(url))
            {
                return true;
            }
        }
        
        return false;
    }
    
    static parse(url, source, cb, additionalData)
    {
        for(let p of Parser.parsers)
        {
            if(p.isMyUrl(url))
            {
                p.parse(url, source, cb, additionalData);
                break;
            }
        }
    }
}