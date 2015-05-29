class SignalRConnectionProxy implements IConnection {

  get signalr() { return this._signalr; }

  constructor(private _signalr: SignalR) {
  }

  send(data: string) {
      this._signalr.send(data);
  }

  received(callback: (data: string) => any) {
    this._signalr.received(callback);
  }
}

interface IConnection {
  send(data: string);
  received(callback: (data: string) => any);
}
