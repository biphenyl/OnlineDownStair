$(document).ready(function()
{
	windowHeight = $(window).height();
	if(windowHeight > 600)
		$("#container").css("margin-top", (windowHeight - 600) / 2 );

	console.log("I trigged at beginning! " + (windowHeight - 600) / 2);
})

$(window).resize(function()
{
	windowHeight = $(window).height();
	if(windowHeight > 600)
	{	
		$("#container").css("margin-top", (windowHeight - 600) / 2 );
		console.log("I trigged! " + (windowHeight - 600) / 2);
	}
	else
	{
		$("#container").css("margin-top", 0 );
	}
})