
function test()
{
    $.ajax({
        url: `${baseURL}/api/v1/userinfo?scope=all`,
        type: 'POST',
        data: {},
        dataType: "json",
        contentType: "application/json",
        headers: {
            access_token: "1CD50D73-7C74-4028-B354-D33A50A93DD9"
        },
        success: function (d) {
            console.log(d);
        },
        error: function (d) {
            console.log(d);
        }
    });
}