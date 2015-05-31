SuperSimplePubSubJS [![Build Status](https://travis-ci.org/SuperSimplePubSub/SuperSimplePubSubJS.svg?branch=master)](https://travis-ci.org/SuperSimplePubSub/SuperSimplePubSubJS)
===================

SuperSimplePubSub exposes a publish-subscribe based API on top of [SignalR's](https://github.com/SignalR/SignalR) [PersistentConnection](https://github.com/SignalR/SignalR/wiki/QuickStart-Persistent-Connections). SuperSimplePubSub provides an alternative to the [Hub](http://www.asp.net/signalr/overview/guide-to-the-api) based API provided by SignalR.


This repository contains the Javascript part whereas the serverside part is hosted over at [https://github.com/SuperSimplePubSub/SuperSimplePubSub](https://github.com/SuperSimplePubSub/SuperSimplePubSub)

**WARNING: This is alpha code NOT suitable for production. The
implementation and API will likely change in significant ways during the
next months. The code and algorithms are not tested enough. A lot more work
is needed.**

## How to install this crap?

```bash
$ bower install SuperSimplePubSubJS --save  # or
$ npm install SuperSimplePubSubJS --save
```

**INFO: SuperSimplePubSub relies on some API's which are not implemented
by all browers yet. Until now these are [Object.assign](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
and ES6
[Promises](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Promise).
You have to provide the appropriate shims for these API's.
SuperSimplePubSubJS uses [es5-shim](https://github.com/es-shims/es5-shim) and
[es6-shim](https://github.com/es-shims/es6-shim) to provide a modern
 environment.**

```bash
$ bower install es5-shim es6-shim --save
```

## How to use SuperSimplePubSub 101

```javascript

var connection = $.connection('/pubsub');
var pubsub = new SuperSimplePubSub(connection);

/*
 * After calling start(), it's save to publish/subscribe messages.
 */
connection.start();

/*
 * By default, subscribe and publish use the default channel/topic.
 */
pubsub.subscribe({ callback: function(data) { console.log(data); }});
pubsub.publish({ data: 'Hello World!' });

/*
 * Subscribe and publish to a custom channel/topic.
 */
var subscription = pubsub.subscribe({
	channel: 'chatroom',
	topic: 'message.new',
	callback: function(data) {
		console.log(data.from + ": " data.message);
	}
});

pubsub.publish({
	channel: 'chatroom',
	topic: 'message.new',
	data: {
		from: 'Fabian Raetz',
		message: 'Hello World!'
	}
});

/*
 * Unsubscribe from a given subscription.
 */
subscription.unsubscribe();

/*
 * Subscribing and publishing can fail for various reasons.
 * As an example, the server could decide that we do not
 * have appropriate permissions to subscribe/publish to a channel/topic.
 *
 * A subscription contains a promise which will be fulfilled if the
 * subscription was successful, else the promise will be rejected.
 */
subscription.promise
	.then(function() { console.log('subscription succeeded'); })
	.catch(function() { console.log('subscription failed'); });

/*
 * A call to publish() will return a promise too.
 */
pubsub.publish({ data: 'could fail' })
	.then(function() { console.log('publishing succeeded'); })
	.catch(function() { console.log('publishing failed'); });


```

## Development Notes

### Testing Frameworks

* [karma test runner](http://karma-runner.github.io/0.12/index.html)  
* [mochajs test framework ](http://mochajs.org/)
* [sinonjs mocking framework](http://sinonjs.org/)
* [chai assertion library](http://chaijs.com/)
* [chai-as-promised assertion for promises](https://github.com/domenic/chai-as-promised/)
* [sinonjs assertions for chai](http://chaijs.com/plugins/sinon-chai)

### Misc

#### es6.d.ts

We want to compile to es5 but want type definitions for es6.
The easiest way for now is to use the es6 definitions from [github.com/Microsoft/TypeScript](https://github.com/Microsoft/TypeScript/blob/master/src/lib/es6.d.ts)
until there is a better way. Idea taken from (https://github.com/Microsoft/TypeScript/issues/3005)


## License (ISC)

Copyright (c) 2015 Fabian Raetz <fabian.raetz@gmail.com>

Permission to use, copy, modify, and distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
