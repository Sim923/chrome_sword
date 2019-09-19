
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.action === 'get_gmail_visible_pane')
    {
        let source = $(".aeF").find("div[role=main]").first().html();
        sendResponse(source);
    }
    
    return true;
});