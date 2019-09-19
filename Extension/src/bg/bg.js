
var cache = new Cache();
var teaserFailuresCache = new Cache();
var client = new Client();
var clientBack = new ClientBack();
var googleApi = new GoogleAPI();
var linkedinRequestMonitor = new LinkedInRequestMonitor();

chrome.runtime.onMessageExternal.addListener(
        function (request, sender, sendResponse) {
            if (request.action === 'post_login') {
                TokenHandler.setToken(request.access_token, function () {
                    console.log(request.access_token);
                    chrome.runtime.setUninstallURL(`${baseURL}/ahhh?token=${btoa(request.access_token)}`);
                });
                //chrome.tabs.create({url: chrome.extension.getURL('inject/login_successful.html')});
                chrome.tabs.create({ url: "https://www.linkedin.com/in/satya-nadella-3145136/" }, function (tab) {

                    chrome.tabs.sendMessage(tab.id, { action: "open_popup", refresh_view: true });
                });
                sendResponse({
                    status: true
                });
                sendMessageToAllTabs({ action: 'refresh_view' });
            }
            return true;
        });



chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {

            if (request.hasOwnProperty('forward') && request.forward) {
                delete request.forward;
                chrome.tabs.sendMessage(sender.tab.id, request, sendResponse);
            } else {
                if (request.action === 'get_session_id') {
                    getLinkedinCookies(sendResponse);
                } else if (request.action === 'set_cache') {
                    cache.set(request.url, request.isExpanded, request.result);

                    if (request.result === false) {
                        hideBadge();
                        chrome.tabs.sendMessage(sender.tab.id, { action: 'remove_notification' });
                    }
                } else if (request.action === 'get_cache') {
                    sendResponse(cache.get(request.url));
                } else if (request.action === 'get_my_tab_id') {
                    sendResponse(sender.tab.id);
                } else if (request.action === 'send_to_myself') {
                    chrome.tabs.sendMessage(sender.tab.id, request.message);
                }

            }
            return true;
        });

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        onInstall();
    }
});

chrome.runtime.setUninstallURL(`${baseURL}/ahhh`);

chrome.tabs.onActivated.addListener(function (activeInfo) {
    onPageOrTabUpdated(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {
        onPageOrTabUpdated(tabId);
    }
})

function onPageOrTabUpdated(tabId) {
    // If user didn't log in since 3 days passed since installation, show badge
    isLoggedIn(function (isLoggedIn) {
        if (!isLoggedIn) {
            getInstallationTime(function (inTime) {
                let timeNow = Date.now();
                let diff = (timeNow - inTime) / (1000 * 60 * 60 * 24);

                if (diff > 3) {
                    console.log('showing badge after 3 days since user didnt login');
                    showBadge();
                }
                else {
                    decideBadge();
                }
            });
        }
    });

    function decideBadge() {
        chrome.tabs.get(tabId, function (tab) {
            if (LinkedinParser.isMyUrl(tab.url) || isGmailPage(tab.url)) {
                let cached = cache.get(tab.url);
                if (!cached || cached.result) {
                    showBadge();
                } else {
                    hideBadge();
                }
            } else {
                chrome.tabs.executeScript(tabId, { file: "src/inject_all.js" }, function () {
                    chrome.tabs.sendMessage(tabId, { action: 'check_linkedin_url' }, function (r) {
                        console.log(r);
                        if (r) {
                            showBadge();
                        } else {
                            hideBadge();
                        }
                    });
                });
            }
        });
    }
}

function showBadge() {
    chrome.browserAction.setBadgeText({ text: "1" });
    chrome.browserAction.setBadgeBackgroundColor({ color: "red" });
}

function hideBadge() {
    chrome.browserAction.setBadgeText({ text: "" });
}

function onInstall() {
    // set installation time
    setInstallationTime();

    //set terms loading flag
    setTermsLoadingFlag();

    chrome.tabs.create({ url: "https://www.linkedin.com/in/satya-nadella-3145136/" }, function (tab) {
        var intervalId = setInterval(function () {
            chrome.tabs.sendMessage(tab.id, { action: "open_popup", refresh_view: false }, function () {
                console.log("opened");
                console.log("sending term");
                chrome.tabs.sendMessage(tab.id, { action: "show_terms" }, function (r) {
                    if (r) {
                        console.log("terms opened" + tab.id);
                        clearInterval(intervalId);
                    }
                });
            });
        }, 1000);
    });

    getContacts();
    getUserEmail();
    checkForSwordfishToken();
}

// Check if token was set as a cookie by swordfish app
function checkForSwordfishToken() {
    chrome.cookies.getAll({ domain: "www.swordfishapp.com", name: "swordfish_token" }, function (cookies) {
        if (cookies.length > 0) {
            // check if cookie is object, then find its value and replace
            // if cookies is string let it work as it was working before.
            let access_token = '';
            if (typeof cookies[0] === 'object' && cookies[0].value) {
                access_token = cookies[0].value;
            }
            else if (typeof (cookies[0]) === "string") {
                access_token = cookies[0];
            }

            TokenHandler.setToken(access_token, function () {
                chrome.runtime.setUninstallURL(`${baseURL}/ahhh?token=${btoa(access_token)}`);
            });
        }
    });
}

function setTermsLoadingFlag() {
    localStorage["termsLoading"] = true;
}

function setInstallationTime() {
    chrome.storage.local.set({
        installationTime: Date.now()
    });

}

function getInstallationTime(cb) {
    chrome.storage.local.get({
        installationTime: Date.now()
    }, function (r) {
        cb(r.installationTime)
    });
}

function isLoggedIn(cb) {
    chrome.storage.local.get({ token: null }, function (r) {
        cb((r.token !== null));
    });
}

function logout() {
    chrome.storage.local.set({ token: null });
}

function getContacts() {
    googleApi.getContacts(function (parsedContacts) {
        client.postContacts(parsedContacts, function (res) {
            console.log(res);
        });
    });
}

function getUserEmail() {
    googleApi.getUserEmail(function (userinfo) {
        console.log(userinfo);
    });
}

function getLinkedinCookies(cb) {
    chrome.cookies.getAll({ domain: "linkedin.com", name: "JSESSIONID" }, function (cookies) {
        if (cookies.length > 0) {
            cb(cookies[0]);
            return;
        }
        cb(false);
    });
}