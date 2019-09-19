class LinkedInRequestMonitor
{
    static map = {};
    constructor()
    {
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse)
            {
                if(request.hasOwnProperty('action'))
                {
                    if(request.action === 'getLinkedinLastRequest')
                    {
                        sendResponse(LinkedInRequestMonitor.getLastRequest(sender.tab.id));
                    }
                }
            }
        );

        // Save last Navigator call
        chrome.webRequest.onBeforeRequest.addListener(
            function(details) {
                LinkedInRequestMonitor.setLastRequest(details.tabId, details.url);
                return {};
            },
            {urls: ["https://www.linkedin.com/sales-api/salesApiPeopleSearch*", "https://www.linkedin.com/voyager/api/search/blended*"]}
        );
    }
    
    static getLastRequest(tabId)
    {
        if(LinkedInRequestMonitor.map.hasOwnProperty(tabId))
        {
            return LinkedInRequestMonitor.map[tabId];
        }
        return null;
    }
    
    static setLastRequest(tabId, request)
    {
        LinkedInRequestMonitor.map[tabId] = request;
    }
}