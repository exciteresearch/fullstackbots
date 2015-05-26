$( document ).ready( function() {
	setTimeout(function(){
		$( "#draggable" ).draggable({ handle: "divider" });
	},100);
});