# PlayRTC Javascript Code Samples
PlayRTC의 자바스크립트 SDK 코드 샘플


## 개요
이 저장소는 PlayRTC의 자바스크립트 SDK를 사용하는데 있어서 필요한 여러 기능을 코드 조각으로 모았습니다.
아래의 링크를 통해 각각의 기능과 실질적인 활용방법을 이해하고 응용할 수 있도록 하였습니다.


## 코드 샘플
### 기본 기능
PlayRTC의 가장 기본적인 기능인 사용자와 사용자를 연결하고 영상, 음성 통화를 수행

- [Get Media](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/basic/get-media.html)
  - PlayRTC를 통해 기기의 영상, 음성 가져오기
- [Media Stream - Audio Only](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/basic/mediastream-audio.html)
  - PlayRTC를 통해 사용자(Peer)와 사용자(Peer)끼리 Audio 태그를 사용하여 음성 통화 하기
- [Media Stream - Video and Audio](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/basic/mediastream-video.html)
  - PlayRTC를 통해 사용자(Peer)와 사용자(Peer)끼리 Video 태그를 사용하여 영상, 음성 통화 하기
- [Calling](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/basic/calling.html)
  - 통화시 상대방의 수락을 기다리기


### PlayRTC 서버 제공 채널 서비스
PlayRTC 서비스가 제공하는 채널 기능 사용

- [Channel](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/playrtc-channel-service/channel.html)
  - 채널 목록을 가져와 표출하기


### 데이터 채널
데이터 채널을 통해 자료 주고 받기

- 주의
  - 파이어 폭스의 경우 아래의 예제에서는 에러가 생기게 되며, 이는 한 페이지에서 데이터 채널 객체를 하나만 생성하여 사용할 수 있기 때문
  - 파이어 폭스에서 데이터 채널을 테스트를 진행하고자 하면 아래의 `종합`을 사용하여 테스트를 진행
  - 크롬은 정상작동
- [Text](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/datachannel/datachannel-text.html)
  - 데이터 채널로 문자 보내기
- [File](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/datachannel/datachannel-file.html)
  - 데이터 채널로 파일 보내기
- [Big File](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/datachannel/datachannel-big-file.html)
  - 데이터 채널로 큰 파일 보내고, 진행상황을 표시 하기


### 녹음/녹화
영상, 음성의 녹음/녹화

- 주의
  - 현재 크롬(v47)에서 녹화 기능은 지원되지 않고 있으며, 이 테스트를 위해서는 파이어 폭스를 사용할 것
- [Local Audio Record](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/record/local-audio-record.html)
  - 로컬 사용자 오디오 녹음하고 저장하기
- [Local Video Record](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/record/local-video-record.html)
  - 로컬 사용자 비디오 녹음하고 저장하기
- [Remote Audio Record](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/record/remote-audio-record.html)
  - 리모트 사용자 오디오 녹음하고 저장하기
- [Remote Video Record](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/record/remote-video-record.html)
  - 리모트 사용자 비디오 녹음하고 저장하기


### 유틸리티
기타 기능, 개발 도구

- [Check Peer Info](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/utility/check-peer-info.html)
  - 사용자의 정보 확인 하기
- [Custom Media Quality](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/utility/custom-media-quality.html)
  - 영상/음성의 품질을 지정하기
- [startStatsReport](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/utility/startStatsReport.html)
  - 각종 품질 지표의 측정 및 표현
- [User Command](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/utility/userCommand.html)
  - PlayRTC 서비스가 제공하는 Web Socket기반의 API를 통해 상대방에게 명령을 전달하기


### 종합
- [Full Features](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/full-features/full-features.html)
  - 위 기능을 한페이지에서 사용하기
- [Full Features Config](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/full-features/full-features-config.html) 
  - config를 적용할 수 있습니다

<!--
### 실험실
실험적 기능 제공. 이 항목의 기능은 특정 상황에서 기능이 작동할 수 있으나, PlayRTC 팀에 의해 품질/기능 보증을 하지 않습니다.

- [Multiple Call](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/experimental/multiple-call.html)
- [Multiple Video Input](https://playrtc.github.io/PlayRTC-Javascript-Code-Samples/experimental/multiple-video-input.html)
-->
COPYRIGHT (c) 2015 SK TELECOM CO. LTD. ALL RIGHTS RESERVED.
