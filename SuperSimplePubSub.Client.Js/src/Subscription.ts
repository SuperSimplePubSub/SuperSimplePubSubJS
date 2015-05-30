class Subscription {

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

  constructor(private _options: ISubscribeOptions, private _promise: Promise<any>) {
  }
}
