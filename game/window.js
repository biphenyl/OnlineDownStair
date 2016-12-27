// Resize game container


$(document).ready(function()
{
	windowHeight = $(window).height();
	if(windowHeight > 600)
		$("#room").css("margin-top", (windowHeight - 600) / 2 );
  if(windowHeight < 600) {
    $('#myViewport').attr({"initial-scale": 0.25, "maximum-scale": 0.25});
  }
});

$(window).resize(function()
{
	windowHeight = $(window).height();
	if(windowHeight > 600)
		$("#room").css("margin-top", (windowHeight - 600) / 2 );	
	else {
		$("#room").css("margin-top", 0 );
    $('#myViewport').attr({"initial-scale": 0.25, "maximum-scale": 0.25});
	}
});
