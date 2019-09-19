
class LinkedinParser {

    static isMyUrl(url)
    {
        return (url.indexOf('.linkedin.') > -1) && LinkedinParser.isLinkedInProfilePageUrl(url);
    }

    static cleanLinkedInURL(url)
    {
        let regex = /(https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9]+)/;
        let match = regex.exec(url);
        if (match && match.length > 1)
        {
            url = match[1];
        }

        return url;
    }

    static isSearchPage(url)
    {
        return (url.indexOf('search/results/') > -1);
    }

    static isLinkedInProfilePageUrl(url)
    {
        return (url.indexOf('.linkedin.com/in') > -1);
    }

    static isSalesNavigatorProfile(url)
    {
        return url.includes('.linkedin.com/sales/people/');
    }

    static isRecuiterProfile(url)
    {
        return url.includes('.linkedin.com/recruiter/profile/');
    }

    static getLinkedinIdFromURL(url)
    {
        var regex = /www\.linkedin\.com\/in\/([0-9a-z]+)/;
        var matches = regex.exec(url);
        if (matches && matches.length > 1)
        {
            return matches[1];
        }
        return "";
    }

    static parse(url, source, cb) {

        // TODO: find a way to parse if source is not there

        let info = {};
        info.valid = true;
        info.profile = url;
        info.cat = 3;

        if (source)
        {
            // basic parsing
            info.name = $(source).find('.pv-top-card-section__name').text().trim();
            info.location = $(source).find('.pv-top-card-section__location').text().trim();
            info.company = $(source).find('.pv-top-card-v2-section__company-name').text().trim();
            info.title = $(source).find('.pv-top-card-section__headline').text().trim();
            info.company_url = "https://www.linkedin.com" + $(source).find('a[data-control-name=background_details_company]').first().attr('href');
            info.profile_photo = $(source).find('.pv-top-card-section__photo').attr('src');

            // for own profile
            if (info.profile_photo === null)
            {
                info.profile_photo = $(source).find('.profile-photo-edit__edit-btn img').attr('src');
            }
        }

        // linkedIn id
        info.linkedin_id = LinkedinParser.getLinkedinIdFromURL(url);

        // get member id, company id and contact info
        LinkedinParser.getProfileInfoAsync(url, source, info, cb);
			
    }
	
	
    static getContactInfo(userid, csfr, cb)
    {
        userid = userid.trim();

        if (!userid || userid === '')
        {
            cb({});
            return;
        }

        let url = `https://www.linkedin.com/voyager/api/identity/profiles/${userid}/profileContactInfo`;

        $.ajax({
            url: url,
            type: 'GET',
            headers: {
                'csrf-token': csfr
            },
            success: function (res) {
                var contactInfo = {};
                if (res)
                {
                    cb(res);
                } else
                {
                    cb({});
                }
            },
            error: function () {
                cb({});
            }
        });

    }
	
    // TODO: Same here. I do not fully understand the implications
    // just writing this todo in order to check if something goes wrong once
    // bulk-search functionality is enabled
    static isProfilePreviouslyFetched(info)
    {
            if(info == null || !info)
                    return false;

            var el=$('[data-request-id='+info.id+']');
            if(el && el.length>0 && el.prev('.linkedin_search_result'))
            {
                    var isDisabled=el.prev('.linkedin_search_result').attr('disabled')	
                    if(isDisabled=== 'disabled')
                    {
                            return true;
                    }
            }
            return false;
    }

    static getProfileInfoAsync(url, source, info, cb)
    {
        // get member id
        var profile_url = url;
        var regex = /\/in\/([^\/]+)\/?/;
        var m = regex.exec(profile_url);
        if (m && m.length > 1)
        {
            var userid = m[1];
            var url = `https://www.linkedin.com/voyager/api/identity/profiles/${userid}/profileView`;

            chrome.runtime.sendMessage({
                action: 'get_session_id'
            }, function (r) {
                if (!r || !r.hasOwnProperty('value'))
                {
                    console.error("unable to get linkedin session id");
                } else
                {
                    var csfr = r.value.substring(1, r.value.length - 1);
                    $.ajax({
                        url: url,
                        type: 'GET',
                        headers: {
                            'csrf-token': csfr
                        },

                        success: function (result) {
                            var text = JSON.stringify(result);
                            var regex = /"urn:li:member:([0-9]*)"/m;
                            var m = regex.exec(text);
                            if (m && m.length > 1)
                            {
                                info.member_id = m[1];
                                console.log("member id: " + m[1]);
                            } else
                            {
                                console.log("unable to extract member id from linkedin response");
                                info.member_id = null;
                            }

                            // company id
                            info.company_id = "";
                            info.company_url = "";
                            if (result.hasOwnProperty('positionGroupView') && result.positionGroupView.hasOwnProperty('elements'))
                            {
                                if (result.positionGroupView.elements.length)
                                {
                                    let e = result.positionGroupView.elements[0];
                                    let text_of_interest = null;

                                    if (e.hasOwnProperty('miniCompany') && e.miniCompany.objectUrn)
                                    {
                                        text_of_interest = e.miniCompany.objectUrn;
                                    }

                                    if (text_of_interest)
                                    {
                                        var regex = /urn:li:company:([0-9]*)/m;
                                        var m = regex.exec(text_of_interest);
                                        if (m && m.length > 1)
                                        {
                                            info.company_id = m[1];
                                            info.company_url = `https://www.linkedin.com/company/${m[1]}/`;
                                            info.company = e.name;
                                        }
                                    }
                                }
                            }

                            // remove company-url if it is search
                            if (info.company_url.includes('keywords'))
                            {
                                info.company_url = null;
                            }

                            // Get full name if not already extracted from web page
                            if (!info.hasOwnProperty('name') || !info.name)
                            {
                                if (result.hasOwnProperty('profile'))
                                {
                                    let fname = result.profile.hasOwnProperty('firstName') ? result.profile.firstName : '';
                                    let lname = result.profile.hasOwnProperty('lastName') ? result.profile.lastName : '';

                                    info.name = fname + ' ' + lname;
                                }
                            }

                            // Get location if not set
                            if (!info.hasOwnProperty('location') || !info.location)
                            {
                                if (result.hasOwnProperty('profile'))
                                {
                                    info.location = result.profile.locationName;
                                }
                            }

                            // Get title/headline
                            if (!info.hasOwnProperty('title') || !info.title)
                            {
                                if (result.hasOwnProperty('profile'))
                                {
                                    info.title = result.profile.headline;
                                }
                            }

                            // country code
                            if (result.hasOwnProperty('profile') && result.profile.hasOwnProperty('location')
                                    && result.profile.location.hasOwnProperty('basicLocation')
                                    && result.profile.location.basicLocation.hasOwnProperty('countryCode'))
                            {
                                info.countrycode = result.profile.location.basicLocation.countryCode;
                            }

                            console.log(info);

                            LinkedinParser.getContactInfo(userid, csfr, function (contactInfo) {
                                console.log(contactInfo);
                                info.contactInfo = contactInfo;
                                cb(info);
                            });
                        },
                        error: function (error) {
                            console.error("Failed to get Linkedin member id");
                            console.log(error);

                            console.log(info);
                            cb(info);
                        }
                    });
                }
            });

        } else
        {
            console.error("unable to extract user id from url");
            cb({});
        }
    }

    static getCompanyId(url, source, info, cb)
    {

    }

    static processSearchPage(url, source)
    {
        var results = [];
        $(source).find(".search-result--person").each(function () {
            let name = $(this).find('.actor-name').text().trim();
            let link = $(this).find('a.search-result__result-link').attr('href');
            let photo = $(this).find("img.presence-entity__image").attr('src');

            if (!photo)
            {
                photo = chrome.runtime.getURL('inject/img/user.png');
            }

            if (name && link)
            {
                link = "https://www.linkedin.com" + link;
                results.push({
                    name: name,
                    url: link,
                    photo: photo
                });
            }
        });

        return results;
    }

    static getSearchResultsAsync(url, source, cb)
    {
        let page = getPageNumberFromURL(url);
        let start = Math.max((page - 1) * 10, 0);
        let term = getSearchTermFromURL(url);
        let asyncURL = `https://www.linkedin.com/voyager/api/search/blended?count=10&filters=List(resultType-%3EPEOPLE)&keywords=${term}&origin=CLUSTER_EXPANSION&q=all&queryContext=List(spellCorrectionEnabled-%3Etrue,relatedSearchesEnabled-%3Etrue,kcardTypes-%3EPROFILE%7CCOMPANY%7CJOB_TITLE)&start=${start}`;
        
        chrome.runtime.sendMessage({action: 'getLinkedinLastRequest'}, function(gotUrl){
            if(gotUrl)
            {
                asyncURL = gotUrl;
            }
            fetchURL(asyncURL);
        });
        
        function fetchURL(asyncURL)
        {

            let results = [];

            let additionalHeaders = {
                                        'x-restli-protocol-version': '2.0.0',
                                        'accept': 'application/vnd.linkedin.normalized+json+2.1'
                                    };

            LinkedinParser.requestWithCsfr(asyncURL, 'GET', function (result) {
                if (result)
                {
                    // the 'included' part of the result
                    let included = null;
                    if(result.hasOwnProperty('data'))
                    {
                        included = result.included;
                    }

                    if(result.hasOwnProperty('data'))
                    {
                        result = result.data;
                    }

                    if (result.hasOwnProperty('elements'))
                    {
                        for(let ele of result.elements)
                        {
                            if (ele.hasOwnProperty('elements'))
                            {
                                for (let el of ele.elements)
                                {
                                    // get name
                                    let title = ``;
                                    if (el.hasOwnProperty('title') && el.title.hasOwnProperty('text'))
                                    {
                                        title = el.title.text;
                                    }

                                    // get link
                                    let link = ``;
                                    if (el.hasOwnProperty('publicIdentifier'))
                                    {
                                        link = `https://www.linkedin.com/in/${el.publicIdentifier}/`;
                                    }

                                    // get photo
                                    let photo = chrome.runtime.getURL('inject/img/user.png');
                                    if(included && el.hasOwnProperty('trackingUrn'))
                                    {
                                        let photoAttempt = null;
                                        let photoSucceeded = false;
                                        let inclElement = included.find(o => o.objectUrn === el.trackingUrn);
                                        if(inclElement && inclElement.hasOwnProperty('picture') &&
                                                inclElement.picture && inclElement.picture.hasOwnProperty('rootUrl'))
                                        {
                                            photoAttempt = inclElement.picture.rootUrl;

                                            if(inclElement.picture.hasOwnProperty('artifacts') &&
                                                    inclElement.picture.artifacts.length > 0)
                                            {
                                                photoAttempt += inclElement.picture.artifacts[0].fileIdentifyingUrlPathSegment;
                                                photoSucceeded = true;
                                            }
                                        }

                                        if(photoSucceeded)
                                        {
                                            photo = photoAttempt;
                                        }
                                    }


                                    results.push({
                                        cat: 3,
                                        name: title,
                                        url: link,
                                        photo: photo
                                    });
                                }

                                cb(results);
                            }
                        }
                    }
                }
            }, additionalHeaders);
        }

        function getPageNumberFromURL(url)
        {
            let parsed = new URL(url);
            return parsed.searchParams.get("page");
        }

        function getSearchTermFromURL(url)
        {
            let parsed = new URL(url);
            return parsed.searchParams.get("keywords");
        }
    }

    static requestWithCsfr(url, method, cb, additionalHeaders)
    {
        chrome.runtime.sendMessage({
            action: 'get_session_id'
        }, function (r) {
            if (!r || !r.hasOwnProperty('value'))
            {
                console.error("CSRF: unable to get linkedin session id");
            } else
            {
                var csfr = r.value.replace(/"/g, "");
                
                var headers = {
                    'csrf-token': csfr
                };
                
                // add additional headers
                if(additionalHeaders)
                {
                    for(let k in additionalHeaders)
                    {
                        if(additionalHeaders.hasOwnProperty(k))
                        {
                            headers[k] = additionalHeaders[k];
                        }
                    }
                }
        
                $.ajax({
                    url: url,
                    type: method,
                    headers: headers,
                    success: function (result) {

                        cb(result);

                    },

                    error: function () {

                        console.error('Linkedin CSFR request failed');

                        cb(false);
                    }
                });
            }
        });
    }
}