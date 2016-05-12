
var reconnect = require('reconnect-tls');
var aggr = require('../../index');
var net = aggr.net;

net.clientOut(
	{
		name: 'SocketMy',
		token: 'mkjhdasldjfhlkjdhclzjxhc',
		client: reconnect,
		failback: '/tmp/client'
	}
).listen({
	port: 1335,
	host: 'ta.infra.systems',
	rejectUnauthorized: false
});


