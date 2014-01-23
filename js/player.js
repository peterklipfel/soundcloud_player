var SWPlayer = {
  state : {currentTrackId : '0', playing : false},
  build : function(){
    // Initialize Player
    $('html').append('<div id="soundwebPlayer"><div id="soundwebPlayerArtwork"></div><div id="soundwebPlayerTrackName"></div><br><div id="soundwebPlayerArtist"></div><div id="soundwebPlayerControls"><span id="soundwebPlayerPrev">Prev</span> <span id="soundwebPlayerPlay">Play</span> <span id="soundwebPlayerNext">Next</span></div></div>')
    var player = $('#soundwebPlayer')
    player.css({'background-color': '#f3f3f3', 'height': '70px', 'position': 'fixed', 'bottom': '0', 'width': '100%'})
    $('#soundwebPlayerPrev').click(function(){
      console.log('prev')
      SWPlayer.state.currentTrackId = (parseInt(SWPlayer.state.currentTrackId)-1).toString()
      console.log(SWPlayer.state.currentTrackId)
      SC.Widget(SWPlayer.state.currentTrackId).play()
      SWPlayer.state.playing = true
    })
    $('#soundwebPlayerPlay').click(function(){
      console.log('play/pause')
      console.log(SWPlayer.state.currentTrackId)
      if(SWPlayer.state.playing){
        SC.Widget(SWPlayer.state.currentTrackId).pause()
        SWPlayer.state.playing = false
      } else {
        SC.Widget(SWPlayer.state.currentTrackId).play()
        SWPlayer.state.playing = true
      }
    })
    $('#soundwebPlayerNext').click(function(){
      console.log("next")
      SWPlayer.state.currentTrackId = (parseInt(SWPlayer.state.currentTrackId)+1).toString()
      console.log(SWPlayer.state.currentTrackId)
      SC.Widget(SWPlayer.state.currentTrackId).play()
    })
    // grab all the iframes for inclusion in the player
    $('iframe').each(function(index, obj){
      var trackIdCapture = /api\.soundcloud\.com\/tracks\/(\d*)/;
      var match = trackIdCapture.exec($(obj).attr('src'));
      if( typeof(match)!=="undefined" && match!==null ){
        $(obj).attr('id', index)
        $(obj).data('soundcloudTrackId', match[1])          
        SC.Widget(index.toString()).bind(SC.Widget.Events.PLAY, function(){
          console.log(toString(this)+" was played")
        })
      }

    })
    //Fill in values for player
    var setPlayerData = function(id){
      $.get("http://api.soundcloud.com/tracks/"+$('#'+id).data('soundcloudTrackId')+".json?client_id="+SOUNDCLOUD_API_KEY, function(data) {
        $('#soundwebPlayerTrackName').append(data.title)
        $('#soundwebPlayerArtwork').append("<img id='soundwebPlayerArtworkImage' src='"+data.artwork_url+"'>")
        $('#soundwebPlayerTrackName').css('float', 'left')
        $('#soundwebPlayerArtwork').css('float', 'left')
        $('#soundwebPlayerArtworkImage').css({'width': '70px', 'height': '70px'})
        $.get("http://api.soundcloud.com/users/"+data.user_id+".json?client_id="+SOUNDCLOUD_API_KEY, function(data) {
          $('#soundwebPlayerArtist').append(data.username)
        })
      })
    }
    setPlayerData('0')
  }
}