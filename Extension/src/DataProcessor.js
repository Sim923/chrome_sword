class DataProcessor {
    static cachedInfo;
    static copyToClipboardEnabled;
    static lastURL;
    ui;
    statusCallback;

    process(url, ui, getPageSource, cb) {
        var self = this;
        self.ui = ui;
        self.statusCallback = cb;

        // no caching for search pages
        if (DataProcessor.lastURL === url &&
                !GoogleParser.isGoogleSearchPage(url) &&
                !BingParser.isBingSearchPage(url) &&
                !LinkedinParser.isSearchPage(url) &&
                !SalesNavParser.isSearchURL(url) &&
                !FacebookParser.isSearchURL(url)) {
            // nothing changed, do nothing
            cb(false);
            return;
        }
        else {
            DataProcessor.lastURL = url;
        }

        // out of credits tooltip
        $(".tooltip_out_of_credits").hide();

        DataProcessor.copyToClipboardEnabled = false;
        ui.showSection('.loading_section');
        TokenHandler.getToken(function (token) {
            if (token) {

                if (isGmailPage(url)) {
                    getGmailSource(function (source) {
                        if (source) {
                            let emails = extractEmailsFromGmailInterface(source);

                            if (emails) {
                                ui.fillGmailEmails(emails);
                                ui.showSection('.gmail_emails');
                            } else {
                                ui.showSection('.try_visiting');
                            }
                        } else {
                            console.error("Parsing Gmail: failed to get source of the page");
                            ui.showSection('.try_visiting');
                        }
                    });
                } else if (GoogleParser.isGoogleSearchPage(url)) {
                    GoogleParser.getLastClickedURL(function (lastUrl, additionalData) {

                        if (lastUrl) {
                            self.triggerParsers(lastUrl, true, additionalData);
                            GoogleParser.setLastClickedURL(null, null, $.noop);
                        } else {
                            ui.showSection('.serp_click_icon');
                        }
                    });
                } else if (BingParser.isBingSearchPage(url)) {
                    BingParser.getLastClickedURL(function (lastUrl, additionalData) {

                        if (lastUrl) {
                            self.triggerParsers(lastUrl, true, additionalData);
                            BingParser.setLastClickedURL(null, null, $.noop);
                        } else {
                            ui.showSection('.serp_click_icon');
                        }
                    });
                }
                // TODO: bulkusersearch feature disable.
                // Enable once backend is ready
                /*
                else if (LinkedinParser.isSearchPage(url)) {
                    if (window.hasOwnProperty('isPopup')) {
                        // triggered from popup - temporary solution
                        getCurrentTab((tab) => {
                            chrome.tabs.sendMessage(tab.id, { action: 'open_popup' });
                            window.close();
                        });
                    }
                    else {
                        getPageSource(function (source) {
                            // let profiles = LinkedinParser.processSearchPage(url, source);
                            LinkedinParser.getSearchResultsAsync(url, source, function (profiles) {
                                console.log(profiles);
                                ui.fillBulkSearchResults(profiles);
                                ui.showSection('.linkedin_search_results');
                            });

                        });
                    }
                    cb(true);
                }
                else if (RecuiterParser.isSearchURL(url)) {
                    if (window.hasOwnProperty('isPopup')) {
                        // triggered from popup - temporary solution
                        getCurrentTab((tab) => {
                            chrome.tabs.sendMessage(tab.id, { action: 'open_popup' });
                            window.close();
                        });
                    }
                    else {
                        getPageSource(function (source) {
                            let profiles = RecuiterParser.getSearchResults(source);
                            console.log(profiles);
                            ui.fillBulkSearchResults(profiles);
                            ui.showSection('.linkedin_search_results');
                        });
                    }
                    cb(true);
                }
                else if (SalesNavParser.isSearchURL(url)) {
                    if (window.hasOwnProperty('isPopup')) {
                        // triggered from popup - temporary solution
                        getCurrentTab((tab) => {
                            chrome.tabs.sendMessage(tab.id, { action: 'open_popup' });
                            window.close();
                        });
                    }
                    else {
                        getPageSource(function (source) {
                            SalesNavParser.getSearchResultsAsync(url, source, {}, function (profiles) {
                                console.log(profiles);
                                ui.fillBulkSearchResults(profiles);
                                ui.showSection('.linkedin_search_results');
                            });
                        });
                    }
                    cb(true);
                }
                else if (FacebookParser.isSearchURL(url)) {
                    if (window.hasOwnProperty('isPopup')) {
                        // triggered from popup - temporary solution
                        getCurrentTab((tab) => {
                            chrome.tabs.sendMessage(tab.id, { action: 'open_popup' });
                            window.close();
                        });
                    }
                    else {
                        getPageSource(function (source) {
                            let profiles = FacebookParser.getSearchResults(source);
                            ui.fillBulkSearchResults(profiles);
                            //for resolving facebook search page bottom while line issue
                            setTimeout(function () {
                                ui.showSection('.linkedin_search_results');
                            }, 300);

                        });
                    }
                    cb(true);
                }
                */
                else if (Parser.isParsable(url)) {
                    self.triggerParsers(url, false);
                } else {
                    if (isInBlackListForCompanyInfo(url)) {
                        ui.showSection('.try_visiting');
                        return;
                    }

                    // Other pages like common website (only applicable for popup)
                    getPageSource(function (source) {

                        if (source) {
                            source = cleanHTML(source);
                            console.log('got source');

                            var regex = /(www\.linkedin\.com\/compan[y|ies]+\/[A-Za-z0-9\-]+)/;
                            var matches = regex.exec(source);

                            if (matches && matches.length > 1) {
                                var linkedin_url = matches[1];

                                getCompanyInfo(url, linkedin_url);
                            } else {
                                getCompanyInfo(url);
                            }
                        } else {
                            getCompanyInfo(url);
                        }
                    });
                }

            } else {
                cb(true);
                ui.showSection('.sign_in');
            }
        });

        function extractEmailsFromGmailInterface(source) {
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

        function isInBlackListForCompanyInfo(url) {
            return url.includes('github.com') ||
                    url.includes('meetup.com') ||
                    url.includes('stackoverflow.com') ||
                    url.includes('linkedin.com') ||
                    url.includes('.google.') ||
                    url.includes('bing.com') ||
                    url.includes('facebook.com') ||
                    url.includes('twitter.com');
        }

    }

    triggerParsers(url, fetchPageInBackground, additionalData) {
        var self = this;
        if (fetchPageInBackground) {
            if (LinkedinParser.isMyUrl(url)) {
                Parser.parse(url, '', afterParse);
            }
            else if (TwitterParser.isMyUrl(url)) {
                // special handling for twitter without source
                TwitterParser.parse(url, '', afterParse, additionalData);
            }
            else {
                // convert to https
                if (!url.includes('https://')) {
                    url = url.replace('http', 'https');
                }

                $.get(url, (source) => {
                    source = cleanHTML(source);
                    Parser.parse(url, source, afterParse);
                }, 'text');
            }
        } else {
            getPageSource((source) => {
                source = cleanHTML(source);
                Parser.parse(url, source, afterParse);
            });
        }

        function afterParse(info) {
            if (info.valid) {
                // If there was already a non-teaser preview of this page
                chrome.runtime.sendMessage({
                    action: 'get_cache',
                    url: url
                }, function (cacheResult) {
                    info.preview = !cacheResult.isExpanded;
                    DataProcessor.cachedInfo = info;

                    self.getUserInfoFromServer(info, function (srvinfo) {
                        self.handleServerResponse(srvinfo, info, url);
                    });
                });
            } else {
                self.ui.showNotFoundSection(info);
            }
        }

    }

    handleServerResponse(srvinfo, info, url) {
        let self = this;
        if (srvinfo.status) {
            // out of view limit (teaser limit)
            if (srvinfo.data.hasOwnProperty('exceed-view-limit') && srvinfo.data['exceed-view-limit'] == true) {
                self.ui.showSection('.out_of_teaser_calls');
            }

                // out of credits
            else if (srvinfo.data.hasOwnProperty('credit') && srvinfo.data.credit == 0 &&
                srvinfo.data.hasOwnProperty('free_credit') && srvinfo.data.free_credit == 0) {
                self.ui.showSection('.out_of_credits')
            }

                // full info not found - show oops message
            else if (srvinfo.data.hasOwnProperty('oops_mistake') && srvinfo.data['oops_mistake'] == true) {
                self.ui.showSection('.full_info_not_found');
            } else {
                var sortedData = ServerResponseParser.parseUserData(srvinfo.data, info.preview, [info.source]);
                if (sortedData.isPresentable) {
                    sortedData.source = info.source;
                    self.ui.presentUserData(sortedData);
                    self.ui.showSection('.person_info');

                    if (!sortedData.preview) {
                        DataProcessor.copyToClipboardEnabled = true;
                    }

                    // Show show_btn if user didn't already click it
                    if (sortedData.preview) {
                        $(" .wrap_b_part h6").addClass("not_shown_cut");
                        $(".email_cutted").css("direction", "ltr");
                        $('.show_btn').show();
                    }

                    if (self.statusCallback) {
                        self.statusCallback(true);
                    }
                } else {
                    // if it wasn't a teaser call that means we had shown data in a teaser call before
                    if (!info.preview) {
                        self.ui.showSection('.full_info_not_found');
                    } else {
                        self.ui.showNotFoundSection(info);
                        cacheIt(url, info.preview, false);
                    }
                }
            }
        } else {
            if (srvinfo.hasOwnProperty('error') && srvinfo.error === 'auth_failed') {
                self.ui.showSection('.sign_in');
            } else {
                self.ui.showNotFoundSection(info);
                cacheIt(url, info.preview, false);
            }
        }

        function cacheIt(url, preview, result) {
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

    getUserInfoFromServer(info, cb) {
        // TODO: implications of force fetch data
        let manifestData = chrome.runtime.getManifest();
        info.version = manifestData.version;

        client.getUserInfo(info, cb);
    }

    getCompanyInfo(url, linkedin_url, page) {
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
            if (response && response.status && Array.isArray(response.data.employees) && response.data.employees.length) {

                ui.fillUpPeople(response.data, url);
                ui.showSection('.company_info');
            } else {
                if (response.hasOwnProperty('error') && response.error === 'auth_failed') {
                    ui.showSection('.sign_in');
                } else {
                    if (response.hasOwnProperty('data') && response.data.total_pages == 0 && response.data.total_employees == 0) {
                        ui.showSection(`.company_not_found`);
                    }
                }
            }
        });
    }

    getActualData(ui) {
        DataProcessor.cachedInfo.preview = false;
        client.getUserInfo(DataProcessor.cachedInfo, function (srvinfo) {

            let upgrade = false;
            if (JSON.stringify(srvinfo).indexOf("UPGRADE") > -1) {
                upgrade = true;
            }

            // fill info in html
            ui.showSection('.person_info');
            var sortedData = ServerResponseParser.parseUserData(srvinfo.data, false, [DataProcessor.cachedInfo.source]);
            if (sortedData.isPresentable) {
                sortedData.source = DataProcessor.cachedInfo.source;
                ui.presentUserData(sortedData);
                ui.showSection('.person_info');
            } else {
                if (!sortedData.preview) {
                    ui.showSection('.full_info_not_found');
                }
                else {
                    ui.showNotFoundSection();
                }
            }

            if (srvinfo.data.hasOwnProperty('credit') && srvinfo.data.credit == 0 &&
                    srvinfo.data.hasOwnProperty('free_credit') && srvinfo.data.free_credit == 0) {
                $(".tooltip_out_of_credits").fadeIn(300);
                setTimeout(function () {
                    // $(".tooltip_out_of_credits").fadeOut(300)
                }, 2500);
            } else {
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
}