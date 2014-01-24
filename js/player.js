var SWPlayer = {
  state : {currentTrackId : 0, playing : false, trackList: []},

  build : function(){
    SWPlayer.buildBoilerPlate()
    SWPlayer.bindFrames()
    SWPlayer.bindPlayerClickHandlers()
    SWPlayer.setPlayerData(SWPlayer.state.trackList[SWPlayer.state.currentTrackId])
  },
  
  buildBoilerPlate : function(){
    $('html').append('<div id="soundwebPlayer"><div id="soundwebPlayerArtwork"></div><div id="soundwebPlayerTrackName"></div><br><div id="soundwebPlayerArtist"></div><div id="soundwebPlayerControls"><span id="soundwebPlayerPrev">Prev</span> <span id="soundwebPlayerPlay">Play</span> <span id="soundwebPlayerNext">Next</span></div></div>')
    var player = $('#soundwebPlayer')
    player.css({'background-color': '#f3f3f3', 'height': '70px', 'position': 'fixed', 'bottom': '0', 'width': '100%'})
  },

  bindPlayerClickHandlers : function() {
    $('#soundwebPlayerPrev').click(function(){
      SWPlayer.state.currentTrackId = (SWPlayer.state.currentTrackId-1)%SWPlayer.state.trackList.length
      SC.Widget(SWPlayer.state.trackList[SWPlayer.state.currentTrackId]).play()
      SWPlayer.state.playing = true
    })
    $('#soundwebPlayerPlay').click(function(){
      console.log(SWPlayer.state)
      if(SWPlayer.state.playing){
        SC.Widget(SWPlayer.state.trackList[SWPlayer.state.currentTrackId]).pause()
        SWPlayer.state.playing = false
      } else {
        SC.Widget(SWPlayer.state.trackList[SWPlayer.state.currentTrackId]).play()
        SWPlayer.state.playing = true
      }
    })
    $('#soundwebPlayerNext').click(function(){
      SWPlayer.state.currentTrackId = (SWPlayer.state.currentTrackId+1)%SWPlayer.state.trackList.length
      SC.Widget(SWPlayer.state.trackList[SWPlayer.state.currentTrackId]).play()
      SWPlayer.state.playing = true
    })
  },

  bindFrames : function() {
    $('iframe').each(function(i, obj){
      var trackIdCapture = /api\.soundcloud\.com\/tracks\/(\d*)/;
      var match = trackIdCapture.exec($(obj).attr('src'));
      if( typeof(match)!=="undefined" && match!==null ){
        $(obj).data('soundcloudTrackId', match[1])
        $(obj).attr('id', match[1])
        SWPlayer.state.trackList.push(match[1])
        SC.Widget(match[1]).swPlayerId = match[1]
        SC.Widget(match[1]).bind(SC.Widget.Events.PLAY, function(){
          SWPlayer.setPlayerData(this.swPlayerId.toString())
          SWPlayer.state.currentTrackId = SWPlayer.state.trackList.indexOf(this.swPlayerId)
          SWPlayer.state.playing = true
        })
      }
    })
  },

  setPlayerData : function(id){
    console.log(id)
    $.get("http://api.soundcloud.com/tracks/"+id+".json?client_id="+SOUNDCLOUD_API_KEY, function(data) {
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