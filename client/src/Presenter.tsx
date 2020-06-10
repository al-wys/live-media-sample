import React from "react";

declare var MediaRecorder: any;

export interface IPresenterState {
  stream?: any;
}

export class Presenter extends React.Component<{}, IPresenterState> {
  private videoEle: React.RefObject<HTMLVideoElement>;

  constructor(props: {}) {
    super(props);

    this.state = {};
    this.videoEle = React.createRef<HTMLVideoElement>();
  }

  public render() {
    return (
      <div>
        <video autoPlay={true} ref={this.videoEle} />
        <br />
        <button onClick={this.onStartSharing}>Start Sharing</button>
      </div>
    );
  }

  private onStartSharing = async () => {
    const screenStream: MediaStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
    this.videoEle.current!.srcObject = screenStream;

    const options = {
      mimeType: 'video/webm;codecs=h264', // 编码格式
      audioBitsPerSecond: 44100,  // 44.1kHz
      videoBitsPerSecond: 3000000 // 3000k 画质
    };
    let mediaRecorder: any;
    try {
      mediaRecorder = new MediaRecorder(screenStream, options);//进行媒体录制，把流变成二进制数据
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      return;
    }
    mediaRecorder.ondataavailable = (event: any) => {
      if (event.data && event.data.size > 0) {
        console.log(event.data);
      }
    };
    mediaRecorder.start(10); // collect 10ms of data
  }
}