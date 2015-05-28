const DEFAULT_CHANNEL = '__SUPERSIMPLEPUBSUB__';
const DEFAULT_TOPIC = '__SUPERSIMPLEPUBSUB__';

class SuperSimplePubSub {

  /**
   * Return the underlying connection which is used to
   * send and receive envelopes.
   */
  get connection() { return this._connection; }

  constructor(private _connection: SignalR) {
  }

  /**
   * Create a new subscription.
   * @param  {ISubscribeOptions} options The options.
   * @return {Subscription}              Returns a new subscription object.
   */
  public subscribe(options?: ISubscribeOptions): Subscription {
    let defaultOptions: ISubscribeOptions = {
      channel: DEFAULT_CHANNEL,
      topic: DEFAULT_TOPIC
    };
    return new Subscription(Object.assign(defaultOptions, options));
  }
}

class Subscription {

  private _promise: Promise<any>;

  /**
   * Return the subscription's channel.
   */
  get channel() { return this._options.channel; }

  /**
   * Returns the subscriptions's topic.
   */
  get topic() { return this._options.topic; }

  /**
   * Returns a promise which is fulfilled if the subscription
   * was successfull else the promise gets rejected.
   */
  get promise() { return this._promise; }

  constructor(private _options: ISubscribeOptions) {
    this._promise = new Promise((resolve, reject) => {
      resolve();
    })
  }
}

interface ISubscribeOptions {
  channel?: string
  topic?: string;
}
