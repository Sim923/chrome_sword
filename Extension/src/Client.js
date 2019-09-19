
var Client = function () {
    
    this.getUserInfo = function(info, cb)
    {
        chrome.runtime.sendMessage({action: 'get_user_info', info: info}, cb);
    }
    
    this.getUserInfoBulk = function(info, cb)
    {
        chrome.runtime.sendMessage({action: 'get_user_info_bulk', info: info}, cb);
    }
    
    this.getCompanyInfo = function(info, cb)
    {
        chrome.runtime.sendMessage({action: 'get_company_info', info: info}, cb);
    }
    
    this.postContacts = function (info, cb) {
        
        chrome.runtime.sendMessage({action: 'post_contacts', info: info}, cb);
    }
    
    this.createList = function (info, cb) {
        
        chrome.runtime.sendMessage({action: 'create_list', info: info}, cb);
    }
    
    this.getLists = function (info, cb) {
        
        chrome.runtime.sendMessage({action: 'get_lists', info: info}, cb);
    }
}