Rooms = new Meteor.collection("Rooms");
State = {
	play:0,
	pause:1
}


// A user clicks on the object in the front end.
$(".room").click( function (){
	// get the id;
	var id = $(this).attr("room_id");
	var room = Rooms.find({"room_id":id}, {});
	// hide template for  
	$("#room_lst").hide();

	Template.video_room.vid_name = function () {
		return room.room_name;
	}

	Template.video_room.user_lst = function() {
		var user_lst = room.user_lst;
		var html = "<div id='user_lst'>";
		for (user_id in user_lst){
			html += "<div id='user'>";	
			html += "<img class='user_pic' src='https://graph.facebook.com/" + user_id + "/picture'> </img>";
			$.ajax({
			  url: "test.html",
			  context: document.body
			  success: function (data){
			    var obj = $.parseJSON(data);	
			    html += "<div class='user_name'>" + obj.name + "</div>";
			  }
   	  })
			html += "</div>;
		}
		html += "</div>";
		return html;
	}
	$("#room").show();
});

if (Meteor.is_client) {
  Template.room_lst.rooms = function () {
    //loop through the rooms
    var html = "";
    var room_lst = Rooms.find();
    for(room in room_lst){
        html += "<div class='room'> " +
			            "<img class='room_main_user_pic' src='https://graph.facebook.com/" + user_id + "/picture'> </img>"+
			            "<div class='room_title' >" + room.room_name + "</div>"+
                "</div>";
        /*var user_lst = room.user_lst;
        var user_count = 0;
        html += "<div class='room_footer'>";
          for ( user_id in user_lst ){
             user_count++;
			       html += "<img class='room_user_pic' src='https://graph.facebook.com/" + user_id + "/picture'> </img>"+
             if (user_count === 5){
                break;
             }
          }
        html += "</div>";*/
    }
    return html;
  };
}

function nextVideo(room_id){
  var room = Rooms.find({"room_id":room_id},{});
  var new_vid_id = room.video_lst[1];
  if (new_vid_id){
	  Rooms.update({"room_id":room_id}, 
               {current_video:{vid_id:new_vid_id,
                 state:State.play,
                 timestamp:new Date().getTime()/1000,
                 time:0
                 },
                video_lst:room.video_lst[1:]});
    return new_vid_id;
  } 
  return -1;
}

function onPlay(room_id){
  var room = Rooms.find({"room_id":room_id},{});
	Rooms.update({"room_id":room_id}, 
               {current_video:{state:State.play,
                  timestamp:new Date().getTime()/1000
                }});
  return room.current_video.time;
}

function onUserJoin(room_id, fb_id){
  var room = Rooms.find({"room_id":room_id},{});
  Rooms.update({"room_id":room_id},
               { user_lst:concat(room.user_lst,[fb_id])})
  return room.current_video.time;  
}

function onPause(room_id, vid_time){
	Rooms.update({"room_id":room_id}, 
               {current_video:{state:State.pause,
                  timestamp:new Date().getTime()/1000,
                  time:vid_time
                }});
}

function onAddedToQueue(vid_id){
  var room = Rooms.find({"room_id":room_id},{});
	Rooms.update({"room_id":room_id}, 
               {video_lst:concat(room.video_lst,[vid_id])});
}



if (Meteor.is_server) {
  Meteor.startup(function () {
	
	  if (Rooms.find().count() === 0){
		Rooms.insert({
		      fb_id:"",
		      room_name:"Global",
		      current_video: {
			      vid_id:"8fJjt068s6s",
			      state:State.play,
			      timestamp:new Date().getTime()/1000, 
            time:0
		      },
		      video_lst:["8fJjt068s6s"],
		      user_lst:[],
		      room_id:1
		}});
	}
    // code to run on server at startup
  });
}
