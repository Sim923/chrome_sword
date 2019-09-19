
var GoogleAPI = function () {

    const api_key = `AIzaSyCXu7UeWMEJAIkcqIBYPM5vGOqqUPyEGLk`;
    var token = null;

    this.getContacts = function (cb)
    {
        let contactsURL = `https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=1000`;
        request(contactsURL, function (data) {
            let parsedContacts = parseContacts(data);
            console.log(parsedContacts);
            cb(parsedContacts);
            client.postContacts(parsedContacts, function (res) {
                console.log(res);
            });
        });
    }

    this.getUserEmail = function(cb)
    {
        let userInfoURL = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json`;
        request(userInfoURL, function (data) {
            if(data && data.hasOwnProperty('email'))
            {
                cb(data.email);
            }
            else
            {
                cb(null);
            }
            console.log(data);
        });
    }
    
    this.revokeToken = function(cb){
        let tokenURL = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
        $.get(tokenURL, function(data){
            token = null;
            console.log(data);
        });
    }

    function initOAuth(cb)
    {
        chrome.identity.getAuthToken({interactive: true}, function (recToken) {
                console.log(recToken);
                token=recToken;
                cb();
            });
    }

    function request(url, cb)
    {
        initOAuth(() => {
            let init = {
                method: 'GET',
                async: true,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                'contentType': 'json'
            };
            fetch(url, init)
                    .then((response) => response.json())
                    .then(function (data) {
                        cb(data);
                    });
        });
    }

    function parseContacts(obj)
    {
        let result = [];

        if (obj.hasOwnProperty('feed') && obj.feed.hasOwnProperty('entry'))
        {
            let contacts = obj.feed.entry;
            for (let i = 0; i < contacts.length; i++)
            {
                let contact = contacts[i];
                let item = {};
                item.title = contact.hasOwnProperty('title') ? contact.title.$t : "";

                item.emails = [];
                if (contact.hasOwnProperty('gd$email'))
                {
                    item.emails = contact.gd$email;
                }

                item.organizations = [];
                if (contact.hasOwnProperty('gd$organization'))
                {
                    for (let j = 0; j < contact.gd$organization.length; j++)
                    {
                        let org = {};
                        for (let prop in contact.gd$organization[j])
                        {
                            if (contact.gd$organization[j].hasOwnProperty(prop))
                            {
                                let key = prop.replace('gd$', '');
                                org[key] = contact.gd$organization[j][prop].$t;
                            }
                        }
                        item.organizations.push(org);
                    }
                }

                item.phones = [];
                if (contact.hasOwnProperty('gd$phoneNumber'))
                {
                    for (let j = 0; j < contact.gd$phoneNumber.length; j++)
                    {
                        let phone = {};
                        for (let prop in contact.gd$phoneNumber[j])
                        {
                            if (contact.gd$phoneNumber[j].hasOwnProperty(prop))
                            {
                                let key = prop.replace('gd$', '');
                                if (key === '$t')
                                    key = 'phone';
                                phone[key] = contact.gd$phoneNumber[j][prop];
                            }
                        }
                        item.phones.push(phone);
                    }
                }

                item.addresses = [];
                if (contact.hasOwnProperty('gd$postalAddress'))
                {
                    for (let j = 0; j < contact.gd$postalAddress.length; j++)
                    {
                        let adr = {};
                        for (let prop in contact.gd$postalAddress[j])
                        {
                            if (contact.gd$postalAddress[j].hasOwnProperty(prop))
                            {
                                let key = prop.replace('gd$', '');
                                if (key === '$t')
                                    key = 'formattedAddress';
                                adr[key] = contact.gd$postalAddress[j][prop];
                            }
                        }
                        item.addresses.push(adr);
                    }
                }
                result.push(item);
            }
        }

        return result;
    }
}