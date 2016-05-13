function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generate() {
	return [ new Date().getTime(), String.fromCharCode(getRandomInt(97, 122)), 1 ];
}
setInterval(function() {
	for(var i = 0; i < 10000; i++) {
		var b = generate();
		r.ingest('test', b[0], b[1], b[2]);
		var b = generate();
		r.ingest('test2', b[0], b[1], b[2]);
	}
}, 100);

var reconnect = require('reconnect-tls');
var aggr = require('../../index');
var net = aggr.net;

var Aggregator = aggr.aggregator;
var r = new Aggregator(1000,1000,{
		debug: true,
		protocol: aggr.protocol,
		fallback: aggr.fallback('/tmp'),
		name: 'AggregatorClient'
});

net.clientIn(
	{
		aggregator: r,
		protocol: aggr.protocol,
		fallback: aggr.fallback('/tmp'),
		name: 'SocketClient',
		token: 'mkjhdasldjfhlkjdhclzjxhc',
		client: reconnect
	}
).listen({
	port: 1338,
	host: 'ta.infra.systems',
	rejectUnauthorized: false
});



