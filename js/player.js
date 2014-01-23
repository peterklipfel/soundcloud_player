$(document).ready(function(){
  var currentTrackId='0'
  var playing = false
  // Initialize Player
  $('html').append('<div id="soundwebPlayer"><div id="soundwebPlayerArtwork"></div><div id="soundwebPlayerTrackName"></div><br><div id="soundwebPlayerArtist"></div><div id="soundwebPlayerControls"><span id="soundwebPlayerPrev">Prev</span> <span id="soundwebPlayerPlay">Play</span> <span id="soundwebPlayerNext">Next</span></div></div>')
  var player = $('#soundwebPlayer')
  player.css({'background-color': '#f3f3f3', 'height': '70px', 'position': 'fixed', 'bottom': '0', 'width': '100%'})
  $('#soundwebPlayerPrev').click(function(){
    console.log('prev')
    currentTrackId = (parseInt(currentTrackId)-1).toString()
    console.log(currentTrackId)
    SC.Widget(currentTrackId).play()
  })
  $('#soundwebPlayerPlay').click(function(){
    console.log('play/pause')
    console.log(currentTrackId)
    if(playing){
      SC.Widget(currentTrackId).pause()
      playing = false
    } else {
      SC.Widget(currentTrackId).play()
      playing = true
    }
  })
  $('#soundwebPlayerNext').click(function(){
    console.log("next")
    currentTrackId = (parseInt(currentTrackId)+1).toString()
    console.log(currentTrackId)
    SC.Widget(currentTrackId).play()
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
})
