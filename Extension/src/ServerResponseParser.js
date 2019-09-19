class ServerResponseParser
{

    static parseUserData(info, preview = true, ignoredSocialProfiles = [])
    {
        const trunc_length = preview ? 10 : 100;

        let result = {};
        result.isPresentable = false;
        result.preview = preview;
        result.items = [];
        result.socials = [];
        result.email_count = 0;
        result.upgrade = JSON.stringify(info).toLowerCase().includes('upgrade');

        // override preview by server's result (it can happen that server had the full result cached while on extension side, it is not cached
        if (info.hasOwnProperty('result') && info.result === 'FULL')
        {
            result.preview = false;
        }

        if (info.hasOwnProperty('name'))
        {
            result.name = info.name;
        } else
        {
            result.name = false;
        }

        // Emails
        if (info.hasOwnProperty('emails'))
        {
            var count = 0;
            for (var name in info.emails) {
                if (info.emails.hasOwnProperty(name))
                {
                    if(info.emails[name].trim() === "")
                        continue;
                    
                    result.isPresentable = true;
                    parseAndPushItem(`#email_${count}`, info.emails[name]);
                    count++;
                }
            }
            result.email_count = count > 3 ? 3 : count;
        }

        if (info.hasOwnProperty('email'))
        {
            result.isPresentable = true;
            parseAndPushItem(`#email_0`, info.email);
            result.email_count = 1;
        }

        // Address
        if (info.hasOwnProperty('mailing_address') && info.mailing_address)
        {
            parseAndPushItem(`#address`, info.mailing_address);
        }

        if (info.hasOwnProperty('address') && info.address)
        {
            parseAndPushItem(`#address`, info.address);
        }

        // Phones
        if (info && info.hasOwnProperty('phones'))
        {
            if (info.phones.hasOwnProperty('mobile') && info.phones.mobile)
            {
                result.isPresentable = true;
                let phones = info.phones.mobile;
                if (typeof phones == 'string')
                {
                    phones = info.phones.mobile.split(',');
                }
                if (phones.length > 1) {
                    parseAndPushItem(`#cellphone`, phones[0]);
                    parseAndPushItem(`#cellphoneSecond`, phones[1]);
                } else {
                    parseAndPushItem(`#cellphone`, phones[0]);
                }
                result.num_mobiles = phones.length;
            }

            result.phone_count = 0;
            if (info.phones.hasOwnProperty('work') && info.phones.work)
            {
                result.isPresentable = true;
                let phones = info.phones.work;
                if (typeof phones == 'string')
                {
                    phones = info.phones.work.split(',');
                }
                if (phones.length > 1)
                {
                    parseAndPushItem(`#phone_${result.phone_count++}`, phones[0]);
                    parseAndPushItem(`#phone_${result.phone_count++}`, phones[1]);
                } else {
                    parseAndPushItem(`#phone_${result.phone_count++}`, phones[0]);
                }
            }

            if (info.phones.hasOwnProperty('workphone') && info.phones.workphone)
            {
                result.isPresentable = true;
                let phones = info.phones.workphone;
                if (typeof phones == 'string')
                {
                    phones = info.phones.workphone.split(',');
                }
                if (phones.length > 1)
                {
                    parseAndPushItem(`#phone_${result.phone_count++}`, phones[0]);
                    parseAndPushItem(`#phone_${result.phone_count++}`, phones[1]);
                } else {
                    parseAndPushItem(`#phone_${result.phone_count++}`, phones[0]);
                }
            }
        }

        if (info.hasOwnProperty('phones') && info.phones.hasOwnProperty('work') && info.phones.hasOwnProperty('workphone'))
        {
            result.hasTwoPhones = true;
        } else
        {
            result.hasTwoPhones = false;
        }

        if (info && info.hasOwnProperty('phone') && info.phone)
        {
            result.isPresentable = true;
            parseAndPushItem(`#cellphone`, info.phone);
        }

        // DOB
        if (info.hasOwnProperty('dob'))
        {
            parseAndPushItem(`#dob`, info.dob);
        }

        // social icons
        var socialProfiles = {
            'facebook': 's_fb',
            'google': 's_gp',
            'linkedin': 's_ln',
            'twitter': 's_tw'
        };

        if (info && info.hasOwnProperty('social_profiles'))
        {
            for (var s in socialProfiles) {
                if (socialProfiles.hasOwnProperty(s))
                {
                    if (info.social_profiles.hasOwnProperty(s) && !ignoredSocialProfiles.includes(s))
                    {
                        let item = {
                            id: socialProfiles[s],
                            key: s,
                            url: info.social_profiles[s],
                            hasUpgrade: info.social_profiles[s].includes("UPGRADE")
                        };
                        result.socials.push(item);
                    }
                }
            }
        }

        // if all the social profiles found are in ignore list, we don't present
        if (result.socials.filter((elem) => !(ignoredSocialProfiles.includes(elem.key))).length > 1)
        {
            result.isPresentable = true;
        }

        return result;

        function parseAndPushItem(id, text)
        {
            var hasUpgrade_ = hasUpgrade(text);
            text = replaceUpgrade(text);

            let item = {
                id: id,
                short_text: text,
                text: text,
                hasUpgrade: hasUpgrade_
            };

            result.items.push(item);
        }

        function replaceUpgrade(str)
        {
            return str.replace("UPGRADE;", "");
        }

        function trunc(value, desired_length = 10, reverse = false)
        {
            if (value && value.length > desired_length)
            {
                if (reverse)
                    return "..." + value.substr(value.length - desired_length);
                else
                    return value.substr(0, desired_length) + "...";
            }
            return value;
        }

        function hasUpgrade(str)
        {
            return (str.indexOf("UPGRADE") > -1);
        }
    }
}