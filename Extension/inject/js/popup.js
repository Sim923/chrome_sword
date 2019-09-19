var isPopup = true;
var client = new Client();
let ui = new PopupUI();
let dataProcessor = new DataProcessor();

$(document).ready(function () {

    refreshView();

    // For Gmail, on click on email
    $('body').on('click', '.find_by_email', function () {
        showSection('.loading_section');

        let info = {};
        info.email = $(this).data('email');
        info.name = $(this).data('name');
        info.cat = $(this).data('cat');

        DataProcessor.cachedInfo = info;
        DataProcessor.cachedInfo.source = "gmail";
        info.force_fetch_data = true;

        getUserInfoFromServer(info, function (r) {
            if (r && r.hasOwnProperty('status') && r.status == true)
            {
                var sortedData = ServerResponseParser.parseUserData(r.data, true, [info.source]);
                if (sortedData.isPresentable)
                {
                    ui.presentUserData(sortedData);
                    ui.showSection('.person_info');
                } else
                {
                    ui.showNotFoundSection(DataProcessor.cachedInfo);
                }
            } else
            {
                ui.showNotFoundSection(DataProcessor.cachedInfo);
            }
        });
    });

    $('body').on('click', '.find_person', function () {

        showSection('.loading_section');

        var linkedin_id = $(this).attr('data-linkedin-id');
        var url = $(this).attr('data-url');
        var cat = $(this).data('cat');
        var company = $(this).data('company');
        var title = $(this).data('title');

        var info = {};

        if (cat == 3)
        {
            info.member_id = linkedin_id;
        } else
        {
            info.id = linkedin_id;
        }

        info.cat = cat;
        info.company_url = url;
        info.company = company;
        info.title = title;
        DataProcessor.cachedInfo = info;
        DataProcessor.cachedInfo.source = "linkedin";
        info.force_fetch_data = true;

        getUserInfoFromServer(info, function (r) {
            if (r && r.hasOwnProperty('status') && r.status == true)
            {
                var sortedData = ServerResponseParser.parseUserData(r.data, true, [info.source]);
                if (sortedData.isPresentable)
                {
                    ui.presentUserData(sortedData);
                    ui.showSection('.person_info');
                } else
                {
                    ui.showNotFoundSection(DataProcessor.cachedInfo);
                }
            } else
            {
                ui.showNotFoundSection(DataProcessor.cachedInfo);
            }
        });
    });

    // Detecting the scroll-to-bottom of people info
    $('.people_f').on('scroll', function () {
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            if (onScrollInfo)
            {
                getCompanyInfo(onScrollInfo.website_url, onScrollInfo.linkedin_company_url, onScrollInfo.page);
            }
        }
    })

    // on show_btn click, send message to tab
    $(".show_btn").click(function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            var tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, {action: 'click_show_btn'}, $.noop);
        });
    });
});

function getUserInfoFromServer(info, cb)
{
    // TODO: implications of force fetch data
    let manifestData = chrome.runtime.getManifest();
    info.version = manifestData.version;

    client.getUserInfo(info, cb);
}

function getPageURL(cb)
{
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        cb(tab.url);
    });
}

function parseLinkedin(cb)
{
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {action: 'parse_linkedin'}, cb);
    });

}

function parseFacebook(cb)
{
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {action: 'parse_facebook'}, cb);
    });

}

function parseTwitter(cb)
{
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {action: 'parse_twitter'}, cb);
    });

}

function isFrameOpen(cb)
{
    cb(true);
}

function getPageSource(cb)
{
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        chrome.tabs.executeScript(tab.id, {file: "src/inject_all.js"}, function () {
            chrome.tabs.sendMessage(tab.id, {action: 'get_page_source'}, cb);
        });
    });
}

function getGmailSource(cb)
{
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {action: 'get_gmail_visible_pane'}, cb);
    });
}

function showSection(selector)
{
    $('.secttion').hide();
    $(selector).show();
    $('body').css('height', $('.guddan').height());
}


function fillUpPeople(info, url)
{

    $('.company_info .people_inn span').text(info.total_employees + " found");

    var info = info.employees;
    for (var i = 0; i < info.length; i++)
    {
        var p = info[i];
        var id = p.id;
        var cat = 4;

        if (p.hasOwnProperty('member_id'))
        {
            id = p.member_id;
            cat = 7;
        }

        var template = `<div class="elem_of_peop">
                        <div class="img_peop">
                            <!--<img src="" alt="prof_im">-->
                        </div>
                        <div class="content_peop">
                            <p class="not_active">${p.name} <span>${p.title}</span></p>
                            <a href="#" class='find_person' 
                                data-linkedin-id="${id}" 
                                data-cat="${cat}"
                                data-url='${url}'
                                data-title=${p.title} 
                                data-company=${p.company} >Find</a>
                        </div>
                    </div>`;

        $('.company_info .people_f').append(template);
    }
}

function fillGmailEmails(emails, url)
{

    $('.gmail_emails .people_inn span').text(emails.length + " found");

    for (var i = 0; i < emails.length; i++)
    {
        let cat = 5;

        let template = `<div class="elem_of_peop">
                        <div class="img_peop">
                            <!--<img src="" alt="prof_im">-->
                        </div>
                        <div class="content_peop">
                            <p class="not_active">${emails[i].email}</p> <a href="#" class='find_by_email' 
                                data-email="${emails[i].email}" data-cat="${cat}" data-name="${emails[i].name}">Find</a>
                        </div>
                    </div>`;

        $('.gmail_emails .people_f').append(template);
    }
}

function extractEmailsFromGmailInterface(source)
{
    let output = [];
    $(source).find('span[email]').each(function () {
        let email = $(this).attr('email');
        let name = $(this).attr('name');
        output.push({
            name: name,
            email: email
        });
    });

    output = output.filter((o, index, self) =>
        index === self.findIndex((t) => (t.email === o.email))
    );

    return output;
}