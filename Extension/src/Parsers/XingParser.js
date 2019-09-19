
class XingParser
{

    static isMyUrl(url)
    {
        return url.includes('.xing.com/profile');
    }

    static parse(url, source, cb)
    {
        let info = {};

        info.valid = true;

        info.url = url;
        info.source = "xing";
        info.cat = 12;

        if (source)
        {
            info.name = $(source).find('h2[data-qa="malt-profile-display-name"]').first().find('span').first().text();
            info.title = $(source).find('div[data-qa="profile-occupation-work_experience"]').first().find('p').first().text();
            info.location = $(source).find('div[data-qa="profile-location"]').first().find('p').first().text();
            info.userid = XingParser.getUserId(url);

            // company
            if (info.title)
            {
                let splits = info.title.split(',');
                if (splits)
                {
                    info.company = splits[splits.length - 1];
                }
            }

            // profile photo (dpd instead of img because cleanHTML() replaces img tags)
            info.profile_photo = $(source).find('figure[data-qa="malt-profile-image"]').first().find('dpd').first().attr('src');

            // info.company_url = $(source).find('.job-company-name').first().find('a').attr('href');


            let ajaxURL = `https://www.xing.com/profile/version/embedded/${info.userid}/cv`;

            jQuery.ajax({

                url: ajaxURL,
                xhr: function () {
                    // Get new xhr object using default factory
                    var xhr = jQuery.ajaxSettings.xhr();
                    // Copy the browser's native setRequestHeader method
                    var setRequestHeader = xhr.setRequestHeader;
                    // Replace with a wrapper
                    xhr.setRequestHeader = function (name, value) {
                        // Ignore the X-Requested-With header
                        if (name == 'X-Requested-With')
                            return;
                        // Otherwise call the native setRequestHeader method
                        // Note: setRequestHeader requires its 'this' to be the xhr object,
                        // which is what 'this' is here when executed.
                        setRequestHeader.call(this, name, value);
                    }
                    // pass it on to jQuery
                    return xhr;
                },

                success: function (res, textStatus, jqXHR) {
                    info.company_url = $(res).find('.company-url').first().find('a').first().attr('href');

                    if (!info.company_url)
                        info.company_url = $(res).find('.job-company-name').first().find('a').attr('href');

                    if (!info.name || !info.userid)
                    {
                        info.valid = false;
                    }

                    cb(info);
                }
            });

            if (!info.name || !info.userid)
            {
                info.valid = false;
            }

            cb(info);
        } else
        {
            cb(info);
        }



    }

    static getUserId(url)
    {
        let regex = /xing\.com\/profile\/([a-zA-Z0-9_-]+)\/?/;
        var matches = regex.exec(url);
        if (matches && matches.length > 1)
        {
            return matches[1];
        }
        return "";
    }

}