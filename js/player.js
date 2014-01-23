var SWPlayer = {
  state : {currentTrackId : '0', playing : false},

  build : function(){
    SWPlayer.buildBoilerPlate()
    SWPlayer.bindFrames()
    SWPlayer.bindPlayerClickHandlers()
    SWPlayer.setPlayerData('0')
  },
  
  buildBoilerPlate : function(){
    $('html').append('<div id="soundwebPlayer"><div id="soundwebPlayerArtwork"></div><div id="soundwebPlayerTrackName"></div><br><div id="soundwebPlayerArtist"></div><div id="soundwebPlayerControls"><span id="soundwebPlayerPrev">Prev</span> <span id="soundwebPlayerPlay">Play</span> <span id="soundwebPlayerNext">Next</span></div></div>')
    var player = $('#soundwebPlayer')
    player.css({'background-color': '#f3f3f3', 'height': '70px', 'position': 'fixed', 'bottom': '0', 'width': '100%'})
  },

  bindPlayerClickHandlers : function() {
    $('#soundwebPlayerPrev').click(function(){
      SWPlayer.state.currentTrackId = (parseInt(SWPlayer.state.currentTrackId)-1).toString()
      SC.Widget(SWPlayer.state.currentTrackId).play()
      SWPlayer.state.playing = true
    })
    $('#soundwebPlayerPlay').click(function(){
      if(SWPlayer.state.playing){
        SC.Widget(SWPlayer.state.currentTrackId).pause()
        SWPlayer.state.playing = false
      } else {
        SC.Widget(SWPlayer.state.currentTrackId).play()
        SWPlayer.state.playing = true
      }
    })
    $('#soundwebPlayerNext').click(function(){
      SWPlayer.state.currentTrackId = (parseInt(SWPlayer.state.currentTrackId)+1).toString()
      SC.Widget(SWPlayer.state.currentTrackId).play()
      SWPlayer.state.playing = true
    })
  },

  bindFrames : function() {
    var index = 0
    $('iframe').each(function(i, obj){
      var trackIdCapture = /api\.soundcloud\.com\/tracks\/(\d*)/;
      var match = trackIdCapture.exec($(obj).attr('src'));
      if( typeof(match)!=="undefined" && match!==null ){
        $(obj).attr('id', index)
        $(obj).data('soundcloudTrackId', match[1])
        SC.Widget(index.toString()).swPlayerId = index
        SC.Widget(index.toString()).bind(SC.Widget.Events.PLAY, function(){
          console.log(this.swPlayerId)
          SWPlayer.setPlayerData(this.swPlayerId.toString())
        })
        index = index+1
      }
    })
  },

  setPlayerData : function(id){
    $.get("http://api.soundcloud.com/tracks/"+$('#'+id).data('soundcloudTrackId')+".json?client_id="+SOUNDCLOUD_API_KEY, function(data) {
      $('#soundwebPlayerTrackName').empty().append(data.title)
      $('#soundwebPlayerArtwork').empty().append("<img id='soundwebPlayerArtworkImage' src='"+data.artwork_url+"'>")
      $('#soundwebPlayerTrackName').css('float', 'left')
      $('#soundwebPlayerArtwork').css('float', 'left')
      $('#soundwebPlayerArtworkImage').css({'width': '70px', 'height': '70px'})
      $.get("http://api.soundcloud.com/users/"+data.user_id+".json?client_id="+SOUNDCLOUD_API_KEY, function(data) {
        $('#soundwebPlayerArtist').empty().append(data.username)
      })
    })
  }
}