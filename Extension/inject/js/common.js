$(document).ready(function () {

    AutoOpenManager.get((autoopen) => {
        if (autoopen) {
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
    let search_engine_link = `${baseURL}/swordfish_search`;

    $('.sign_in_link').attr('href', signInLink);
    $('.signup_link').attr('href', signupLink);
    $('.pricing_link').attr('href', pricingLink);
    $('.dashboard_link').attr('href', dashboardLink);
    $('.policy_link').attr('href', policyLink);
    $('.refer_link').attr('href', referLink);
    $('.search_engine_link').attr('href', search_engine_link);
});

function getActualData() {
    dataProcessor.getActualData(ui);
}

function refreshView() {
    isFrameOpen((isOpen) => {
        if (isOpen) {

            //if terms page is open, then wait for user to accept it before processing.
            if (isWaitingForTermsAccept()) {
                
                if(window.hasOwnProperty(`isPopup`))
                {
                    getCurrentTab((tab) => {
                        chrome.tabs.sendMessage(tab.id, { action: 'open_popup' });
                        window.close();
                    });
                }
                else
                {
                    showSection('.terms');
                }
                return;
            }

            getPageURL((url) => {
                dataProcessor.process(url, ui, getPageSource, $.noop);
            });
        }
    });
}

function isWaitingForTermsAccept() {
    if (localStorage["termsLoading"] === "true") {
        return true;
    }
}

function extractEmailsFromSource(source) {
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

function extractPhonesFromSource(source) {

    var regex = /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/gm;
    let phones = [];
    let m;
    while ((m = regex.exec(source)) !== null) {

        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
            phones.push(match);
        });
    }

    phones = Array.from(new Set(phones));

    return phones;
}