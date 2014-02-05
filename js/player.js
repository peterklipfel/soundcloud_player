var SWPlayer = {
  state : {currentTrackNum : 0, playing : false, trackList: [], playlistUp : false, 
           streaming : false, currentStreamtrack: null},

  addToPlaylist : function(data){
    $('#soundwebPlayerPlaylist').append('<li id="playlist-'+data.id+'" data-soundcloud-track-id='+data.id+'>'+data.title+'</li>')
    var playlistTrack = $('#playlist-'+data.id)
    playlistTrack.click(function(){
      SWPlayer.togglePlayPause(data.id)
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
        var playButton = '<div data-soundcloud-track-id="'+match[1]+'">Play</div>'
        $(obj).replaceWith(playButton)
        $("div[data-soundcloud-track-id="+match[1]+"]").click(function(){
          console.log($(this).data('soundcloud-track-id'))
          SWPlayer.setPlayerData($(this).data('soundcloud-track-id'))
          SWPlayer.togglePlayPause($(this).data('soundcloud-track-id').toString())
        })
      }
    })
  },

  bindPlayerClickHandlers : function() {
    $('#soundwebPlayerPrev').click(function(){
      SWPlayer.pauseTrack()
      SWPlayer.state.currentTrackNum = (SWPlayer.state.currentTrackNum-1+SWPlayer.state.trackList.length)%SWPlayer.state.trackList.length
      SWPlayer.bindStreamTrack(function(){
        SWPlayer.playTrack()
        SWPlayer.state.streaming = true
      })
    })
    $('#soundwebPlayerPlay').click(function(){
      if(SWPlayer.state.playing){
        SWPlayer.pauseTrack()
      } else {
        SWPlayer.playTrack()
      }
    })
    $('#soundwebPlayerNext').click(function(){
      SWPlayer.pauseTrack()
      SWPlayer.state.currentTrackNum = (SWPlayer.state.currentTrackNum+1)%SWPlayer.state.trackList.length
      SWPlayer.bindStreamTrack(function(){
        SWPlayer.playTrack()
        SWPlayer.state.streaming = true
      })
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

  bindStreamTrack : function(callback) {
    if(SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].stream==null){
      SC.stream("/tracks/"+SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].id, function(sound){
        console.log(SWPlayer.state.trackList[SWPlayer.state.currentTrackNum])
        SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].stream = sound
        SWPlayer.state.currentStreamtrack = sound
        callback()
      });
    } else {
      SWPlayer.state.currentStreamtrack = SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].stream
      callback()
    }
  },

  build : function(){
    if (!$('#soundwebPlayer').length) {
      SWPlayer.buildBoilerPlate();
      SWPlayer.bindFrames();
      SWPlayer.bindPlayerClickHandlers()
      SWPlayer.bindPlayListHandlers(0)
      SWPlayer.setPlayerData(SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].id)
      SWPlayer.bindStreamTrack(function() {console.log('ready')})
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
                  '<div id=soundwebPlayerTime style="position: absolute; top: 50%; left: 50%;"></div>'+
                  '<div id=soundwebPlayerShowPlaylist>Show/Hide Playlist</div>'+
                  '<ul id=soundwebPlayerPlaylist></ul>'+
                '</div>'
    $('body').append(html)
    var player = $('#soundwebPlayer')
    player.css({'background-color': '#f3f3f3', 'height': '70px', 'position': 'fixed', 'bottom': '0', 'width': '100%', "z-index":"99999"})
  },

  playTrack : function(){
    SWPlayer.state.playing = true
    SWPlayer.setPlayerData(SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].id)
    $("div[data-soundcloud-track-id="+SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].id+"]").addClass('playing')
    SWPlayer.state.currentStreamtrack.play({whileplaying: function(){
      $('#soundwebPlayerTime').text(msToTime(this.position))
    }})
  },

  pauseTrack : function(){
    SWPlayer.state.playing = false
    $("div[data-soundcloud-track-id="+SWPlayer.state.trackList[SWPlayer.state.currentTrackNum].id+"]").removeClass('playing')
    SWPlayer.state.currentStreamtrack.pause()
    SWPlayer.state.streaming = true
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
  },

  togglePlayPause : function(id){
    var wasPlaying = SWPlayer.state.playing
    if(SWPlayer.state.playing){
      SWPlayer.pauseTrack()
    }
    if (SWPlayer.state.currentTrackNum==arrayObjectIndexOf(SWPlayer.state.trackList, id, 'id')) {
      if(!wasPlaying){
        SWPlayer.playTrack()
      }
    } else {
      SWPlayer.state.currentTrackNum = arrayObjectIndexOf(SWPlayer.state.trackList, id, 'id') 
      SWPlayer.bindStreamTrack(function(){
        SWPlayer.playTrack()
      })
    }
  }
}

function arrayObjectIndexOf(myArray, searchTerm, property) {
  for(var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i;
  }
  return -1;
}

function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs + '.' + ms;
}
