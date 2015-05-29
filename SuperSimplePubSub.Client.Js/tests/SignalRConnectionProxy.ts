describe('SignarRConnectionProxy', () => {
  let signalr: SignalR;
  let proxy: SignalRConnectionProxy;

  beforeEach(() => {
    signalr = $.connection('/pubsub');
    proxy = new SignalRConnectionProxy(signalr);
  });

  describe('constructor', () => {
    it('should have a signalr property which is set to the underlying connection object', () => {
      proxy.should.have.property('signalr').equal(signalr);
    });
  });

  describe('send', () => {
    it.skip('should take data and forward it to the underlying connection', () => {
      let expectedData = 'sampledata';
      sinon.stub(signalr, 'send');

      proxy.send(expectedData);

      signalr.send.should.have.been.calledWith(expectedData);
    });
  });

  describe('received', () => {
    it('should be called when the underlying connection received data', () => {
      let expectedData = 'sampledata';
      let callback = sinon.spy();
      sinon.stub(signalr, 'received').callsArgWith(0, expectedData);

      proxy.received(callback);

      callback.should.be.calledWith(expectedData);
    });
  });
});
