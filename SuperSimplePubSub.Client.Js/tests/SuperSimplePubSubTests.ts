describe('SuperSimplePubSub', () =>  {
  let connection: IConnection;
  let pubsub: SuperSimplePubSub;
  let subscription: Subscription;

  beforeEach(() => {
    connection = $.connection('/pubsub');
    pubsub = new SuperSimplePubSub(connection);
  });

  describe('constructor', () => {
    it('should accept a connection', () => {
      pubsub.connection.should.equal(connection);
    });
  });

  describe('subscribe', () => {
    it('should return a Subscription with default channel / topic', () => {
      // act
      subscription = pubsub.subscribe();

      // assert
      subscription.should.be.an.instanceOf(Subscription);
      subscription.should.have.property('channel').equal(DEFAULT_CHANNEL);
      subscription.should.have.property('topic').equal(DEFAULT_TOPIC);

      return subscription.promise.should.be.fulfilled;
    });

    it('should return a Subscription with specified channel and default topic', () => {
      // arrange
      let expectedChannel = 'sample.channel';

      // act
      subscription = pubsub.subscribe({ channel: expectedChannel });

      // assert
      subscription.should.be.an.instanceOf(Subscription);
      subscription.should.have.property('channel').equal(expectedChannel);

      return subscription.promise.should.be.fulfilled;
    });

    it('should return a Subscription with specified topic and default channel', () => {
      // arrange
      let expectedTopic = 'sample.topic';

      // act
      subscription = pubsub.subscribe({ topic: expectedTopic });

      // assert
      subscription.should.be.an.instanceOf(Subscription);
      subscription.should.have.property('topic').equal(expectedTopic);

      return subscription.promise.should.be.fulfilled;
    });
  });


  describe('publish', () => {
    let receivedStub: Sinon.SinonStub;
    let sendStub: Sinon.SinonStub;

    beforeEach(() => {
      /*
       * create stubs before using the connection,
       * so we can stub the received callback which is hooked
       * up in SuperSimplePubSub's constructor.
       */
      receivedStub = sinon.stub(connection, 'received');
      sendStub = sinon.stub(connection, 'send');

      pubsub = new SuperSimplePubSub(connection);
    });

    it('should create and send an envelope over the connection', () => {
      // act
      pubsub.publish();

      // assert
      connection.send.should.have.been.calledOnce;
      let data = sendStub.firstCall.args[0];
      data.should.be.a('string');

      let envelope = JSON.parse(data);
      envelope.channel.should.equal(DEFAULT_CHANNEL);
      envelope.topic.should.equal(DEFAULT_TOPIC);
      envelope._id.should.be.a('string');
    });

    describe('resulting promise', () => {
      let clock: Sinon.SinonFakeTimers;

      beforeEach(() => {
        clock = sinon.useFakeTimers();
      });

      afterEach(() => {
        clock.restore();
      });

      it('should be rejected after a specific time if no response received', () => {
        // arrange
        let expectedEnvelope: IEnvelope = {
          channel: DEFAULT_CHANNEL,
          topic: DEFAULT_TOPIC
        };

        // act
        let promise = pubsub.publish();
        clock.tick(5010);

        // assert - TODO: fix type definition for rejectedWith
        return promise.should.be.rejectedWith(Error/*, sinon.match(expectedEnvelope)*/);
      });

      it('should be rejected if a response with an error has been received', () => {
        // arrange
        let expectedError = 'server error message';

        // act
        let promise = pubsub.publish();

        connection.send.should.have.been.calledOnce;
        let data = sendStub.firstCall.args[0];
        data.should.be.a('string');

        let envelope = JSON.parse(data);
        receivedStub.firstCall.args[0](JSON.stringify({
          channel: SYSTEM_CHANNEL,
          topic: SYSTEM_TOPIC_ACKERR,
          data: expectedError,
          _id: envelope._id
        }));

        // assert
        return promise.should.be.rejectedWith(expectedError);
      });

      it('should be fulfilled if a response has been received within time', () => {
        // act
        let promise = pubsub.publish();

        connection.send.should.have.been.calledOnce;
        let data = sendStub.firstCall.args[0];
        data.should.be.a('string');

        let envelope = JSON.parse(data);
        receivedStub.firstCall.args[0](JSON.stringify({
          channel: SYSTEM_CHANNEL,
          topic: SYSTEM_TOPIC_ACK,
          _id: envelope._id
        }));

        // assert
        return promise.should.be.fulfilled;
      });
    });

  });
});
