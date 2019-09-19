
var cachedInfo = {};
var onScrollInfo = null;
var copyToClipboardEnabled = false;
// var lastURLwithoutTeaser = null;
var cb = $.noop;

$(document).ready(function () {

    AutoOpenManager.get((autoopen)=>{
        if(autoopen)
        {
            $("#autoopen").prop("checked", true);
        }
    });

    $("#autoopen").click(function () {
        var isChecked = $(this).prop("checked");
        AutoOpenManager.set(isChecked);
    });

    $('.show_btn').click(getActualData);

    /* Setup Links */
    // set sign in link based on extension id
    let signInLink = `${baseURL}/login?ext=true&extension_id=${chrome.runtime.id}`;
    let signupLink = `${baseURL}/signup?ext=true&extension_id=${chrome.runtime.id}`;
    let pricingLink = `${baseURL}/pricing`;
    let dashboardLink = `${baseURL}/dashboard_table/all`;
    let policyLink = `${baseURL}/policy`;
    let referLink = `${baseURL}/refer`;

    $('.sign_in_link').attr('href', signInLink);
    $('.signup_link').attr('href', signupLink);
    $('.pricing_link').attr('href', pricingLink);
    $('.dashboard_link').attr('href', dashboardLink);
    $('.policy_link').attr('href', policyLink);
    $('.refer_link').attr('href', referLink);
});

function getActualData()
{
    cachedInfo.preview = false;
    client.getUserInfo(cachedInfo, function (srvinfo) {

        var upgrade = false;
        if (JSON.stringify(srvinfo).indexOf("UPGRADE") > -1)
        {
            upgrade = true;
        }

        // fill info in html
        showSection('.person_info');
        var sortedData = parseUserData(srvinfo.data, false, [cachedInfo.source]);
        if (sortedData.isPresentable)
        {
            sortedData.source = cachedInfo.source;
            presentUserData(sortedData);
            showSection('.person_info');
        } else
        {
            if(!sortedData.preview)
            {
                showSection('.full_info_not_found');
            }
            else
            {
                showNotFoundSection();
            }
        }

        if (srvinfo.data.hasOwnProperty('credit') && srvinfo.data.credit == 0 &&
                srvinfo.data.hasOwnProperty('free_credit') && srvinfo.data.free_credit == 0)
        {
            $(".tooltip_out_of_credits").fadeIn(300);
            setTimeout(function () {
                // $(".tooltip_out_of_credits").fadeOut(300)
            }, 2500);
        } else
        {
            $(".tooltip_saved_really").fadeIn(300);
            setTimeout(function () {
                $(".tooltip_saved_really").fadeOut(300)
            }, 2500);
        }

        getPageURL(function (url) {
            chrome.runtime.sendMessage({
                action: 'set_cache',
                url: url,
                isExpanded: true,
                result: sortedData.isPresentable
            });
        });
    });
}

function hasUpgrade(str)
{
    return (str.indexOf("UPGRADE") > -1);
}

function parseUserData(info, preview = true, ignoredSocialProfiles = [])
{
    const trunc_length = preview ? 10 : 100;

    let result = {};
    result.isPresentable = false;
    result.preview = preview;
    result.items = [];
    result.socials = [];
    result.email_count = 0;
    result.upgrade = JSON.stringify(info).toLowerCase().includes('upgrade');

    // override preview by server's result (it can happen that server had the full result cached while on extension side, it is not cached
    if (info.hasOwnProperty('result') && info.result === 'FULL')
    {
        result.preview = false;
    }

    if (info.hasOwnProperty('name'))
    {
        result.name = info.name;
    } else
    {
        result.name = false;
    }

    // Emails
    if (info.hasOwnProperty('emails'))
    {
        var count = 0;
        for (var name in info.emails) {
            if (info.emails.hasOwnProperty(name))
            {
                result.isPresentable = true;
                parseAndPushItem(`#email_${count}`, info.emails[name]);
                count++;
            }
        }
        result.email_count = count > 3 ? 3 : count;
    }

    if (info.hasOwnProperty('email'))
    {
        result.isPresentable = true;
        parseAndPushItem(`#email_0`, info.email);
        result.email_count = 1;
    }

    // Address
    if (info.hasOwnProperty('mailing_address') && info.mailing_address)
    {
        parseAndPushItem(`#address`, info.mailing_address);
    }

    if (info.hasOwnProperty('address') && info.address)
    {
        parseAndPushItem(`#address`, info.address);
    }

    // Phones
    if (info && info.hasOwnProperty('phones'))
    {
        result.isPresentable = true;
        if (info.phones.hasOwnProperty('mobile') && info.phones.mobile)
        {
            let phones = info.phones.mobile;
            if (typeof phones == 'string')
            {
                phones = info.phones.mobile.split(',');
            }
            if (phones.length > 1) {
                parseAndPushItem(`#cellphone`, phones[0]);
                parseAndPushItem(`#cellphoneSecond`, phones[1]);
            } else {
                parseAndPushItem(`#cellphone`, phones[0]);
            }
            result.num_mobiles = phones.length;
        }

        result.phone_count = 0;
        if (info.phones.hasOwnProperty('work') && info.phones.work)
        {
            let phones = info.phones.work;
            if (typeof phones == 'string')
            {
                phones = info.phones.work.split(',');
            }
            if (phones.length > 1)
            {
                parseAndPushItem(`#phone_${result.phone_count++}`, phones[0]);
                parseAndPushItem(`#phone_${result.phone_count++}`, phones[1]);
            } else {
                parseAndPushItem(`#phone_${result.phone_count++}`, phones[0]);
            }
        }

        if (info.phones.hasOwnProperty('workphone') && info.phones.workphone)
        {
            let phones = info.phones.workphone;
            if (typeof phones == 'string')
            {
                phones = info.phones.workphone.split(',');
            }
            if (phones.length > 1)
            {
                parseAndPushItem(`#phone_${result.phone_count++}`, phones[0]);
                parseAndPushItem(`#phone_${result.phone_count++}`, phones[1]);
            } else {
                parseAndPushItem(`#phone_${result.phone_count++}`, phones[0]);
            }
        }
    }

    if (info.hasOwnProperty('phones') && info.phones.hasOwnProperty('work') && info.phones.hasOwnProperty('workphone'))
    {
        result.hasTwoPhones = true;
    } else
    {
        result.hasTwoPhones = false;
    }

    if (info && info.hasOwnProperty('phone') && info.phone)
    {
        result.isPresentable = true;
        parseAndPushItem(`#cellphone`, info.phone);
    }

    // DOB
    if (info.hasOwnProperty('dob'))
    {
        parseAndPushItem(`#dob`, info.dob);
    }

    // social icons
    var socialProfiles = {
        'facebook': 's_fb',
        'google': 's_gp',
        'linkedin': 's_ln',
        'twitter': 's_tw'
    };

    if (info && info.hasOwnProperty('social_profiles'))
    {
        for (var s in socialProfiles) {
            if (socialProfiles.hasOwnProperty(s))
            {
                if (info.social_profiles.hasOwnProperty(s) && !ignoredSocialProfiles.includes(s))
                {
                    let item = {
                        id: socialProfiles[s],
                        key: s,
                        url: info.social_profiles[s],
                        hasUpgrade: info.social_profiles[s].includes("UPGRADE")
                    };
                    result.socials.push(item);
                }
            }
        }
    }

    // if all the social profiles found are in ignore list, we don't present
    if (result.socials.filter((elem) => !(ignoredSocialProfiles.includes(elem.key))).length > 1)
    {
        result.isPresentable = true;
    }

    return result;

    function parseAndPushItem(id, text)
    {
        var hasUpgrade_ = hasUpgrade(text);
        text = replaceUpgrade(text);

        let item = {
            id: id,
            short_text: text,
            text: text,
            hasUpgrade: hasUpgrade_
        };

        result.items.push(item);
    }

    function replaceUpgrade(str)
    {
        return str.replace("UPGRADE;", "");
    }

    function trunc(value, desired_length = 10, reverse = false)
    {
        if (value && value.length > desired_length)
        {
            if (reverse)
                return "..." + value.substr(value.length - desired_length);
            else
                return value.substr(0, desired_length) + "...";
        }
        return value;
}
}

function presentUserData(data)
{
    // reset HTML
    $('.left_wr___').find('img').show();
    $(".no_bottom_border").removeClass('no_bottom_border');

    $(".elem_of_collected").hide();
    $('.upgrade_btn').hide();

    if (data.preview)
    {
        $('.show_btn').show();
        $('img.copy_img').hide();
    } else
    {
        $('.show_btn').hide();
        $(".not_shown_cut").removeClass("not_shown_cut");
        if (!data.upgrade)
        {
            $(".email_cutted").removeClass('email_cutted');
            $(".phone_cutted").removeClass('phone_cutted');
            $(".mailing_cutted").removeClass('mailing_cutted');
        }
        $('img.copy_img').show();
    }

    if ((data.source === 'recuiter' || data.source === 'gmail') && data.name)
    {
        $("#name span").text(data.name);
        $("#name").parents(".elem_of_collected").show();
    }

    for (let d in data.items)
    {
        if (data.items.hasOwnProperty(d))
        {
            let elem = data.items[d];
            if (elem.hasUpgrade)
            {
                $(elem.id).siblings('.upgrade_btn').show();
                $(elem.id).siblings('.show_btn').hide();
                $(elem.id).children("img.copy_img").hide();
            } else
            {
                $(elem.id).removeClass('email_cutted');
                $(elem.id).removeClass('phone_cutted');
                $(elem.id).removeClass('mailing_cutted');
            }

            $(`${elem.id} span`).text(elem.short_text);

            if (!data.preview)
                $(`${elem.id} span`).attr('title', elem.text);

            $(elem.id).parents(".elem_of_collected").show();
        }
    }

    $(".social_icon").hide();
    $(".social_icon a").removeAttr("href");
    for (let i = 0; i < data.socials.length; i++)
    {
        let s = data.socials[i];
        $(`#${s.id}`).parent().show();
        if (s.hasUpgrade)
        {
            $(`#${s.id}`).closest("div").siblings('.upgrade_btn').show();
            $(`#${s.id}`).closest("div").siblings('.show_btn').hide();
        } else
        {
            if (!data.preview)
            {
                $(`#${s.id}`).attr("href", s.url);
                $(`#${s.id}`).attr("target", '_blank')
            }
        }
        $("#s_fb").parents(".elem_of_collected").show();
    }

    // special requirements: remove lines if multiple emails, remove multiple icons
    $('.email').parents('.elem_of_collected').addClass('no_bottom_border');
    $(`#email_${data.email_count - 1}`).parents('.elem_of_collected').removeClass('no_bottom_border');
    
    // two mobile phones, remove redundant icons and separators
    if(data.num_mobiles > 1)
    {
        $('#cellphone').parents('.elem_of_collected').addClass('no_bottom_border');
        $('#cellphoneSecond').siblings('.left_wr___').find('img').hide();
    }
    
    // special requirements: remove lines if multiple emails, remove multiple icons
    $('.phone').parents('.elem_of_collected').addClass('no_bottom_border');
    $(`#phone_${data.phone_count - 1}`).parents('.elem_of_collected').removeClass('no_bottom_border');
}

function getUserInfoFromServer(info, cb)
{
    let manifestData = chrome.runtime.getManifest();
    info.version = manifestData.version;
    
    if (info.hasOwnProperty('force_fetch_data') && info.force_fetch_data)
    {
        client.getUserInfo(info, cb);
        return;
    }

    isFrameOpen(function (isVisible) {
        if (isVisible)
        {
            client.getUserInfo(info, cb);
        } else
        {
            cb({tried: false});
        }
    });
}

function getCompanyInfo(url, linkedin_url, page)
{
    var info = {};

    if (linkedin_url)
        info.linkedin_company_url = linkedin_url;

    if (url)
        info.website_url = url

    if (page)
        info.page = page
    else
        info.page = 1

    client.getCompanyInfo(info, function (response) {
        if (response && response.status && Array.isArray(response.data.employees) && response.data.employees.length)
        {
            onScrollInfo = info;
            onScrollInfo.page++;

            fillUpPeople(response.data, url);
            showSection('.company_info');
            cb(true);
        } else
        {
            if (response.hasOwnProperty('error') && response.error === 'auth_failed')
            {
                showSection('.sign_in');
            } else
            {
                // show this dialog only if the request with page:1 failed
                if (!onScrollInfo || onScrollInfo.page == 1)
                {
                    showSection('.company_not_found');
                }
            }
            cb(false);

            onScrollInfo = null;
        }
    });
}

function refreshView(force_fetch_data, cb)
{

    // out of credits tooltip
    $(".tooltip_out_of_credits").hide();

    copyToClipboardEnabled = false;
    showSection('.loading_section');
    TokenHandler.getToken(function (token) {
        if (token)
        {
            getPageURL(function (url) {

                // If there was already a non-teaser preview of this page
                chrome.runtime.sendMessage({
                    action: 'get_cache',
                    url: url
                }, function (cacheResult) {
                    var preview = !cacheResult.isExpanded;

                    if (isGmailPage(url))
                    {
                        getGmailSource(function (source) {
                            if (source)
                            {
                                let emails = extractEmailsFromGmailInterface(source);

                                if (emails)
                                {
                                    fillGmailEmails(emails);
                                    showSection('.gmail_emails');
                                    cb(true);
                                } else
                                {
                                    showSection('.try_visiting');
                                    cb(false);
                                }
                            } else
                            {
                                console.error("Parsing Gmail: failed to get source of the page");
                                showSection('.try_visiting');
                                cb(false);
                            }
                        });
                    } else if (GoogleParser.isGoogleSearchPage(url))
                    {
                        GoogleParser.getLastClickedURL(function (lastUrl) {

                            if (lastUrl)
                            {
                                triggerParsers(lastUrl, true);
                                GoogleParser.setLastClickedURL(null, $.noop);
                            } else
                            {
                                showSection('.serp_click_icon');
                                cb(false);
                            }
                        });
                    } else if (BingParser.isBingSearchPage(url))
                    {
                        BingParser.getLastClickedURL(function (lastUrl) {

                            if (lastUrl)
                            {
                                triggerParsers(lastUrl, true);
                                BingParser.setLastClickedURL(null, $.noop);
                            } else
                            {
                                showSection('.serp_click_icon');
                                cb(false);
                            }
                        });
                    } else if (Parser.isParsable(url))
                    {
                        triggerParsers(url, false);
                    } else
                    {
                        if (isInBlackListForCompanyInfo(url))
                        {
                            showSection('.try_visiting');
                            cb(false);
                            return;
                        }

                        // Other pages like common website (only applicable for popup)
                        getPageSource(function (source) {

                            if (source)
                            {
                                console.log('got source');

                                var regex = /(www\.linkedin\.com\/compan[y|ies]+\/[A-Za-z0-9\-]+)/;
                                var matches = regex.exec(source);

                                if (matches && matches.length > 1)
                                {
                                    var linkedin_url = matches[1];

                                    getCompanyInfo(url, linkedin_url);
                                } else
                                {
                                    getCompanyInfo(url);
                                }
                            } else
                            {
                                getCompanyInfo(url);
                            }
                        });
                    }


                    function triggerParsers(url, fetchPageInBackground)
                    {
                        if (fetchPageInBackground)
                        {
                            if (LinkedinParser.isMyUrl(url))
                            {
                                Parser.parse(url, '', afterParse);
                            } else
                            {
                                // convert to https
                                if(!url.includes('https://'))
                                {
                                    url = url.replace('http', 'https');
                                }
                                
                                $.get(url, (source) => {
                                    source = cleanHTML(source);
                                    Parser.parse(url, source, afterParse)
                                }, 'text');
                            }
                        } else
                        {
                            getPageSource((source) => {
                                Parser.parse(url, source, afterParse)
                            });
                        }

                        function afterParse(info)
                        {
                            if (info.valid)
                            {
                                info.preview = preview;
                                cachedInfo = info;
                                info.force_fetch_data = force_fetch_data;

                                getUserInfoFromServer(info, function (srvinfo) {
                                    handleServerResponse(srvinfo, info, url);
                                });
                            } else
                            {
                                showSection('.try_visiting');
                                cb(false);
                            }
                        }

                    }

                });
            });

        } else
        {
            showSection('.sign_in');
            cb(false);
        }
    });

    function handleServerResponse(srvinfo, info, url)
    {
        if (srvinfo.status)
        {
            // out of view limit (teaser limit)
            if (srvinfo.data.hasOwnProperty('exceed-view-limit') && srvinfo.data['exceed-view-limit'] == true)
            {
                showSection('.out_of_teaser_calls');
                cb(false);
            }
            // full info not found - show oops message
            else if (srvinfo.data.hasOwnProperty('oops_mistake') && srvinfo.data['oops_mistake'] == true)
            {
                showSection('.full_info_not_found');
                cb(false);
            } else
            {
                var sortedData = parseUserData(srvinfo.data, info.preview, [info.source]);
                if (sortedData.isPresentable)
                {
                    sortedData.source = info.source;
                    presentUserData(sortedData);
                    showSection('.person_info');
                    cb(true);

                    if (!sortedData.preview)
                    {
                        copyToClipboardEnabled = true;
                    }

                    // Show show_btn if user didn't already click it
                    if (sortedData.preview)
                    {
                        $(" .wrap_b_part h6").addClass("not_shown_cut");
                        $(".email_cutted").css("direction", "ltr");
                        $('.show_btn').show();
                    }
                } else
                {
                    // if it wasn't a teaser call that means we had shown data in a teaser call before
                    if(!sortedData.preview)
                    {
                        showSection('.full_info_not_found');
                        cb(false);
                    }
                    else
                    {
                        showNotFoundSection(info);
                        cacheIt(url, info.preview, false);
                        cb(false);
                    }
                }
            }
        } else
        {
            if (srvinfo.hasOwnProperty('error') && srvinfo.error === 'auth_failed')
            {
                showSection('.sign_in');
                cb(false);
            } else
            {
                showNotFoundSection(info);
                cacheIt(url, info.preview, false);
                cb(false);
            }
        }

        function cacheIt(url, preview, result)
        {
            if (srvinfo.hasOwnProperty('tried') && srvinfo.tried === false)
                return;

            chrome.runtime.sendMessage({
                action: 'set_cache',
                url: url,
                isExpanded: !preview,
                result: result
            });
        }
    }
}

function isInBlackListForCompanyInfo(url)
{
    return url.includes('github.com') ||
            url.includes('meetup.com') ||
            url.includes('stackoverflow.com') ||
            url.includes('linkedin.com') ||
            url.includes('.google.') ||
            url.includes('bing.com') ||
            url.includes('facebook.com') ||
            url.includes('twitter.com');
}

function showNotFoundSection(info)
{
    if (info && info.hasOwnProperty('source') && info.source !== 'linkedin' && info.hasOwnProperty('name'))
    {
        // show section with LinkedIn search button
        let searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${info.name}`;
        $('.search_linkedin').attr('href', searchUrl);
        showSection('.person_not_found_with_search_btn');
    } else
    {
        showSection('.person_not_found');
    }
}

function extractEmailsFromSource(source)
{
    var regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gm;

    let emails = [];
    let m;
    while ((m = regex.exec(source)) !== null) {

        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
            emails.push(match);
        });
    }

    emails = Array.from(new Set(emails));

    return emails;
}

function setIntervalLimited(func, interval, max)
{
    var calls = 0;
    var intervalId = setInterval(function () {
        func();
        calls++;

        if (calls >= max)
        {
            clearInterval(intervalId);
        }
    }, interval);
}
