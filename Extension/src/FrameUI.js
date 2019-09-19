class FrameUI extends BaseUI
{
    showSection(selector)
    {
        $('.secttion').hide();
        $(selector).show();
        this.resetHeight();
    }
    
    fillUpPeople()
    {
    }
    
    fillGmailEmails()
    {
    }
    
    resetHeight()
    {
        chrome.runtime.sendMessage(
                {
                    action: 'set_frame_height',
                    forward: true,
                    value: $('.search_results_export').height() 
                }
        );

        chrome.runtime.sendMessage(
                {
                    action: 'get_url',
                    forward: true
                },
                function(url){
                    if(doesPageRequireExtraWidth(url))
                    {
                        $('.search_results_export').addClass('w_400');
                    }
                    else
                    {
                        $('.search_results_export').removeClass('w_400');
                    }
                }
        );
    }
}