const tls = require('tls');
var fs = require('fs');
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generate() {
	return [ new Date().getTime(), String.fromCharCode(getRandomInt(97, 122)), 1 ];
}

var aggr = require('../../index');
var Aggregator = aggr.aggregator;
var r = new Aggregator(1000,100,{
		protocol: aggr.protocol,
		fallback: aggr.fallback('/tmp'),
		name: 'AggregatorEntry'
});
var net = aggr.net;

net.socketTls(
	{
		aggregator: r,
		protocol: aggr.protocol,
		fallback: aggr.fallback('/tmp'),
		name: 'SocketEntry',
		token: 'mkjhdasldjfhlkjdhclzjxhca'
	}
).listen({
	port: 1338,
	host: 'ta.infra.systems',
	rejectUnauthorized: false
});

setInterval(function() {
	for(var i = 0; i < 10000; i++) {
		var b = generate();
		r.ingest('test', b[0], b[1], b[2]);
		var b = generate();
		r.ingest('test2', b[0], b[1], b[2]);
	}
}, 200);


