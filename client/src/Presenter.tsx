import React from "react";
import io from 'socket.io-client';

declare var MediaRecorder: any;
// declare var MediaSource: any;

const MIME_TYPE = "video/webm; codecs=opus,vp8";
const DEMO_CUSTOMER_ID = "Megan";

export interface IPresenterState {
  msg?: string;
}

export class Presenter extends React.Component<{}, IPresenterState> {
  private videoEle: React.RefObject<HTMLVideoElement>;
  private mediaRecorder: any;
  private screenStream?: MediaStream;
  // private mediaSource: any;

  private socket: SocketIOClient.Socket = io(process.env.REACT_APP_SOCKET_SERVER!, {
    path: "/presenter",
    query: {
      id: DEMO_CUSTOMER_ID
    },
    autoConnect: false
  });

  constructor(props: {}) {
    super(props);

    this.state = {};
    this.videoEle = React.createRef<HTMLVideoElement>();
  }

  public render() {
    return (
      <div>
        <h2>{"Hello Client, " + DEMO_CUSTOMER_ID}</h2>
        <video autoPlay={true} ref={this.videoEle} />
        <br />
        {this.state.msg ? (
          <>
            <label>{this.state.msg}</label>
            <br />
          </>
        ) : <></>}
        <button onClick={this.onFindAgent}>Find an agent</button>
        <button onClick={this.onStartSharing}>Start Sharing</button>
        <button onClick={this.onStopSharing}>Stop Sharing</button>
      </div>
    );
  }

  private listenConnection() {
    this.socket.on("ready", (msg: string) => {
      this.setState({ msg: msg });
    });
  }

  private onFindAgent = () => {
    this.setState({ msg: "Please wait..." });

    if (!this.socket.connected) {
      this.socket.connect();

      this.listenConnection();
    }
  }

  private onStartSharing = async () => {
    this.screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
    // this.videoEle.current!.srcObject = screenStream;

    const options = {
      // mimeType: 'video/webm;codecs=h264', // 编码格式
      mimeType: MIME_TYPE,
      audioBitsPerSecond: 44100,  // 44.1kHz
      videoBitsPerSecond: 3000000 // 3000k 画质
    };

    try {
      this.mediaRecorder = new MediaRecorder(this.screenStream, options);//进行媒体录制，把流变成二进制数据
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      return;
    }

    this.mediaRecorder.ondataavailable = async (event: any) => {
      if (event.data && event.data.size > 0) {
        // console.log(event.data);

        const tempBlob: any = new Blob([event.data], { "type": MIME_TYPE });
        // const b = new Blob([event.data], { "type": "video/webm;codecs=h264" });
        const ab = await tempBlob.arrayBuffer();

        this.socket.emit("share", ab);
        console.log(ab);
      }
    };
    this.mediaRecorder.start(3 * 1000); // collect 3s of data
  }

  private onStopSharing = async () => {
    this.mediaRecorder?.stop();
    this.mediaRecorder = null;

    this.screenStream?.getTracks()?.forEach(track => {
      track.stop();
    });
  }
}