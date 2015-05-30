SuperSimplePubSub
=================

## How to use SuperSimplePubSub 101

```javascript

var connection = $.connection('/pubsub');
var pubsub = new SuperSimplePubSub(connection);

/*
 * after calling start(), it's save to publish/subscribe messages
 */
connection.start();

/*
 *subscribe and publish to the default channel/topic
 */
pubsub.subscribe({ callback: function(data) { console.log(data); }});
pubsub.publish({ data: 'Hello World!' });

/*
 * subscribe, publish and unsubscribe to a custom channel/topic
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

subscription.unsubscribe();

/*
 * subscribing and publishing can fail for various reasons.
 * As an example, the server could decide that we do not
 * have appropriate permissions to subscribe/publish to a channel/topic.
 *
 * A subscription contains a promise which will be fulfilled if the
 * subscription was successfull, else the promise will be rejected.
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

## Development

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
