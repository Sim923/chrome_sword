$(document).ready(function(){
    
    $('body').on('click', '.signin_btn', function(e){
        
        e.preventDefault();
        
        var id = chrome.runtime.id;
        var url = `${baseURL}/login?ext=true&extension_id=${id}`;
        chrome.tabs.create({url: url});
    });
    
});