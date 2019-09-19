
$(document).ready(function(){
    
    let iconUrl = chrome.runtime.getURL('inject/img/delta_arrow.png');
    
    $('cite').each(function(){
        let url = $(this).closest('a').first().attr('href');
        // TODO: Xing temporarily disabled till we find a way to bg scrape
        if(url && !url.includes('xing.com') && Parser.isParsable(url))
        {
            let html = `<span class='swordfish_search_trigger' url='${url}'><img src='${iconUrl}' /></span> &nbsp;`;
            $(this).parents('a').first().find('h3').first().after(html);
        }
    });
    
    $('body').on('click', '.swordfish_search_trigger', function(e){
        e.preventDefault();
        let url = $(this).attr('url');
        let additionalData = {};
        additionalData.title = $(this).siblings('h3').first().text();
        GoogleParser.setLastClickedURL(url, additionalData, function(){
            openFrame(true);
        });
    });
});