class BaseUI extends UI {
    showSection() {
    }

    fillUpPeople() {
    }

    fillGmailEmails() {
    }

    presentUserData() {
    }

    showNotFoundSection(info) {
        
        if (info && info.hasOwnProperty('source') && info.source === 'github' && info.hasOwnProperty('name')) {
            // show section with social icon search button
            let searchLinkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${info.name}`;
            let searchFacebookUrl = `https://www.facebook.com/search/people/?epa=SEARCH_BOX&q=${info.name}`;
            let searchTwitterUrl = `https://www.twitter.com/search?src=typed_query&q=${info.name}`;
            let searchStackOverflowUrl = `https://stackoverflow.com/users?q=${info.name}`;
            let searchGithubUrl = `https://github.com/search?q=${info.name}`;;

            $('.social_linkedin_anchor').attr('href', searchLinkedInUrl);
            $('.social_facebook_anchor').attr('href', searchFacebookUrl);
            $('.social_twitter_anchor').attr('href', searchTwitterUrl);
            $('.social_github_anchor').attr('href', searchGithubUrl);
            $('.social_stackoverflow_anchor').attr('href', searchStackOverflowUrl);

            showSection('.person_not_found_with_search_btn');
        } else {
            showSection('.person_not_found');
        }
    }

    presentUserData(data) {
        // reset HTML
        $('.left_wr___').find('img').show();
        $(".no_bottom_border").removeClass('no_bottom_border');

        $(".elem_of_collected").hide();
        $('.upgrade_btn').hide();

        if (data.preview) {
            $('.show_btn').show();
            $('img.copy_img').hide();
        } else {
            $('.show_btn').hide();
            $(".not_shown_cut").removeClass("not_shown_cut");
            if (!data.upgrade) {
                $(".email_cutted").removeClass('email_cutted');
                $(".phone_cutted").removeClass('phone_cutted');
                $(".mailing_cutted").removeClass('mailing_cutted');

                $(".email span").addClass('long_email');
            }
            $('img.copy_img').show();
        }

        if ((data.source === 'recuiter' || data.source === 'gmail') && data.name) {
            $("#name span").text(data.name);
            $("#name").parents(".elem_of_collected").show();
        }

        for (let d in data.items) {
            if (data.items.hasOwnProperty(d)) {
                let elem = data.items[d];
                if (elem.hasUpgrade) {
                    $(elem.id).siblings('.upgrade_btn').show();
                    $(elem.id).siblings('.show_btn').hide();
                    $(elem.id).children("img.copy_img").hide();
                } else {
                    $(elem.id).removeClass('email_cutted');
                    $(elem.id).removeClass('phone_cutted');
                    $(elem.id).removeClass('mailing_cutted');
                }

                $(`${elem.id} span`).text(elem.short_text);

                if (!data.preview)
                    $(`${elem.id} span`).attr('title', elem.text);

                $(elem.id).parents(".elem_of_collected").show();
            }
        }

        $(".social_icon").hide();
        $(".social_icon a").removeAttr("href");
        for (let i = 0; i < data.socials.length; i++) {
            let s = data.socials[i];
            $(`#${s.id}`).parent().show();
            if (s.hasUpgrade) {
                $(`#${s.id}`).closest("div").siblings('.upgrade_btn').show();
                $(`#${s.id}`).closest("div").siblings('.show_btn').hide();
            } else {
                if (!data.preview) {
                    $(`#${s.id}`).attr("href", s.url);
                    $(`#${s.id}`).attr("target", '_blank')
                }
            }
            $("#s_fb").parents(".elem_of_collected").show();
        }

        // special requirements: remove lines if multiple emails, remove multiple icons
        $('.email').parents('.elem_of_collected').addClass('no_bottom_border');
        $(`#email_${data.email_count - 1}`).parents('.elem_of_collected').removeClass('no_bottom_border');

        // two mobile phones, remove redundant icons and separators
        if (data.num_mobiles > 1) {
            $('#cellphone').parents('.elem_of_collected').addClass('no_bottom_border');
            $('#cellphoneSecond').siblings('.left_wr___').find('img').hide();
        }

        // special requirements: remove lines if multiple emails, remove multiple icons
        $('.phone').parents('.elem_of_collected').addClass('no_bottom_border');
        $(`#phone_${data.phone_count - 1}`).parents('.elem_of_collected').removeClass('no_bottom_border');
    }


    fillBulkSearchResults(results) {

        $('.linkedin_search_results .people_inn span').text(results.length + " found");

        // $('.linkedin_search_results .people_f').html("");

        // find existing results which are in current resutls as well
        var existingUrls = [];
        $(".result_item label").each(function () {
            let url = $(this).data('url');
            let found = results.find(function (el) {
                return el.url === url;
            });

            if (!found) {
                $(this).parents('.elem_of_peop').remove();
            }
            else {
                existingUrls.push(url);
            }
        });

        for (var i = 0; i < results.length; i++) {

            if (!existingUrls.includes(results[i].url)) {

                let template = `
                                <div class="elem_of_peop no_border">
                                        <div class="img_peop">
                                            <!--<img src="" alt="prof_im">-->
                                        </div>
                                        <div class="content_peop result_item">
                                            <img src="${results[i].photo}" class="result_photo circled" />

                                            <input type="checkbox" id="profile_${i}" class='linkedin_search_result' />
                                            <label for="profile_${i}" data-request-id="${i + 1}" data-url="${results[i].url}" data-cat="${results[i].cat}" class="chkbox_label">${results[i].name}</label>

                                            <div class="ticks_wrapper">
                                                <span class="badge orange badge_list_name">designers</span>

                                                <img src="img/tick_green.png" class="tick green" />
                                                <img src="img/tick_red.png" class="tick red" />
                                            </div>


                                        </div>
                                    </div>
                                `;

                $('.linkedin_search_results .people_f').append(template);
            }
        }

        // trigger the custom event
        $(`label[for="linkedin_select_all"`).trigger(`swordfish:bulklistloaded`);

        // load lists
        client.getLists({}, function (response) {

            if (response && response.length > 0) {
                for(let r of response)
                {
                    if (r.hasOwnProperty('id') &&
                            r.hasOwnProperty('name')) {
                        if ($(`select.user_lists option[value=${r.id}]`).length == 0) {
                            $("select.user_lists").append(`<option value='${r.id}'>${r.name}</option>`);
                        }
                    }
                }
            }
        });
    }

}