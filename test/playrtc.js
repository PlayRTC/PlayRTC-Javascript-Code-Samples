/*! 
 * PLAYRTC. PLAYRTC is WebRTC SDK.
 * Copyright 2013, 2016 Heo Youngnam
 * 
 * project: PLAYRTC
 * version: 2.2.14
 * contact: cryingnavi@gmail.com
 * homepage: http://www.playrtc.com
 * Date: 2016-04-22 14:25 
 */

(function(factory){
	var Module = factory();
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = Module;
	}
	else{
		window.PlayRTC = Module;
	}
})(function(){

var PeerConnection = (function(){
	var PeerConnection = window.PeerConnection || 
		window.webkitPeerConnection00 || 
		window.webkitRTCPeerConnection || 
		window.mozRTCPeerConnection || 
		window.RTCPeerConnection;

	return PeerConnection;
})();

var NativeRTCSessionDescription = (function(){
	var nativeRTCSessionDescription = window.mozRTCSessionDescription || 
		window.RTCSessionDescription;

	return nativeRTCSessionDescription;
})();

var NativeRTCIceCandidate = (function(){
	var nativeRTCIceCandidate = window.mozRTCIceCandidate || 
		window.RTCIceCandidate;

	return nativeRTCIceCandidate;
})();

var UserMedia = (function (){
	var getUserMedia = navigator.getUserMedia || 
		navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || 
		navigator.msGetUserMedia;
	
	return getUserMedia;
})();

var URL = (function(){
	var URL = window.URL || 
		window.webkitURL || 
		window.msURL || 
		window.oURL;

	return URL;
})();

function request(options){
	Logger.trace("cdm", {
		klass: "Core",
		method: "request",
		message: "Called http request. options = " + JSON.stringify(options)
	});
	
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(e) {
		var xhr = e.target,
			res = xhr.responseText;

		if (xhr.readyState === 4 && xhr.status === 200 && res) {
			try{
				Logger.trace("cdm", {
					klass: "Core",
					method: "request",
					message: "Received http request. res = " + res
				});
				res = JSON.parse(res);
				if(res.error){
					if(options.error){
						options.error(xhr, res);
					}
				}
				else{
					if(options.success){
						options.success(res);
					}
				}
			}
			catch(e){
				Logger.error("cdm", {
					klass: "Core",
					method: "request",
					message: "Received http request. res = " + xhr.responseText
				});
				if(options.error){
					options.error(xhr, res);
				}
			}
		}
		else if (xhr.readyState === 4 && xhr.status !== 200) {
			try{
				res = JSON.parse(res);
				options.error(xhr, res);
			}
			catch(e){
				Logger.error("cdm", {
					klass: "Core",
					method: "request",
					message: "Received http request. res = " + xhr.responseText
				});
				options.error(xhr);
			}
		}
	};

	req.open(options.method, options.url, true);
	if(options.contentType){
		req.setRequestHeader("Content-Type", options.contentType);
	}
	else{
		if(utils.browser.name === "firefox"){
			req.setRequestHeader("Accept", "application/json");
		}
		req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
	}

	if(options.projectKey){
		req.setRequestHeader("TDCProjectKey", options.projectKey);
	}

	if(options.body){
		req.send(JSON.stringify(options.body));
	}
	else{
		req.send();
	}
}

/**
 * PlayRTC.utils
 * @namespace {Object} utils
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 */
var utils = { };

/**
 * 사용자 브라우저의 종류와 버전을 {name: "chrome", version: "38.0.2125.111"} 와 같은 형식으로 반환한다.
 * @member browser
 * @memberof utils
 * @example
	PlayRTC.utils.browser
	//{name: "chrome", version: "38.0.2125.111"}
 */
utils.browser = (function(){
	function getFirstMatch(regex) {
		var match = ua.match(regex);
		return (match && match.length > 1 && match[1]) || '';
	}
	
	var ua = navigator.userAgent,
		versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i),
		result = null;

	if(/chrome|crios|crmo/i.test(ua)){
		result = {
			name: 'chrome',
			version: getFirstMatch(/(?:chrome|crios|crmo)\/([\.1234567890]+)/i)
		};
	}
	else if (/opera|opr/i.test(ua)) {
		result = {
			name: 'opera',
			version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/]([\.1234567890]+)/i)
		};
	}
	else if(/msie|trident/i.test(ua)){
		result = {
			name: 'ie',
			version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
		};
	}
	else if(/firefox|iceweasel/i.test(ua)){
		result = {
			name: 'firefox',
			version: getFirstMatch(/(?:firefox|iceweasel)[ \/]([\.1234567890]+)/i)
		};
	}
	else if(/safari/i.test(ua)){
		result = {
			name: 'safari',
			version: versionIdentifier
		};
	}
	
	return result;
})();

/**
 * 사용자 단말기의 OS 정보를 문자열로 반환한다. 반환되는 문자열은 다음과 같다. "windows", "ios", "android", "mac", "linux"
 * @member platform
 * @memberof utils
 * @example
	PlayRTC.utils.platform
	//"windows", "ios", "android", "mac", "linux"
 */
utils.platform = (function(){
	var userAgent = navigator.userAgent.toLowerCase();
	var platform = navigator.platform;

	var iPhone = /iPhone/i.test(platform),
		iPad = /iPad/i.test(platform),
		iPod = /iPod/i.test(platform);

	var win = /win/i.test(platform),
		mac = /mac/i.test(platform),
		linux = /linux/i.test(platform),
		iOs = iPhone || iPad || iPod;

	var android = /android/i.test(userAgent);
	
	if(win){
		return "windows";
	}
	else if(iOs){
		return "ios";
	}
	else if(android){
		return "android";
	}
	else if(mac){
		return "mac";
	}
	else if(linux){
		return "linux";
	}
})();

/**
 * 사용자 브라우저의 언어 설정을 반환한다.
 * @member platform
 * @memberof utils
 * @example
	PlayRTC.utils.language
	//"ko-KR, en-US"
 */
utils.language = (function(){
	return navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
})();

/**
 * 사용자 브라우저의 국가 설정을 반환한다.
 * @member platform
 * @memberof utils
 * @example
	PlayRTC.utils.nation
	//"KR", "US"
 */
utils.nation = (function(){
	return utils.language.split("-")[1];
})();

/**
 * 자바스크립트에서 클래스간의 상속 구조를 만들어주는 메소드이다. 자식 클래스 지정시 initialize 메소드를 반드시 포함해야한다. 이는 자식클래스의 생성자 함수로 객체를 초기화하는데 사용된다.
 * @method Extend
 * @memberof utils
 * @param {Function} parentClass 부모 클래스를 지정한다.
 * @param {Object} childbClass 자식 클래스를 JSON Object 형태로 지정한다.
 * @example
	var ChildClass = PlayRTC.utils.Extend(PlayRTC.utils.Event, {
		initialize: function(config){
			//부모 생성자 호출
			ChildClass.base.initialize.call(this);
			
			this.age = config.age;
			this.name = config.name;
		},
		getName: function(){
			
		},
		getAge: function(){
			
		}
	});
	
	var c = new ChildClass({
		age: 50,
		name: "john"
	});
	
	console.log(c.getName());
	
	var GrandsonClass = ChildClass.Extend({
		initialize: function(config){
			//부모 생성자 호출
			GrandsonClass.base.initialize.call(this, config);
			
			this.sex = config.sex;
		},
		getSex: function(){
			return this.sex;
		}
	});
	
	var g = new GrandsonClass({
		age: 20,
		name: "jenny",
		sex: "female"
	});
	
	console.log(g.getName());
	console.log(g.getSex());
 */
utils.Extend = function(sp, proto){
	var sb = function(){
		var args = Array.prototype.slice.call(arguments);
		this.initialize.apply(this, args);
	};

	var F = function(){ },
		spp = sp.prototype;

	F.prototype = spp;
	sb.prototype = new F();
	sb.prototype.constructor = sb;
	sb.base = spp;

	if (proto){
		for(var attr in proto){
			sb.prototype[attr] = proto[attr];
		}
	}

	sb.Extend = function(proto){
		var sp = this;
		return utils.Extend(sp, proto);
	};

	return sb;
};


var BaseKlass = function(){ };

/**
 * 객체에 사용자 정의 이벤트를 등록하고 이를 트리거 할 수 있도록 한다. PlayRTC SDK 에선 모든 클래스의 최상위 부모 클래스로서 존재한다. 
 * @method Event
 * @memberof utils
 * @example
	var ChildClass = PlayRTC.utils.Extend(PlayRTC.utils.Event, {
		initialize: function(config){
			//부모 생성자 호출
			ChildClass.base.initialize.call(this);
		},
		...
	});
	
	var obj = new ChildClass();
	
	//이벤트 등록
	obj.on("customEvent", function(){ }, window);
	
	//특정 이벤트 삭제
	obj.on.off("customEvent", function(){ }, window);
	
	//이벤트 발생
	obj.fire("customEvent", "someData", "someData", "someData", "someData", "someData" ....);
	
	//이벤트 전체 삭제
	obj.clear();
	
	//이벤트 유무 검사
	obj.hasEvent("customEvent"); //true 또는 false
 */
utils.Event = utils.Extend(BaseKlass, {
	initialize: function(){
		this.listeners = { };
	},
	on: function(name, callback, context){
		this.listeners || (this.listeners = { });
		var listeners = this.listeners[name] || (this.listeners[name] = [ ]);
		listeners.push({
			callback: callback,
			context: context
		});
		return this;
	},
	off: function(name, callback, context){
		var retain, ev, listeners, names = [], i, l;
		if (!name && !callback && !context) {
			this.listeners = void 0;
			return this;
		}

		if (listeners = this.listeners[name]) {
			this.listeners[name] = retain = [];
			if (callback || context) {
				for (i = 0, l = listeners.length; i < l; i++) {
					ev = listeners[i];
					if ((callback && callback !== ev.callback) ||
							(context && context !== ev.context)) {
						retain.push(ev);
					}
				}
			}
			if (!retain.length) {
				delete this.listeners[name];
			}
		}
		return this;
	},
	fire: function(name){
		if (!this.listeners){
			return this;
		}

		var args = Array.prototype.slice.call(arguments, 1),
			listeners = this.listeners[name],
			i = -1

		if (listeners){
			var len = listeners.length;
			switch (args.length) {
				case 0: 
					if(len === 1){
						return (ev = listeners[0]).callback.call(ev.context);
					}
					else{
						while (++i < len){ 
							(ev = listeners[i]).callback.call(ev.context);
						}
						return this;
					}
				default:
					if(len === 1){
						return (ev = listeners[0]).callback.apply(ev.context, args);
					}
					else{
						while (++i < len){
							(ev = listeners[i]).callback.apply(ev.context, args);
						}
						return this;
					}
			}
		}
		return this;
	},
	clear: function(){
		this.listeners = { };
	},
	hasEvent: function(name){
		if(this.listeners[name]){
			return true;
		}
		return false;
	}
});


/**
 * 객체 확장하기 위해 두번째 인자로 받은 객체를 첫번째 인자로 받은 객체에 더하고 이를 반환한다. 
 * @method apply
 * @memberof utils
 * @param {Object} target 새 속성을 받을 객체를 지정한다.
 * @param {Object} copy 추가 속성을 가진 객체를 지정한다.
 * @return {Object} target 확장된 객체를 반환한다.
 * @example
 	var target = {
 		age: 50,
 		name: "john"
 	};
 	
 	var copy = {
 		sex: "male",
 		tall: 180,
 		weight: 100
 	};
 	
 	var obj = PlayRTC.utils.apply(target, copy);
 	console.log(obj);
 	
 	var target = {
 		age: 50,
 		name: "john",
 		family: {
 			age: 20,
 			name: "jenny"
 		}
 	};
 	
 	var copy = {
 		sex: "male",
 		tall: 180,
 		weight: 100,
 		family: {
 			age: 20,
 			name: "jenny",
 			tall: 170,
 			weight: 60
 		}
 	};
 	
 	var obj = PlayRTC.utils.apply(target, copy);
 	console.log(obj); 	
 */
utils.apply = function(target, copy){
	if(!target || !copy){
		throw new Error("Failed to execute 'apply' on 'utils': 2 arguments required, but only " + arguments.length + " present.");
	}
	
	if(typeof copy === "object"){
		if(typeof target === "number" || typeof target === "boolean" || typeof target === "string"){
			target = copy;
			return target;
		}
	}

	var attr = null;
	for(attr in copy){
		if(typeof copy[attr] === "object" && copy[attr] && !copy[attr].hasOwnProperty("length")){
			target[attr] = utils.apply(target[attr] || { }, copy[attr]);
		}
		else{
			target[attr] = copy[attr];
		}
	}
	return target;
};

/**
 * 자바스크립트 함수 실행시 context 의 변경을 방어하기 위해 함수의 context 를 강제한다.
 * @method bind
 * @memberof utils
 * @param {Function} fn this 를 강제할 함수를 지정한다.
 * @param {Object} context 함수의 this 가 가르킬 객체를 지정한다.
 * @example
	PlayRTC.utils.bind(function(){
		console.log(this === window); //true 반환
	}, window);
 */
utils.bind = function(fn, context){
	if(!fn || !context){
		throw new Error("Failed to execute 'bind' on 'utils': 2 arguments required, but only " + arguments.length + " present.");
	}
	return function(){
		fn.apply(context, Array.prototype.slice.call(arguments));
	};
};

/**
 * 파일을 로컬에 다운로드 한다. DataChannel 을 통해 받은 파일을 로컬에 저장하고 싶을 때나, 레코딩한 오디오/비디오를 저장하고 싶을 때 사용할 수 있다.
 * @method fileDownload
 * @memberof utils
 * @param {Blob} blob 파일로 저장할 blob 객체를 지정한다.
 * @param {String} fileName 해당 파일의 파일 이름을 명시한다.
 * @example
	//레코딩한 결과를 저장할 경우
	//1. 레코딩 시작
	conn.getMedia().record("video");
	
	//2. 레코딩 중단
	conn.getMedia().recordStop(function(blob){ 
	 	//3. video 의 경우 레코딩 다운로드
	 	PlayRTC.utils.fileDownload(blob, "localVideo.webm");
	});
	
	//DataChannel 을 통해 파일을 받았을 경우
	var dc = peer.getDataChannel();
	dc.on("message", function(message){
		if(message.type === "file"){
			PlayRTC.utils.fileDownload(message.blob, message.fileName);
		}
	});
 */
utils.fileDownload = function(blob, fileName){
	var doc = document,
		link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
		event = doc.createEvent("MouseEvents");
	
	link.href = URL.createObjectURL(blob);
	link.download = fileName;

	event.initEvent("click", true, false);
	link.dispatchEvent(event); 
};

/**
 * 비디오 태그를 대신 생성하여 반환해준다. 두번째 인자로 video 태그에 대한 속성을 객체로 지정할 수 있다.
 * @method createVideo
 * @memberof utils
 * @param {MediaStream} stream 비디오 엘리먼트가 표현할 스트림
 * @param {Object} config 비디오 엘리먼트의 속성을 명시한다. { autoPlay: true, controls: true, width: "100%", height: "100%" } 가 기본값이며 이를 오버라이드 할 수 있다.
 * @return {VideoElement} video 비디오 엘리먼트를 생성하여 반환한다.
 * @example
	conn.on("addLocalStream", function(stream){
		var video = PlayRTC.utils.createVideo(stream, {
			autoPlay: true,
			controls: false, //오버라이드 할 수 있다.
			width: "100%",
			height: "100%"
		});
		document.getElementById("container").appendChild(video);
	});
	
	conn.on("addRemoteStream", function(pid, uid, stream){
		var video = PlayRTC.utils.createVideo(stream, {
			autoPlay: true,
			controls: false, //오버라이드 할 수 있다.
			width: "100%",
			height: "100%"
		});
		document.getElementById("container").appendChild(video);
	});
 */
utils.createVideo = function(stream, config){
	var defaultConfig = {
		autoPlay: true,
		controls: true,
		width: "100%",
		height: "100%"
	},
	video = document.createElement("video");

	config = config || {};
	
	defaultConfig = utils.apply(defaultConfig, config);
	
	if(defaultConfig.controls){
		video.setAttribute("controls", true);
	}
	
	if(defaultConfig.autoPlay){
		video.setAttribute("autoPlay", true);
	}

	video.setAttribute("width", defaultConfig.width);
	video.setAttribute("height", defaultConfig.height);
	
	video.src = utils.createObjectURL(stream);

	return video;
};

/**
 * 오디오 태그를 대신 생성하여 반환해준다. 두번째 인자로 audio 태그에 대한 속성을 객체로 지정할 수 있다.
 * @method createAudio
 * @memberof utils
 * @param {MediaStream} stream 오디오 엘리먼트가 표현할 스트림
 * @param {Object} config 오디오 엘리먼트의 속성을 명시한다. { autoPlay: true, controls: true, width: "100%", height: "100%" } 가 기본값이며 이를 오버라이드 할 수 있다.
 * @return {AudioElement} audio 오디오 엘리먼트를 생성하여 반환한다.
 * @example
	conn.on("addLocalStream", function(stream){
		var audio = PlayRTC.utils.createAudio(stream{
			autoPlay: true,
			controls: false, //오버라이드 할 수 있다.
			width: "100%",
			height: "100%"
		});
		document.getElementById("container").appendChild(audio);
	});
	
	conn.on("addRemoteStream", function(pid, uid, stream){
		var audio = PlayRTC.utils.createAudio(stream{
			autoPlay: true,
			controls: false, //오버라이드 할 수 있다.
			width: "100%",
			height: "100%"
		});
		document.getElementById("container").appendChild(audio);
	});
 */
utils.createAudio = function(stream, config){
	var defaultConfig = {
		autoPlay: true,
		controls: true
	},
	audio = document.createElement("audio");
	
	config = config || {};
	
	defaultConfig = utils.apply(defaultConfig, config);
	
	if(defaultConfig.controls){
		audio.setAttribute("controls", true);
	}
	
	if(defaultConfig.autoPlay){
		audio.setAttribute("autoPlay", true);
	}
	
	audio.src = utils.createObjectURL(stream);

	return audio;
};

/**
 * URL.createObjectURL 메소드를 이용하여 파일 객체나 데이터의 참조를 가리키는 객체 URL 을 생성하여 반환한다.
 * @method createObjectURL
 * @memberof utils
 * @param {MediaStream} stream 오디오 엘리먼트가 표현할 스트림
 * @return {String} 파일 객체나 데이터의 참조를 가리키는 객체 URL 을 생성하여 반환한다.
 * @example
	conn.on("addLocalStream", function(stream){
		var url = PlayRTC.utils.createObjectURL(stream);
		console.log(url);

		return false;
	});
 */
utils.createObjectURL = function(stream){
	return URL.createObjectURL(stream);
};

utils.blobWorkerSupport = (function(){
	try{
		var javascript = function(e){ }.toString(),
			blob = new Blob([
				"this.onmessage = " + javascript
			], {
				type: "application/javascript"
			});

		blob = URL.createObjectURL(blob);
		var w = new Worker(blob);
		URL.revokeObjectURL(blob);
		
		return true;
	}
	catch(e){
		return false;
	}
})();
 
utils.mediaRecorderSupport = function(stream){
	try{
		new MediaRecorder(stream);
		utils.mediaRecorderSupport = true;
	}
	catch(e){
		utils.mediaRecorderSupport = false;
	}
};

/**
 * 사용자 단말기에서 미디어 장치를 지원하는지 여부를 반환한다.
 * @method userMediaSupport
 * @memberof utils
 * @example
	PlayRTC.utils.userMediaSupport();
 */
utils.userMediaSupport = !!UserMedia || false;

/**
 * 로컬 DB 에 저장되어 있는 로그를 로컬에 텍스트 파일로 다운로드 한다. 해당 기능은 향우 좀더 유용한 형태로 보완될 예정이다.
 * @method exportLog
 * @memberof utils
 * @example
	PlayRTC.utils.exportLog();
 */
utils.exportLog = function(){
	Logger.db.exportLog();
};

/**
 * 페이지에 디버그뷰를 활성화시킨다. playrtc-debug-view.js 를 화면에 include 하여야 한다.
 * @method debugViewShow
 * @memberof utils
 * @example
	PlayRTC.utils.debugViewShow();
 */
utils.debugViewShow = function(){
	Logger.monitor.show();
};

/**
 * 페이지에 디버그뷰를 비활성화시킨다. playrtc-debug-view.js 를 화면에 include 하여야 한다.
 * @method debugViewHide
 * @memberof utils
 * @example
	PlayRTC.utils.debugViewHide();
 */
utils.debugViewHide = function(){
	Logger.monitor.hide();
};

/**
 * 간단한문자열 포맷을 위한 메소드이다.
 * @method strFormat
 * @memberof utils
 * @example
	var str = PlayRTC.utils.strFormat("{0} {1}", "Hello", "World!");
	console.log(str);
 */
utils.strFormat = function(str){
	var args = arguments,
		len = args.length,
		reg = null,
		i = 0;
	
	for(; i<len; i++){
		reg = new RegExp('\\{' + i + '\\}', 'g');
		str = str.replace(reg, args[i + 1]);
	}
	return str;
};


var SDK_ERROR_CODE = {
	//Media
	"M4001": "Unsupported media",
	"M4002": "Permission denied",
	"M4003": "Devices not found",
	"M4004": "Unknown media error",
	
	//Channel
	"C4001": "Failed allocate channel",
	"C4002": "Failed to connect channel's server",
	"C4003": "Already disconnected channel's server",
	"C4004": "Invalid authentication of channel",
	"C4005": "Invalid channel id",
	"C4006": "Channel error",
	"C4007": "Channel's socket error",
	"C4008": "Failed to create sdp",
	"C4009": "Failed to register sdp",
	"C4010": "Failed to register candidate",
	"C4011": "Failed to request nag's ice servers",

	//P2P
	"P4001": "Failed P2P",
	
	//ActiveX Create
	"A4001": "Failed to create ActiveX"
};

var SERVER_CODE = {
	20001: "SUCCESS",
	40001: "MESSAGE_SYNTAX_ERROR",
	40101: "PROJECTID_INVALID",
	40102: "TOKEN_INVALID",
	40103: "TOKEN_EXPIRED",
	40104: "CHANNELID_INVALID",
	40105: "PEERID_INVALID",
	40106: "UNKNOWN_CONNECTION",
	40107: "UNKNOWN_COMMAND"
};

function errorDelegate(type, serverCode, payload){
	var code = null,
		desc = null;

	switch(serverCode){
		case "40102":
		case "40103":
			code = "C4004"
			desc = SDK_ERROR_CODE["C4004"];
			break;
		case "40104":
			code = "C4005"
			desc = SDK_ERROR_CODE["C4005"];
			break;
		default:
			code = "C4006"
			desc = SDK_ERROR_CODE["C4006"];
			break;
	}

	this.fire("error", code, desc, payload);
};
var Socket = utils.Extend(utils.Event, {
	initialize: function(url){
		Socket.base.initialize.call(this);
		this.socket = new WebSocket(url);
		this.setEvent();
	},
	setEvent: function(){
		this.socket.onopen = utils.bind(function(e){
			this.fire("open", e);
		}, this);
		this.socket.onclose = utils.bind(function(e){
			this.fire("close", e);
		}, this);
		this.socket.onerror = utils.bind(function(e){
			this.fire("error", e);
		}, this);
		this.socket.onmessage = utils.bind(function(e){
			this.fire("message", e);
		}, this);
	},
	send: function(data){
		try{
			this.socket.send(data);
		}
		catch(err){ }
	},
	getReadyState: function(){
		return this.socket.readyState;
	},
	close: function(){
		if(this.socket){
			this.socket.close();
		}
	}
});
function _call(success, error){
	if(!UserMedia){
		Logger.error("cdm", {
			method: "_call",
			message: "Your device is not supported media"
		});
		
		this.error("M4001", SDK_ERROR_CODE["M4001"]);
		return false;
	}

	var constraints = this.userMedia;
	if(constraints.video || constraints.audio){
		if(!this.getMedia()){
			UserMedia.call(navigator, constraints, utils.bind(function(stream){
				Logger.trace("cdm", {
					klass: "PlayRTC",
					method: "createUserMedia",
					message: "Got local stream. constraints = " + JSON.stringify(constraints)
				});
				
				if(!this.hasEvent("addLocalStream")){
					if(this.config.localMediaTarget){
						var target = document.getElementById(this.config.localMediaTarget);
						if(target){
							if(!target.hasAttribute("autoPlay")){
								target.setAttribute("autoPlay", true);
							}
							target.setAttribute("muted", true);
							target.src = utils.createObjectURL(stream);
						}
					}
				}
				else{
					if(this.fire("addLocalStream", stream) === false){
						if(this.config.localMediaTarget){
							var target = document.getElementById(this.config.localMediaTarget);
							if(target){
								if(!target.hasAttribute("autoPlay")){
									target.setAttribute("autoPlay", true);
								}
								target.setAttribute("muted", true);
								target.src = utils.createObjectURL(stream);
							}
						}
					}
				}

				this.createMedia(stream);
				success.call(this);

				if(typeof utils.mediaRecorderSupport === "function"){
					utils.mediaRecorderSupport(stream);
				}
			}, this), utils.bind(function(e){
				Logger.error("cdm", {
					klass: "PlayRTC",
					method: "createUserMedia",
					message: "Failed to get local stream. message = " + e.message
				});
				
				this.destroy();
				
				var name = e.name.toUpperCase();
				if(name === "PERMISSIONDENIEDERROR" || name === "SECURITYERROR"){
					this.error("M4002", SDK_ERROR_CODE["M4002"], e);
				}
				else if(name === "DEVICESNOTFOUNDERROR" || name === "NOTFOUNDERROR"){
					this.error("M4003", SDK_ERROR_CODE["M4003"], e);
				}
				else{
					this.error("M4004", SDK_ERROR_CODE["M4004"], e);
				}
				
			}, this));
		}
	}
	else if(this.dataChannelEnabled){
		//data channel only
		success.call(this);
	}
	else{
		error.call(this);
	}
}

/**
 * PlayRTC Class
 * @namespace {Object} PlayRTC
 * @class PlayRTC
 * @extends PlayRTC.utils.Event
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 * @property {Object} [config] 						- PlayRTC 의 기본값을 명시한다.
 * @property {String} config.projectKey				- projectKey 를 명시한다.
 * @property {String} config.logLevel				- 로그레벨을 명시한다 TRACE, WARN, ERROR, NONE 중 하나를 명시한다.
 * @property {Boolean} config.ring					- 서비스 플로우에서 접속시 상대방의 허가를 받을지 여부를 명시한다. ring 이 true 일 경우, 반드시 accept 또는 reject 메소드를 호출하여야한다.
 * @property {String} config.localMediaTarget		- 자신의 모습을 출력할 비디오태그 ID 명을 명시한다.
 * @property {String} config.remoteMediaTarget		- 상대의 모습을 출력할 비디오태그 ID 명을 명시한다.
 * @property {Object} config.userMedia				- 오디오, 비디오 사용 유무를 명시한다. 기본적으로 서버에서 해당 값을 내려받으며 직접 명시할 경우 서버에서 내려받음 값음 무시한다. 예) {video: true, audio: true}
 * @property {Boolean} config.dataChannelEnabled	- dataChannel 사용 유무를 명시한다. 기본적으로 서버에서 해당 값을 내려받으며 직접 명시할 경우 서버에서 내려받음 값음 무시한다.
 */
var PlayRTC = utils.Extend(utils.Event, {
	initialize: function(config){
		if(!config.projectKey){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "initialize",
				message: "Failed to execute 'initialize' on 'PlayRTC': projectKey required, not present"
			});
			return;
		}
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "initialize",
			message: "Created instance of 'PlayRTC'"
		});

		this.config = {
			projectKey: null,
			ring: false,
			iceServers: null,
			localVideoTarget: null,
			remoteVideoTarget: null,
			localMediaTarget: null,
			remoteMediaTarget: null,
			dataChannelEnabled: true,
			logLevel: "TRACE", 
			userMedia: {
				audio: true,
				video: true
			},
			video: true,
			audio: true,
			data: true,
			bandwidth: {
				video: 1500,
				data: 1638400
			}
		};
		this.iceServers = [];
		this.media = null;
		
		this.userMedia = {
			audio: this.config.userMedia.audio,
			video: this.config.userMedia.video
		};
		this.dataChannelEnabled = this.config.dataChannelEnabled;

		PlayRTC.base.initialize.call(this);
		utils.apply(this.config, config);

		if(config.hasOwnProperty("video")){
			this.userMedia.video = config.video;
		}

		if(config.hasOwnProperty("audio")){
			this.userMedia.audio = config.audio;
		}

		if(config.hasOwnProperty("data")){
			this.dataChannelEnabled = config.data;
		}

		if(PlayRTC.utils.browser.name === "firefox"){
			if(typeof this.userMedia.audio !== "boolean"){
				this.userMedia.audio = true;
			}
		}
		else{
			if(this.userMedia.audio === true){
				this.userMedia.audio = {
					optional: [
						{ googEchoCancellation: true },
						{ googAutoGainControl: true },
						{ googNoiseReduction: true },
						{ googNoiseSuppression: true },
						{ googHighpassFilter: true }
					],
					mandatory: { }
				};
			}
			else if(typeof this.userMedia.audio !== "boolean"){
				var audioConstraints = {
					optional: [
						{ googEchoCancellation: true },
						{ googAutoGainControl: true },
						{ googNoiseReduction: true },
						{ googNoiseSuppression: true },
						{ googHighpassFilter: true }
					],
					mandatory: { }
				}

				if(this.userMedia.audio.hasOwnProperty("echoCancellation")){
					audioConstraints.optional[0].googEchoCancellation = this.userMedia.audio.echoCancellation;
				}

				if(this.userMedia.audio.hasOwnProperty("autoGainControl")){
					audioConstraints.optional[1].googAutoGainControl = this.userMedia.audio.autoGainControl;
				}

				if(this.userMedia.audio.hasOwnProperty("noiseReduction")){
					audioConstraints.optional[2].googNoiseReduction = this.userMedia.audio.noiseReduction;
				}

				if(this.userMedia.audio.hasOwnProperty("noiseSuppression")){
					audioConstraints.optional[3].googNoiseSuppression = this.userMedia.audio.noiseSuppression;
				}

				if(this.userMedia.audio.hasOwnProperty("highpassFilter")){
					audioConstraints.optional[4].googHighpassFilter = this.userMedia.audio.highpassFilter;
				}

				this.userMedia.audio = audioConstraints;
			}
		}

		if(PlayRTC.utils.browser.name === "firefox"){
			if(typeof this.userMedia.video !== "boolean"){
				var videoConstraints = { }

				if(this.userMedia.video.hasOwnProperty("minWidth")){
					if(videoConstraints.width){
						videoConstraints.width.min = this.userMedia.video.minWidth;
					}
					else{
						videoConstraints.width = { min: this.userMedia.video.minWidth };
					}
				}

				if(this.userMedia.video.hasOwnProperty("minHeight")){
					if(videoConstraints.height){
						videoConstraints.height.min = this.userMedia.video.minHeight;
					}
					else{
						videoConstraints.height = { min: this.userMedia.video.minHeight };
					}
				}

				if(this.userMedia.video.hasOwnProperty("maxWidth")){
					if(videoConstraints.width){
						videoConstraints.width.max = this.userMedia.video.maxWidth;
					}
					else{
						videoConstraints.width = { max: this.userMedia.video.maxWidth };
					}
				}

				if(this.userMedia.video.hasOwnProperty("maxHeight")){
					if(videoConstraints.height){
						videoConstraints.height.max = this.userMedia.video.maxHeight;
					}
					else{
						videoConstraints.height = { max: this.userMedia.video.maxHeight };
					}
				}

				if(this.userMedia.video.hasOwnProperty("minFrameRate")){
					if(videoConstraints.frameRate){
						videoConstraints.frameRate.min = this.userMedia.video.minFrameRate;
					}
					else{
						videoConstraints.frameRate = { min: this.userMedia.video.minFrameRate };
					}
				}

				if(this.userMedia.video.hasOwnProperty("maxFrameRate")){
					if(videoConstraints.frameRate){
						videoConstraints.frameRate.max = this.userMedia.video.maxFrameRate;
					}
					else{
						videoConstraints.frameRate = { max: this.userMedia.video.maxFrameRate };
					}
				}

				this.userMedia.video = videoConstraints;
			}
		}
		else{
			if(typeof this.userMedia.video !== "boolean"){
				var videoConstraints = {
					optional: [ ],
					mandatory: { }
				}

				if(this.userMedia.video.hasOwnProperty("minWidth")){
					videoConstraints.mandatory.minWidth = this.userMedia.video.minWidth;
				}

				if(this.userMedia.video.hasOwnProperty("minHeight")){
					videoConstraints.mandatory.minHeight = this.userMedia.video.minHeight;
				}

				if(this.userMedia.video.hasOwnProperty("maxWidth")){
					videoConstraints.mandatory.maxWidth = this.userMedia.video.maxWidth;
				}

				if(this.userMedia.video.hasOwnProperty("maxHeight")){
					videoConstraints.mandatory.maxHeight = this.userMedia.video.maxHeight;
				}

				if(this.userMedia.video.hasOwnProperty("minFrameRate")){
					videoConstraints.mandatory.minFrameRate = this.userMedia.video.minFrameRate;
				}

				if(this.userMedia.video.hasOwnProperty("maxFrameRate")){
					videoConstraints.mandatory.maxFrameRate = this.userMedia.video.maxFrameRate;
				}

				this.userMedia.video = videoConstraints;
			}
		}

		Rest.setProjectKey(this.config.projectKey);
		
		this.config.logLevel = this.config.logLevel.toUpperCase();
		Logger.setLogLevel(this.config.logLevel);
		
		if(this.config.localVideoTarget){
			this.config.localMediaTarget = this.config.localVideoTarget;
		}
		
		if(this.config.remoteVideoTarget){
			this.config.remoteMediaTarget = this.config.remoteVideoTarget;
		}
		
		if(!this.userMedia.audio && !this.userMedia.video && !this.dataChannelEnabled){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "initialize",
				message: "Might be true one of video or audio or dataChannel"
			});
			return;
		}
	},
	_setServers: function(config, nagToken, turn){
		var iceServers = null;
		if(this.config.iceServers){
			iceServers = this.config.iceServers;
		}
		else{
			iceServers = [{
				url: "turn:" + turn.turnserver.turnIp + ":" + turn.turnserver.turnPort,
				credential: turn.turnserver.turnPw,
				username: turn.turnserver.turnId
			}];
		}
		
		this.nagToken = nagToken;
		this.iceServers = iceServers;

		this.channelServer = config.channelUrl;
		this.nagServer = config.nagRestUrl;
		this.fractionLost = config.fractionLost;

		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "_setServers",
			message: "Set servers channelServer[" + this.channelServer + "] nagServer[" + this.nagServer + "] iceServers[" + JSON.stringify(this.iceServers) + "]"
		});
	},
	_createCall: function(token, channelId, uid){
		this.calling = new Call(this, {
			nagToken: this.nagToken,
			token: token,
			channelId: channelId,
			uid: uid
		});
		
		this.calling
			.on("addRemoteStream", this.addRemoteStream, this)
			.on("_disconnectChannel", this._disconnectChannel, this)
			.on("_otherDisconnectChannel", this._otherDisconnectChannel, this)
			.on("stateChange", this._stateChange, this)
			.on("error", this.error, this)
			.on("userCommand", this.onUserCommand, this);
	},
	/**
	 * 채널을 생성하고 해당 채널에 입장한다.
	 * @method createChannel
	 * @memberof PlayRTC.prototype
	 * @param {Object} [options] 채널 및 Peer 에 대한 부가 정보를 지정한다.
	 * @example
	 conn.createChannel({
	 	channel: {
	 		channelName: "Test Channel"
	 	},
	 	Peer: {
	 		uid: "UserID",
	 		userName: "Test User"
	 	}
	 });
	 */
	createChannel: function(options){
		if(this.calling){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "createChannel",
				message: "Already connected channel"
			});
			return;
		}
		
		options = options || {};
		options.env = {
			os: utils.platform,
			device: utils.browser.name,
			version: "",
			carrier: "",
			country: utils.nation,
			networkType: "wired"
		};
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "createChannel",
			message: "Called createChannel. data = " + JSON.stringify(options)
		});
		
		_call.call(this, function(){
			Rest.createChannel(options, utils.bind(function(result){
				var channelId = result.channelId,
					token = result.token.tokenId,
					serverConfig = result.configuration,
					uid = options.peer ? options.peer.uid || "" : "";

				this._setServers(serverConfig, result.nag.data.authToken, result.turn);
				this._createCall(token, channelId, uid);
					
				this.fire("connectChannel", channelId, "create");
			}, this), utils.bind(function(xhr, data){
				this.destroy();

				Logger.trace("cdmn", {
					klass: "PlayRTC",
					method: "createChannel",
					type: "p2p",
					callType: "caller",
					resultCode: "300",
					connectTime: new Date().getTime(),
					networkType: "wired",
					candidate: "",
					audioYn: this.userMedia.audio ? "Y" : "N",
					videoYn: this.userMedia.video ? "Y" : "N",					
					message: "Status[" + xhr.status + "] Failed createChannel. data = " + JSON.stringify(data)
				});

				this.error("C4001", SDK_ERROR_CODE["C4001"], data);
			}, this));
		}, function(){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "createChannel",
				message: "Must set 'true' video or audio or data"
			});
		});
	},
	/**
	 * 생성된 채널에 입장한다.
	 * @method connectChannel
	 * @memberof PlayRTC.prototype
	 * @param {Object} [options] Peer 에 대한 부가 정보를 지정한다.
	 * @example
	 conn.connectChannel({
	 	Peer: {
	 		uid: "UserID",
	 		userName: "Test User"
	 	}
	 });
	 */
	connectChannel: function(channelId, options){
		if(this.calling){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "connectChannel",
				message: "Already connected channel"
			});
			return;
		}

		if(!channelId){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "connectChannel",
				message: "Failed to execute 'connectChannel' on 'PlayRTC': 1 arguments required, but only " + arguments.length + " present"
			});
			return;
		}

		options = options || {};
		options.env = {
			os: utils.platform,
			device: utils.browser.name,
			version: "",
			carrier: "",
			country: utils.nation,
			networkType: "wired"
		};
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "connectChannel",
			channelId: channelId,
			message: "Called connectChannel. data = " + JSON.stringify(options)
		});

		_call.call(this, function(){
			Rest.connectChannel(channelId, options, utils.bind(function(result){
				var channelId = result.channelId,
					token = result.token.tokenId,
					serverConfig = result.configuration,
					uid = options.peer ? options.peer.uid || "" : "";
				
				this._setServers(serverConfig, result.nag.data.authToken, result.turn);
				this._createCall(token, channelId, uid);
				
				this.fire("connectChannel", channelId, "connect");
			}, this), utils.bind(function(xhr, data){
				this.destroy();

				Logger.trace("cdmn", {
					klass: "PlayRTC",
					method: "connectChannel",
					type: "p2p",
					callType: "callee",
					resultCode: "300",
					connectTime: new Date().getTime(),
					networkType: "wired",
					candidate: "",
					audioYn: this.userMedia.audio ? "Y" : "N",
					videoYn: this.userMedia.video ? "Y" : "N",					
					message: "Status[" + xhr.status + "] Failed connectChannel. data = " + JSON.stringify(data)
				});

				this.error("C4001", SDK_ERROR_CODE["C4001"], data);
			}, this));
		}, function(){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "connectChannel",
				message: "Must set 'true' video or audio or data"
			});
		});
	},
	/**
	 * 현재 접속 중인 채널에서 퇴장한다. 만약 인자로 Peer Id 를 지정하면 해당 Peer 가 퇴장하며 인자를 전달하지 않을 경우 자신이 퇴장한다.
	 * @method disconnectChannel
	 * @memberof PlayRTC.prototype
	 * @param {String} [pid] 지정한 Peer 를 채널에서 퇴장시킨다. 만약 인자로 PeerId 를 지정하지 않으면 자기 자신이 퇴장한다.
	 * @example
	 conn.disconnectChannel();
	 */
	disconnectChannel: function(pid){
		if(this.calling){
			Logger.trace("cdm", {
				klass: "PlayRTC",
				method: "disconnectChannel",
				channelId: this.getChannelId(),
				message: "Called disconnectChannel"
			});
			
			
			pid = pid || this.getPeerId();

			this.calling.channeling.disconnectChannel(pid);
			window.setTimeout(utils.bind(function(){
				if(pid === this.getPeerId()){
					if(this.calling){
						Logger.trace("cdm", {
							klass: "PlayRTC",
							method: "deleteChannel",
							channelId: this.getChannelId(),
							message: "Force disconnectChannel"
						});
						var channelId = this.getChannelId();
						
						this.destroy();
						this.fire("disconnectChannel", channelId, pid);
					}
				}
			}, this), 2000);
		}
	},
	/**
	 * 참여하고 있는 모든 Peer 를 퇴장시키고 채널을 완전히 종료한다. 
	 * @method deleteChannel
	 * @memberof PlayRTC.prototype
	 * @example
	 conn.deleteChannel();
	 */
	deleteChannel: function(){
		if(this.calling){
			Logger.trace("cdm", {
				klass: "PlayRTC",
				method: "deleteChannel",
				channelId: this.getChannelId(),
				message: "Called deleteChannel"
			});

			this.calling.channeling.deleteChannel();
			window.setTimeout(utils.bind(function(){
				if(this.calling){
					Logger.trace("cdm", {
						klass: "PlayRTC",
						method: "deleteChannel",
						channelId: this.getChannelId(),
						message: "Force deleteChannel"
					});
					var channelId = this.getChannelId(),
						pid = this.getPeerId();
					
					this.destroy();
					this.fire("disconnectChannel", channelId, pid);
				}
			}, this), 2000);
		}
	},
	/**
	 * 현재 생성되어 있는 모든 채널을 가져온다. 
	 * @method getChannelList
	 * @memberof PlayRTC.prototype
	 * @param {Function} success 정상적으로 채널 목록을 가져왔다면 호출된다.
	 * @param {Function} [error] 에러가 발생했다면 호출된다. 에러 핸들러에는 ajax xhr 객체와 서버에서의 반환값이 인자로 전달된다.
	 * @example
	 conn.getChannelList(function(data){
		var channels = data.channels,
			channel = null,
			channelList = "";
		
		for(var i=0; i<channels.length; i++){
			channel = channels[i];
			channelList = channelList + (channel.channelName || channel.channelId);
		}
		
		console.log(channelList);
	}, function(xhr, res){
		//error
	});
	 */
	getChannelList: function(success, error){
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "getChannelList",
			message: "Called getChannelList"
		});
		Rest.getChannelList(utils.bind(function(result){
			if(success){
				success(result);
			}
		}, this), utils.bind(function(xhr, data){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getChannelList",
				message: "Status[" + xhr.status + "] Failed getChannelList. data = " + JSON.stringify(data)
			});

			if(error){
				error(xhr, data);
			}
		}, this));
	},
	/**
	 * 지정한 채널 하나에 대한 정보를 반환한다. 
	 * @method getChannel
	 * @memberof PlayRTC.prototype
	 * @param {String} channelId 채널 정보를 가져올 채널의 Id 를 지정한다.
	 * @param {Function} success 정상적으로 채널을 가져왔다면 호출된다.
	 * @param {Function} [error] 에러가 발생했다면 호출된다. 에러 핸들러에는 ajax xhr 객체와 서버에서의 반환값이 인자로 전달된다.
	 * @example
	 conn.getChannel("ChannelId", function(data){
	 	console.log(data.channelId);
	 	console.log(data.peers);
	 	console.log(data.status);
	}, function(xhr, res){
		//error
	});
	 */
	getChannel: function(channelId, success, error){
		if(!channelId){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getChannel",
				message: "Failed to execute 'getChannel' on 'PlayRTC': 1 arguments required, but only " + arguments.length + " present"
			});
			return;
		}

		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "getChannel",
			message: "Called getChannel"
		});
		Rest.getChannel(channelId, utils.bind(function(result){
			if(success){
				success(result);
			}
		}, this), utils.bind(function(xhr, data){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getChannel",
				message: "Status[" + xhr.status + "] Failed getChannel. data = " + JSON.stringify(data)
			});
			
			if(error){
				error(xhr, data);
			}
		}, this));
	},
	/**
	 * 지정한 채널 속해있는 모든 Peer 목록을 반환한다.
	 * @method getPeerList
	 * @memberof PlayRTC.prototype
	 * @param {String} channelId Peer 목록을 가져올 channel Id 를 지정한다.
	 * @param {Function} success 정상적으로 채널을 가져왔다면 호출된다.
	 * @param {Function} [error] 에러가 발생했다면 호출된다. 에러 핸들러에는 ajax xhr 객체와 서버에서의 반환값이 인자로 전달된다.
	 * @example
	 conn.getPeerList("ChannelId", function(data){
	 	console.log(data.peers);
	}, function(xhr, res){
		//error
	});
	 */
	getPeerList: function(channelId, success, error){
		if(!channelId){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getPeerList",
				message: "Failed to execute 'getPeerList' on 'PlayRTC': 1 arguments required, but only " + arguments.length + " present"
			});
			return;
		}
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "getPeerList",
			message: "Called getPeerList"
		});
		Rest.getPeerList(channelId, utils.bind(function(result){
			if(success){
				success(result);
			}
		}, this), utils.bind(function(xhr, data){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getPeerList",
				message: "Status[" + xhr.status + "] Failed getPeerList. data = " + JSON.stringify(data)
			});
			
			if(error){
				error(xhr, data);
			}
		}, this));
	},
	/**
	 * 지정한 채널에 속해 있는 특정 Peer 에 대한 정보를 가져온다.
	 * @method getPeer
	 * @memberof PlayRTC.prototype
	 * @param {String} channelId Peer 를 가져올 channel Id 를 지정한다.
	 * @param {String} pid 정보를 가져올 Peer Id 를 지정한다..
	 * @param {Function} success 정상적으로 채널을 가져왔다면 호출된다.
	 * @param {Function} [error] 에러가 발생했다면 호출된다. 에러 핸들러에는 ajax xhr 객체와 서버에서의 반환값이 인자로 전달된다.
	 * @example
	 conn.getPeer("ChannelId", "PeerId", function(data){
	 	console.log(data.id);
	 	console.log(data.uid);
	 	console.log(data.userName);
	 	console.log(data.env);
	}, function(xhr, res){
		//error
	});
	 */
	getPeer: function(channelId, pid, success, error){
		if(!channelId || !pid){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getPeer",
				message: "Failed to execute 'getPeer' on 'PlayRTC': 2 arguments required, but only " + arguments.length + " present"
			});
			return;
		}
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "getPeer",
			message: "Called getPeer"
		});
		Rest.getPeer(channelId, pid, utils.bind(function(result){
			if(success){
				success(result);
			}
		}, this), utils.bind(function(xhr, data){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getPeer",
				message: "Status[" + xhr.status + "] Failed getPeer. data = " + JSON.stringify(data)
			});
			
			if(error){
				error(xhr, data);
			}
		}, this));
	},
	searchChannel: function(f, q, success, error){
		if(!f || !q){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "searchChannel",
				message: "Failed to execute 'searchChannel' on 'PlayRTC': 2 arguments required, but only " + arguments.length + " present"
			});
			return;
		}

		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "searchChannel",
			message: "Called searchChannel"
		});

		Rest.searchChannel(f, q, utils.bind(function(result){
			if(success){
				success(result);
			}
		}, this), utils.bind(function(xhr, data){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "searchChannel",
				message: "Status[" + xhr.status + "] Failed searchChannel. data = " + JSON.stringify(data)
			});
			
			if(error){
				error(xhr, data);
			}
		}, this));
	},
	/**
	 * Peer Id 를 기반으로 해당 Peer 를 대표하는 객체를 가져온다. 
	 * @method getPeerByPeerId
	 * @memberof PlayRTC.prototype
	 * @param {String} peerId 가져올 Peer 객체의 id 를 지정한다.
	 * @return {Peer} peer PeerConnect 객체의 Wrapper 객체
	 * @example
	 conn.getPeerByPeerId("peer id");
	 */
	getPeerByPeerId: function(pid){
		if(!this.calling){
			return null;
		}

		var o = this.calling.peers[pid];
		if(o){
			return o.peer;
		}
		
		return null;
	},
	/**
	 * User Id 를 기반으로 해당 Peer 를 대표하는 객체를 가져온다. 
	 * @method getPeerByUserId
	 * @memberof PlayRTC.prototype
	 * @param {String} uid 가져올 Peer 객체의 user id 를 지정한다. 
	 * @return {Peer} peer PeerConnect 객체의 Wrapper 객체
	 * @example
	 conn.getPeerByUserId("user id");
	 */
	getPeerByUserId: function(uid){
		if(!this.calling){
			return null;
		}

		var attr = null,
			peers = this.calling.peers;
		for(attr in peers){
			if(peers[attr].uid === uid){
				return peers[attr].peer;
			}
		}
		
		return null;
	},
	/**
	 * 현재 연결 중인 모든 Peer 를 배열로 반환한다. 
	 * @method getAllPeer
	 * @memberof PlayRTC.prototype
	 * @return {Array} peers 
	 * @example
	 conn.getAllPeer();
	 */
	getAllPeer: function(){
		if(!this.calling){
			return null;
		}

		var o = this.calling.peers,
			result = [],
			attr = null;
		
		for(attr in o){
			result.push(o[attr].peer);
		}
		
		return result;
	},
	/**
	 * 현재 자신의 Peer Id 를 반환한다.
	 * @method getPeerId
	 * @memberof PlayRTC.prototype
	 * @return {String} peerId 
	 * @example
	 conn.getPeerId();
	 */
	getPeerId: function(){
		if(this.calling){
			return this.calling.getPid();
		}
		return null;
	},
	/**
	 * 현재 자신 접속해 있는 Channel 의 Id 를 반환한다.
	 * @method getChannelId
	 * @memberof PlayRTC.prototype
	 * @return {String} channelId 
	 * @example
	 conn.getChannelId();
	 */
	getChannelId: function(){
		if(this.calling){
			return this.calling.getChannelId();
		}
		return null;
	},
	addRemoteStream: function(pid, uid, stream){
		/**
		 * 상대방 Peer 와 내가 연결되고 상대방의 미디어 스트림을 얻었다면 호출된다. 만약 remoteMediaTarget Configuration 이 지정되어 있지 않다면, 여기서 상대의 비디오 태그등의 UI 를 생성할 수 있다.
		 * @event addRemoteStream
		 * @memberof PlayRTC.prototype
		 * @param {String} peerid 접속에 성공한 상대방의 peer 고유 id
		 * @param {String} userId 접속에 성공한 상대방의 peer의 user id
		 * @param {MediaStream} remoteStream 접속에 성공한 상대방의 mediaStream
		 * @example
		 	conn.on("addRemoteStream", function(peerid, userid, stream){
		 		
		 	});
		 */
		if(!this.hasEvent("addRemoteStream")){
			if(this.config.remoteMediaTarget){
				var target = document.getElementById(this.config.remoteMediaTarget);
				if(target){
					if(!target.hasAttribute("autoPlay")){
						target.setAttribute("autoPlay", true);
					}
					target.src = utils.createObjectURL(stream);
				}
			}
		}
		else{
			if(this.fire("addRemoteStream", pid, uid, stream) === false){
				if(this.config.remoteMediaTarget){
					var target = document.getElementById(this.config.remoteMediaTarget);	
					if(target){
						if(!target.hasAttribute("autoPlay")){
							target.setAttribute("autoPlay", true);
						}
						target.src = utils.createObjectURL(stream);
					}
				}
			}
		}
	},
	createMedia: function(stream){
		this.media = new Media(stream);
		return this.media;
	},
	/**
	 * Local Stream 을 담고 있는 Meida 객체를 반환한다.
	 * @method getMedia
	 * @memberof PlayRTC.prototype
	 * @return {Media} media Local Stream 을 담고 있는 Media 객체를 반환한다.
	 * @example
	 conn.getMedia();
	 */
	getMedia: function(){
		return this.media;
	},
	/**
	 * 현재 SDK 의 **Configuration** 설정값을 반환한다.
	 * @method getConfig
	 * @memberof PlayRTC.prototype
	 * @return {Object} SDK 의 **Configuration** 설정값
	 * @example
	 conn.getConfig();
	 */
	getConfig: function(){
		return this.config;
	},
	/**
	 * DataChannel 을 통해 상대 Peer 에게 Data를 전송할 수 있다. 기본적으로 연결된 모든 Peer 에게 Data를 전송하고 두번째 인자로 PeerId 또는 UserId 를 지정하면 해당 Peer 에게만 Data 를 전송한다.
	 * @method dataSend
	 * @deprecated
	 * @memberof PlayRTC.prototype
	 * @param {Object} data 상대 Peer 에게 전송하고자 하는 Data. 문자열 또는 파일을 지정한다.
	 * @param {String} [id] Data 를 전송받을 Peer 의 PeerId 또는 UserId
	 * @example
	 //텍스트 전송
	 conn.dataSend("전송하고자 하는 텍스트");

	 //파일 전송
	 var input = document.getElementById("sendFileInput"),
		files = input.files,
		file = files[0];

		conn.dataSend(file);
	 */
	dataSend: function(/*data, id*/){
		Logger.warn("cdm", {
			klass: "PlayRTC",
			method: "dataSend",
			message: "dataSend is deprecated. please use get sendText of sendFile"
		});

		if(!this.calling){
			return false;
		}
		if(arguments.length < 1){
			return false;
		}

		var peer = null,
			peers = null,
			i = 0,
			len = 0,
			dc = null,
			args = arguments,
			data = args[0],
			id = null,
			succ = null,
			error = null;
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "dataSend",
			channelId: this.getChannelId(),
			message: "Sent data. data = " + data
		});

		if(typeof args[1] === "string"){
			id = args[1];
			if(args.length === 3){
				succ = args[2];
			}
			else if(args.length === 4){
				succ = args[2];
				error = args[3];
			}
		}
		else if(typeof args[1] === "function"){
			succ = args[1];
			if(args.length === 3){
				error = args[2];
			}
		}

		if(id){
			peer = this.getPeerByPeerId(id) || this.getPeerByUserId(id);
			if(peer){
				dc = peer.getDataChannel();
				if(dc){
					dc.send(data, succ, error);
				}
				return;
			}
		}
		else{
			peers = this.getAllPeer();
			len = peers.length;
			
			for(; i<len; i++){
				dc = peers[i].getDataChannel();
				if(dc){
					dc.send(data, succ, error);
				}
			}
		}
	},
	_dataSend: function(/*data, id*/){
		if(!this.calling){
			return false;
		}
		if(arguments.length < 1){
			return false;
		}

		var peer = null,
			peers = null,
			i = 0,
			len = 0,
			dc = null,
			args = arguments,
			data = args[0],
			id = null,
			succ = null,
			error = null;
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "dataSend",
			channelId: this.getChannelId(),
			message: "Sent data. data = " + data
		});

		if(typeof args[1] === "string"){
			id = args[1];
			if(args.length === 3){
				succ = args[2];
			}
			else if(args.length === 4){
				succ = args[2];
				error = args[3];
			}
		}
		else if(typeof args[1] === "function"){
			succ = args[1];
			if(args.length === 3){
				error = args[2];
			}
		}

		if(id){
			peer = this.getPeerByPeerId(id) || this.getPeerByUserId(id);
			if(peer){
				dc = peer.getDataChannel();
				if(dc){
					dc.send(data, succ, error);
				}
				return;
			}
		}
		else{
			peers = this.getAllPeer();
			len = peers.length;
			
			for(; i<len; i++){
				dc = peers[i].getDataChannel();
				if(dc){
					dc.send(data, succ, error);
				}
			}
		}
	},
	/**
	 * DataChannel 을 통해 상대 Peer 에게 Data를 전송할 수 있다. 기본적으로 연결된 모든 Peer 에게 Data를 전송하고 두번째 인자로 PeerId 또는 UserId 를 지정하면 해당 Peer 에게만 Data 를 전송한다.
	 * @method sendText
	 * @memberof PlayRTC.prototype
	 * @param {Object} data 상대 Peer 에게 전송하고자 하는 Data. 문자열 또는 파일을 지정한다.
	 * @param {String} [id] Data 를 전송받을 Peer 의 PeerId 또는 UserId
	 * @example
	 //텍스트 전송
	 conn.sendText("전송하고자 하는 텍스트");
	 */
	sendText: function(){
		if(!this.calling){
			return false;
		}
		if(arguments.length < 1){
			return false;
		}

		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "sendText",
			channelId: this.getChannelId(),
			message: "Sent data. data = " + arguments[0]
		});
		this._dataSend.apply(this, Array.prototype.slice.call(arguments));
	},
	/**
	 * DataChannel 을 통해 상대 Peer 에게 Data를 전송할 수 있다. 기본적으로 연결된 모든 Peer 에게 Data를 전송하고 두번째 인자로 PeerId 또는 UserId 를 지정하면 해당 Peer 에게만 Data 를 전송한다.
	 * @method sendFile
	 * @memberof PlayRTC.prototype
	 * @param {Object} data 상대 Peer 에게 전송하고자 하는 Data. 문자열 또는 파일을 지정한다.
	 * @param {String} [id] Data 를 전송받을 Peer 의 PeerId 또는 UserId
	 * @example
	 //파일 전송
	 var input = document.getElementById("sendFileInput"),
		files = input.files,
		file = files[0];

		conn.sendFile(file);
	 */
	sendFile: function(){
		if(!this.calling){
			return false;
		}
		if(arguments.length < 1){
			return false;
		}

		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "sendFile",
			channelId: this.getChannelId(),
			message: "Sent data. data = " + arguments[0]
		});
		this._dataSend.apply(this, Array.prototype.slice.call(arguments));
	},
	/**
	 * PlayRTC 서비스 플랫폼과 연결된 채널 소켓을 통해 상대 Peer 에게 Data를 전송할 수 있다. dataSend 와 다르게 텍스트만 전송이 가능하다.
	 * @method userCommand
	 * @memberof PlayRTC.prototype
	 * @param {Object} data 상대 Peer 에게 전송하고자 하는 Data. 텍스트만 전송이 가능하다.
	 * @param {String} [id] Data 를 전송받을 Peer 의 PeerId 또는 UserId
	 * @example
	 //텍스트 전송
	 conn.userCommand("전송하고자 하는 텍스트");
	 */
	userCommand: function(data, id){
		if(!this.calling){
			return false;
		}

		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "userCommand",
			channelId: this.getChannelId(),
			message: "Sent data. data = " + data
		});
		
		var peer = null;
	
		if(id){
			peer = this.getPeerByPeerId(id) || this.getPeerByUserId(id);
			if(peer){
				this.calling.channeling.userCommand(data, [{id: peer.id}]);
			}
		}
		else{
			this.calling.channeling.userCommand(data, []);
		}
	},
	onUserCommand: function(pid, data){
		var peer = this.getPeerByPeerId(pid);
		if(peer){
			this.fire("userCommand", pid, peer.uid, data);
		}
	},
	_disconnectChannel: function(channelId, pid){
		this.destroy();
		
		/**
		 * 나의 P2P 통신이 끊겼을 때 발생한다.
		 * @event disconnectChannel
		 * @memberof PlayRTC.prototype
		 * @example
		 	conn.on("disconnectChannel", function(channelId, peerId){
		 		
		 	});
		 */
		this.fire("disconnectChannel", channelId, pid);
	},
	_otherDisconnectChannel: function(pid, uid){
		var remote = document.getElementById(this.config.remoteMediaTarget);
		if(remote){
			remote.src = "";
		}
		this.fire("otherDisconnectChannel", pid, uid);
	},
	error: function(code, desc, payload){
		this.fire("error", code, desc, payload);
	},
	/**
	 * 모든 과정에서 상태가 변경되었을 때마다 호출된다.
	 * @event stateChange
	 * @memberof PlayRTC.prototype
	 * @param {String} type 주 단계의 문자열을 전달한다. 다음 4가지 경우가 존재한다. MEDIA, CHANNELING, SIGNALING, P2P
	 * @param {String} pid SIGNALING 단계 부터 상대방의 peerid
	 * @param {String} uid SIGNALING 단계 부터 상대방의 userid
	 * @example
	 	conn.on("stateChange", function(state, pid, uid){
	 		
	 	});
	 */
	_stateChange: function(state, pid, uid){
		this.fire("stateChange", state, pid, uid);
	},
	destroy: function(){
		if(this.calling){
			Logger.trace("cdm", {
				klass: "PlayRTC",
				method: "destroy",
				message: "Destroyed instance of 'PlayRTC'"
			});
			
			this.calling.destroy();
			this.calling = null;
	
			var remote = document.getElementById(this.config.remoteMediaTarget);
			if(remote){
				remote.src = "";
			}
			
			var local = document.getElementById(this.config.localMediaTarget);	
			if(local){
				local.src = "";
			}
		}
		
		if(this.media){
			this.media.stop();
			this.media = null;
		}
	},
	close: function(){
		this.destroy();
	},
	/**
	 * PlayRTC 객체 생성시 전달한 **Configuration** 에서 ring 이 true 로 지정되어 있을 경우, 수락/거절 프로세스가 추가된다.
	 * 먼저 접속한 Peer 는 나중에 접속한 Peer 를 수락/거절 할 수 있으며 accept 는 상대방을 허가할 때 사용하는 메소드 이다.
	 * @method accept
	 * @memberof PlayRTC.prototype
	 * @param {String} [pid] 연결을 허가할 상대받의 PeerId
	 * @example
	 *
	 //Ring
	 conn.on("ring", function(call, pid, uid){
	     if(window.confirm("수락하시겠습니까?")){
	         conn.accept(pid); //참여자 수락
	     }
	     else{
	         conn.reject(pid); //참여자 거절
	     }
	 });
	 */
	accept: function(pid){
		if(this.calling){
			this.calling.accept(pid);
		}
	},
	/**
	 * PlayRTC 객체 생성시 전달한 **Configuration** 에서 ring 이 true 로 지정되어 있을 경우, 수락/거절 프로세스가 추가된다.
	 * 먼저 접속한 Peer 는 나중에 접속한 Peer 를 수락/거절 할 수 있으며 reject 는 상대방을 거절할 때 사용하는 메소드 이다.
	 * @method reject
	 * @memberof PlayRTC.prototype
	 * @param {String} [pid] 연결을 허가할 상대받의 PeerId
	 * @example
	 *
	 //Ring
	 conn.on("ring", function(call, pid, uid){
	     if(window.confirm("수락하시겠습니까?")){
	         conn.accept(pid); //참여자 수락
	     }
	     else{
	         conn.reject(pid); //참여자 거절
	     }
	 });
	 */
	reject: function(pid){
		if(this.calling){
			this.calling.reject(pid);
		}
	},
	startStatsReport: function(peerid, interval, fn){
		var peer = this.getPeerByPeerId(peerid);
		if(peer){
			peer.startStatsReport(interval, fn);
			return true;
		}
		return false;
	},
	stopStatsReport: function(peerid){
		var peer = this.getPeerByPeerId(peerid);
		if(peer){
			peer.stopStatsReport();
			return true;
		}
		return false;
	}
});
var Logger = (function(){
	var LogKlass = utils.Extend(BaseKlass, {
		initialize: function(){ },
		trace: function(){ },
		warn: function(){ },
		error: function(){ },
		dateFormat: function(date){
			var yyyy = date.getFullYear().toString(),
				MM = (date.getMonth() + 1).toString(),
				dd = date.getDate().toString(),
				hh = date.getHours().toString(),
				mm = date.getMinutes().toString(),
				ss = date.getSeconds().toString(),
				ms = date.getMilliseconds();

			return utils.strFormat("{0}/{1}/{2} {3}:{4}:{5}.{6}", yyyy, function(){
				return (MM[1] ? MM: "0" + MM[0]);
			}, function(){
				return (dd[1] ? dd : "0" + dd[0]);
			}, function(){
				return (hh[1] ? hh : "0" + hh[0]);
			}, function(){
				return (mm[1] ? mm : "0" + mm[0]);
			}, function(){
				return (ss[1] ? ss : "0" + ss[0]);
			}, function(){
				if(ms < 10){
					ms = "00" + ms;
				}
				else if(ms < 100){
					ms = "0" + ms;
				}
				return ms;
			});
		}
	});
	
	var loggerFactory = function(category, appender){
		var logger = null, Klass;
		if(!PlayRTC.loggers[category]){
			Klass = utils.Extend(LogKlass, appender);
			logger = PlayRTC.loggers[category] = new Klass();
		}
		else{
			logger = PlayRTC.loggers[category];
		}

		return logger;
	};

	PlayRTC.loggers = { };

	return {
		level: 0,
		LOGLEVEL: {
			"TRACE": 0,
			"WARN": 1,
			"ERROR": 2,
			"NONE": 3
		},
		typeEach: function(str, fn){
			var s = null,
				len = str.length,
				o = null;

			while(len--){
				s = str[len].toUpperCase();
				switch(s){
					case "C":
						o = Logger.console;
						break;
					case "N":
						o = Logger.network;
						break;
					case "D":
						o = Logger.db;
						break;
					case "M":
						o = Logger.monitor;
						break;
				}
				if(o){
					fn.call(o);
				}

				o = null;
			}
		},
		trace: function(logType, log){
			if(this.LOGLEVEL["TRACE"] < this.level){
				return;
			}
			log.logType = "TRACE";
			this.typeEach(logType, function(){
				this.trace(log);
			});
		},
		warn: function(logType, log){
			if(this.LOGLEVEL["WARN"] < this.level){
				return;
			}
			log.logType = "WARN";
			this.typeEach(logType, function(){
				this.warn(log);
			});
		},
		error: function(logType, log){
			if(this.LOGLEVEL["ERROR"] < this.level){
				return;
			}
			log.logType = "ERROR";
			this.typeEach(logType, function(){
				this.error(log);
			});
		},
		setLogLevel: function(level){
			this.level = this.LOGLEVEL[level];
			if(!this.level){
				this.level = 0;
			}
		},
		console: loggerFactory("console", {
			initialize: function(){
				this.console = window.console;
				this.debugFn = this.console.debug ? "debug" : "log";
			},
			trace: function(log){
				this.console[this.debugFn](this.format(log));
			},
			warn: function(log){
				this.console.warn(this.format(log));
			},
			error: function(log){
				this.console.error(this.format(log));
			},
			format: function(log){
				var now = this.dateFormat(new Date()),
					logType = "[" + log.logType + "]",
					channelId = log.channelId ? "[" + log.channelId + "]" : "",
					klass = log.klass ? "[" + log.klass + "]" : "",
					method = log.method ? "[" + log.method + "]" : "",
					message = log.message || "";
				
				return utils.strFormat("{0} {1} {2} {3} {4} {5}", now, logType, channelId, klass, method, message).replace(/(?:\s\s)+/g, " ");
			}
		}),
		monitor: loggerFactory("monitor", {
			initialize: function(){
				function dumy(){ }
				this.view = {
					setLog: dumy,
					show: dumy,
					hide: dumy,
					exportLog: dumy,
					trace: dumy,
					error: dumy,
					warn: dumy
				};
			},
			show: function(){
				this.view.show();
			},
			hide: function(){
				this.view.hide();
			},
			trace: function(log){
				this.view.trace(this.format(log));
			},
			warn: function(log){
				this.view.warn(this.format(log));
			},
			error: function(log){
				this.view.error(this.format(log));
			},
			format: function(log){
				var now = this.dateFormat(new Date()),
					logType = "[" + log.logType + "]",
					channelId = log.channelId ? "[" + log.channelId + "]" : "",
					klass = log.klass ? "[" + log.klass + "]" : "",
					method = log.method ? "[" + log.method + "]" : "",
					message = log.message || "";
				
				return utils.strFormat("{0} {1} {2} {3} {4} {5}", now, logType, channelId, klass, method, message).replace(/(?:\s\s)+/g, " ");
			}
		}),
		db: loggerFactory("db", {
			initialize: function(){
				this.db = null;
				this.logsData = [];
				try{
					if(window.openDatabase){
						this.db = openDatabase("PlayRTC", "1.0", "PlayRTC Log Database", 1021 * 1024 * 20);//20MB
						this.db.transaction(function(tx){
							tx.executeSql("select * from logs", [] , function(){
								var sql = "delete from logs where logdate < datetime('now', '-10 day')";
								
								tx.executeSql(sql);
							}, function(tx, err){
								var sql = "create table if not exists logs ("
									+ "id integer primary key autoincrement,"
									+ "logdate datetime default current_time, "
									+ "log text)";
								
								tx.executeSql(sql);
							});
						});
					}
				}
				catch(e){ }
			},
			trace: function(log){
				this.save(this.format(log));
			},
			warn: function(log){
				this.save(this.format(log));
			},
			error: function(log){
				this.save(this.format(log));
			},
			save: function(log){
				try{
					this.db.transaction(function (tx) {
						var sql = "insert into logs(log) values (?)";
						tx.executeSql(sql, [log]);
					});
				}
				catch(e){ }
			},
			exportLog: function(){
				try{
					this.db.transaction(utils.bind(function(tx){
						var sql = "select * from logs;";
						tx.executeSql(sql, [], utils.bind(function(tx, rs){
							var row = null;
							for(var i=0; i<rs.rows.length; i++) {
								row = rs.rows.item(i);
								this.logsData.push(row["log"] + "\r\n");
							}
							
							if(rs.rows.length){
								this.processEnd();
							}
						}, this));
					}, this));
				}
				catch(e){ }
			},
			processEnd: function(){
				var blob = new Blob(this.logsData, {
					type : "text/plain"
				});
				this.logsData = [];
				utils.fileDownload(blob, this.dateFormat(new Date()) + "_log.txt");
			},
			format: function(log){
				var now = this.dateFormat(new Date()),
					logType = "[" + log.logType + "]",
					channelId = log.channelId ? "[" + log.channelId + "]" : "",
					klass = log.klass ? "[" + log.klass + "]" : "",
					method = log.method ? "[" + log.method + "]" : "",
					message = log.message || "";
				
				return utils.strFormat("{0} {1} {2} {3} {4} {5}", now, logType, channelId, klass, method, message);
			}
		}),
		network: loggerFactory("network", {
			initialize: function(){
				this.config = {
					projectKey: null,
					interval: 60000
				};

				this.storage = window.localStorage;
				this.q = [];
			},
			trace: function(log){
				Rest.log(this.format(log), function(){});
			},
			warn: function(log){
				Rest.log(this.format(log), function(){});
			},
			error: function(log){
				Rest.log(this.format(log), function(){});
			},
			format: function(log){
				var data = utils.apply({}, log);
				delete data.klass;
				delete data.method;
				delete data.message;
				delete data.logType;
				return data;
			}
		})
	};
})();
var Call = utils.Extend(utils.Event, {
	initialize: function(playRtc, options){
		Call.base.initialize.call(this);

		this.pid = null;
		this.token = options.token;
		this.nagToken = options.nagToken;
		this.uid = options.uid;
		this.channelId = options.channelId;
		this.channelServer = playRtc.channelServer;
		this.turnInterval = null;
		this.healthInterval = null;
		
		this.peers = { };
		this.playRtc = playRtc;

		Logger.trace("cdm", {
			klass: "Call",
			method: "initialize",
			channelId: this.channelId,
			message: "Created instance of 'Call'"
		});
		
		this.channeling = new PlayRTC.Channeling(this, this.channelServer);
		this.channeling
			.on("onOpen", this.connect, this)
			.on("onConnect", this.onConnect, this)
			.on("onOtherConnect", this.onOtherConnect, this)
			.on("onRing", this.onRing, this)
			.on("onAccept", this.onAccept, this)
			.on("onReject", this.onReject, this)
			.on("onClose", this.onClose, this)
			.on("onOtherClose", this.onOtherClose, this)
			.on("error", this.error, this)
			.on("userCommand", this.onUserCommand, this)
			.on("receiveOfferSdp", this.receiveOfferSdp, this)
			.on("receiveAnwserSdp", this.receiveAnwserSdp, this)
			.on("receiveCandidate", this.receiveCandidate, this);
	},
	getChannelId: function(channel){
		return this.channelId;
	},
	getToken: function(){
		return this.token;
	},
	getNagToken: function(){
		return this.nagToken;
	},
	setPid: function(pid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "setPid",
			channelId: this.getChannelId(),
			message: "PID[" + pid + "] Set self pid"
		});
		this.pid = pid;
	},
	getPid: function(pid){
		return this.pid;
	},
	getUid: function(uid){
		return this.uid;
	},
	requestTurn: function(success, error){
		Logger.trace("cdm", {
			klass: "Call",
			method: "requestTurn",
			channelId: this.getChannelId(),
			message: "Called requestTurn"
		});

		var url = this.playRtc.nagServer + "/webrtcsignaling/v1/" + this.getToken() + "/turnserver?authToken=" + this.getNagToken();
		request({
			method: "get",
			url: url,
			contentType: "application/x-www-form-urlencoded",
			success: success,
			error: error
		});
	},
	connect: function(){
		var channelId = this.getChannelId();
		Logger.trace("cdm", {
			klass: "Call",
			method: "connect",
			channelId: channelId,
			message: "Token[" + this.getToken() + "] UID[" + this.getUid() + "] Connected of channel"
		});
		
		this.channeling.connect(channelId);
	},
	accept: function(pid){
		if(!pid){
			Logger.error("cdm", {
				klass: "Call",
				method: "accept",
				channelId: this.getChannelId(),
				message: "Failed to execute 'accept' on 'Call': 1 arguments required, but only " + arguments.length + " present"
			});
			return false;
		}
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "accept",
			channelId: this.getChannelId(),
			message: "OtherPID[" + pid + "] Accepted other peer"
		});

		this.channeling.accept(pid);
		for(attr in this.peers){
			this.peers[attr].type = "answer";
		}
	},
	reject: function(pid){
		if(!pid){
			Logger.error("cdm", {
				klass: "Call",
				method: "reject",
				channelId: this.getChannelId(),
				message: "Failed to execute 'reject' on 'Call': 1 arguments required, but only " + arguments.length + " present"
			});
			return false;
		}

		Logger.trace("cdm", {
			klass: "Call",
			method: "reject",
			channelId: this.getChannelId(),
			message: "OtherPID[" + pid + "] Rejected other peer"
		});

		delete this.peers[pid];
		this.channeling.reject(pid);
	},
	ring: function(pid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "ring",
			channelId: this.getChannelId(),
			message: "OtherPID[" + pid + "] Sent to ring to other peer"
		});
		this.channeling.ring(pid);
	},
	createPeer: function(pid, uid){
		var playRtc = this.playRtc,
			media = this.playRtc.getMedia(),
			localStream = media ? media.getStream() : null,
			peerConfig = null;

		if(!this.peers[pid]){
			this.peers[pid] = { };
		}

		if(this.peers[pid].peer){
			return;
		}
		
		if(!this.peers[pid].uid){
			this.peers[pid].uid = uid || "";
		}
		
		peerConfig = {
			iceServers: playRtc.iceServers,
			dataChannelEnabled: playRtc.dataChannelEnabled,
			bandwidth: playRtc.getConfig().bandwidth
		};

		this.peers[pid].peer = new Peer(this, pid, this.peers[pid].uid, localStream, peerConfig);
		this.peers[pid].peer
			.on("sendOfferSdp", this.sendOfferSdp, this)
			.on("sendAnswerSdp", this.sendAnswerSdp, this)
			.on("sendCandidate", this.sendCandidate, this)
			.on("addRemoteStream", this.addRemoteStream, this)
			.on("signalEnd", this.signalEnd, this)
			.on("error", function(code, desc, data){
				this.fire("error", code, desc, data);
			}, this)
			.on("stateChange", this._stateChange, this);

		return this.peers[pid];
	},
	onConnect: function(pid, peers){
		var p = null;

		this.setPid(pid);
		Logger.trace("cdm", {
			klass: "Call",
			method: "onConnect",
			channelId: this.getChannelId(),
			message: "Channel connecting is success"
		});
		
		var peer,
			i = 0,
			len = peers.length;
		
		if(len > 0){
			if(this.playRtc.config.ring){
				for (; i<len; i++) {
					this.ring(peers[i].id);
				};
			}
			else{
				for (; i<len; i++) {
					p = this.createPeer(peers[i].id, peers[i].uid);
					p.type = "offer";
					p.peer.createOffer();
				};
			}
		}
		else{
			//nag turn timer interval
			this._startTurnInterval();
		}
		
		this.channeling.health();
		this.healthInterval = window.setInterval(utils.bind(function(){
			this.channeling.health();
		}, this), 30000);
	},
	_startTurnInterval: function(){
		if(!this.playRtc.config.iceServers){
			//nag turn timer interval
			this.turnInterval = window.setInterval(utils.bind(function(){
				this.requestTurn(utils.bind(function(result){
					Logger.trace("cdm", {
						klass: "Call",
						method: "onConnect",
						channelId: this.getChannelId(),
						message: "Received nag turn server. iceServer = " + JSON.stringify(result)
					});
	
					var iceServers = [{
						url: "turn:"+ result.data.turnserver.turnIp + ":" + result.data.turnserver.turnPort,
						credential: result.data.turnserver.turnPw,
						username: result.data.turnserver.turnId
					}];
					
					this.playRtc.iceServers = iceServers;
				}, this), utils.bind(function(){
					window.clearInterval(this.turnInterval);
					this.error("C4011", SDK_ERROR_CODE["C4011"]);
				}, this));
			}, this), 40000);
		}
	},
	onOtherConnect: function(pid, uid){
		if(this.turnInterval){
			window.clearInterval(this.turnInterval);
			this.turnInterval = null;
		}
		var attr = null;
		if(this.playRtc.config.ring){
			return;
		}

		if(!this.peers[pid]){
			this.peers[pid] = { };
			this.peers[pid].type = "answer";
			this.peers[pid].uid = uid;
		}
	},
	onRing: function(pid, uid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "onRing",
			channelId: this.getChannelId(),
			message: "OtherPID[" + pid + "] OtherUID[" + uid + "] Received to ring from other peer"
		});

		this.peers[pid] = {
			uid: uid
		};

		if(!this.playRtc.hasEvent("ring")){
			alert("You must create ring event.");
			return false;
		}

		/**
		 * Peer 간의 연결시, 먼저 붙어 있던 Peer 가 나중에 들어온 Peer 를 허가 해야 연결이 되는 서비스 플로우라면, 이때 먼저 들어온 Peer 에게 ring 이라는 이벤트가 호출된다. 이 이벤트 내에서 상대방의 연결 요청을 수락/거절 할 수 있다.해당 이벤트의 첫번째 파라미터 요소인 call 객체의 accept 또는 reject 메소드를 호출하여 수락/거절을 수행할 수 있다.
		 * @event ring
		 * @memberof PlayRTC.prototype
		 * @param {String} pid 새로 접속한 peer 의 고유 id
		 * @param {String} uid 새로 접속한 peer 의 서비스 id
		 * @example
		 	conn.on("ring", function(call, pid, uid){
		 		
		 	});
		 */
		this.playRtc.fire("ring", pid, uid);
	},
	onAccept: function(pid, uid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "onAccept",
			channelId: this.getChannelId(),
			message: "OtherPID[" + pid + "] OtherUID[" + uid + "] Received to accept from other peer"
		});

		var p = this.createPeer(pid, uid);
		p.type = "offer";
		p.peer.createOffer();

		/**
		 * 상대방 Peer 가 나를 ring 에 대해 수락을 하였다면 호출된다.
		 * @event accept
		 * @memberof PlayRTC.prototype
		 * @param {String} pid 나를 수락한 peer 의 고유 id
		 * @param {String} uid 나를 수락한 peer 의 서비스 id
		 * @example
		 	conn.on("accept", function(pid, uid){
		 		
		 	});
		 */
		this.playRtc.fire("accept", pid, uid);
	},
	onReject: function(pid, uid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "onReject",
			channelId: this.getChannelId(),
			message: "OtherPID[" + pid + "] OtherUID[" + uid + "] Received to reject from other peer"
		});


		/**
		 * 상대방 Peer 가 나를 ring 에 대해 거절을 하였다면 호출된다.
		 * @event reject
		 * @memberof PlayRTC.prototype
		 * @param {String} pid 나를 거절한 peer 의 고유 id
		 * @param {String} uid 나를 거절한 peer 의 서비스 id
		 * @example
		 	conn.on("reject", function(pid, uid){
		 		
		 	});
		 */
		this.playRtc.fire("reject", pid, uid);
	},
	sendOfferSdp: function(id, sdp){
		this.channeling.sendOfferSdp(id, sdp);
	},
	sendAnswerSdp: function(id, sdp){
		this.channeling.sendAnswerSdp(id, sdp);
	},
	sendCandidate: function(id, candidate){
		this.channeling.sendCandidate(id, candidate);
	},
	receiveOfferSdp: function(id, sdp, uid){
		var p = this.peers[id],
			peer = null;

		if(!p){
			peer = this.createPeer(id).peer;
		}
		else{
			if(!p.peer){
				peer = this.createPeer(id).peer;
			}
			else{
				peer = p.peer;
			}
		}

		Logger.trace("cdm", {
			klass: "Call",
			method: "receiveOfferSdp",
			channelId: this.getChannelId(),
			message: "OtherPID[" + id + "] Received from other Peer offer sdp"
		});

		peer.createAnswer(sdp);
	},
	receiveAnwserSdp: function(id, sdp){
		Logger.trace("cdm", {
			klass: "Call",
			method: "receiveAnwserSdp",
			channelId: this.getChannelId(),
			message: "OtherPID[" + id + "] Received from other Peer anwser sdp"
		});

		var peer = this.peers[id].peer;
		peer.receiveAnwserSdp(sdp);
	},
	receiveCandidate: function(id, candidate, uid){
		var p = this.peers[id],
			peer = null;
	
		if(!p){
			peer = this.createPeer(id).peer;
		}
		else{
			if(!p.peer){
				peer = this.createPeer(id).peer;
			}
			else{
				peer = p.peer;
			}
		}

		Logger.trace("cdm", {
			klass: "Call",
			method: "receiveCandidate",
			channelId: this.getChannelId(),
			message: "OtherPID[" + id + "] Received from other Peer candidate"
		});

		peer.receiveCandidate(candidate);
	},
	addRemoteStream: function(pid, uid, stream){
		this.fire("addRemoteStream", pid, uid, stream);
	},
	signalEnd: function(pid){
		
	},
	onClose: function(channelId, pid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "onClose",
			channelId: this.getChannelId(),
			message: "Disconnected channel"
		});
		this.fire("_disconnectChannel", channelId, pid);
	},
	onOtherClose: function(pid){
		var p = this.peers[pid],
			uid = null;
	
		if(!p){
			this.fire("_otherDisconnectChannel", pid);
			return;
		}
		
		uid = p.uid;
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "onOtherClose",
			channelId: this.getChannelId(),
			message: "OtherPID[" + pid + "] OtherUID[" + uid + "] Disconnected with other peer"
		});
		
		if(p.peer){
			p.peer.close();
		}
		delete this.peers[pid];
		
		var index = 0;
		for(var peer in this.peers){
			index++;
		}
		
		if(index < 1){
			this._startTurnInterval();
		}
		 
		this.fire("_otherDisconnectChannel", pid, uid);
	},
	error: function(code, desc, payload){
		window.clearInterval(this.healthInterval);
		window.clearInterval(this.turnInterval);
		
		this.healthInterval = null;
		this.turnInterval = null;
		
		this.fire("error", code, desc, payload);
	},
	_stateChange: function(state, pid, uid){
		this.fire("stateChange", state, pid, uid);
	},
	destroy: function(){
		Logger.warn("cdm", {
			klass: "Call",
			method: "destroy",
			channelId: this.getChannelId(),
			message: "Destroyed instance of 'Call'"
		});

		if(this.turnInterval){
			window.clearInterval(this.turnInterval);
			this.turnInterval = null;
		}

		var attr = null,
			peers = this.peers,
			url = null;

		if(this.channeling){
			this.channeling.socket.close();
		}

		for(attr in peers){
			if(peers[attr].peer){
				peers[attr].peer.close();
			}
		}

		this.peers = { };
		
		if(this.healthInterval){
			window.clearInterval(this.healthInterval);
			this.healthInterval = null;
		}
	},
	onUserCommand: function(pid, data){
		this.fire("userCommand", pid, data);
	}
});
PlayRTC.Channeling = utils.Extend(utils.Event, {
	initialize: function(call, url){
		PlayRTC.Channeling.base.initialize.call(this);

		this.url = url;
		this.call = call;
		
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "initialize",
			channelId: this.call.getChannelId(),
			message: "Created instance of 'Channeling'"
		});
		
		this.createSocket();
	},
	serialize: function(data){
		var default_json = {
			header: {
				command: "",
				commandType: "req",
				token: this.call.getToken(),
				expireTime: "none",
				broadcast: "none",
				sender: {
					type: "peer",
					id: "none"
				},
				receiver: {
					type: "server",
					id: "none"
				}
			},
			body: { }
		};
		return JSON.stringify(utils.apply(default_json, data));
	},
	signalSerialize: function(data){
		var default_json = {
			header: {
				command: "",
				commandType: "req",
				token: this.call.getToken(),
				sender: {
					type: "peer",
					id: "none"
				},
				receiver: {
					type: "peer",
					id: "none"
				}
			},
			body: { }
		};
		return JSON.stringify(utils.apply(default_json, data));
	},
	createSocket: function(){
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "createSocket",
			channelId: this.call.getChannelId(),
			message: "WebSocket[" + this.url + "] Created instance of 'Channeling Web Socket'"
		});

		try{
			this.socket = new Socket(this.url);
		}
		catch(e){
			Logger.error("cdm", {
				klass: "Channeling",
				method: "createSocket",
				channelId: this.call.getChannelId(),
				message: "Failed to create instance of 'Channeling Web Socket'"
			});
			this.fire("error", "C4002", SDK_ERROR_CODE["C4002"]);
			return;
		}
		
		this.socket.on("open", utils.bind(function(e){
			this.fire("onOpen");
		}, this)).on("close", utils.bind(function(e){
			Logger.trace("cdm", {
				klass: "Channeling",
				method: "createSocket",
				channelId: this.call.getChannelId(),
				message: "Closed 'Channeling Web Socket'"
			});
		}, this)).on("error", utils.bind(function(e){
			Logger.error("cdm", {
				klass: "Channeling",
				method: "createSocket",
				channelId: this.call.getChannelId(),
				message: "Caused error 'Channeling Web Socket'"
			});
			
			this.fire("error", "C4007", SDK_ERROR_CODE["C4007"]);
		}, this)).on("message", this.message, this);
	},
	send: function(data){
		if(this.socket.getReadyState() === 1){
			this.socket.send(data);
		}
		else{
			Logger.error("cdm", {
				klass: "Channeling",
				method: "send",
				channelId: this.call.getChannelId(),
				message: "Already disconnected channel server"
			});
			this.fire("error", "C4003", SDK_ERROR_CODE["C4003"]);
		}
	},
	connect: function(channelId){
		var data = this.serialize({
			header: {
				command: "connect",
				sender: {
					env: {
						platformType: utils.platform,
						browser: {
							name: utils.browser.name,
							version: utils.browser.version
						},
						sdk: {
							type: "web",
							version: PlayRTC.version
						},
						networkType: "wired"
					}
				}
			},
			body: {
				data: {
					uid: this.call.getUid() || "none",
					channelId: channelId
				}
			}
		});

		Logger.trace("cdm", {
			klass: "Channeling",
			method: "connect",
			channelId: this.call.getChannelId(),
			message: "Sent to connect channel. data = " + data
		});
		this.send(data);
	},
	userCommand: function(data, id){
		var data = this.serialize({
			header: {
				command: "userdefined",
				broadcast: id.length < 1 ? "yes" : "no",
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					targets: id
				}
			},
			body: {
				data: {
					channelId: this.call.getChannelId(),
					userData: data
				}
			}
		});

		Logger.trace("cdm", {
			klass: "Channeling",
			method: "userCommand",
			channelId: this.call.getChannelId(),
			message: "Sent userdefined. data = " + data
		});
		this.send(data);
	},
	accept: function(pid){
		var data = this.serialize({
			header: {
				command: "on_ready",
				commandType: "res",
				sender: {
					type: "peer",
					id: this.call.getPid()
				}
			},
			body: {
				header: {
					code: "20001",
					desc: "SUCCESS"
				},
				data: {
					status: "yes",
					channelId: this.call.getChannelId(),
					targetId: pid
				}
			}
		});

		Logger.trace("cdm", {
			klass: "Channeling",
			method: "accept",
			channelId: this.call.getChannelId(),
			message: "Sent to accept. data = " + data
		});
		this.send(data);
	},
	reject: function(pid){
		var data = this.serialize({
			header: {
				command: "on_ready",
				commandType: "res",
				sender: {
					type: "peer",
					id: this.call.getPid()
				}
			},
			body: {
				header: {
					code: "20001",
					desc: "SUCCESS"
				},
				data: {
					status: "no",
					channelId: this.call.getChannelId(),
					targetId: pid
				}
			}
		});

		Logger.trace("cdm", {
			klass: "Channeling",
			method: "reject",
			channelId: this.call.getChannelId(),
			message: "Sent to reject. data = " + data
		});
		this.send(data);
	},
	ring: function(pid){
		var data = this.serialize({
			header: {
				command: "ready",
				sender: {
					id: this.call.getPid()
				}
			},
			body: {
				data: {
					channelId: this.call.getChannelId(),
					targetId: pid
				}
			}
		});

		Logger.trace("cdm", {
			klass: "Channeling",
			method: "ring",
			channelId: this.call.getChannelId(),
			message: "Sent to ring. data = " + data
		});
		this.send(data);	
	},
	disconnectChannel: function(pid){
		var data = this.serialize({
			header: {
				command: "peer_close",
				sender: {
					id: pid
				}
			},
			body: {
				data: {
					channelId: this.call.getChannelId()
				}
			}
		});

		Logger.trace("cdm", {
			klass: "Channeling",
			method: "disconnectChannel",
			channelId: this.call.getChannelId(),
			message: "Sent to disconnectChannel. data = " + data
		});
		this.send(data);
	},
	deleteChannel: function(){
		var data = this.serialize({
			header: {
				command: "channel_close",
				token: this.call.getToken(),
				sender: {
					id: this.call.getPid()
				}
			},
			body: {
				data: {
					channelId: this.call.getChannelId()
				}
			}
		});

		Logger.trace("cdm", {
			klass: "Channeling",
			method: "deleteChannel",
			channelId: this.call.getChannelId(),
			message: "Sent to delete. data = " + data
		});
		this.send(data);
	},
	sendOfferSdp: function(id, sdp){
		var data = this.signalSerialize({
			header: {
				command: "sdp",
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					type: "peer",
					id: id
				}
			},
			body: {
				data: {
					type: "offer",
					sdp: JSON.stringify(sdp)
				}
			}
		});
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "sendOfferSdp",
			channelId: this.call.getChannelId(),
			message: "Sent offer sdp. data = " + data
		});
		this.send(data);
	},
	sendAnswerSdp: function(id, sdp){
		var data = this.signalSerialize({
			header: {
				command: "sdp",
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					id: id
				}
			},
			body: {
				data: {
					type: "answer",
					sdp: JSON.stringify(sdp)
				}
			}
		});
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "sendAnswerSdp",
			channelId: this.call.getChannelId(),
			message: "Sent answer sdp. data = " + data
		});
		this.send(data);
	},
	sendCandidate: function(id, candidate){
		var data = this.signalSerialize({
			header: {
				command: "candidate",
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					id: id
				}
			},
			body: {
				data: {
					candidate: JSON.stringify(candidate)
				}
			}
		});
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "sendCandidate",
			channelId: this.call.getChannelId(),
			message: "Sent candidate. data = " + data
		});
		this.send(data);
	},
	health: function(){
		var data = this.serialize({
			header: {
				command: "health",
				sender: { },
				receiver: { }
			},
			body: {	}
		});

		try{
			this.socket.send(data);
		}
		catch(e){
			Logger.error("cdm", {
				klass: "Channeling",
				method: "health",
				channelId: this.call.getChannelId(),
				message: "Failed to send health."
			});
		}
	},
	message: function(message){
		var data = JSON.parse(message.data),
			header = data.header,
			body = data.body,
			command = header.command.toUpperCase(),
			others = [],
			len = 0,
			i = 0;

		if(header.commandType === "res"){
			if(SERVER_CODE[body.header.code] !== "SUCCESS"){
				Logger.error("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received message. data = " + message.data
				});

				errorDelegate.call(this, "CHANNEL", body.header.code, data);
				return;
			}
		}

		switch(command){
			case "CONNECT":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received channel 'connect'. data = " + message.data
				});
				for(len = body.data.others.length; i<len; i++){
					others.push({
						id: body.data.others[i].id,
						uid: body.data.others[i].uid !== "none" ? body.data.others[i].uid : ""
					});
				}
				this.fire("onConnect", header.receiver.id, others);
				break;
			case "ON_CONNECT":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received channel 'on_connect'. data = " + message.data
				});
				if(body.data.others.length > 0){
					this.fire("onOtherConnect", body.data.others[0].id, body.data.others[0].uid !== "none" ? body.data.others[0].uid : "");
				}
				break;
			case "READY":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received 'ring'. data = " + message.data
				});
				if(body.data.status){
					if(body.data.status === "yes"){
						this.fire("onAccept", body.data.targetId, body.data.uid !== "none" ? body.data.uid : "");
					}
					else{
						this.fire("onReject", body.data.targetId, body.data.uid !== "none" ? body.data.uid : "");
					}
				}
				break;
			case "ON_READY":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Rreceived 'on_ring'. data = " + message.data
				});
				this.fire("onRing", body.data.targetId, body.data.uid !== "none" ? body.data.uid : "");
				break;
			case "CLOSE":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received 'close'. data = " + message.data
				});
				this.fire("onClose", body.data.channelId, header.receiver.id);
				break;
			case "ON_CLOSE":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received 'on_close'. data = " + message.data
				});
				this.fire("onOtherClose", body.data.targetId);
				break;
			case "ON_USERDEFINED":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received 'on_userdefined'. data = " + message.data
				});
				this.fire("userCommand", body.data.targetId, body.data.userData);
				break;
			case "SDP":
				if(header.commandType === "res"){
					return;
				}
				type = body.data.type.toUpperCase();
				if(type === "OFFER"){
					this.fire("receiveOfferSdp", header.sender.id, JSON.parse(body.data.sdp));
				}
				else if(type === "ANSWER"){
					this.fire("receiveAnwserSdp", header.sender.id, JSON.parse(body.data.sdp));
				}
				break;
			case "CANDIDATE":
				if(header.commandType === "res"){
					return;
				}
				this.fire("receiveCandidate", header.sender.id, JSON.parse(body.data.candidate));
				break;
		}
	}
});

/**
 * Peer Class
 * @class Peer
 * @extends PlayRTC.utils.Event
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 */
var Peer = utils.Extend(utils.Event, {
	initialize: function(call, id, uid, localStream, config){
		Peer.base.initialize.call(this);

		this.config = utils.apply({
			iceServers: null,
			dataChannelEnabled: false,
			bandwidth: {
				video: 1500,
				data: 1638400
			}
		}, config);

		this.call = call;
		this.id = id;
		this.uid = uid;
		this.localStream = localStream;
		this.media = null;
		this.connected = false;
		this.oldStats = null;
		this.statsReportTimer = null;
		this.preferCodec = {
			audio: "ISAC",
			video: "H264"
		};

		this.fractionLost = this.call.playRtc.fractionLost || {
			audio: [
				{rating: 1, fromAflost: 0, toAflost: 50},
				{rating: 2, fromAflost: 51, toAflost: 150},
				{rating: 3, fromAflost: 151, toAflost: 250},
				{rating: 4, fromAflost: 251, toAflost: 350},
				{rating: 5, fromAflost: 351, toAflost: 9999999}
			],
			video: [
				{rating: 1, fromAflost: 0, toAflost: 40},
				{rating: 2, fromAflost: 41, toAflost: 55},
				{rating: 3, fromAflost: 56, toAflost: 70},
				{rating: 4, fromAflost: 71, toAflost: 90},
				{rating: 5, fromAflost: 91, toAflost: 9999999}
			]
		}
		
		Logger.trace("cdm", {
			klass: "Peer",
			method: "initialize",
			channelId: this.call.getChannelId(),
			message: "PID[" + this.id +"]. Created instance of 'Peer'."
		});
	},
	setEvent: function(){
		var pc = this.pc;
		pc.onicecandidate = utils.bind(function(e){
			Logger.trace("cdm", {
				klass: "Peer",
				method: "setEvent",
				channelId: this.call.getChannelId(),
				message: "Created candidate. candidate = " + JSON.stringify(e.candidate)
			});
			if(e.candidate){
				this.fire("sendCandidate", this.id, e.candidate);
			}
		}, this);

		pc.onaddstream = utils.bind(function(e){
			this.media = new Media(e.stream);
			this.fire("addRemoteStream", this.id, this.uid, e.stream);
		}, this);

		pc.onsignalingstatechange = utils.bind(function(e){
			this.fire("signalingstatechange", e);
		}, this);

		pc.oniceconnectionstatechange = utils.bind(function(e){
			this.fire("iceconnectionstatechange", e);

			var connectionState = e.target.iceConnectionState.toUpperCase(),
				gatheringState = e.target.iceGatheringState.toUpperCase();

			Logger.trace("cdm", {
				klass: "Peer",
				method: "setEvent",
				channelId: this.call.getChannelId(),
				message: "ConnectionState[" + connectionState + "] GatheringState[" + gatheringState + "] Changed P2P state"
			});
			
			if(connectionState === "COMPLETED" || connectionState === "CONNECTED" || connectionState === "FAILED"){
				this.fire("signalEnd", this.id);
			}
			
			if(connectionState === "FAILED"){
				Logger.error("cdmn", {
					klass: "Peer",
					method: "setEvent",
					channelId: this.call.getChannelId(),
					tokenId: this.call.getToken(),
					type: "p2p",
					callType: this.call.peers[this.id].type === "offer" ? "callee" : "caller",
					resultCode: "400",
					connectTime: new Date().getTime(),
					networkType: "wired",
					candidate: "",
					audioYn: this.call.playRtc.userMedia.audio ? "Y" : "N",
					videoYn: this.call.playRtc.userMedia.video ? "Y" : "N",					
					message: "PID[" + this.call.getPid() + "] UID[" + this.call.getUid() + "] OtherPID[" + this.id + "] OtherUID[" + this.uid + "] Failed P2P connection"
				});
				
				this._error("P4001", SDK_ERROR_CODE["P4001"]);
			}
			else if(connectionState === "CHECKING"){
				this.fire("stateChange", "CHECKING", this.id, this.uid);
			}
			else if(connectionState === "COMPLETED" || connectionState === "CONNECTED"){
				Logger.trace("cdm", {
					klass: "Peer",
					method: "setEvent",
					channelId: this.call.getChannelId(),
					message: "PID[" + this.call.getPid() + "] UID[" + this.call.getUid() + "] OtherPID[" + this.id + "] OtherUID[" + this.uid + "] Connected P2P"
				});

				if(!this.connected){
					this.getStats(utils.bind(function(stats){
						this.oldStats = stats;

						var localCandidate;
						if(utils.browser.name === "firefox"){
							for(attr in stats){
								if(stats[attr].type === "candidatepair" && stats[attr].selected === true){
									localCandidate = stats[stats[attr].localCandidateId].candidateType;
									break;
								}
							}
						}
						else{
							for(var i=0; i<stats.length; i++){
								if(stats[i].googActiveConnection === "true"){
									localCandidate = stats[i].googLocalCandidateType;
									break;
								}
							}
						}

						Logger.trace("cdmn", {
							klass: "Peer",
							method: "setEvent",
							channelId: this.call.getChannelId(),
							tokenId: this.call.getToken(),
							type: "p2p",
							callType: this.call.peers[this.id].type === "offer" ? "callee" : "caller",
							resultCode: "200",
							connectTime: new Date().getTime(),
							networkType: "wired",
							candidate: localCandidate,
							audioYn: this.call.playRtc.userMedia.audio ? "Y" : "N",
							videoYn: this.call.playRtc.userMedia.video ? "Y" : "N",					
							message: "PID[" + this.call.getPid() + "] UID[" + this.call.getUid() + "] OtherPID[" + this.id + "] OtherUID[" + this.uid + "] Connected P2P"
						});
					}, this));

					this.fire("stateChange", "SUCCESS", this.id, this.uid); 
				}
				else{
					Logger.trace("cdmn", {
						klass: "Peer",
						method: "setEvent",
						channelId: this.call.getChannelId(),
						tokenId: this.call.getToken(),
						type: "p2p",
						resultCode: "202",
						connectTime: new Date().getTime(),			
						message: "PID[" + this.call.getPid() + "] UID[" + this.call.getUid() + "] OtherPID[" + this.id + "] OtherUID[" + this.uid + "] Reconnected P2P"
					});
				}

				this.fire("stateChange", "CONNECTED", this.id, this.uid);
				this.connected = true;
			}
			else if(connectionState === "DISCONNECTED"){
				Logger.trace("cdmn", {
					klass: "Peer",
					method: "setEvent",
					channelId: this.call.getChannelId(),
					tokenId: this.call.getToken(),
					type: "p2p",
					resultCode: "401",
					message: "PID[" + this.call.getPid() + "] UID[" + this.call.getUid() + "] OtherPID[" + this.id + "] OtherUID[" + this.uid + "] Disconnected P2P"
				});
				this.fire("stateChange", "DISCONNECTED", this.id, this.uid);
			}
			else if(connectionState === "CLOSED"){
				this.fire("stateChange", "CLOSED", this.id, this.uid);
			}
			
		}, this);

		pc.onremovestream = utils.bind(function(e){
			this.fire("removestream", e);
		}, this);

		pc.onclose = utils.bind(function(e){
			this.fire("close", e);
		}, this);
	},
	createPeerConnection: function(){
		Logger.trace("cdm", {
			klass: "Peer",
			method: "createPeerConnection",
			channelId: this.call.getChannelId(),
			message: "PID[" + this.id + "] Created instance of 'Native PeerConnection. Used iceServers = '" + JSON.stringify(this.config.iceServers)
		});

		this.pc = new PeerConnection({
			iceServers: this.config.iceServers
		}, {
			optional: [
				{ DtlsSrtpKeyAgreement: true },
				{ RtpDataChannels: false }
			]
		});

		this.setEvent();
		if(this.localStream){
			this.pc.addStream(this.localStream);
		}

		if(utils.dataChannelSupport && this.config.dataChannelEnabled){
			this.data = new Data(this);
			this.data.on("open", utils.bind(function(){
				/**
				 * 상대방과의 DataChannel 이 연결되면 호출되는 이벤트이다.
				 * @event addDataStream
				 * @memberof PlayRTC.prototype
				 * @param {String} pid 나와 연결된 상대방의 pid.
				 * @param {String} uid 나와 연결된 상대방의 uid. 
				 * @param {Data} dataChannel dataChannel 객체의 wrapper 객체로 이벤트를 정의 할 수 있다.
				 * @example
				 	conn.on("addDataStream", function(pid, uid, dataChannel){
				 		dataChannel.on("message", function(message){
				 			
				 		});
				 		
				 		dataChannel.on("progress", function(message){
				 			
				 		});
				 		
				 		dataChannel.on("error", function(message){
				 			
				 		});
				 	});
				 */
				this.call.playRtc.fire("addDataStream", this.id, this.uid, this.data);
			}, this));
		}
		else{
			this.config.dataChannelEnabled && Logger.warn("cdm", {
				klass: "Peer",
				method: "createPeerConnection",
				channelId: this.call.getChannelId(),
				message: "PID[" + this.id + "] Didn't create data channel"
			});
		}
	},
	replaceBandWidth: function(sdp, preferCodec){
		if (utils.browser.name === "firefox"){
			return sdp;
		}

		if(!this.config.bandwidth){
			return sdp;
		}

		var vb = this.config.bandwidth.video,
			db = this.config.bandwidth.data,
			reg = new RegExp("a=rtpmap:(\\d+) " + preferCodec + "/(\\d+)");

		sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, "");
		sdp = sdp.replace(/a=mid:video\r\n/g, "a=mid:video\r\nb=AS:" + (vb > 0 ? vb : 2500) + "\r\n");
		sdp = sdp.replace(reg, "a=rtpmap:$1 " + preferCodec + "/$2\r\na=fmtp:$1 x-google-start-bitrate=1000; x-google-min-bitrate=600; x-google-max-bitrate=" + (vb > 0 ? vb : 2500) + "; x-google-max-quantization=56");
		sdp = sdp.replace(/a=mid:data\r\n/g, "a=mid:data\r\nb=AS:" + (db > 0 ? db : 1638400) + "\r\n");
		return sdp;
	},
	replacePreferCodec: function(sdp, mLineReg, preferCodec){
		var mLine,
			newMLine = [],
			sdpCodec,
			mLineSplit,
			reg = new RegExp("a=rtpmap:(\\d+) " + preferCodec + "/\\d+");

		mLine = sdp.match(mLineReg);
		if(!mLine){
			return sdp;
		}

		sdpCodec = sdp.match(reg);
		if(!sdpCodec){
			return sdp;
		}

		mLine = mLine[0];
		sdpCodec = sdpCodec[1];

		mLineSplit = mLine.split(" ");
		newMLine.push(mLineSplit[0]);
		newMLine.push(mLineSplit[1]);
		newMLine.push(mLineSplit[2]);
		newMLine.push(sdpCodec);

		for(var i=3; i<mLineSplit.length; i++){
			if(mLineSplit[i] !== sdpCodec){
				newMLine.push(mLineSplit[i]);
			}
		}
		
		return sdp.replace(mLine, newMLine.join(" "));
	},
	_getConstraints: function(){
		var constraints;
		if(utils.browser.name === "firefox"){
			constraints = {
				offerToReceiveAudio: true, 
				offerToReceiveVideo: true
			};
		}
		else{
			constraints = {
				optional: [
					{ VoiceActivityDetection: false	},
					{ DtlsSrtpKeyAgreement: true}
				],
				mandatory: {
					OfferToReceiveAudio: true,
					OfferToReceiveVideo: true
				}
			};
		}
		return constraints;
	},
	createOffer: function(){
		this.createPeerConnection();
		this.pc.createOffer(utils.bind(function(sessionDesc){
			sessionDesc.sdp = this.replaceBandWidth(sessionDesc.sdp, this.preferCodec.video);
			sessionDesc.sdp = this.replacePreferCodec(sessionDesc.sdp, /m=audio(:?.*)?/, this.preferCodec.audio);
			sessionDesc.sdp = this.replacePreferCodec(sessionDesc.sdp, /m=video(:?.*)?/, this.preferCodec.video);

			Logger.trace("cdm", {
				klass: "Peer",
				method: "createOffer",
				channelId: this.call.getChannelId(),
				message: "Create offer sdp. offerSdp = " + JSON.stringify(sessionDesc)
			});

			this.pc.setLocalDescription(sessionDesc);
			this.fire("sendOfferSdp", this.id, sessionDesc);
		}, this), utils.bind(function(){
			Logger.error("cdm", {
				klass: "Peer",
				method: "createOffer",
				channelId: this.call.getChannelId(),
				message: "Failed to create offer sdp"
			});
			
			this._error("C4008", SDK_ERROR_CODE["C4008"]);
		}, this), this._getConstraints());
	},
	createAnswer: function(sdp){
		if(!this.pc){
			this.createPeerConnection();
		}
		var me = this,
			pc = this.pc;

		try{
			pc.setRemoteDescription(new NativeRTCSessionDescription(sdp));
			
			Logger.trace("cdm", {
				klass: "Peer",
				method: "createAnswer",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Set offer sdp. offerSdp = " + JSON.stringify(sdp)
			});
		}
		catch(e){
			Logger.error("cdm", {
				klass: "Peer",
				method: "createAnswer",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Failed to set offer sdp"
			});
			
			this._error("C4009", SDK_ERROR_CODE["C4009"]);
			return;
		}
		
		pc.createAnswer(utils.bind(function(sessionDesc){
			sessionDesc.sdp = this.replaceBandWidth(sessionDesc.sdp, this.preferCodec.video);
			sessionDesc.sdp = this.replacePreferCodec(sessionDesc.sdp, /m=audio(:?.*)?/, this.preferCodec.audio);
			sessionDesc.sdp = this.replacePreferCodec(sessionDesc.sdp, /m=video(:?.*)?/, this.preferCodec.video);

			Logger.trace("cdm", {
				klass: "Peer",
				method: "createAnswer",
				channelId: this.call.getChannelId(),
				message: "Created answer sdp. answerSdp = " + JSON.stringify(sessionDesc)
			});

			this.pc.setLocalDescription(sessionDesc);
			this.fire("sendAnswerSdp", this.id, sessionDesc);
		}, this), utils.bind(function(e){
			Logger.error("cdm", {
				klass: "Peer",
				method: "createAnswer",
				channelId: this.call.getChannelId(),
				message: "Failed to create answer sdp"
			});
			
			this._error("C4008", SDK_ERROR_CODE["C4008"]);
		}, this), this._getConstraints());
	},
	receiveAnwserSdp: function(sdp){
		var pc = this.pc;
		try{
			pc.setRemoteDescription(new NativeRTCSessionDescription(sdp));
			
			Logger.trace("cdm", {
				klass: "Peer",
				method: "receiveAnwserSdp",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Set anwser sdp. anwserSdp = " + JSON.stringify(sdp)
			});
		}
		catch(e){
			Logger.error("cdm", {
				klass: "Peer",
				method: "receiveAnwserSdp",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Failed to set anwser sdp"
			});
			
			this._error("C4009", SDK_ERROR_CODE["C4009"]);
		}
	},
	receiveCandidate: function(candidate){
		if(!this.pc){
			this.createPeerConnection();
		}
		
		var pc = this.pc;
		try{
			candidate = new NativeRTCIceCandidate(candidate);
			pc.addIceCandidate(candidate);
			
			Logger.trace("cdm", {
				klass: "Peer",
				method: "receiveCandidate",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Set candidate. candidate = " + JSON.stringify(candidate)
			});
		}
		catch(e){
			Logger.error("cdm", {
				klass: "Peer",
				method: "receiveCandidate",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Failed to set candidate"
			});
			
			this._error("C4010", SDK_ERROR_CODE["C4010"]);
		}
	},
	close: function(){
		if(this.pc){
			this.pc.close();
		}
		this.pc = null;
		
		this.stopStatsReport();
	},
	/**
	 * Peer 가 생성한 DataChannel 객체를 반환한다. 이렇게 반환받은 DataChannel 을 이용하여 해당 Peer 에게 Text 또는 File 을 전송할 수 있다.
	 * @method getDataChannel
	 * @memberof Peer.prototype
	 * @example
	 //Remote
	 var peer = conn.getPeerById("pid");
	 var dc = peer.getDataChannel();
	 
	 dc.send("전송할 데이터");
	 */
	getDataChannel: function(){
		return this.data;
	},
	/**
	 * Remote Stream 을 담고 있는 Meida 객체를 반환한다.
	 * @method getMedia
	 * @memberof Peer.prototype
	 * @return {Media} media Remote Stream 을 담고 있는 Media 객체를 반환한다.
	 * @example
	 var peer = conn.getPeerById("pid");
	 peer.getMedia();
	 */
	getMedia: function(){
		if(this.media){
			return this.media;
		}
		return null;
	},
	/**
	 * 해당 Peer 의 webrtc Native PeerConnection 객체를 반환한다.
	 * @method getPeerConnection
	 * @memberof Peer.prototype
	 * @return {PeerConnection} peerConnection WebRTC PeerConnection 객체를 반환한다.
	 * @example
	 var peer = conn.getPeerById("pid");
	 peer.getPeerConnection();
	 */
	getPeerConnection: function(){
		return this.pc;
	},
	/**
	 * 해당 Peer 의 P2P 성능 측정을 위한 정보를 배열로 반환한다. 이때 해당 반환값을 받아 처리 하기 위한 함수를 인자로 전달해야 한다.
	 * @method getStats
	 * @memberof Peer.prototype
	 * @param {Function} fn 성능 측정을 위한 정보를 인자로 넘겨받는 함수를 지정한다.
	 * @example
	 var peer = conn.getPeerById("pid");
	 peer.getStats(function(state){
	 	console.log(state);
	 	console.log(state.length);
	 });
	 */
	getStats: function(fn){
		if(!this.call.playRtc.userMedia.video && !this.call.playRtc.userMedia.audio){
			fn.call(this, false);
			return;
		}
		if(utils.browser.name === "firefox"){
			this.pc.getStats(null, utils.bind(function(res){
				fn.call(this, res);
			}, this), function(){ });
		}
		else{
			this.pc.getStats(utils.bind(function(res){
				var items = [ ];
				res.result().forEach(function (result) {
					var item = { };
					result.names().forEach(function (name) {
						item[name] = result.stat(name);
					});
					item.id = result.id;
					item.type = result.type;
					item.timestamp = result.timestamp;
					
					items.push(item);
				});

				fn.call(this, items);
			}, this));
		}
	},
	/**
	 * 해당 Peer 의 P2P 성능 측정을 위한 정보를 배열로 반환한다. 이때 해당 반환값을 받아 처리 하기 위한 함수를 인자로 전달해야 한다.
	 * @method getStatsReport
	 * @memberof Peer.prototype
	 * @param {Function} fn 성능 측정을 위한 정보를 인자로 넘겨받는 함수를 지정한다.
	 * @example
	 var peer = conn.getPeerById("pid");
	 peer.getStatsReport(function(report){
	 	console.log(report);
	 });
	 */
	startStatsReport: function(interval, fn){
		if(this.statsReportTimer){
			window.clearInterval(this.statsReportTimer);
			this.statsReportTimer = null;
		}
		
		if(interval < 2000){
			interval = 2000;
		}
		
		this.statsReportTimer = window.setInterval(utils.bind(function(){
			this.getStats(utils.bind(function(stats){
				var i = 0,
					len = 0,
					attr = null,
					result = {
						localCandidate: "",
						remoteCandidate: "",
						localFrameWidth : "",
						localFrameHeight : "",
						remoteFrameWidth: "",
						remoteFrameHeight: "",
						localFrameRate: "",
						remoteFrameRate: "",
						availableSendBandwidth: 0,
						availableReceiveBandwidth: 0,
						rtt: 0,
						rttRating: "",
						localAudioFractionLost: 0,
						localVideoFractionLost: 0,
						localAudioFractionRating: 0,
						localVideoFractionRating: 0,
						remoteAudioFractionLost: 0,
						remoteVideoFractionLost: 0,
						remoteAudioFractionRating: 0,
						remoteVideoFractionRating: 0,
						fractionRating: 0
					},
					nowLocalAPLost = 0, nowLocalVPLost = 0,
					nowLocalAPSent = 0, nowLocalVPSent = 0,
					oldLocalAPLost = 0, oldLocalVPLost = 0,
					oldLocalAPSent = 0, oldLocalVPSent = 0,
					nowRemoteAPLost = 0, nowRemoteVPLost = 0,
					nowRemoteAPReceived = 0, nowRemoteVPReceived = 0,
					oldRemoteAPLost = 0, oldRemoteVPLost = 0,
					oldRemoteAPReceived = 0, oldRemoteVPReceived = 0,
					oldStats = this.oldStats,
					ffAudioRtt,
					ffVideoRtt;

				if(utils.browser.name === "firefox"){
					for(attr in stats){
						if(stats[attr].type === "candidatepair" && stats[attr].selected === true){
							result.localCandidate = stats[stats[attr].localCandidateId].candidateType;
							result.remoteCandidate = stats[stats[attr].remoteCandidateId].candidateType;
							continue;
						}
						
						if(stats[attr].type === "inboundrtp" && stats[attr].mediaType === "audio" && stats[attr].isRemote === true){
							if(stats[attr].hasOwnProperty("mozRtt")){
								ffAudioRtt = stats[attr].mozRtt;
							}
							
							if(stats[attr].hasOwnProperty("packetsLost")){
								nowRemoteAPLost = stats[attr].packetsLost;
							}
							if(stats[attr].hasOwnProperty("packetsReceived")){
								nowRemoteAPReceived = stats[attr].packetsReceived;
							}
							continue;
						}

						if(stats[attr].type === "inboundrtp" && stats[attr].mediaType === "video" && stats[attr].isRemote === true){
							if(stats[attr].hasOwnProperty("mozRtt")){
								ffVideoRtt = stats[attr].mozRtt;
							}

							if(stats[attr].hasOwnProperty("packetsLost")){
								nowRemoteVPLost = stats[attr].packetsLost;
							}
							if(stats[attr].hasOwnProperty("packetsReceived")){
								nowRemoteVPReceived = stats[attr].packetsReceived;
							}
							continue;
						}
					}

					for(attr in oldStats){
						if(stats[attr].type === "inboundrtp" && stats[attr].mediaType === "audio" && stats[attr].isRemote === true){
							if(stats[attr].hasOwnProperty("packetsLost")){
								oldRemoteAPLost = stats[attr].packetsLost;
							}
							if(stats[attr].hasOwnProperty("packetsReceived")){
								oldRemoteAPReceived = stats[attr].packetsReceived;
							}
							continue;
						}

						if(stats[attr].type === "inboundrtp" && stats[attr].mediaType === "video" && stats[attr].isRemote === true){
							if(stats[attr].hasOwnProperty("packetsLost")){
								oldRemoteVPLost = stats[attr].packetsLost;
							}
							if(stats[attr].hasOwnProperty("packetsReceived")){
								oldRemoteVPReceived = stats[attr].packetsReceived;
							}
							continue;
						}
					}

					if(this.call.playRtc.userMedia.video){
						result.rtt = ffVideoRtt;
					}
					else{
						result.rtt = ffAudioRtt;
					}
				}
				else{
					len = stats.length;
					for(; i<len; i++){
						if(stats[i].googActiveConnection === "true"){
							result.localCandidate = stats[i].googLocalCandidateType;
							result.remoteCandidate = stats[i].googRemoteCandidateType;
							
							result.rtt = parseInt(stats[i].googRtt);
							continue;
						}
						
						if(stats[i].hasOwnProperty("audioInputLevel")){
							nowLocalAPLost = parseInt(stats[i].packetsLost);
							nowLocalAPSent = parseInt(stats[i].packetsSent);
							continue;
						}

						if(stats[i].hasOwnProperty("googFrameWidthSent")){
							result.localFrameWidth = parseInt(stats[i].googFrameWidthSent);
							result.localFrameHeight = parseInt(stats[i].googFrameHeightSent);
							result.localFrameRate = parseInt(stats[i].googFrameRateSent);
							
							nowLocalVPLost = parseInt(stats[i].packetsLost);
							nowLocalVPSent = parseInt(stats[i].packetsSent);
							continue;
						}
						
						if(stats[i].hasOwnProperty("audioOutputLevel")){
							nowRemoteAPLost = parseInt(stats[i].packetsLost);
							nowRemoteAPReceived = parseInt(stats[i].packetsReceived);
							continue;
						}

						if(stats[i].hasOwnProperty("googFrameWidthReceived")){
							result.remoteFrameWidth = parseInt(stats[i].googFrameWidthReceived);
							result.remoteFrameHeight = parseInt(stats[i].googFrameHeightReceived);
							result.remoteFrameRate = parseInt(stats[i].googFrameRateReceived);
							
							nowRemoteVPLost = parseInt(stats[i].packetsLost);
							nowRemoteVPReceived = parseInt(stats[i].packetsReceived);
							continue;
						}

						if(stats[i].hasOwnProperty("googAvailableSendBandwidth")){
							result.availableSendBandwidth = parseInt(stats[i].googAvailableSendBandwidth);
							result.availableReceiveBandwidth = parseInt(stats[i].googAvailableReceiveBandwidth);
							continue;
						}
					}
					

					for(i=0; i<oldStats.length; i++){					
						if(oldStats[i].hasOwnProperty("audioInputLevel")){
							oldLocalAPLost = parseInt(oldStats[i].packetsLost);
							oldLocalAPSent = parseInt(oldStats[i].packetsSent);
							continue;
						}
						
						if(oldStats[i].hasOwnProperty("googFrameWidthSent")){
							oldLocalVPLost = parseInt(oldStats[i].packetsLost);
							oldLocalVPSent = parseInt(oldStats[i].packetsSent);
							continue;
						}
						
						if(oldStats[i].hasOwnProperty("audioOutputLevel")){
							oldRemoteAPLost = parseInt(oldStats[i].packetsLost);
							oldRemoteAPReceived = parseInt(oldStats[i].packetsReceived);
							continue;
						}
						
						if(oldStats[i].hasOwnProperty("googFrameWidthReceived")){
							oldRemoteVPLost = parseInt(oldStats[i].packetsLost);
							oldRemoteVPReceived = parseInt(oldStats[i].packetsReceived);
							continue;
						}
					}
				}
				
				var localAFLost = parseFloat(parseFloat((nowLocalAPLost - oldLocalAPLost) / (nowLocalAPSent - oldLocalAPSent) * 255 || 0).toFixed(4));
				var localVFLost = parseFloat(parseFloat((nowLocalVPLost - oldLocalVPLost) / (nowLocalVPSent - oldLocalVPSent) * 255 || 0).toFixed(4));
				
				result.localAudioFractionLost = localAFLost;
				result.localVideoFractionLost = localVFLost;
				
				result.localAudioFractionRating = this._getAFLostRating(localAFLost);
				result.localVideoFractionRating = this._getVFLostRating(localVFLost);


				var remoteAFLost = parseFloat(parseFloat((nowRemoteAPLost - oldRemoteAPLost) / (nowRemoteAPReceived - oldRemoteAPReceived) * 255 || 0).toFixed(4));
				var remoteVFLost = parseFloat(parseFloat((nowRemoteVPLost - oldRemoteVPLost) / (nowRemoteVPReceived - oldRemoteVPReceived) * 255 || 0).toFixed(4));
				
				result.remoteAudioFractionLost = remoteAFLost;
				result.remoteVideoFractionLost = remoteVFLost;
				
				result.remoteAudioFractionRating = this._getAFLostRating(remoteAFLost);
				result.remoteVideoFractionRating = this._getVFLostRating(remoteVFLost);
				
				result.fractionRating = result.remoteVideoFractionRating;

				result.rttRating = this._getRttRating(result.rtt);

				this.oldStats = stats;
				if(fn){
					fn.call(this, result);
				}
			}, this));
		}, this), interval);
	},
	stopStatsReport: function(){
		if(this.statsReportTimer){
			window.clearInterval(this.statsReportTimer);
			this.statsReportTimer = null;
		}
	},
	_getRttRating: function(rtt){
		var rttRating = 0;

		if (rtt / 2 >= 500){
			rttRating = 5;
		}
		else if (rtt / 2 >= 400){
			rttRating = 4;
		}
		else if (rtt / 2 >= 300){
			rttRating = 3;
		}
		else if (rtt / 2 >= 200){
			rttRating = 2;
		}
		else if (rtt / 2 < 200){
			rttRating = 1;
		}

		return rttRating;
	},
	_getAFLostRating: function(loss){
		var af = this.fractionLost.audio;
		for(var i=0; i<af.length; i++){
			if(af[i].fromFractionLost <= loss && af[i].toFractionLost >= loss){
				return af[i].rating;
			}
		}
	},
	_getVFLostRating: function(loss){
		var vf = this.fractionLost.video;
		for(var i=0; i<vf.length; i++){
			if(vf[i].fromFractionLost <= loss && vf[i].toFractionLost >= loss){
				return vf[i].rating;
			}
		}
	},
	_error: function(code, desc){
		this.fire("error", code, desc, {
			pid: this.id,
			uid: this.uid
		});
	}
});
/**
 * @class Media
 * @extends PlayRTC.utils.Event
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 */
var Media = (function(){
	var Recorder = function(stream, type){
		this.type = type;
		this.stream = stream;
		this.recordingCb = null;
		this.stopCb = null;
		
		this.mr = new MediaRecorder(this.stream);
		this.array = [];
		this.mr.ondataavailable = utils.bind(function(e){
			this.array.push(e.data);
			if(this.recordingCb){
				this.recordingCb(e.data);
			}
		}, this);
		
		this.mr.onstop = utils.bind(function(e){
			var encodeData = new Blob(this.array, {type: this.type});
			if(this.stopCb){
				this.stopCb(encodeData);
			}
			this.stopCb = null;
		}, this);
	};
	
	Recorder.prototype.start = function(recordingCb){
		this.recordingCb = recordingCb;
		this.mr.start(3000);
	};
	
	Recorder.prototype.stop = function(stopCb){
		this.stopCb = stopCb;
		this.mr.stop();
	};

	return utils.Extend(utils.Event, {
		initialize: function(stream){
			Media.base.initialize.call(this);
			this.stream = stream;
			this.recorder = null;
		},
		createRecorder: function(){
			if(!utils.mediaRecorderSupport){
				Logger.warn("cdm", {
					klass: "Media",
					method: "createRecorder",
					message: "Media Recorder is not suporrted"
				});
			}
			
			var recorder = null,
				stream = this.getStream();
				videoTrack = this.getVideoTrack();

			if(videoTrack){
				recorder = new Recorder(stream, "video/webm");
			}
			else{
				recorder = new Recorder(stream, "audio/ogg; codecs=opus");
			}

			return recorder;
		},
		/**
		 * 스트림의 오디오/비디오를 캡처한다. 크롬의 경우 로컬과 리모두 모두 오디오/비디오 캡처가 불가능하며 파이어폭스는 로컬과 리모트 모두 오디오/비디오 캡처가 가능하다
		 * 레코드가 가능한 경우는 정리하면 다음과 같다.
		 <table width="500" class="description-table">
		 	<thead>
			 	<tr>
			 		<th>레코딩 구분</th>
			 		<th>브라우저</th>
			 		<th>Local</th>
			 		<th>Remote</th>
			 	</tr>
			 </thead>
			 <tbody>
			 	<tr>
			 		<td rowspan="2">오디오 레코딩</td>
			 		<td>파이어폭스</td>
			 		<td>가능</td>
			 		<td>가능</td>
			 	</tr>
			 	<tr>
			 		<td>크롬</td>
			 		<td>불가능</td>
			 		<td>불가능</td>
			 	</tr>
			 	<tr>
			 		<td rowspan="2">비디오 레코딩</td>
			 		<td>파이어폭스</td>
			 		<td>가능</td>
			 		<td>가능</td>
			 	</tr>
			 	<tr>
			 		<td>크롬</td>
			 		<td>불가능</td>
			 		<td>불가능</td>
			 	</tr>
			 </tbody>
		 </table>
		 * @method record
		 * @memberof Media.prototype
		 * @param {String} type 레코딩을 시작할 Type 를 지정한다. audio 또는 video 를 지정할 수 있다.
		 * @example
		 //Local
		 conn.getMedia().record()
		 conn.getMedia().record();
		
		 //Remote
		 var peer = conn.getPeerById("id");
		 peer.getMedia().record();
		 peer.getMedia().record();
		 */
		record: function(recordingCb){
			if(this.recorder){
				Logger.error("cdm", {
					klass: "Media",
					method: "record",
					message: "Must call recordStop first"
				});
				return;
			}
			Logger.trace("cdm", {
				klass: "Media",
				method: "record",
				message: "MediaStream Started record"
			});

			this.recorder = this.createRecorder();
			if(this.recorder){
				this.recorder.start(recordingCb);
			}
		},
		/**
		 * 현재 녹음 중인 오디오 또는 비디오의 를 중단한다. 이 때 인자로 함수를 넘겨주어야 한다. 이 메소드가 불려지기 바로 직전까지 캡처한 결과인 blob 을 해당 함수의 인자로 전달된다. 만약 해당 blob 을 로컬에 다운로드 하고 싶다면 오디오의 경우 wav 형식의 파일로 저장해야한다. 비디오의 경우 webm 형식으로 저장해야 한다.
		 * @method recordStop
		 * @memberof Media.prototype
		 * @param {Funtion} fn 녹음이 완료되면 통지받을 함수를 지정한다. 해당 함수에는 녹음의 결과인 blob 객체가 전달된다. 해당 객체를 utils 밑에 있는 fileDownload 에 전달하면 다운로드 할 수 있다.
		 * @example
		 conn.getMedia().recordStop(function(blob){ 
		 	//audio 의 경우
		 	PlayRTC.utils.fileDownload(blob, "localAudio.wav");

		 	//video 의 경우
		 	PlayRTC.utils.fileDownload(blob, "localVideo.webm");
		 });
		 */
		recordStop: function(stopCb){
			if(!this.recorder){
				Logger.error("cdm", {
					klass: "Media",
					method: "recordStop",
					message: "Failed to execute 'recordStop' on this.recorder is null"
				});
				return;
			}
			
			Logger.trace("cdm", {
				klass: "Media",
				method: "recordStop",
				message: "Stopped record"
			});

			this.recorder.stop(stopCb);
			this.recorder = null;
		},
		/**
		 * 스트림을 반환한다.
		 * @method getStream
		 * @memberof Media.prototype
		 * @return {MediaStream} stream 스트림을 반환한다.
		 * @example
		 //Local
		 conn.getMedia().getStream();
		
		 //Remote
		 var peer = conn.getPeerById("pid");
		 peer.getMedia().getStream();
		 */
		getStream: function(){
			return this.stream;
		},
		/**
		 * 비디오 트랙을 반환한다.
		 * @method getVideoTrack
		 * @memberof Media.prototype
		 * @return {MediaVideoTrack} track 비디오 트랙을 반환한다.
		 * @example
		 //Local
		 conn.getMedia().getVideoTrack();
		
		 //Remote
		 var peer = conn.getPeerById("pid");
		 peer.getMedia().getVideoTrack();
		 */
		getVideoTrack: function(){
			var s = this.getStream(),
				v = s.getVideoTracks();

			return v.length > 0 ? v[0] : null;
		},
		/**
		 * 오디오 트랙을 반환한다.
		 * @method getAudioTrack
		 * @memberof Media.prototype
		 * @return {MediaVideoTrack} track 비디오 트랙을 반환한다.
		 * @example
		 //Local
		 conn.getMedia().getAudioTrack();
		
		 //Remote
		 var peer = conn.getPeerById("pid");
		 peer.getMedia().getAudioTrack();
		 */
		getAudioTrack: function(){
			var s = this.getStream(),
				a = s.getAudioTracks();

			return a.length > 0 ? a[0] : null;
		},
		/**
		 * audio 를 비활성화 또는 활성화시킨다. False 를 지정할 경우 비활성화 되며, True 를 지정할 경우 활성화 한다.
		 * @method audioMute
		 * @memberof Media.prototype
		 * @param {Boolean} enabled true, false 를 전달한다.
		 * @return {Boolean} isSuccess audio의 활성화/비활성화 를 정상적으로 수행했다면 true 를 반환. 만약 audio 가 존재하지 않아 실패했다면 false 를 반환한다.
		 * @example
		 //Local
		 conn.getMedia().audioMute(true);

		 //Remote
		 var peer = conn.getPeerById("pid");
		 peer.getMedia().audioMute(true);
		 */
		audioMute: function(enabled){
			var a = this.getAudioTrack();
			if(a){
				a.enabled = enabled;
				return true;
			}
			return false;
		},
		/**
		 * video 를 비활성화 또는 활성화시킨다. False 를 지정할 경우 비활성화 되며, True 를 지정할 경우 활성화 한다.
		 * @method videoMute
		 * @memberof Media.prototype
		 * @param {Boolean} enabled true, false 를 전달한다.
		 * @return {Boolean} isSuccess video의 활성화/비활성화 를 정상적으로 수행했다면 true 를 반환. 만약 video 가 존재하지 않아 실패했다면 false 를 반환한다.
		 * @example
		 //Local
		 conn.getMedia().videoMute(true);

		 //Remote
		 var peer = conn.getPeerById("pid");
		 peer.getMedia().videoMute(true);
		 */
		videoMute: function(enabled){
			var v  = this.getVideoTrack();
			if(v){
				v.enabled = enabled;
				return true;
			}
			return false;
		},
		/**
		 * video 와 audio 를 한번에 비활성화 또는 활성화시킨다. False 를 지정할 경우 비활성화 되며, True 를 지정할 경우 활성화 한다.
		 * @method mute
		 * @memberof Media.prototype
		 * @param {Boolean} enabled true, false 를 전달한다.
		 * @example
		 //Local
		 conn.getMedia().mute(true);

		 //Remote
		 var peer = conn.getPeerById("pid");
		 peer.getMedia().mute(true);
		 */
		mute: function(enabled){
			this.audioMute(enabled);
			this.videoMute(enabled);
		},
		stop: function(){
			var v = this.getVideoTrack();
			var a = this.getAudioTrack();
			
			if(v){
				v.stop();
			}
			
			if(a){
				a.stop();
			}

			//chrome 47 deprecation.
			if(this.stream.stop){
				this.stream.stop();
			}
		}
	});
})();
/**
 * Data Class
 * @class Data
 * @extends PlayRTC.utils.Event
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 */
var Data = (function(){
	if(!utils.blobWorkerSupport){
		return false;
	}

	var TYPE = {
		0: "text",
		1: "binary"
	};
	
	var HEADERTYPE = {
		0: "master",
		1: "frag"
	};

	function getUniqId(){
		return new Date().getTime();
	}

	function concatBuffer(buf1, buf2){
		var tmp = new Uint8Array(buf1.byteLength + buf2.byteLength);
		tmp.set(new Uint8Array(buf1), 0);
		tmp.set(new Uint8Array(buf2), buf1.byteLength);
		return tmp.buffer;
	}

	var TextReceiveDatas = { }, 
		FileReceiveDatas = { };

	return utils.Extend(utils.Event, {
		initialize: function(peer){
			Data.base.initialize.call(this);

			this.peer = peer;
			this.sending = false;
			this.queue = [];
			this.dataChannel = this.peer.getPeerConnection().createDataChannel("channel", {
				id: 1
			});
			this.fileReceiveStartTime = 0;
			
			this.dataChannel.binaryType = "arraybuffer";

			this.setEvent();
			
			Logger.trace("cdm", {
				klass: "Data",
				method: "initialize",
				message: "PID[" + this.peer.id +"]. Created instance of 'Data'"
			});
		},
		setEvent: function(){
			var dc = this.dataChannel;
			dc.onopen = utils.bind(function(e){
				Logger.trace("cdm", {
					klass: "Data",
					method: "setEvent",
					channelId: this.peer.call.getChannelId(),
					message: "PID[" + this.peer.id + "] Opened dataChannel"
				});

				this.fire("open", e);
			}, this);

			dc.onclose = utils.bind(function(e){
				Logger.trace("cdm", {
					klass: "Data",
					method: "setEvent",
					channelId: this.peer.call.getChannelId(),
					message: "PID[" + this.peer.id + "] Closed dataChannel"
				});
	
				this.fire("close", e);
			}, this);

			dc.onerror = utils.bind(function(e){
				Logger.error("cdm", {
					klass: "Data",
					method: "setEvent",
					channelId: this.peer.call.getChannelId(),
					message: "PID[" + this.peer.id + "] Caused error"
				});

				/**
				 * 데이터를 주고 받을 때 에러가 발생되면 이벤트가 호출된다.
				 * @event error
				 * @memberof Data.prototype
				 * @param {Object} err 에러 객체 또는 문자열을 전달 받는다. DataChannel 의 에러 이벤트가 호출되면 에러 객체가 전달되고 전송 또는 데이터를 받았을 때 파싱과정에서 에러가 나면 SEND_ERROR, RECEIVE_ERROR 문자열을 전달 받는다.
				 * @example
				 	dc.on("error", function(err){
				 		
				 	});
				 */
				this.fire("error", e);
			}, this);

			function onmessage(data){
				var dv = new DataView(data),
					id = dv.getFloat64(0),
					type = dv.getInt32(20);
				
				try{
					if(TextReceiveDatas[id]){
						this.textReceive(id, dv, data);
					}
					else if(FileReceiveDatas[id]){
						this.fileReceive(id, dv, data);
					}
					else{
						if(TYPE[type] === "text"){
							this.textReceive(id, dv, data);
						}
						else{
							this.fileReceive(id, dv, data);
						}
					}
				}
				catch(e){
					Logger.error("cdm", {
						klass: "Data",
						method: "setEvent",
						channelId: this.peer.call.getChannelId(),
						message: "PID[" + this.peer.id + "] Failed to receive message"
					});
					this.fire("error", e);
				}
			};

			dc.onmessage = utils.bind(function(e){
				Logger.trace("cdm", {
					klass: "Data",
					method: "setEvent",
					channelId: this.peer.call.getChannelId(),
					message: "PID[" + this.peer.id + "] Received message"
				});
				
				onmessage.call(this, e.data);
			}, this);
		},
		/**
		 * 텍스트 또는 파일을 파라미터로 전달하여 상대 Peer 에게 전송한다. dataSend 메소드는 실제 이 메소드를 이용하여 전송하는 것이다.
		 * @method send
		 * @memberof Data.prototype
		 * @param {Object} data 텍스트 또는 파일을 파라미터로 전달하여 상대 Peer 에게 전송한다.
		 * @example
			var pc = conn.getPeerByPeerId("pid");
			var dc = pc.getDataChannel();
			dc.send("전송할 데이터");
		 */
		send: function(message, success, error){
			if(message.size && message.name){
				if(!this.sending){
					this.sendFile(message, success, error);
				}
				else{
					this.queue.push({
						message: message,
						success: success,
						error: error
					});
				}
				
				this.sending = true;
			}
			else{
				message = message.toString();
				this.sendText(message, success, error);
			}
		},
		bufferedSend: function(message){
			var dc = this.dataChannel;
			try{
				dc.send(message);
				Logger.trace("cdm", {
					klass: "Data",
					method: "bufferedSend",
					channelId: this.peer.call.getChannelId(),
					message: "Sent message"
				});
			}
			catch(e){
				Logger.error("cdm", {
					klass: "Data",
					method: "bufferedSend",
					channelId: this.peer.call.getChannelId(),
					message: "Failed to send dataChannel message error"
				});
				return false;
			}

			return true;
		},
		sendText: function(text, success, error){
			var dc = this.dataChannel,
				id = getUniqId(),
				fragHbuf = new ArrayBuffer(20),
				fragDv = new DataView(fragHbuf),
				buf = new ArrayBuffer(text.length * 2),
				view = new Uint8Array(buf),
				i = 0,
				char = null,
				len = text.length,
				j = 0,
				totalSize = buf.byteLength,
				arr, hbuf, dv, fragCount;

				fragDv.setFloat64(0, id);
				fragDv.setInt32(8, 1);

			var send = utils.bind(function(hbuf, arr, index){
				var bbuf = arr[index];

				this.fire("sending", {
					id: id,
					type: "text",
					totalSize: totalSize,
					fragSize: arr[index].byteLength,
					fragCount: fragCount,
					fragIndex: index
				});

				if(!this.bufferedSend(concatBuffer(hbuf, bbuf))){
					//error
					if(error){
						error(text);
					}
					return;
				}

				if((index + 1) < arr.length){
					window.setTimeout(function(){
						var i = index + 1;
						fragDv.setInt32(12, i);
						fragDv.setInt32(16, arr[i].byteLength);

						send(fragDv.buffer, arr, i);
					}, 100);
				}
				else{
					//success
					if(success){
						success(text);
					}
				}
			}, this);
			
			
	
			for(;i < len; i++) {
				char = text.charCodeAt(i);
				view[j] = char >>> 8;
				view[j + 1] = char & 0xFF;
				j = j + 2;
			}

			var arr = this.packetSplit(buf, 8192),
				hbuf = new ArrayBuffer(36),
				dv = new DataView(hbuf);
			
			fragCount = arr.length;
	
			dv.setFloat64(0, id);
			dv.setInt32(8, 0);
			dv.setFloat64(12, totalSize);
			dv.setInt32(20, 0);
			dv.setInt32(24, fragCount);
			dv.setInt32(28, 0);
			dv.setInt32(32, arr[0].byteLength);
	
			send(dv.buffer, arr, 0);
		},
		sendFile: function(file, success, error){
			var dc = this.dataChannel,
				id = getUniqId(),
				fileName = file.name,
				mimeType = file.type,
				chunkSize = 8192,
				me = this,
				index = 0,
				totalSize = file.size,
				fragCount = Math.ceil(totalSize / chunkSize)

			var mbuf = new ArrayBuffer(548),
				mdv = new DataView(mbuf),
				tmp = null;

			mdv.setFloat64(0, id);
			mdv.setInt32(8, 0);
			mdv.setFloat64(12, totalSize);
			mdv.setInt32(20, 1);

			var i = 24, j = 0;
			for (; i<280; i=i+2) {
				tmp = fileName.charCodeAt(j);
				if(tmp){
					mdv.setUint8(i, tmp >>> 8);
					mdv.setUint8(i+1, tmp & 0xFF);
				}
				j++;
			}

			var i = 280, j = 0;
			for (; i<536; i=i+2) {
				tmp = mimeType.charCodeAt(j);
				if(tmp){
					mdv.setUint8(i, tmp >>> 8);
					mdv.setUint8(i+1, tmp & 0xFF);
				}
				j++;
			}

			mdv.setInt32(536, fragCount);
			mdv.setInt32(540, index);
			if(totalSize < chunkSize){
				mdv.setInt32(544, totalSize);
			}
			else{
				mdv.setInt32(544, chunkSize);
			}

			var fbuf = new ArrayBuffer(20),
				fdv = new DataView(fbuf);

			fdv.setFloat64(0, id);
			fdv.setInt32(8, 1);

			function send(offset){
				var reader = new FileReader(),
					size = 0,
					hbuf = null;

				size = offset + chunkSize;
				reader.onload = utils.bind(function(e){
					if(offset === 0){
						hbuf = mdv.buffer;
					}
					else{
						index++;
						fdv.setInt32(12, index);
						fdv.setInt32(16, e.target.result.byteLength);
						hbuf = fdv.buffer;
					}

					me.fire("sending", {
						id: id,
						type: "binary",
						fileName: fileName,
						mimeType: mimeType,
						totalSize: totalSize,
						fragSize: e.target.result.byteLength,
						fragCount: fragCount,
						fragIndex: index
					});

					me.bufferedSend(concatBuffer(hbuf, e.target.result));
					if (totalSize > offset + e.target.result.byteLength) {
						if(dc.bufferedAmount !== 0){
							var interval = window.setInterval(function(){
								if(dc.bufferedAmount === 0){
									window.clearInterval(interval);
									interval = null;
									
									send(size);
								}
							}, 0);
						}
						else{
							send(size);
						}
					}
					else{
						me.sending = false;
						//success
						if(success){
							success(file);
						}

						nextData = me.queue.pop();
						if(nextData){
							me.send(nextData.message, nextData.success, nextData.error);
						}
					}
				}, this);

				var slice = file.slice(offset, size);
				reader.readAsArrayBuffer(slice);
			};
			
			send(0);
		},
		textReceive: function(id, dv, data){
			var progress = { },
				body = null,
				headerType = dv.getInt32(8);

			progress.peerId = this.peer.id;
			if(HEADERTYPE[headerType] === "master"){
				progress.id = id;
				progress.totalSize = dv.getFloat64(12);
				progress.fragCount = dv.getInt32(24);
				progress.fragIndex = dv.getInt32(28);
				progress.fragSize = dv.getInt32(32);

				body = data.slice(36);

				TextReceiveDatas[id] = [];
				TextReceiveDatas[id].totalSize = progress.totalSize;
				TextReceiveDatas[id].fragCount = progress.fragCount;
				TextReceiveDatas[id].push(body);
			}
			else{
				progress.id = id;
				progress.type = "text";
				progress.totalSize = TextReceiveDatas[id].totalSize;
				progress.fragCount = TextReceiveDatas[id].fragCount;
				progress.fragIndex = dv.getInt32(12);
				progress.fragSize = dv.getInt32(16);

				body = data.slice(20);
				TextReceiveDatas[id].push(body);
			}

			/**
			 * DataChannel 을 통해 서로 데이터를 주고 받을 때, 상대방이 보낸 데이터의 양이 클 경우 이를 분할하여 전송 받는다. 이 경우 전체 메시지의 크기와 현재 받은 크기를 헤더 정보에 포함하게 된다. Progress 이벤트는 이 헤더 정보를 바탕으로 사용자에게 progress 할 수 있게 해준다.
			 * @event progress
			 * @memberof Data.prototype
			 * @param {Object} data 
			 * @example
			 	dc.on("progress", function(data){
			 		
			 	});
			 */
			this.fire("progress", progress);

			if((progress.fragCount - 1) === progress.fragIndex){
				try{
					var totLength = TextReceiveDatas[id].length,
						textData = TextReceiveDatas[id],
						buf = new ArrayBuffer(0),
						view = null,
						chars = [],
						i = 0,
						len = 0;
		
					for(; i<totLength; i++) {
						buf = concatBuffer(buf, textData[i]);
					}
		
					i = 0;
					view = new Uint8Array(buf);
					len = buf.byteLength;
					for(; i < len;) {
						chars.push(((view[i++] & 0xff) << 8) | (view[i++] & 0xff));
					}
					
					if(!this.hasEvent("message")){
						alert("You must create message's event.");
						return false;
					}
					
					/**
					 * DataChannel 을 통해 서로 데이터를 주고 받을 때, 상대방이 보낸 데이터를 수신하는 이벤트이다.
					 * @event message
					 * @memberof Data.prototype
					 * @param {Object} data 
					 * @example
					 	dc.on("message", function(data){
						 		
					 	});
					 */
					this.fire("message", {
						type: "text",
						id: id,
						peerId: this.peer.id,
						totalSize: textData.totalSize,
						data: String.fromCharCode.apply(null, chars)
					});
				}
				catch(e){
					Logger.error("cdm", {
						klass: "Data",
						method: "textReceive",
						channelId: this.peer.call.getChannelId(),
						message: "PID[" + this.peer.id + "] Caused error"
					});

					this.fire("error", e);
				}
			}
		},
		fileReceive: function(id, dv, data){
			var progress = { },
				body = null,
				headerType = dv.getInt32(8),
				blob = null,
				tmp = null,
				totLength = null,
				buffer = null,
				blob = null;

			progress.peerId = this.peer.id;
			if(HEADERTYPE[headerType] === "master"){
				progress.totalSize = dv.getFloat64(12);

				progress.fileName = "";
				i = 24;
				for(; i<280; i = i+2){
					tmp = String.fromCharCode(dv.getInt16(i));
					if(tmp.charCodeAt(0) !== 0){
						progress.fileName = progress.fileName + tmp;
					}
				}

				progress.mimeType = "";
				i = 280;
				for(; i<536; i = i+2){
					tmp = String.fromCharCode(dv.getInt16(i));
					if(tmp.charCodeAt(0) !== 0){
						progress.mimeType = progress.mimeType + tmp;
					}
				}
				
				progress.id = id;
				progress.fragCount = dv.getInt32(536);
				progress.fragIndex = dv.getInt32(540);
				progress.fragSize = dv.getInt32(544);

				body = data.slice(548);

				FileReceiveDatas[id] = [];
				FileReceiveDatas[id].totalSize = progress.totalSize;
				FileReceiveDatas[id].fileName = progress.fileName;
				FileReceiveDatas[id].mimeType = progress.mimeType;
				FileReceiveDatas[id].fragCount = progress.fragCount;
				FileReceiveDatas[id].push(body);
				
				this.fileReceiveStartTime = new Date().getTime();
			}
			else{
				progress.id = id;
				progress.type = "binary";
				progress.fileName = FileReceiveDatas[id].fileName;
				progress.mimeType = FileReceiveDatas[id].mimeType;
				progress.totalSize = FileReceiveDatas[id].totalSize;
				progress.fragCount = FileReceiveDatas[id].fragCount;
				progress.fragIndex = dv.getInt32(12);
				progress.fragSize = dv.getInt32(16);

				body = data.slice(20);
				FileReceiveDatas[id].push(body);
			}

			this.fire("progress", progress);

			if((progress.fragCount - 1) === progress.fragIndex){
				try{
					var blob = new Blob(FileReceiveDatas[id], {
						type: FileReceiveDatas[id].mimeType
					});

					this.fire("message", {
						type: "binary",
						id: id,
						peerId: this.peer.id,
						fileName: FileReceiveDatas[id].fileName,
						mimeType: FileReceiveDatas[id].mimeType,
						totalSize: FileReceiveDatas[id].totalSize,
						blob: blob
					});

					Logger.trace("cdmn", {
						klass: "PlayRTC",
						method: "fileReceive",
						channelId: this.peer.call.getChannelId(),
						tokenId: this.peer.call.getToken(),
						type: "data",
						callType: this.peer.call.peers[this.peer.id].type === "offer" ? "callee" : "caller",
						resultCode: "200",
						fileRcvSize: FileReceiveDatas[id].totalSize,
						fileRcvTime: new Date().getTime() - this.fileReceiveStartTime,
						message: "PID[" + this.peer.id + "] Succeeded to receive a file. name = " + FileReceiveDatas[id].fileName
					});
					
					this.fileReceiveStartTime = 0;
				}
				catch(e){
					this.fire("error", {
						type: "binary",
						id: id,
						peerId: this.peer.id,
						fileName: FileReceiveDatas[id].fileName,
						mimeType: FileReceiveDatas[id].mimeType,
						totalSize: FileReceiveDatas[id].totalSize
					});
					
					Logger.error("cdmn", {
						klass: "PlayRTC",
						method: "fileReceive",
						channelId: this.peer.call.getChannelId(),
						tokenId: this.peer.call.getToken(),
						type: "data",
						callType: this.peer.call.peers[this.peer.id].type === "offer" ? "callee" : "caller",
						resultCode: "601",
						fileRcvSize: 0,
						fileRcvTime: 0,
						message: "PID[" + this.peer.id + "] Failed to receive a file. name = " + FileReceiveDatas[id].fileName
					});
				}
				
				FileReceiveDatas[id] = null;
			}
		},
		packetSplit: function(buf, size){
			var arr = [],
				packetSize = size,
				totalSize = buf.byteLength,
				max = Math.ceil(totalSize / packetSize),
				i = 0;

			for (; i <max; i++) {
				arr.push(buf.slice(i * packetSize, (i + 1) * packetSize));
			};

			return arr;
		},
		/**
		 * 생성한 DataChannel 을 Close 한다.
		 * @method close
		 * @memberof Data.prototype
		 * @example
			var pc = conn.getPeerByPeerId("peerid");
			var dc = pc.getDataChannel();
			dc.close();
		 */
		close: function(){
			this.dataChannel.close();
			this.peer.data = null;
		}
	});

})();
var Rest = {
	url: "https://apis.sktelecom.com/v3/playrtc",
	projectKey: null,
	setUrl: function(url){
		this.url = url;
	},
	setProjectKey: function(projectKey){
		this.projectKey = projectKey;
	},
	getProjectKey: function(){
		return this.projectKey;
	},
	createChannel: function(options, success, error){
		var url = this.url + "/channels/channel",
			method = "post";

		options.nag = {
			userExpires: "86000"
		};
		request({
			body: options,
			projectKey: this.getProjectKey(),
			method: method,
			url: url,
			success: success,
			error: error
		});
	},
	connectChannel: function(channelId, options, success, error){
		var url = this.url + "/channels/channel/" + channelId
			method = "put";

		options.nag = {
			userExpires: "86000"
		};
		request({
			body: options,
			projectKey: this.getProjectKey(),
			method: method,
			url: url,
			success: success,
			error: error
		});
	},
	getChannelList: function(success, error){
		var url = this.url + "/channels",
			method = "get";
		
		request({
			projectKey: this.getProjectKey(),
			method: method,
			url: url,
			success: success,
			error: error
		});
	},
	getChannel: function(channelId, success, error){
		var url = this.url + "/channels/channel/" + channelId,
			method = "get";
		
		request({
			projectKey: this.getProjectKey(),
			method: method,
			url: url,
			success: success,
			error: error
		});
	},
	getPeerList: function(channelId, success, error){
		var url = this.url + "/channels/channel/" + channelId + "/peers",
			method = "get";
		
		request({
			projectKey: this.getProjectKey(),
			method: method,
			url: url,
			success: success,
			error: error
		});
	},
	getPeer: function(channelId, peerId, success, error){
		var url = this.url + "/channels/channel/" + channelId + "/peers/peer/" + peerId,
			method = "get";
		
		request({
			projectKey: this.getProjectKey(),
			method: method,
			url: url,
			success: success,
			error: error
		});
	},
	searchChannel: function(f, q, success, error){
		var url = this.url + "/channels/search?f=" + f + "&q=" + q,
			method = "get";
		
		request({
			projectKey: this.getProjectKey(),
			method: method,
			url: url,
			success: success,
			error: error
		});
	},
	log: function(log, error){
		var url = this.url + "/stat",
			method = "put";

		request({
			body: log,
			projectKey: this.getProjectKey(),
			method: method,
			url: url,
			error: error
		});
	}
};


(function(_) {
	if(Object.defineProperties){
		Object.defineProperties(_, {
			/**
			 * PlayRTC version
			 * @static
			 * @memberof PlayRTC
			 * @example
			 console.log(PlayRTC.version);
			 */
			version: {
				get: function(){
					return "2.2.14";
				}
			},
			activeXversion: {
				get: function(){
					return "1,0,0,60";
				}
			},
			utils: {
				get: function(){
					return utils;
				}
			}
		});
	}
	else{
		_.version = "2.2.14";
		_.activeXversion = "1,0,0,60";
		_.utils = utils;
	}
}(PlayRTC));

if(!PeerConnection || !NativeRTCSessionDescription || !NativeRTCIceCandidate){
	Logger.warn("cdm", {
		message: "Your browser is not supported about WebRTC."
	});
	
	/**
	 * 사용자 단말기에서 WebRTC 를 지원하는지 여부를 반환한다.
	 * @method webRtcSupport
	 * @memberof utils
	 * @example
		PlayRTC.utils.webRtcSupport();
	 */
	utils.webRtcSupport = false;
}
else{
	utils.webRtcSupport = true;
}

/**
 * 사용자의 브라우저가 dataChannel 을 지원하는지 여부를 반환한다.
 * @method dataChannelSupport
 * @memberof utils
 * @return {Boolean} data dataChannel 을 지원한다면 true, 아니면 false를 반환한다.
 * @example
	console.log(utils.dataChannelSupport());
 */
utils.dataChannelSupport = (function(config){
	try {
		var pc = new PeerConnection(config, {
			optional: [{RtpDataChannels: true}]
		}),
		data = true,
		ch = null;
	
		try {
			ch = pc.createDataChannel("_support");
			ch.close();
		}
		catch(e){
			data = false;
			Logger.warn("cdm", {
				tag: "utils",
				message: "DataChannel is not supported."
			});
		}
	}
	catch(e){
		data = false;
		Logger.warn("cdm", {
			tag: "utils",
			message: "DataChannel is not supported."
		});
	}

	return data;
})();

return PlayRTC;

});