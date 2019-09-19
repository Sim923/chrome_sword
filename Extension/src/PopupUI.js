class PopupUI extends BaseUI
{
    showSection(selector)
    {
        $('.secttion').hide();
        $(selector).show();
        this.resetHeight();
    }
    
    fillUpPeople(info, url)
    {

        $('.company_info .people_inn span').text(info.total_employees + " found");

        var info = info.employees;
        for (var i = 0; i < info.length; i++)
        {
            var p = info[i];
            var id = p.id;
            var cat = 4;

            if (p.hasOwnProperty('member_id'))
            {
                id = p.member_id;
                cat = 7;
            }

            var template = `<div class="elem_of_peop">
                            <div class="img_peop">
                                <!--<img src="" alt="prof_im">-->
                            </div>
                            <div class="content_peop">
                                <p class="not_active">${p.name} <span>${p.title}</span></p>
                                <a href="#" class='find_person' 
                                    data-linkedin-id="${id}" 
                                    data-cat="${cat}"
                                    data-url='${url}'
                                    data-title=${p.title} 
                                    data-company=${p.company} >Find</a>
                            </div>
                        </div>`;

            $('.company_info .people_f').append(template);
        }
    }
    
    fillGmailEmails(emails, url)
    {

        $('.gmail_emails .people_inn span').text(emails.length + " found");

        for (var i = 0; i < emails.length; i++)
        {
            let cat = 5;

            let template = `<div class="elem_of_peop">
                            <div class="img_peop">
                                <!--<img src="" alt="prof_im">-->
                            </div>
                            <div class="content_peop">
                                <p class="not_active">${emails[i].email}</p> <a href="#" class='find_by_email' 
                                    data-email="${emails[i].email}" data-cat="${cat}" data-name="${emails[i].name}">Find</a>
                            </div>
                        </div>`;

            $('.gmail_emails .people_f').append(template);
        }
    }
    
    resetHeight()
    {
        $('body').css('height', $('.guddan').height());
    }
}