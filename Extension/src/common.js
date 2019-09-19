
function cleanLinkedInURL(url)
{
    let regex = /(https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9]+)/;
    let match = regex.exec(url);
    if (match && match.length > 1)
    {
        url = match[1];
    }

    return url;
}

function isGmailPage(url)
{
    return url.includes('mail.google.');
}

// Cleans HTML, removes any JS events and scripts, disables images
function cleanHTML(html)
{
    var new_text = replaceAll(html, "<img", "<dpd");
    new_text = replaceAll(new_text, "onclick", "href");
    new_text = replaceAll(new_text, "onerror", "bad");
    new_text = replaceAll(new_text, "<script>", "<!--");
    new_text = replaceAll(new_text, "<script", "<!--");
    new_text = replaceAll(new_text, "<video", "<dpd");   
	html = replaceAll(new_text, "</script>", "-->");
	function replaceAll(text, search, replacement) {
        return text.replace(new RegExp(search, 'g'), replacement);
    }

    return html.trim();
}

function strToInt(str)
{
    var int = parseInt(str);
    if (isNaN(int))
        int = 0;
    return int;
}

function sendMessageToAllTabs(msg)
{
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, msg);
        }
    });
}

/* search pages should have extra width. req from user */
function doesPageRequireExtraWidth(url)
{
    return url.includes('linkedin.com/search/results') ||
            url.includes('linkedin.com/recruiter/smartsearch') ||
            url.includes('linkedin.com/sales/search/people') ||
            url.includes('facebook.com/search/people/');
}

function showTooltipMessage(msg)
{
    $(".tooltip_general_msg p").text(msg);
    $(".tooltip_general_msg").fadeIn('slow', function(){
        setTimeout(function(){
            $(".tooltip_general_msg").fadeOut();
        }, 2000);
    });
}

function getCurrentTab(cb)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     var activeTab = tabs[0];
     cb(activeTab);
  });
}