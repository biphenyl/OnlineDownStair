var flag = 0;
$(document).ready(function() {
    $("#Menu").click(function() {
        if (flag == 0) {
            $(this).children("a").show();
            flag = 1;
        }else if (flag == 1) {
            $(this).children("a").hide();
            flag = 0;
        }
    });
});