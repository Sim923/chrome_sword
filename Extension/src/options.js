
/*
 * ------------------------------------------------
 *  Save Options
 * ------------------------------------------------
 */
function save_options(e) {
    var options = {};
    
    $(".saveable").each(function(){
        var id = $(this).attr('id');
        options[id] = $(this).prop('checked');
    });

    chrome.storage.local.set(options, function () {

        $("#status").text("Successfully saved!").slideDown();

        setTimeout(function () {

            $("#status").fadeOut();

        }, 2000);

    });
}

/*
 * ------------------------------------------------
 *  Load saved options
 * ------------------------------------------------
 */

function restore_options() {
    
    var options = {};
    
    $(".saveable").each(function(){
        var id = $(this).attr('id');
        options[id] = $(this).val();
    });
    
    chrome.storage.local.get(options, function (items) {
        
        for (var key in items) 
        {
            if (items.hasOwnProperty(key)) 
            {
                $('#' + key).prop('checked', items[key]);
            }
        }
        
    });
}

$(document).ready(function () {
    
    restore_options();
    
    $('#save').click(function(e){
        e.preventDefault();
        save_options();
    });
});