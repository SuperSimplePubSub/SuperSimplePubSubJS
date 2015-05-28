var DEFAULT_CHANNEL = '__SUPERSIMPLEPUBSUB__';
var DEFAULT_TOPIC = '__SUPERSIMPLEPUBSUB__';

class SuperSimplePubSub {
  constructor(public connection: SignalR) {
  }

  public subscribe(options?: ISubscribeOptions): Subscription {
    let defaultOptions: ISubscribeOptions = {
      channel: DEFAULT_CHANNEL,
      topic: DEFAULT_TOPIC
    };
    return new Subscription(Object.assign(defaultOptions, options));
  }
}

class Subscription {
  constructor(options: ISubscribeOptions) {
    Object.assign(this, options);
  }
}

interface ISubscribeOptions {
  topic: string;
}
