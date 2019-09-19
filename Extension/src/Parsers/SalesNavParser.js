class SalesNavParser
{
    static isMyUrl(url)
    {
        return url.includes('.linkedin.com/sales/people/');
    }
    
    static isSearchURL(url)
    {
        return url.includes('linkedin.com/sales/search/people');
    }
    
    static parse(url, source, cb)
    {
        let info = {};
        info.valid = true;
        info.cat = 3;
        info.source = "linkedin";
        info.subsource = "salesnav";
        
        SalesNavParser.getMemberId(url, info, cb);
    }
    
    static getMemberId(url, info, cb){
        
        if(!info) 
            info = {};
        
        let regex = /sales\/people\/([A-Za-z0-9-_,]+)/;
        let matches = regex.exec(url);
        if(matches && matches.length > 1)
        {
            let params = matches[1];
            let broken = params.split(",");
            
            if(broken.length < 3)
            {
                console.error("unable to find enough params from url");
                info.valid = false;
                cb(info);
                return;
            }
            
            var userid = broken[0];
            var authType = broken[1];
            var authToken = broken[2];
            
            chrome.runtime.sendMessage({
                    action: 'get_session_id'
                }, function (r) {
                    if (!r || !r.hasOwnProperty('value'))
                    {
                        console.error("unable to get linkedin session id");
                        info.valid = false;
                        cb(info);
                    }
                    else
                    {
                        let getURL = `https://www.linkedin.com/sales-api/salesApiProfiles/(profileId:${userid},authType:${authType},authToken:${authToken})?decoration=%28entityUrn%2CobjectUrn%2CpictureInfo%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cheadline%2CmemberBadges%2Cdegree%2CprofileUnlockInfo%2Clocation%2ClistCount%2Cindustry%2CnumOfConnections%2CinmailRestriction%2CsavedLead%2CdefaultPosition%2CcontactInfo%2Csummary%2CcrmStatus%2CpendingInvitation%2Cunlocked%2CrelatedColleagueCompanyId%2CnumOfSharedConnections%2CshowTotalConnectionsPage%2CconnectedTime%2CnoteCount%2CflagshipProfileUrl%2Cpositions*%2Ceducations*%2Ctags*~fs_salesTag%28entityUrn%2Ctype%2Cvalue%29%29`;
                        var csfr = r.value.replace(/"/g, "");
                        $.ajax({
                            url: getURL,
                            type: 'GET',
                            headers: {
                                'csrf-token': csfr,
                                'X-RestLi-Protocol-Version': '2.0.0'
                            },
                            success: function (result) {
                                
                                info.company_id = result.relatedColleagueCompanyId;
                                info.profile = result.flagshipProfileUrl;
                                
                                var text = JSON.stringify(result);
                                var regex = /"urn:li:member:([0-9]*)"/m;
                                var m = regex.exec(text);
                                if (m && m.length > 1)
                                {
                                    info.member_id = m[1];
                                    console.log("member id: " + m[1]);
                                } else
                                {
                                    console.log("unable to extract member id from salesnav response");
                                    info.member_id = null;
                                    info.valid = false;
                                }
                                
                                console.log(info);
                                cb(info);
                            },
                            error: function (error) {
                                console.error("Failed to get SalesNav member id");
                                console.log(error);
                                
                                info.valid = false;
                                console.log(info);
                                cb(info);
                            }
                        });
                    }
                });
        }
    }
    
    static getSearchResultsAsync(url, source, info, cb)
    {
        let asyncURL = ``;
        if(source)
        {
            let regex = /"request":"(\/sales-api\/salesApiPeopleSearch.+)","status":200,"body"/gm;
            let matches = regex.exec(source);
            if(matches && matches.length > 1)
            {
                let x = JSON.parse('"' + matches[1] + '"');
                asyncURL = `https://www.linkedin.com${x}`;
            }
        }
        
        console.log(asyncURL);
        
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
                                        'x-restli-protocol-version': '2.0.0'
                                    };

            LinkedinParser.requestWithCsfr(asyncURL, 'GET', function (result) {
                if (result)
                {
                    if (result.hasOwnProperty('elements'))
                    {
                        for (let el of result.elements)
                        {
                            // get name
                            let title = ``;
                            if (el.hasOwnProperty('fullName'))
                            {
                                title = el.fullName;
                            }

                            // get link
                            let link = ``;
                            if (el.hasOwnProperty('entityUrn'))
                            {
                                let entityUrn = el.entityUrn;
                                let regex = /urn:li:fs_salesProfile:\((.+)\)/;
                                let matches = regex.exec(entityUrn);
                                if(matches && matches.length > 1)
                                {
                                    link = `https://www.linkedin.com/sales/people/${matches[1]}/`;
                                }
                            }

                            // get photo
                            let photo = chrome.runtime.getURL('inject/img/user.png');
                            if(el.hasOwnProperty('profilePictureDisplayImage'))
                            {
                                let photoAttempt = null;
                                let photoSucceeded = false;
                                let picElement = el.profilePictureDisplayImage;
                                if(picElement && picElement.hasOwnProperty('rootUrl'))
                                {
                                    photoAttempt = picElement.rootUrl;

                                    if(picElement.hasOwnProperty('artifacts') &&
                                            picElement.artifacts.length > 0)
                                    {
                                        photoAttempt += picElement.artifacts[0].fileIdentifyingUrlPathSegment;
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
                                source: 'navigator',
                                name: title,
                                url: link,
                                photo: photo
                            });
                        }

                        cb(results);
                    }
                }
                else
                {
                    cb([]);
                }
            }, additionalHeaders);
        }
    }
      
}