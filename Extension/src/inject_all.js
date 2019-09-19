

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.action === 'get_page_source')
    {
        sendResponse(document.all[0].outerHTML);
    }
    else if(request.action === 'check_linkedin_url')
    {
        var source = document.all[0].outerHTML;
        
        var regex = /(www\.linkedin\.com\/compan[y|ies]+\/[A-Za-z0-9\-]+)/;
        var matches = regex.exec(source);

        if(matches && matches.length > 1)
        {
            sendResponse(true);
            return;
        }
        sendResponse(false);
    }
    
    return true;
});

// If jQuery is not loaded this gives error on other website.
if(window.jQuery)
{
// For facebook search page, on scroll send refresh_view message
$(window).scroll(function() {
    clearTimeout($.data(this, 'scrollTimer'));
    $.data(this, 'scrollTimer', setTimeout(function() {
        if(FacebookParser.isSearchURL(window.location.href))
        {
            chrome.runtime.sendMessage({action: 'send_to_myself', message:{action: 'refresh_view'}});
            console.log("Haven't scrolled in 250ms!");
        }
    }, 250));
});
}