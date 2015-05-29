const DEFAULT_CHANNEL = '__default__';
const DEFAULT_TOPIC = '/';

const SYSTEM_CHANNEL = '__system__';
const SYSTEM_TOPIC_SUBSCRIBE = 'subscribe-request';
const SYSTEM_TOPIC_ACK = 'ack';

class SuperSimplePubSub {

  private _unacknowledged: { [ _id: string ]: IUnacknowledged} = {};

  /**
   * Return the underlying connection which is used to
   * send and receive envelopes.
   */
  get connection() { return this._connection; }

  constructor(private _connection: IConnection) {
    _connection.received(this.onReceived.bind(this));
  }

  /**
   * Create a new subscription.
   * @param  {ISubscribeOptions} options The options.
   * @return {Subscription}              Returns a new subscription object.
   */
  subscribe(options?: ISubscribeOptions): Subscription {
    let defaults: ISubscribeOptions = {
      channel: DEFAULT_CHANNEL,
      topic: DEFAULT_TOPIC
    };
    return new Subscription(Object.assign(defaults, options));
  }

  publish(envelope?: IEnvelope) : Promise<any> {
    let defaults = {
      channel: DEFAULT_CHANNEL,
      topic: DEFAULT_TOPIC
    };

    envelope = Object.assign(defaults, envelope)
    envelope._id = this.uuid();

    this._connection.send(JSON.stringify(envelope));

    return new Promise((resolve: Function, reject: Function) => {
      let timeoutId = setTimeout(() => {
        reject('No ACK received!', envelope)
      }, 5000);

      this._unacknowledged[envelope._id] = {
        envelope: envelope,
        resolve: resolve,
        reject: reject,
        timeoutId : timeoutId
      };
    });
  }

  private onReceived(data: string) {
    let envelope = JSON.parse(data);

    let unacked = this._unacknowledged[envelope._id];
    if(unacked) {
      clearTimeout(unacked.timeoutId);
      unacked.resolve(envelope.data, envelope);
      delete this._unacknowledged[envelope._id];
    }
  }

  private uuid(a?: any): string {
    /* for a discussion see https://gist.github.com/jed/982883 */

    /* tslint:disable */
    return a?(a^Math.random()*16>>a/4).toString(16):((<any>[1e7])+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,this.uuid);
    /* tslint:enable */
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
    });
  }
}

interface ISubscribeOptions {
  channel?: string;
  topic?: string;
}

interface IEnvelope {
  channel?: string;
  topic?: string;
  data?: any;
  _id?: string;
}

interface IUnacknowledged {
  envelope: IEnvelope;
  resolve: Function;
  reject: Function;
  timeoutId: number;
}
