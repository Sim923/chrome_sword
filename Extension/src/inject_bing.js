
$(document).ready(function(){
    
    let iconUrl = chrome.runtime.getURL('inject/img/delta_arrow.png');
    
    $('cite').each(function(){
        let url = $(this).text().trim();
        // TODO: Xing temporarily disabled till we find a way to bg scrape
        if(url && !url.includes('xing.com') && Parser.isParsable(url))
        {
            let html = `<span class='swordfish_search_trigger'><img src='${iconUrl}' /></span> &nbsp;`;
            $(this).before(html);
        }
    });
    
    $('body').on('click', '.swordfish_search_trigger', function(e){
        e.preventDefault();
        let url = $(this).siblings('cite').text();
        let additionalData = {};
        additionalData.title = $(this).siblings('cite').parents('li').first().find('h2').first().text();
        BingParser.setLastClickedURL(url, additionalData, function(){
            openFrame(true);
        });
    });
});