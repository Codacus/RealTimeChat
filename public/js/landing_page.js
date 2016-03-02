$(function(){	

	var roomid="";

  //Create a new random, 10-character rooom ID that contains only alphanumeric characters
	$(".createNewRoom").click(function () {
    	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    	for( var i=0; i < 10; i++ )
        	roomid += possible.charAt(Math.floor(Math.random() * possible.length));    	
	
		window.location.href = window.location  +roomid;
	});

  //Check if the given room ID is valid and navigate to the room 
	$(".RoomUrl").click(function() {
      
      	roomid = $(".copyroomurl").val();
      
      	roomid = roomid.slice(-10);
      
      	if(/[^a-zA-Z0-9]/.test( roomid )){
      		roomid = "";
      		alert("Please enter a valid link or 10 character long roomid.\n Eg.Fcer9vtsre");
      	}
      	
      	else
			window.location.href = window.location +roomid;
      
    });
});