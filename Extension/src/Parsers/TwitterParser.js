class TwitterParser {
    static isMyUrl(url) {
        return (url.indexOf('twitter.') > -1);
    }

    static getTwitterUsername(url) {
        var regex = /twitter\.com\/([a-zA-Z0-9\.]*)/;
        var m = regex.exec(url);
        if (m.length > 1) {
            var username = m[1];

            var common_names = ["search", "i", "hashtag", "who_to_follow", "settings", "onboarding"];

            if (common_names.includes(username))
                return "";
            return username;
        } else
            return "";
    }

    static parse(url, source, cb, additionalData) {
        let info = {};

        info.valid = true;
        info.twitter_id = TwitterParser.getTwitterUsername(url);
        info.cat = 2;
        info.source = "twitter";
        info.profile = url;

        if (additionalData && additionalData.hasOwnProperty('title')) {
            let regex = /(.+) \(@(.+)\)/;
            let m = regex.exec(additionalData.title);
            if (m && m.length > 1) {
                info.name = m[1];

                if (m.length > 2) {
                    info.twitter_id = m[2];
                }
            }
        }

        if (source) {
            //selector is icon of website
            var web = $(source).find('[data-testid="UserProfileHeader_Items"]');

            //if user is logged in then below selector for website works
            if (web && web.length > 0 && web.find('[role="link"]').length > 0) {
                info.website = web.find('[role="link"]').text().trim();
                console.log("website: " + info.website);
            }

            // if user is not logged in then below selector for website works
            if (info.website === undefined || (info.website === '' && $(source).find('.ProfileHeaderCard-urlText').length > 0)) {
                info.website = $(source).find('.ProfileHeaderCard-urlText').text().trim();
                console.log("website (from profile header): " + info.website);
            }
            else {
                console.log("website not found");
            }

            //selector for name
            //if user is logged in then below selector for name works
            if ($(source).find('[data-testid="primaryColumn"]').length > 0 && $(source).find('[data-testid="primaryColumn"]').find('h2[role="heading"]').length > 0 && $(source).find('[data-testid="primaryColumn"]').find('h2[role="heading"]').find('[role="presentation"]').length > 0) {
                info.name = $(source).find('[data-testid="primaryColumn"]').find('h2[role="heading"]').find('[role="presentation"]').text();
                console.log("name: " + info.name);
            }

            //if user is not logged in then below selector for name works
            if (info.name === undefined || (info.name === '' && $(source).find('.ProfileHeaderCard-nameLink').length > 0)) {
                info.name = $(source).find('.ProfileHeaderCard-nameLink').text().trim();
                console.log("name (from profile header): " + info.name);
            }
            else {
                console.log("name not found");
            }

        }

        if (!info.twitter_id || !info.name) {
            info.valid = false;
        }

        cb(info);
    }
}