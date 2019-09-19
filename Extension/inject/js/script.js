$(document).ready(function () {

    $('.upgrade_btn').addClass('tooltipster');
    $('.upgrade_btn').attr('title', 'Premium data is available on all paid plans. Please upgrade to view');
    $('.tooltipster').tooltipster({
        theme: 'tooltipster-borderless'
    });

    $("#phone_input").on("focus", function () {
        $("#phone_input").attr("placeholder", "");
    });

    if ($("#phone_input").length) {
        $("#phone_input").intlTelInput({
            initialCountry: "auto",
            autoPlaceholder: "aggressive",
            geoIpLookup: function (callback) {
                $.get("https://ipinfo.io", function () {}, "jsonp").always(function (resp) {
                    var countryCode = (resp && resp.country) ? resp.country : "";
                    callback(countryCode);
                });
            },
            utilsScript: "js/utils.js"
        });
    }
    $("#country-listbox li").on("click", function () {
        $("#phone_input").val($("#country-listbox li.highlight.highlight").find(".dial-code").text());
        $("#phone_input").focus();
    });
    $(".onlynumbers").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                        (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                        // Allow: home, end, left, right, down, up
                                (e.keyCode >= 35 && e.keyCode <= 40)) {
                    // let it happen, don't do anything
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });



    /*
     if ($(".people_f").length) {
     $('.people_f').animate({scrollTop: $(".people_f>.elem_of_peop:last-child").offset().top}, 700);
     
     
     setTimeout(function () {
     $('.people_f').animate({scrollTop: $(".people_f>.elem_of_peop:nth-child(1)").offset().top - 30}, 1000);
     }, 700);
     }
     */




    $(".four_digits_inpos input").on("keypress", function () {
        if ($(this).next().length) {
            $(this).next().focus();
        }
    });

    $("#phone_input").on("focus", function () {
        $('#phone_input')[0].setSelectionRange(0, 0);
    });
    // if ($("#phone_input").length) {
    // 	$("#phone_input").mask("(999)-999-9999");
    // }

    $("#phone_input").on("keypress", function () {
        if ($(this).length != 0) {
            $(this).css("border", "1px solid #e8e9e9");
        }
    });
    if ($(".countdown_text_but_on_one_page").length) {
        var value = 30;
        var delta = setInterval(function () {
            if (value != 0) {
                if (value <= 10) {
                    value -= 1;
                    $(".countdown_text_but_on_one_page .resend_href>span").text("0" + value);
                } else {
                    value -= 1;
                    $(".countdown_text_but_on_one_page .resend_href>span").text(value);
                }
            } else {
                $(".countdown_text_but_on_one_page .resend_href").text("Resend");
                $(".countdown_text_but_on_one_page .resend_href").removeClass("not-active");
                clearInterval(delta);
            }
        }, 1000);
    }
    $(".input_your_phone .four_digits_continue a").on("click", function (e) {
        e.preventDefault();
        if ($("#phone_input").val().length != 0) {
            $(".input_your_phone").css("display", "none");
            $(".four_digits").fadeIn(300);
            var value = 30;
            $(".inner_search_first_step>span").text("Step 2 of 2");
            var delta = setInterval(function () {
                if (value != 0) {
                    if (value <= 10) {
                        value -= 1;
                        $(".resend_href>span").text("0" + value);
                    } else {
                        value -= 1;
                        $(".resend_href>span").text(value);
                    }
                } else {
                    $(".resend_href").text("Resend");
                    $(".resend_href").removeClass("not-active");
                    clearInterval(delta);
                }
            }, 1000);
        } else {
            $("#phone_input").css("border", "1px solid red");
        }
    });

    $('.resend_href').on("click", function () {
        $("#phone_input").val("");
        $(".resend_href").addClass("not-active");
        $(".resend_href").html("<a href='#' class='not-active resend_href'>Resend in 0:<span>30</span></a>");
        $(".four_digits").css("display", "none");
        $(".input_your_phone").fadeIn(300);
    });


    $(".four_digits_inpos input").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                        (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                        // Allow: home, end, left, right, down, up
                                (e.keyCode >= 35 && e.keyCode <= 40)) {
                    // let it happen, don't do anything
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });





    if ($("#sign_up_modal").length) {
        $("#sign_up_modal").modal("show");
    }


    // $(".content_peop a").on("click" , function(e){
    // 	e.preventDefault();
    // 	$(this).prev().removeClass("not_active");
    // });



    // $('.elem_of_collected a').on("click" ,function(e){
    // 	$(this).prev().removeClass("not_active");
    // 	$(this).prev().addClass("already_shown")
    // 	e.preventDefault();
    // 	$(this).css("display" , 'inline-block');
    // });

    $('.show_btn').on('click', function (e) {
        e.preventDefault();

        DataProcessor.copyToClipboardEnabled = true;

        // Remeber this url as non-teaser
        getPageURL(function (url) {


            // lastURLwithoutTeaser = url;
            // console.log(lastURLwithoutTeaser);
        });

        var that = this;

        if ($(this).prev().length) {
            $(" .wrap_b_part h6").removeClass("not_shown_cut");
            $(" .wrap_b_part h6 span").text("loading...")
            $(".email_cutted").css("direction", "ltr");
            $('.show_btn').fadeOut(200);
        }
    });


    $(".guddan .arrow_hide").on('click', function () {
        chrome.runtime.sendMessage({
            action: "close_popup",
            forward: true
        }, function (r) {
            console.log(r);
        });
        /*
         $(this).closest(".guddan").css("right" , "-450px");
         var closestVal = $(this).closest(".guddan").attr("data-id");
         setTimeout(function(){
         $(".logo_non_vis").attr("data-id" , closestVal);
         $(".logo_non_vis").fadeIn(300);
         } , 1000);
         */
    });

    $('.logo_non_vis').on("click", function () {
        $("body").find("#" + $(this).attr("data-id")).css("right", "0px");
        $(".logo_non_vis").fadeOut(300);
    });

    // Copy the text on click 
    $(".copy_img").on("click", function () {

        if (!DataProcessor.copyToClipboardEnabled)
            return;

        var $temp = $("<input>");
        $("body").append($temp);
        //$temp.val($(this).parent().text()).select();
        $temp.val($(this).parent().find("span").attr("title")).select();
        document.execCommand("copy");
        $temp.remove();
        $(".tooltip_copy").fadeIn(400);
        let that = this;
        setTimeout(function () {
            $('.tooltip_copy').fadeOut(400)
        }, 1500);
    });


    $("#first_step_next").on("click", function () {
        $(".step_one_search").css("display", "none");
        $(".step_two_slider").css("display", "block");
    });

    $("#cell_check").on('change', function () {
        if ($(this).prop("checked") == true) {
            $("#ifnotcelllphone").fadeIn();
        } else {
            $("#ifnotcelllphone").fadeOut();
        }
    });




    $("#phone_check").on('change', function () {
        if ($(this).prop("checked") == true) {
            $("#ifnotphone").fadeIn();
        } else {
            $("#ifnotphone").fadeOut();
        }
    });

    $("#email_check").on('change', function () {
        if ($(this).prop("checked") == true) {
            $("#ifemail").fadeIn();
        } else {
            $("#ifemail").fadeOut();
        }
    });


    $("#range_second_step").slider();
    $("#range_second_step").on("slide", function (slideEvt) {
        $(".header_of_range>p>span").text(slideEvt.value);
        if (slideEvt.value >= 25) {
            $(".if_twenty_five").fadeIn(400);
        } else {
            $(".if_twenty_five").fadeOut(400);
        }
    });
    $(".exrt_first_head").on("click", function () {
        $(".exrt_first_content").slideToggle(300);
    });
    // $(".elem_of_collected>a").on("click" , function(e){
    // 	e.preventDefault();
    // 	$(this).closest(".elem_of_collected").find(".not_allowed_").fadeIn();
    // 	$(this).css('display' , "none");
    // });


    $(".not_active_phone").on("click", function (e) {
        e.preventDefault();

        $('.wrap_b_part h6').fadeIn(400);
        $('.wrap_b_part i').fadeIn(400);
        $('.wrap_b_part h6').css("max-width", "100%");
        $('.wrap_b_part i').css("max-width", "100%");
        $(".not_active_phone").css("display", 'none');
        $(".tooltip_saved").fadeIn(300);
        setTimeout(function () {
            $(".tooltip_saved").fadeOut(300)
        }, 5000);
    });







    $('.elem_questions h6').on("click", function () {


        if ($(this).hasClass("orange_b")) {
            $(this).next().slideUp();
            $(this).removeClass("orange_b");
            $(this).find("img").css("transform", "rotate(0deg)");
        } else {
            $(".elem_questions h6").next().slideUp();
            $(".elem_questions h6").removeClass("orange_b");
            $(".elem_questions h6 img").css("transform", "rotate(0deg)");
            $(this).next().slideToggle();
            $(this).addClass("orange_b");
            $(this).find("img").css("transform", "rotate(90deg)");
        }

    });









    $("#myInput").on("focus", function () {
        $(".variant_of_choices").fadeIn(300);
    });

    $(".variant_of_choices a").on("click", function () {
        $("#myInput").val($(this).text());
        $(".variant_of_choices").fadeOut(300);
    });

    $(".create_list_a_button_in_modal>a").on("click", function () {
        $(".zero_list_block").css("display", 'none');
        $(".add_somebody_to_list").fadeIn(300);
    });


    $(".next_button_modal").on("click", function (e) {
        e.preventDefault();
        $(".first_step_modal").css("display", 'none');
        $('.sec_step_modal').fadeIn(300);
    });

    $(".relative_elem input").on("change", function () {
        var countDelta = 0;
        $('.relative_elem ').each(function (elem, index) {
            if ($(index).find("input").prop("checked") == true) {
                countDelta += 1;
            }
        });
        if (countDelta != 0) {
            $(".move_button").css("display", 'inline-flex');
        } else {
            $(".move_button").css("display", 'none');
        }
    });


    $(".elem_data_field p input").on("change", function () {

        if ($(this).prop("checked") == true) {
            // console.log($(this).closest(".check_of_elem").find(".important_count").text()*$(this).closest(".elem_data_field").find(".credits_per").find("p").find("span").text());
            $(".estimated_credits>h5>span").text(+$(".estimated_credits>h5>span").text() + $(this).closest(".check_of_elem").find(".important_count").text() * $(this).closest(".elem_data_field").find(".credits_per").find("p").find("span").text());
            $(this).closest(".elem_data_field").find(".result_per").find("p").text($(this).closest(".check_of_elem").find(".important_count").text() * $(this).closest(".elem_data_field").find(".credits_per").find("p").find("span").text() + " credits");
        } else {
            $(".estimated_credits>h5>span").text(+$(".estimated_credits>h5>span").text() - $(this).closest(".check_of_elem").find(".important_count").text() * $(this).closest(".elem_data_field").find(".credits_per").find("p").find("span").text());
            $(this).closest(".elem_data_field").find(".result_per").find("p").text("0 credits");
        }
    });




    $('.wrap_of_first_table th').on("click", function (e) {
        if ($(".dropdown_of_th").has(e.target).length === 0) {
            $('.wrap_of_first_table .dropdown_of_th').fadeOut(300)
                    .removeClass("opened_now");
            $(".wrap_of_first_table  img").attr("src", "img/orange_arrow.png")
                    .css("top", "18px");


            if ($(this).find(".dropdown_of_th").is(':visible')) {

                $(this).find("img").attr("src", "img/orange_arrow.png")
                        .css("top", "18px");
                $(this).find(".dropdown_of_th").fadeOut(100)
                        .removeClass("opened_now");
            } else {
                $(this).find("img").attr("src", "img/active_orange.png")
                        .css("top", "13px");
                $(this).find(".dropdown_of_th").fadeIn(100)
                        .addClass("opened_now");
            }
        }



    });

    $(".dropdown_of_th a").on("click", function (e) {
        e.preventDefault();

        $(this).closest(".dropdown_of_th").find("a").removeClass("active_in_drop");
        $(this).addClass("active_in_drop");
        $(this).closest("th").find("span").text($(this).text());
        $(this).closest(".dropdown_of_th").fadeOut(100);
        $(this).closest(".dropdown_of_th").removeClass("opened_now");
        $(this).closest("th").find("img").attr("src", "img/orange_arrow.png")
                .css("top", "18px");
    });


    $(".clickable_tr").on("click", function () {
        $('.clickable_tr').removeClass("active_tr_at_modal");
        $(this).addClass("active_tr_at_modal");
    });




    $("#write_note").on("click", function (e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: $(".notes_bl").offset().top}, 500);
        document.getElementById("editable_span").contentEditable = "true";
        $("#editable_span").addClass("some_bord");
        $("#editable_span").focus();
        $("#editable_span").text("");
    });

    $("#editable_span").on("focusout", function () {
        document.getElementById("editable_span").contentEditable = "false";
        $("#editable_span").removeClass("some_bord");
    });


    if ($('*[data-toggle="tooltip"]').length) {
        $('[data-toggle="tooltip"]').tooltip();
    }


    $(".find_cont_info").on("click", function (e) {
        e.preventDefault();
        var countCheck = 0;
        $(".main_content_table").find("input").each(function (index, elem) {
            if ($(elem).prop("checked") == true) {
                countCheck++;
            }

        });
        if (countCheck == 0) {
            alert("Please select a contact/s to find information for");
        } else {

        }
    });


    $("#all_of_checks").on("change", function () {
        if ($(this).prop("checked") == true) {

            $(".clickable_person").find("input").prop("checked", true);
            // $(".right_person_content").fadeIn(500);
        } else {
            $(this).prop("checked", false);
            $(".clickable_person").find("input").prop("checked", false);
            // $(".right_person_content").fadeOut(500);
        }
    });

    $(".clickable_person").on("click", function (e) {
        if ($(e.target).closest(".first_rrr").length === 0 && !$(e.target).is("a")) {
            if ($(".right_person_content").hasClass("visible_one") && $(this).hasClass("visible_this_person")) {
                $(".right_person_content").fadeOut(500);
                $('.right_person_content').removeClass("visible_one");
                $(".main_content_table").removeClass("control_my_table");
            } else if ($(".right_person_content").hasClass("visible_one") && !$(this).hasClass("visible_this_person")) {
                $(".right_person_content").fadeOut(500);
                $(".right_person_content").fadeIn(500);
                $(".clickable_person").removeClass('visible_this_person');
                $(this).addClass("visible_this_person");
                $('.right_person_content').addClass("visible_one");
                $(".main_content_table").addClass("control_my_table");
            } else {
                $(".right_person_content").fadeIn(500);
                $(".clickable_person").removeClass('visible_this_person');
                $(this).addClass('visible_this_person');
                $('.right_person_content').addClass("visible_one");
                $(".main_content_table").addClass("control_my_table");
            }


        }
    });

    $(".right_person_content>img").on("click", function () {
        $('.right_person_content').removeClass("visible_one");
        $(".clickable_person").removeClass('visible_this_person');
        $('.right_person_content').fadeOut(500);
        $(".main_content_table").removeClass("control_my_table");
    });



    // $(".relative_elem input").on("change" ,function(){
    // 	if ($(this).prop("checked") == true) {
    // 		$(".relative_elem input").prop('checked' , false);
    // 		$(this).prop("checked" , true);
    // 		$(".right_person_content").fadeIn(500);
    // 		$(".main_content_table").addClass("control_my_table");
    // 	} else {
    // 		$(this).prop("checked" , false);
    // 		$(".right_person_content").fadeOut(500);
    // 		$(".main_content_table").removeClass("control_my_table");
    // 	}
    // });


    $(".right_person_content >img").on("click", function () {
        $(".right_person_content").fadeOut();
    });

    $(window).on("resize", function () {
        if ($(window).width() <= 1200) {

            if ($(".right_person_content").length) {
                $(".right_person_content").draggable({
                    containment: "html"
                });
            }
        }
    });
    if ($(window).width() <= 1200) {
        if ($(".right_person_content").length) {
            $(".right_person_content").draggable({
                containment: "html"
            });
        }
    }

    $(".price_switcher a").on("click", function (e) {
        e.preventDefault();
        $(".price_switcher a").removeClass("active_claass");
        $(this).addClass("active_claass");
        if ($(this).hasClass("first_sw")) {
            $(".price_second_list").css("display", "none");
            $(".price_first_list").css("display", "flex");
            // $(".yearly_inning").fadeOut(300);
        } else {
            $(".price_second_list").css("display", "flex");
            $(".price_first_list").css("display", "none");
            // $(".yearly_inning").fadeIn(300);
        }
    });



    $(".menu_icon>img").on("click", function () {
        $('.left_dashboard_panel').css("left", "0px");
        $(".menu-overlay").fadeIn(300);
    });
    $(".menu-overlay").on('click', function () {
        $('.left_dashboard_panel').css("left", "-300px");
        $('.menu-overlay').fadeOut(300);
    });
    $(".dropdown_set ul li a ,  .cool_row>a").on("click", function () {
        $('.left_dashboard_panel').css("left", "-300px");
        $('.menu-overlay').fadeOut(300);
    });

    $(".create_list_a_button a  , .add_somebody_small").on("click", function (e) {
        $(".add_somebody_to_list").css("display", "block");
        $(".top_install_part").css("display", "none");
        $(".zero_list_block").css("display", "none");
        $(".account_settings_block").css("display", "none");
    });
    $(".main_account_info>img").on("click", function () {
        $(".dropdown_set").fadeIn();
    });

    $('.dropdown_set ul li a').on("click", function () {
        $(".dropdown_set").fadeOut();
    });

    $('.account_settings_block>img').on("click ", function () {
        $(".add_somebody_to_list").css("display", "none");
        $(".top_install_part").css("display", "block");
        $(".zero_list_block").css("display", "block");
        $(".account_settings_block").css("display", "none");
    });

    $(".account_settings_button").on("click", function () {
        $(".add_somebody_to_list").css("display", "none");
        $(".top_install_part").css("display", "none");
        $(".zero_list_block").css("display", "none");
        $(".account_settings_block").css("display", "block");
    });


    $(document).mouseup(function (e)
    {
        var container = $(".dropdown_set");


        if (!container.is(e.target) && e.target != $(".main_account_info>img") && container.has(e.target).length === 0)
        {
            container.fadeOut();
        }
    });


    $(".add_somebody_to_list>img").on("click", function () {
        $(".account_settings_block").css("display", "none");
        $(".add_somebody_to_list").css("display", "none");
        $(".top_install_part").css("display", "block");
        $(".zero_list_block").css("display", "block");
    });
});