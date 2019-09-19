
var client = new Client();
let ui = new FrameUI();
let dataProcessor = new DataProcessor();

$(document).ready(function () {
    refreshView();

    // $(".loading_section").hide();


    $("#accept").click(function (e) {

        e.preventDefault();
        resetHeight();
        
        refreshView();

        //remove terms loading flag from localStorage so that bg allows to display other window.
        localStorage.removeItem("termsLoading");
    });
});


chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {

            //console.log(request.action);
            //console.trace();

            if (request.action === 'refresh_view') {
                refreshView(request.force_fetch_data);
            }
            else if (request.action === 'click_show_btn') {
                $(".show_btn").click();
            }
            else if (request.action === "show_terms") {
                console.log("showing terms");
                showSection(".terms");
                setTimeout(resetHeight, 500);
                sendResponse(true);
            }
            return true;
        });

function isFrameOpen(cb) {
    chrome.runtime.sendMessage(
            {
                action: 'is_frame_open',
                forward: true
            }, cb
    )
}

function getPageSource(cb) {
    chrome.runtime.sendMessage({ action: 'get_my_tab_id' }, (tabId) => {
        if (!tabId) {
            console.error("Getting page source: unable to get current tab id");
        }
        else {
            chrome.tabs.executeScript(tabId, { file: "src/inject_all.js" }, function () {
                chrome.tabs.sendMessage(tabId, { action: 'get_page_source' }, cb);
            });
        }
    });
}

function showSection(selector) {
    $('.secttion').hide();
    $(selector).show();
    resetHeight();
}

function resetHeight() {
    chrome.runtime.sendMessage(
            {
                action: 'set_frame_height',
                forward: true,
                value: $('.search_results_export').height()
            }
    );
}

function getPageURL(cb) {
    chrome.runtime.sendMessage({ forward: true, action: 'get_url' }, cb);
}

function parseLinkedin(cb) {
    chrome.runtime.sendMessage({ forward: true, action: 'parse_linkedin' }, cb);
}

function parseFacebook(cb) {
    chrome.runtime.sendMessage({ forward: true, action: 'parse_facebook' }, cb);
}

function parseTwitter(cb) {
    chrome.runtime.sendMessage({ forward: true, action: 'parse_twitter' }, cb);
}