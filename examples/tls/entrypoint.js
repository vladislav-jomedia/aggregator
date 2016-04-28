/**
 * New node file
 */
var fs = require('fs');

var aggr = require('../../index');

var Aggregator = aggr.aggregator;

var r = new Aggregator(10000,1000,{
		protocol: aggr.protocol,
		fallback: aggr.fallback('/tmp'),
		name: 'AggregatorEntry'
});

var net = aggr.net;
var protocol = aggr.protocol;
var winston = require('winston');

var logger = new (winston.Logger)({
	transports: [new (winston.transports.Console)()]
});

net.socket({
	aggregator: r,
	protocol: protocol,
	fallback: aggr.fallback('/tmp'),
	logger: logger,
	name: 'SocketEntry'
}).listen(1337,'127.0.0.1');

net.serverTls({
	aggregator: r,
	protocol: protocol,
	name: 'ServerEntry',
	authBase: {
		'mkjhdasldjfhlkjdhclzjxhc': "adserving",
		'mkjhdasldjfhlkjdhclzjxsd': "adserving"
	},
	tlsServerOpt: {
  		key: fs.readFileSync('/tmp/certs/key.key'),
  		cert: fs.readFileSync('/tmp/certs/cert.pem'),
  		ca:  fs.readFileSync('/tmp/certs/ca.crt')
	}
}).listen(1338, '127.0.0.1');