$(function(){ 
  
  //Initialize view on load. 

  $('#nameModal').modal('show');
  $('#nameModal').on('shown.bs.modal', function() {
        $(this).find('[autofocus]').focus();
  });
 


  
  // Adjust Height of window depending on viewport height.
  
  var req_height= $(window).height() - $(".page-header").outerHeight(true);

  $(".user_box").css('height',req_height-3);

  $("#video-container").css('height',req_height-23);

 
  /*
  ##################################################################################################
    Different Event Handlers Code.
  */

  //Handler for window resizing
  $( window ).resize(function() {
    
    var req_height= $(window).height() - $(".page-header").outerHeight(true);

    $(".user_box").css('height',req_height);
    $("#video-container").css('height',req_height-20);
  });

  // Handler for chat send on pressing enter key.

  $('#chatarea').keypress(function(e) {
    if (e.keyCode == 13 && !e.shiftKey && document.getElementById('chatarea').value !=="") {
      
      e.preventDefault();
      //Broadcast Chat to socket's room.
      socket.emit('chatmsg', document.getElementById('chatarea').value); 
      
      var d = new Date();
      var chatmsg ='<li class="clearfix"><div class="chat-body clearfix" style="font-size:13px"><div class="header clearfix"><strong class="pull-right primary-font">'+user+'</strong></div><p class="text-left">'+document.getElementById('chatarea').value+'</p><small class="pull-right text-muted timespan"><span class="glyphicon glyphicon-time"> </span>'+ d.getHours()+':'+d.getMinutes() +'</small></div></li>';
      
      $(".chat").append(chatmsg);
      $('#chatarea').val('');

      //Auto Scroll to latest message.
      var scrolltoh = $('.panel-body')[0].scrollHeight;
      $('.panel-body').scrollTop(scrolltoh);
    }
  });
//Handlers for input field enter key press

    $('.username').keypress(function(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        $( ".EnterRoom" ).trigger( "click" );
    }
  });

  //Enter room on name submit

  $(".EnterRoom").click(function(){
    
    user = $(".username").val();
    user = user.trim();
    user = user.replace(/\s\s+/g, ' ');
    
    //Validiate name removing extra spaces and check for length and special characters.
    if(user!="" && !(/[^A-Za-z0-9 ]/.test(user)) && user.length>3){ 
      $("#nameModal").modal('hide');
      $(".user_span").html("<h5 class='h5' style='color:white'>Hello <b><u>" + user + "</u></b></h4>" );
      socket.emit('addToRoom',{'room':myroom, 'user':user});
      $("#roompath").val(window.location);
     
    }
    else
      alert("1. Name should contain alphanumeric characters.\n 2. Length should be minimum 4 characters.");
  });

var textarea = $('#chatarea');
var typingStatus = $('.typingstatus');
var lastTypedTime = new Date(0); //lastTypedTime it's 01/01/1970, actually some time in the past
var typingDelayMillis = 1000; // typingDelayMillis how long user can "think about his spelling" before we show "No one is typing -blank space." message

function refreshTypingStatus() {
    if (!textarea.is(':focus') || textarea.val() == '' || new Date().getTime() - lastTypedTime.getTime() > typingDelayMillis) {
    } else {
        socket.emit('usertyping',user);
    }
}
function updateLastTypedTime() {
    lastTypedTime = new Date();
}

setInterval(refreshTypingStatus, 100);
textarea.keypress(updateLastTypedTime);
textarea.blur(refreshTypingStatus);




});    


//###############################################################################################################

/* 
Functions and socket.io event handlers
*/

//global socket object
socket = io();

//global users_online array
user_online_array = "";

//current user
user="";

//user's socket.io server side socket.id to be used as peerjs video chat id
my_socket_id ="";

ispresentationrunning = false;
//Compatiability Shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

//Number of users online in current room
var num_users =0;
var usertypingtimer = null;
//Room id from the url                
myroom = window.location.pathname;
myroom = myroom.slice(1);

/*
  Socket.io custom event handlers
*/

//Send current user details to the server when requested
socket.on("giveuser",function(msg){
  if(user!="" && myroom!="")
    socket.emit('addToRoom',{'room':myroom, 'user':user});
});



socket.on("usertyping", function(typinguser){
   $('.typingstatus').html(typinguser+' is typing...');   

   if (usertypingtimer) {
    clearTimeout(usertypingtimer); //cancel the previous timer.
    usertypingtimer = null;
    }
  usertypingtimer = setTimeout(function(){
    $('.typingstatus').html('');
    }, 1000);
   
    
});


//Receive Chat messges from other users in the room.
socket.on('chatmsg', function(msg){
  var d = new Date();
  clearTimeout(usertypingtimer); //cancel the previous timer.
  usertypingtimer = null;
  $('.typingstatus').html('');
  var chatmsg ='<li class="clearfix"><div class="chat-body clearfix" style="font-size:13px"><div class="header clearfix"><strong class="primary-font pull-left" >'+msg.user+'</strong></div><p class="text-left">'+msg.msg+'</p><small class="pull-right text-muted timespan"><span class="glyphicon glyphicon-time"> </span>'+ d.getHours()+':'+d.getMinutes() +'</small></div></li>';
  $(".chat").append(chatmsg);
  var scrolltoh = $('.panel-body')[0].scrollHeight;
  $('.panel-body').scrollTop(scrolltoh);
  var audio = document.getElementById('sound_chat');
  audio.play();
});

//Receive info of other users connecting in the room
socket.on('user_connect', function(users_array){
  
  $(".user_list").empty();
  
  user_online_array = users_array;
  num_users=user_online_array.length -1;
  
  if(num_users ===0)
    $(".user_list").html("There are no people in this room.");
  
  for(var i=0; i<users_array.length;i++){
    if(users_array[i][0] !== user)
      $(".user_list").append('<div class="btn-group pull-right rm_'+users_array[i][0]+'_div" style="padding: 5px 5px 5px 5px;width:100%">'+users_array[i][0]+'</div>');
  }
});

//Receive info of other user disconnecting.
socket.on('user_disconnect', function(disconnected_user){
   //remove the disconnected user
  $('.rm_'+disconnected_user+'_div').remove();
   
  num_users--;
  if(num_users === 0){
    $(".user_list").empty();
    $(".user_list").html("There are no people in this room.");
  }
}); 
