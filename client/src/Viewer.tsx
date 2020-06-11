import React from "react";
import io from 'socket.io-client';

declare var MediaSource: any;

const DEMO_AGENT_ID = "Frank";

export interface IViewState {
  msg?: string;
}

export class Viewer extends React.Component<{}, IViewState> {
  private socket: SocketIOClient.Socket = io(process.env.REACT_APP_SOCKET_SERVER!, {
    path: "/viewer",
    query: {
      id: DEMO_AGENT_ID
    },
    autoConnect: false
  });
  private readonly mediaSource: any;
  private sourceBuffer: any;

  constructor(props: {}) {
    super(props);

    this.state = {};

    try {
      this.mediaSource = new MediaSource();
    } catch (e) {
      console.error('Exception while creating MediaSource:', e);
      return;
    }

    this.mediaSource.addEventListener("sourceopen", () => {
      this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    });
  }

  public render() {
    return (
      <div>
        <h2>{"Welcome agent, " + DEMO_AGENT_ID}</h2>
        <video autoPlay={true} src={window.URL.createObjectURL(this.mediaSource)} />
        {this.state.msg ? (
          <>
            <label>{this.state.msg}</label>
            <br />
          </>
        ) : <></>}
        <button onClick={this.onGetReady}>I'm ready</button>
      </div>
    );
  }

  private listenConnection() {
    this.socket.on("ready", (msg: string) => {
      this.setState({ msg: msg });
    });

    this.socket.on("view", (data: any) => {
      if (!this.sourceBuffer.updating) {
        this.sourceBuffer.appendBuffer(data);
      }
    });
  }

  private onGetReady = () => {
    this.setState({ msg: "Please wait..." });

    if (!this.socket.connected) {
      this.socket.connect();

      this.listenConnection();
    }
  }
}