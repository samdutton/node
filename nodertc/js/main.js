var isInitiator;
var isStarted;
var localStream;
var pc;
var remoteStream;

var pc_config = webrtcDetectedBrowser == "firefox" ?
	{"iceServers":[{"url":"stun:23.21.150.121"}]} : // number IP
	{"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

var pc_constraints = {"optional": [{"DtlsSrtpKeyAgreement": true}]};

var room = location.pathname.substring(1);
if (room === '') {
  room = prompt("Enter room name:");
} else {
}

/////////////////////////////////////////////

var socket = io.connect();

if (room !== "") {
  console.log('Joining ', room);
  socket.emit('create or join', room);
}

socket.on('full', function (room){
  console.log('Room ' + room + ' is full');
});

socket.on('empty', function (room){
  isInitiator = true;
  console.log('Room ' + room + ' is empty');
});

socket.on('join', function (room){
  console.log('Request to join ' + room);
  console.log('You are the initiator!');
});

socket.on('log', function (array){
  console.log.apply(console, array);
});

////////////////////////////////////////////////

function sendMessage(data){
	socket.emit('message', data);
}

socket.on('message', function (message){
  console.log('Received message: ', message);
  if (message.type === 'offer') {
    if (!isInitiator && !isStarted)
      maybeStart();
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
			candidate:message.candidate});
    pc.addIceCandidate(candidate);
  } else if (message.type === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector("#localVideo");
var remoteVideo = document.querySelector("#remoteVideo");

var constraints = {video: true};

function successCallback(stream) {
  localStream = stream;
  attachMediaStream(localVideo, stream);
	createPeerConnection();
	pc.addStream(localStream);
  console.log("Adding local stream.");
	isStarted = true;
	if (isInitiator) {
		doCall();
	}
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pc_config, pc_constraints);
    pc.onicecandidate = handleIceCandidate;
    console.log("Created RTCPeerConnnection with:\n" +
	    "  config: \"" + JSON.stringify(pc_config) + "\";\n" +
	    "  constraints: \"" + JSON.stringify(pc_constraints) + "\".");
  } catch (e) {
    console.log("Failed to create PeerConnection, exception: " + e.message);
    alert("Cannot create RTCPeerConnection object.");
      return;
  }
  pc.onaddstream = onRemoteStreamAdded;
  pc.onremovestream = onRemoteStreamRemoved;
}

function handleIceCandidate(event) {
  if (event.candidate) {
    sendMessage({
    	type: 'candidate',
			label: event.candidate.sdpMLineIndex,
			id: event.candidate.sdpMid,
			candidate: event.candidate.candidate});
  } else {
    console.log("End of candidates.");
  }
}

function onRemoteStreamAdded(event) {
  console.log("Remote stream added.");
  reattachMediaStream(miniVideo, localVideo);
  attachMediaStream(remoteVideo, event.stream);
  remoteStream = event.stream;
  waitForRemoteVideo();
}

function doCall() {
  var constraints = {"optional": [], "mandatory": {"MozDontOfferDataChannel": true}};
  // temporary measure to remove Moz* constraints in Chrome
  if (webrtcDetectedBrowser === "chrome") {
    for (prop in constraints.mandatory) {
      if (prop.indexOf("Moz") != -1) {
        delete constraints.mandatory[prop];
      }
     }
   }
  constraints = mergeConstraints(constraints, sdpConstraints);
  console.log("Sending offer to peer, with constraints: \n" +
              "  \"" + JSON.stringify(constraints) + "\".")
  pc.createOffer(setLocalAndSendMessage, null, constraints);
}

function doAnswer() {
  console.log("Sending answer to peer.");
  pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
}

function mergeConstraints(cons1, cons2) {
  var merged = cons1;
  for (var name in cons2.mandatory) {
    merged.mandatory[name] = cons2.mandatory[name];
  }
  merged.optional.concat(cons2.optional);
  return merged;
}

function setLocalAndSendMessage(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pc.setLocalDescription(sessionDescription);
  sendMessage(sessionDescription);
}

function requestTurn(turn_url) {
  var turnExists = false;
  for (var i in pc_config.iceServers) {
    if (pc_config.iceServers[i].url.substr(0, 5) == 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    // No TURN server. Get one from computeengineondemand.appspot.com:
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = handleTurnResult;
    xmlhttp.open("GET", turn_url, true);
    xmlhttp.send();
  }
}

function handleTurnResult() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    var turnServer = JSON.parse(xmlhttp.responseText);
    pc_config.iceServers.push({
      "url": "turn:" + turnServer.username + "@" + turnServer.turn,
      "credential": turnServer.password
    });
    turnReady = true;
  }
}

function handleRemoteStreamAdded(event) {
  console.log("Remote stream added.");
  reattachMediaStream(miniVideo, localVideo);
  attachMediaStream(remoteVideo, event.stream);
  remoteStream = event.stream;
  waitForRemoteVideo();
}
function handleRemoteStreamRemoved(event) {
  console.log("Remote stream removed.");
}

function hangup() {
  console.log("Hanging up.");
  stop();
  // will trigger BYE from server
  socket.close();
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  initiator = 0;
}

function stop() {
  started = false;
  isAudioMuted = false;
  isVideoMuted = false;
  pc.close();
  pc = null;
}

