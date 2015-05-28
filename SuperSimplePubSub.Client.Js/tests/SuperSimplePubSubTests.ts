describe('SuperSimplePubSub', () =>  {
  describe('constructor', () => {
    it('should accept a signalR connection', () => {
      let connection = $.connection('/pubsub');
      let pubsub = new SuperSimplePubSub(connection);

      pubsub.should.have.property('connection').equal(connection);
    });
  });

  describe('subscribe', () => {
    let pubsub: SuperSimplePubSub;
    let subscription: Subscription;

    beforeEach(() => {
      let connection = $.connection('/pubsub');
      pubsub = new SuperSimplePubSub(connection);
    });

    it('should return a Subscription with default channel / topic', () => {
      subscription = pubsub.subscribe();

      subscription.should.be.an.instanceOf(Subscription);
      subscription.should.have.property('channel').equal(DEFAULT_CHANNEL);
      subscription.should.have.property('topic').equal(DEFAULT_TOPIC);

      return subscription.promise.should.be.fulfilled;
    });
  });

});
