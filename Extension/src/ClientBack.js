
var ClientBack = function () {

    var base_url = `${baseURL}/api/v1/`;
    var that = this;
    init();
    
    function init()
    {
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse)
            {
                if (request.hasOwnProperty('action') && request.action === 'get_user_info')
                {
                    that.getUserInfoImpl(request.info, sendResponse);
                }
                else if (request.hasOwnProperty('action') && request.action === 'get_company_info')
                {
                    that.getCompanyInfoImpl(request.info, sendResponse);
                }
                else if (request.hasOwnProperty('action') && request.action === 'post_contacts')
                {
                    that.postContacts(request.info, sendResponse);
                }
                else if (request.hasOwnProperty('action') && request.action === 'get_user_info_bulk')
                {
                    that.getUserInfoBulkImpl(request.info, sendResponse);
                }
                else if (request.hasOwnProperty('action') && request.action === 'create_list')
                {
                    that.createList(request.info, sendResponse);
                }
                else if (request.hasOwnProperty('action') && request.action === 'get_lists')
                {
                    that.getLists(request.info, sendResponse);
                }
                
                return true;
            });
    }

    this.getUserInfoImpl = function (info, cb) {
        
        // For Test Server
        if(info && info.hasOwnProperty('source') && info.source == 'localhost')
        {
            let url = info.url;
            if(!info.preview && info.url.includes('.part'))
            {
                url = info.url.replace('.part', '');
            }
            $.get(url, (source) => {
                let ret = {};
                ret.status = true;
                ret.data = source;
                cb(ret);
            });
            return;
        }
        
        // For Live Server
        
        var preview = true;
        if (info.hasOwnProperty('preview') && info.preview == false)
            preview = false;

        var url = base_url + 'userinfo?preview=' + preview;
        
        if(RequestCache.getCache(info, (response)=>{
            if(response)
            {
                cb(response);
            }
            else
            {
                RequestCache.setCache(info);
                requestWithAuth('POST', url, JSON.stringify(info), function (data) {

                    var result = {};
                    result.status = true;
                    result.data = data;
                    
                    RequestCache.setCache(info, result);

                    cb(result);

                }, function (data) {

                    var result = {};

                    var json = data.responseJSON;

                    if(json && json.hasOwnProperty('error'))
                    {
                        if(json.error.indexOf('Authorization Token') > -1)
                        {
                            result.error = 'auth_failed';
                        }
                    }

                    result.status = false;
                    cb(result);

                });
            }
        }));
    }
    
    this.getUserInfoBulkImpl = function (info, cb) {
        
        // For Test Server
        if(info && info.hasOwnProperty('source') && info.source == 'localhost')
        {
            let url = info.url;
            if(!info.preview && info.url.includes('.part'))
            {
                url = info.url.replace('.part', '');
            }
            $.get(url, (source) => {
                let ret = {};
                ret.status = true;
                ret.data = source;
                cb(ret);
            });
            return;
        }
        
        // For Live Server

        var url = base_url + 'bulkuserinfo';
        
        if(RequestCache.getCache(info, (response)=>{
            if(response)
            {
                cb(response);
            }
            else
            {
                RequestCache.setCache(info);
                requestWithAuth('POST', url, JSON.stringify(info), function (data) {

                    var result = {};
                    result.status = true;
                    result.data = data;
                    
                    RequestCache.setCache(info, result);

                    cb(result);

                }, function (data) {

                    var result = {};

                    var json = data.responseJSON;

                    if(json && json.hasOwnProperty('error'))
                    {
                        if(json.error.indexOf('Authorization Token') > -1)
                        {
                            result.error = 'auth_failed';
                        }
                    }

                    result.status = false;
                    cb(result);

                });
            }
        }));
    }

    this.getCompanyInfoImpl = function (info, cb) {
        var url = base_url + 'companyinfo';
        
        if(RequestCache.getCache(info, (response)=>{
            if(response)
            {
                cb(response);
            }
            else
            {
                RequestCache.setCache(info);
                requestWithAuth('POST', url, JSON.stringify(info), function (data) {

                    var result = {};
                    result.status = true;
                    result.data = data;
                    
                    RequestCache.setCache(info, result);
                    
                    cb(result);

                }, function (data) {

                    var result = {};

                    var json = data.responseJSON;

                    if(json && json.hasOwnProperty('error'))
                    {
                        if(json.error.indexOf('Authorization Token') > -1)
                        {
                            result.error = 'auth_failed';
                        }
                    }

                    result.status = false;
                    cb(result);

                });
            }
        }));
    }
    
    this.postContacts = function (info, cb) {
        var url = base_url + 'contacts';

        requestWithAuth('POST', url, JSON.stringify(info), function (data) {
            
            cb(data);

        }, function (data) {

            var result = {};
            
            var json = data.responseJSON;
            
            if(json && json.hasOwnProperty('error'))
            {
                if(json.error.indexOf('Authorization Token') > -1)
                {
                    result.error = 'auth_failed';
                }
            }
            
            result.status = false;
            cb(result);

        });
    }
    
    this.createList = function (info, cb) {
        var url = base_url + 'userlists';

        requestWithAuth('POST', url, JSON.stringify(info), function (data) {
            
            cb(data);

        }, function (data) {

            var result = {};
            
            var json = data.responseJSON;
            
            if(json && json.hasOwnProperty('error'))
            {
                if(json.error.indexOf('Authorization Token') > -1)
                {
                    result.error = 'auth_failed';
                }
            }
            
            result.status = false;
            cb(result);

        });
    }
    
    this.getLists = function (info, cb) {
        var url = base_url + 'userlists';

        requestWithAuth('GET', url, JSON.stringify(info), function (data) {
            
            cb(data);

        }, function (data) {

            var result = {};
            
            var json = data.responseJSON;
            
            if(json && json.hasOwnProperty('error'))
            {
                if(json.error.indexOf('Authorization Token') > -1)
                {
                    result.error = 'auth_failed';
                }
            }
            
            result.status = false;
            cb(result);

        });
    }

    function requestWithAuth(type, url, data, cb, failure)
    {
        TokenHandler.getToken(function (token) {
            $.ajax({
                url: url,
                type: type,
                data: data,
                dataType: "json",
                contentType: "application/json",
                headers: {
                    access_token: token
                },
                success: cb,
                error: failure
            });
        });
    }
}