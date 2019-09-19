
let autoOpenManager = new AutoOpenManager();
let client = new Client();

$(document).ready(function () {

    $('body').prepend(`<dummy></dummy>`);
    
    // inject bobble and frame
    var html = `<iframe src='${chrome.extension.getURL("inject/frame.html")}' class='swordfish101' id='swordframe'></iframe>`;
    $('body').prepend(html);

    $.get(chrome.extension.getURL("inject/bobble.html"), function (html) {

        $('body').prepend(html);
        $('.swordlogo').attr('src', chrome.extension.getURL("inject/img/delta_black_arrow.png"));
        
        checkShowBobble();
        decideNotification();
    });
    
    // bobble on click
    $('body').on("click", '.logo_non_vis', function () {
        openFrame(true);
    });
    
    // Auto-open
    autoOpenManager.autoOpen(openFrame, refreshView);
});

function openFrame(refreshView = true)
{
    $("body").find("#swordframe").css("right", "0px");
    $(".logo_non_vis").fadeOut(300);
    
    if(refreshView)
    {
        chrome.runtime.sendMessage({action: 'send_to_myself', message:{action: 'refresh_view', forward: true, force_fetch_data: true}});
    }
}

function checkShowBobble()
{
    chrome.storage.local.get({
        show_side_tab: true
    }, function(r){
        if(r.show_side_tab)
        {
            $('.vertical_openner').css('display', 'flex');
        }
    });
}

function decideNotification()
{
    // if linkedin profile, show notification
    if(window.location.href.indexOf(".linkedin.com/in/") > -1 || 
            window.location.href.includes("linkedin.com/sales/people/"))
    {
        chrome.runtime.sendMessage({
                action: 'get_cache',
                url: window.location.href
            }, function(response){
                if(!response || response.result)
                {
                    $(".notif_round").css("display", "inline-flex");
                }
                else
                {
                    $(".notif_round").hide();
                }
            });
    }
    else
    {
        $(".notif_round").hide();
    }
}

function refreshView(cb)
{
    let ui = new UI();
    let dataProcessor = new DataProcessor();
    let url = window.location.href;
    dataProcessor.process(url, ui, getPageSource, cb);
}

function getPageSource(cb)
{
    cb(document.documentElement.outerHTML);
}

var lastUrl = cleanLinkedInURL(window.location.href);
setInterval(function(){
    var currentURL = cleanLinkedInURL(window.location.href);
    if(lastUrl != currentURL)
    {
        lastUrl = currentURL;
        decideNotification();
        
        if(isFrameOpen())
        {
            chrome.runtime.sendMessage({action: 'send_to_myself', message:{action: 'refresh_view'}});
        }
        else
        {
            autoOpenManager.autoOpen(openFrame, refreshView);
        }
        
    }
}, 1000);


function isFrameOpen()
{
    let right = parseFloat($('.swordfish101').css("right"));
    return (right > -440);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.action === 'close_popup')
    {
        $('.swordfish101').css('right', '-450px');
        $('.logo_non_vis').fadeIn(300);
    }
    if (request.action === 'open_popup')
    {
        console.log("opening pipup");
        openFrame(request.hasOwnProperty('refresh_view') ? request.refresh_view : true);
        sendResponse(true);
    }
    else if(request.action === 'set_frame_height')
    {
        $('.swordfish101').attr('height', request.value);
        
        // set frame width based on url
        if(doesPageRequireExtraWidth(window.location.href))
        {
            $('.swordfish101').css('width', '400px');
        }
        else
        {
            $('.swordfish101').css('width', '350px');
        }
    }
    else if(request.action === 'get_url')
    {
        sendResponse(window.location.href);
    }
    else if(request.action === 'parse_linkedin')
    {
        // linkedin parser
        var parser = new LinkedinParser();
        parser.parse(sendResponse);
    }
    else if(request.action === 'parse_facebook')
    {
        var parser = new FacebookParser();
        parser.parse(sendResponse);
    }
    else if(request.action === 'parse_twitter')
    {
        var parser = new TwitterParser();
        parser.parse(sendResponse);
    }
    else if(request.action === 'is_frame_open')
    {
        setTimeout(()=>{
            sendResponse(isFrameOpen());
        }, 500);
    }
    else if (request.action === 'remove_notification')
    {
        $(".notif_round").hide();
    }

    return true;
});