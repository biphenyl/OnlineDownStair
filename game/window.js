// Resize game container

$(document).ready(function()
{
	windowHeight = $(window).height();
	if(windowHeight > 600)
		$("#container").css("margin-top", (windowHeight - 600) / 2 );
})

$(window).resize(function()
{
	windowHeight = $(window).height();
	if(windowHeight > 600)
		$("#container").css("margin-top", (windowHeight - 600) / 2 );	
	else
		$("#container").css("margin-top", 0 );
	
})