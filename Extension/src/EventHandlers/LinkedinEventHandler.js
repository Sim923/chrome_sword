
$(document).ready(function () {

    $('body').on('click', '.linkedin_search_result_lookup', function () {

        showSection('.loading_section');

        var url = $(this).attr('data-url');

        let dataProcessor = new DataProcessor();

        // ui is initialized in frame or popup
        dataProcessor.ui = ui;
        dataProcessor.triggerParsers(url, true, {});
    });

    $("#filter_any").click(function () {
        $("#filter_mobile").prop('checked', false);
        $("#filter_landline").prop('checked', false);
        $("#filter_email").prop('checked', false);
    });

    $("#filter_mobile, #filter_landline, #filter_email").click(function () {
        $("#filter_any").prop('checked', false);
    });

    $('body').on('click swordfish:bulklistloaded', '.chkbox_label, label[for="linkedin_select_all"]', function () {
        setTimeout(recountSelectedProfiles, 200);
    });

    function recountSelectedProfiles() {
        let count = $('.linkedin_search_result:checked').length;
        $('label[for=linkedin_select_all]').text(`Select All (${count} selected)`);

        if (count === 0) {
            $("#linkedin_select_all").prop('checked', false);
        }
    }

    $("#linkedin_select_all").click(function () {
        if ($(this).is(':checked')) {
            $('.linkedin_search_results .people_f').find('input[type=checkbox]').prop('checked', true);
        }
        else {
            $('.linkedin_search_results .people_f').find('input[type=checkbox]').prop('checked', false);
        }
    });

    $(".create_new_list_trigger").click(function () {
        $(this).hide();
        $('#new_list').val('');
        $('.select_list_row').hide();
        $('.new_list_row').show();
        ui.resetHeight();
    });

    $('.linkedin_list_cancel_btn').click(function () {
        $('.select_list_row').show();
        $('.new_list_row').hide();
        $(".create_new_list_trigger").show();
        ui.resetHeight();
    });

    $('#linkedin_create_new_list_btn').click(function (e) {

        e.preventDefault();

        let name = $("#new_list").val().trim();

        if (name === "") {
            return;
        }

        let lists = [];
        lists.push(name);

        let request = {};
        request.lists = lists;

        client.createList(request, function (response) {

            console.log(response);

            if (response && response.length > 0) {
                for(let r of response)
                {
                    if (r.hasOwnProperty('name') &&
                            r.hasOwnProperty('id') &&
                            r.hasOwnProperty('response') &&
                            r.response) {
                        $("select.user_lists").append(`<option value='${r.id}'>${r.name}</option>`);
                        $("select.user_lists").val(r.id);
                    }
                }
            }

            $('.select_list_row').show();
            $('.new_list_row').hide();
            $(".create_new_list_trigger").show();
            ui.resetHeight();

        });
    });

    $('#linkedin_search_find').click(function (e) {

        e.preventDefault();

        // no profile is selected
        if ($('.linkedin_search_result:checked').length == 0) {
            $(".tooltip_no_profile_selected").fadeIn('slow', function () {
                setTimeout(function () {
                    $(".tooltip_no_profile_selected").fadeOut();
                }, 2000);
            });
            return;
        }

        // no filter is selected
        if ($("input[id^=filter_]:checked").length === 0) {
            showTooltipMessage(`Please select at least one "must-have"`);
            return;
        }

        ui.showSection('.loading_section');

        let finalRequest = {};

        let requests = [];

        $('.linkedin_search_result:checked').each(function () {

            let url = $(this).siblings('.chkbox_label').attr('data-url');
            let requestId = $(this).siblings('.chkbox_label').attr('data-request-id');
            let cat = $(this).siblings('.chkbox_label').attr('data-cat');
            console.log(url);

            let info = {
                id: requestId,
                processed: false,
                profile: url,
                cat: cat,
                url: url
            };

            if (cat == 1) {
                info.name = $(this).siblings('.chkbox_label').text();
            }

            if (!LinkedinParser.isProfilePreviouslyFetched(info)) {
                requests.push(info);
            }
            
            // TODO: This looks a bit dangerous to me. I do not fully understand the implications
            // just writing this todo in order to check if something goes wrong once
            // bulk-search functionality is enabled
            if (requests.length == 0) {
                ui.showSection('.linkedin_search_results');
            }
        });

        for(let req of requests)
        {
            callParser(req.cat, req.url, '', req, function (info) {

                let found = requests.findIndex(function (e) {
                    return e.id === info.id;
                });

                if (found > -1) {
                    info.processed = true;
                    requests[found] = info;
                }

                let pending = requests.findIndex(function (e) {
                    return e.processed === false;
                });

                if (pending === -1) {
                    allDone();
                }
            });
        }

        function callParser(cat, url, source, info, cb) {
            if (cat == 3) {
                if (url.includes("linkedin.com/sales")) {
                    SalesNavParser.parse(url, source, function (newInfo) {
                        for (let x in newInfo) {
                            if (newInfo.hasOwnProperty(x)) {
                                info[x] = newInfo[x];
                            }
                        }

                        cb(info);
                    });
                }
                else {
                    LinkedinParser.getProfileInfoAsync(url, source, info, cb);
                }
            }
            else if (cat == 6) {
                RecuiterParser.parseAsync(url, source, info, cb);
            }
            else if (cat == 1) {
                cb(info);
            }
            else {
                console.error('unknown cat');
                cb(info);
            }
        }

        function allDone() {
            finalRequest.save_to_list = $('.user_lists').val();

            let filters = {
                email: $('#filter_email').is(':checked'),
                landline: $('#filter_landline').is(':checked'),
                mobile: $('#filter_mobile').is(':checked')
            }

            finalRequest.filters = filters;
            finalRequest.requests = requests;

            client.getUserInfoBulk(finalRequest, userInfoBulkResposeHandler);
        }

    });

    function userInfoBulkResposeHandler(response) {
        if (response && response.hasOwnProperty('status') && response.status) {
            let profiles = response.data;

            if (profiles && profiles.length > 0) {
                let nSuccessfullySaved = 0;

                for(let p of profiles)
                {
                    let id = p.id;
                    let listname = p.list_name;

                    if (id) {
                        let el = $(`.chkbox_label[data-request-id=${id}]`);
                        let wrapper = el.siblings('.ticks_wrapper');
                        let profileCheckBox = el.prev('.linkedin_search_result');
                        if (profileCheckBox) {
                            profileCheckBox.attr('disabled', 'disabled');
                        }

                        if (p.hasOwnProperty('response') && p.response) {
                            nSuccessfullySaved++;

                            if (listname) {
                                wrapper.find('.badge').text(listname);
                                wrapper.find('.badge').show();
                            }
                            wrapper.find('.tick.green').show();
                            wrapper.find('.tick.red').hide();
                        }
                        else {
                            wrapper.find('.badge').hide();
                            wrapper.find('.tick.green').hide();
                            wrapper.find('.tick.red').show();
                        }

                    }
                }

                let msg = `${nSuccessfullySaved} contacts successfully found and added to your list `;
                let profileListName = $('option[value="' + $('.user_lists').val() + '"]').text();
                let successfullyAddedSectionHtml = `<p><img src="img/check.png" alt="check"> ${msg}<a href="">${profileListName}</a></p>`;



                $('.tooltip_contact_added_to_list_successfully').html(successfullyAddedSectionHtml);
                $(".tooltip_contact_added_to_list_successfully").fadeIn(300);
                setTimeout(function () {
                    $(".tooltip_contact_added_to_list_successfully").fadeOut(300)
                }, 5000);

            }
        }
        ui.showSection('.linkedin_search_results');
        console.log(response);
    }

    $(window).scroll(function () {
        if (FacebookParser.isSearchURL(window.location.href)) {
            refreshView();
        }
    });
});
