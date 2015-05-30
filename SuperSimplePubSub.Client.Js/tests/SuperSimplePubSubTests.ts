describe('SuperSimplePubSub', () =>  {
  let connection: IConnection;
  let pubsub: SuperSimplePubSub;
  let subscription: Subscription;

  let receivedStub: Sinon.SinonStub;
  let sendStub: Sinon.SinonStub;


  let fakeReceivedMessage = (envelope: IEnvelope) => {
    receivedStub.firstCall.args[0](JSON.stringify(envelope));
  };

  let fakeAckSubscription = (sendStubCall: Sinon.SinonSpyCall = sendStub.firstCall) => {
    let data = sendStubCall.args[0];
    data.should.be.a('string');

    let envelope = JSON.parse(data);

    fakeReceivedMessage({
      channel: SYSTEM_CHANNEL,
      topic: SYSTEM_TOPIC_ACK,
      data: envelope.data,
      _id: envelope._id
    });
  };


  /*
   * for an explanation see
   * http://stackoverflow.com/questions/11235815/is-there-a-way-to-get-chai-working-with-asynchronous-mocha-tests
   */
  let check = (done: Function, f: Function): (envelope: IEnvelope) => any =>  {
    return (envelope: IEnvelope) => {
      try {
        f();
        done();
      } catch(e) {
        done(e);
      }
    };
  };

  beforeEach(() => {
    connection = $.connection('/pubsub');

    /*
     * create stubs before using the connection,
     * so we can stub the received callback which is hooked
     * up in SuperSimplePubSub's constructor.
     */
    receivedStub = sinon.stub(connection, 'received');
    sendStub = sinon.stub(connection, 'send');

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
    });

    it('should return a Subscription with specified channel and default topic', () => {
      // arrange
      let expectedChannel = 'sample.channel';

      // act
      subscription = pubsub.subscribe({ channel: expectedChannel });

      // assert
      subscription.should.be.an.instanceOf(Subscription);
      subscription.should.have.property('channel').equal(expectedChannel);
    });

    it('should return a Subscription with specified topic and default channel', () => {
      // arrange
      let expectedTopic = 'sample.topic';

      // act
      subscription = pubsub.subscribe({ topic: expectedTopic });

      // assert
      subscription.should.be.an.instanceOf(Subscription);
      subscription.should.have.property('topic').equal(expectedTopic);
    });

    it('should send a subscribe envelope through the connection', () => {
      // act
      subscription = pubsub.subscribe();

      // assert
      connection.send.should.have.been.calledOnce;
      let data = sendStub.firstCall.args[0];
      data.should.be.a('string');

      let envelope = JSON.parse(data);
      envelope.channel.should.equal(SYSTEM_CHANNEL);
      envelope.topic.should.equal(SYSTEM_TOPIC_SUBSCRIBE);
      envelope._id.should.be.a('string');

      envelope.data.should.have.property('channel').equal(DEFAULT_CHANNEL);
      envelope.data.should.have.property('topic').equal(DEFAULT_TOPIC);
    });

    describe('resulting subscription.promise', () => {
      let clock: Sinon.SinonFakeTimers;

      beforeEach(() => {
        clock = sinon.useFakeTimers();
      });

      afterEach(() => {
        clock.restore();
      });

      it('should be rejected after a specific time if no response received', () => {
        // arrange
        let expectedError = 'No ACK received!';

        // act
        subscription = pubsub.subscribe();
        clock.tick(5010);

        // assert
        return subscription.promise.should.be.rejectedWith(sinon.match({ data: expectedError }));
      });

      it('should be rejected if a response with an error has been received', () => {
        // arrange
        let expectedError = 'server error message';

        // act
        subscription = pubsub.subscribe();

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
        return subscription.promise.should.be.rejectedWith(sinon.match({ data: expectedError}));
      });

      it('should be fulfilled if a response has been received within time', () => {
        // act
        subscription = pubsub.subscribe();
        fakeAckSubscription();

        // assert
        return subscription.promise.should.be.fulfilled;
      });
    });

    describe('subscription callback', () => {
      it('should be a noop if not specified otherwise', (done: Function) => {
        // arrange
        let data = 'sampledata';
        let envelope: IEnvelope = {
          channel: DEFAULT_CHANNEL,
          topic: DEFAULT_TOPIC,
          data: data
        };

        subscription = pubsub.subscribe();
        fakeAckSubscription();

        // act
        subscription.promise.then(check(done, () => {
          receivedStub.firstCall.args[0](JSON.stringify(envelope));
        }));
      });

      it('should be called when a matching message is received', (done: Function) => {
        // arrange
        let data = 'sampledata';
        let envelope: IEnvelope = {
          channel: DEFAULT_CHANNEL,
          topic: DEFAULT_TOPIC,
          data: data
        };

        let callbackSpy = sinon.spy();
        subscription = pubsub.subscribe({ callback: callbackSpy });
        fakeAckSubscription();

        subscription.promise.then(check(done, () => {
          // act
          fakeReceivedMessage(envelope);

          // assert
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(data, envelope);
        }));
      });

      it('of two different subscriptions should each be called one', (done: Function) => {
        // arrange
        let callbackSpy1 = sinon.spy();
        let callbackSpy2 = sinon.spy();

        let subscription1 = pubsub.subscribe({ topic: 'one', callback: callbackSpy1 });
        let subscription2 = pubsub.subscribe({ topic: 'two', callback: callbackSpy2 });
        fakeAckSubscription(sendStub.firstCall);
        fakeAckSubscription(sendStub.secondCall);

        Promise.all([subscription1.promise, subscription2.promise]).then(check(done, () => {
          // act
          fakeReceivedMessage({ channel: DEFAULT_CHANNEL, topic: 'one' });
          fakeReceivedMessage({ channel: DEFAULT_CHANNEL, topic: 'two' });

          // assert
          callbackSpy1.should.have.been.calledOnce;
          callbackSpy2.should.have.been.calledOnce;
        }));
      });

      it('of two equal subscriptions should be called each once', (done: Function) => {
        // arrange
        let callbackSpy1 = sinon.spy();
        let callbackSpy2 = sinon.spy();

        let subscription1 = pubsub.subscribe({ topic: 'one', callback: callbackSpy1 });
        let subscription2 = pubsub.subscribe({ topic: 'one', callback: callbackSpy2 });
        fakeAckSubscription(sendStub.firstCall);
        fakeAckSubscription(sendStub.secondCall);

        Promise.all([subscription1.promise, subscription2.promise]).then(check(done, () => {
          // act
          fakeReceivedMessage({ channel: DEFAULT_CHANNEL, topic: 'one' });

          // assert
          callbackSpy1.should.have.been.calledOnce;
          callbackSpy2.should.have.been.calledOnce;
        }));
      });
    });
  });

  describe('publish', () => {
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
        let expectedError = 'No ACK received!';

        // act
        let promise = pubsub.publish();
        clock.tick(5010);

        // assert
        return promise.should.be.rejectedWith(sinon.match({ data: expectedError }));
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
        return promise.should.be.rejectedWith(sinon.match({ data: expectedError }));
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
