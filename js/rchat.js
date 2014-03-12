(function() {
	function add_room(room_id, name) {
		var rooms = get_rooms();
		rooms.push({
			name : name,
			id : room_id
		});
		localStorage.setItem('rooms', JSON.stringify(rooms));
	}
	function get_rooms() {
		var rooms = localStorage.getItem('rooms');
		if(rooms == null) {
			return [];
		}
		return JSON.parse(rooms);
	}
	window.add_room = add_room;
	window.get_rooms = get_rooms;

	function init_chat_room(milkcocoa, room_id) {
		console.log(room_id);
		//2."message"データストアを作成
		var ds = milkcocoa.DataStore("room/" + room_id + "/message");
		//3."message"データストアからメッセージを取ってくる
		ds.query({}).desort("date").limit(30).done(function(e) {
                    var re = e.reverse();
                    for(var i=0;i < re.length;i++) {
                        renderMessage(re[i]);
                    }
    	});
    	//4."message"データストアのプッシュイベントを監視
    	ds.on("push", function(e) {
    		renderMessage(e.value);
    	});

    	var last_message = "dummy";
    	function renderMessage(message) {
    		var message_html = '<div>' + escapeHTML(message.content) + '</div>';
    		var date_html = '';
    		if(message.date) {
    			date_html = '<div class="date">'+escapeHTML(message.date.toLocaleString())+'</div>';
    		}
        	$("#"+last_message).before('<div id="'+message.id+'" class="message">'+message_html + date_html +'</div>');
        	last_message = message.id;
        }

                function post() {
                    if($("#message-content").val() == "") return;
                    //5."message"データストアにメッセージをプッシュする
                    ds.push({
                        title : "タイトル",
                        content : escapeHTML($("#message-content").val()),
                        date : new Date()
                    }, function(e) {
                        $("#message-content").val("");
                    });
                }

                $('#post').click(function() {
                    post();
                })
                $('#message-content').keydown(function(e) {
                    if(e.which == 13) {
                        post();
                    }
                });
	}
	window.init_chat_room = init_chat_room;
} ())