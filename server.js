function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


function generate() {
	//return [ new Date().getTime(), String.fromCharCode(getRandomInt(97, 122)), getRandomInt(1, 1) ];
	return [ new Date().getTime(), String.fromCharCode(getRandomInt(97, 122)), 1 ];
}

var aggr = require('./index');

var Agg = aggr.aggregator;
var r = new Agg(10000,10000,{
		protocol: aggr.protocol,
		fallback: aggr.fallback('/tmp/backup'),
		name: 'Aggregator1'
});

var net = aggr.net;

net.socket(
	{
		aggregator: r,
		protocol: aggr.protocol,
		fallback: aggr.fallback('/tmp/backup'),
		name: 'Socket1'
	}
).listen(1338,'127.0.0.1');


net.server(
	{
		aggregator: r,
		protocol: aggr.protocol,
		name: 'Server1'
	}
).listen(1337, '127.0.0.1');


setInterval(function() {
	for(var i = 0; i < 100000; i++) {
		var b = generate();
		r.ingest('test', b[0], b[1], b[2]);
		var b = generate();
		r.ingest('test2', b[0], b[1], b[2]);
	}
}, 100);