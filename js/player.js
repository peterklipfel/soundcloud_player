var SWPlayer = {
  state : {currentTrackNum : 0, playing : false, trackList: [], playlistUp : false},

  addToPlaylist : function(data){
    $('#soundwebPlayerPlaylist').append('<li id="playlist-'+data.id+'" data-soundcloud-track-id='+data.id+'>'+data.title+'</li>')
    var playlistTrack = $('#playlist-'+data.id)
    playlistTrack.click(function(){
      SWPlayer.setPlayerData(data.id)
      if ($('#'+data.id).length) {
        if(SWPlayer.state.playing){
          SC.Widget(data.id).pause()
          SWPlayer.state.playing = false
        } else {
          SC.Widget(data.id).play()
          SWPlayer.state.playing = true
        }
      } else {
        SWPlayer.bindStreamToPlaylist(data)
      }
    })
  },

  bindFrames : function() {
    $('iframe').each(function(i, obj){
      var trackIdCapture = /api\.soundcloud\.com\/tracks\/(\d*)/;
      var match = trackIdCapture.exec($(obj).attr('src'));
      if( typeof(match)!=="undefined" && match!==null ){
        $(obj).data('soundcloudTrackId', match[1])
        $(obj).attr('id', match[1])
        SWPlayer.state.trackList.push(SWPlayer.soundcloudData(match[1], SWPlayer.addToPlaylist))
        SC.Widget(match[1]).swPlayerId = match[1]
        SC.Widget(match[1]).bind(SC.Widget.Events.PLAY, function(){
          SWPlayer.setPlayerData(this.swPlayerId.toString())
          var swPlayerId = this.swPlayerId
          SWPlayer.state.currentTrackNum = arrayObjectIndexOf(SWPlayer.state.trackList, swPlayerId, 'id')
          SWPlayer.state.playing = true
        })
      }
    })
  },

  bindPlayerClickHandlers : function() {
    $('#soundwebPlayerPrev').click(function(){
      SWPlayer.state.currentTrackNum = (SWPlayer.state.currentTrackNum-1+SWPlayer.state.trackList.length)%SWPlayer.state.trackList.length
      SWPlayer.playTrack()
    })
    $('#soundwebPlayerPlay').click(function(){
      if(SWPlayer.state.playing){
        SWPlayer.pauseTrack()
      } else {
        SWPlayer.playTrack()
      }
    })
    $('#soundwebPlayerNext').click(function(){
      SWPlayer.state.currentTrackNum = (SWPlayer.state.currentTrackNum+1)%SWPlayer.state.trackList.length
      SWPlayer.playTrack()
    })
  },

  bindPlayListHandlers : function() {
    $('#soundwebPlayerShowPlaylist').css({float:'right', 'margin-top':'-30px'})
    $('#soundwebPlayerShowPlaylist').click(function(){
      if(SWPlayer.state.playlistUp){
        $('#soundwebPlayer').animate({'height': '70px'})
        SWPlayer.state.playlistUp = false
      } else {
        $('#soundwebPlayer').animate({'height': ($('#soundwebPlayerPlaylist').height()+80).toString()+"px"})
        SWPlayer.state.playlistUp = true
      }
    })
  },

  bindStreamToPlaylist : function(data) {
    SC.stream("/tracks/"+data.id, function(sound){
      sound.play()
      SWPlayer.state.playing = true
      playlistTrack.unbind()
      playlistTrack.click(function(){
        if(SWPlayer.state.playing){
          console.log('pausing sound')
          sound.pause()
          SWPlayer.state.playing = false
        } else {
          console.log('playing sound')
          sound.play()
          SWPlayer.state.playing = true
        }
      })
      $('#soundwebPlayerPlay').unbind()
      $('#soundwebPlayerPlay').click(function(){
        if(SWPlayer.state.playing){
          sound.pause()
          SWPlayer.state.playing = false
        } else {
          sound.play()
          SWPlayer.state.playing = true
        }
      })
    });
  },

  build : function(){
    if (!$('#soundwebPlayer').length) {
      SWPlayer.buildBoilerPlate()
      SWPlayer.bindFrames()
      SWPlayer.bindPlayerClickHandlers()
      SWPlayer.bindPlayListHandlers(0)
      SWPlayer.setPlayerData(SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].id)
    };
  },

  buildBoilerPlate : function(){
    var html = '<div id="soundwebPlayer">'+
                  '<div id="soundwebPlayerArtwork"></div>'+
                  '<div id="soundwebPlayerTrackName"></div>'+
                  '<br>'+
                  '<div id="soundwebPlayerArtist"></div>'+
                  '<div id="soundwebPlayerControls">'+
                    '<span id="soundwebPlayerPrev">Prev</span>'+
                    '<span id="soundwebPlayerPlay">Play</span>'+
                    '<span id="soundwebPlayerNext">Next</span>'+
                  '</div>'+
                  '<div id=soundwebPlayerShowPlaylist>Show/Hide Playlist</div>'+
                  '<ul id=soundwebPlayerPlaylist></ul>'+
                '</div>'
    $('html').append(html)
    var player = $('#soundwebPlayer')
    player.css({'background-color': '#f3f3f3', 'height': '70px', 'position': 'fixed', 'bottom': '0', 'width': '100%'})
  },

  playTrack : function(){
    SC.Widget(SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].id).play()
    SWPlayer.state.playing = true
  },

  pauseTrack : function(){
    SC.Widget(SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].id).pause()
    SWPlayer.state.playing = false
  },

  soundcloudData : function(id, callback){
    var blob = {id: id}
    $.get("http://api.soundcloud.com/tracks/"+id+".json?client_id="+SOUNDCLOUD_API_KEY, function(data) {
      blob.title = data.title
      blob.artwork_url = data.artwork_url
      blob.stream_url = data.stream_url
      $.get("http://api.soundcloud.com/users/"+data.user_id+".json?client_id="+SOUNDCLOUD_API_KEY, function(data) {
        blob.artist = data.username
        callback(blob)
      })
    })
    return blob
  },

  setPlayerData : function(id){
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

function arrayObjectIndexOf(myArray, searchTerm, property) {
  for(var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i;
  }
  return -1;
}
