'use strict';

module.exports = {
	client: function(options) {
		if(!options.aggregator) {
			throw new Error('Aggregator is required');
		}
		if(!options.protocol) {
			throw new Error('Protocol is required');
		}
		if(!options.name || typeof(options.name) != 'string') {
			options.name = 'DefaultSocket'
		}
		if(!options.client) {
			throw new Error('Client lib is required');
		}
		if(options.client == 'reconnect-tls' && !options.token) {
			throw new Error('Token is required with tls client');
		}
		var reconnect = require(options.client)

		var aggregator = options.aggregator;
		var protocol = options.protocol;
		var socketOption = (options.socketOption && typeof(options.socketOption) == 'object' ? options.socketOption : {});
		var chain = (options.chain ? options.chain: undefined);
		var plug;
		var connected = false;
		var authenticated = false;
		var fallbackListenerAttached = false;
		var fallbackListener;
		var fallback;

		var write;

		if(options.fallback) {
			fallback = options.fallback;
			var wStream = 'false';
			fallbackListener = function(data) {
				if(wStream === 'false'){
					fallback.listener(options.name+'_'+'failback.txt',function(stream){
						wStream = stream;
					})
				}
				protocol.encode(data, function(encoded) {
					wStream.write(encoded + "\n");
				})
			};
			aggregator.on('data', fallbackListener);
		} else {
			fallback = undefined;
			fallbackListener = undefined;
		}

		return reconnect(socketOption, function(stream) {
			stream.on('data', function(data) {
				var msgs = String(data.toString()).split('\n');
				if (authenticated === false){
					var authReply = msgs[0];
					console.log('Received Auth reply: '+authReply)
					if (authReply === 'CONNECTED'){
						authenticated = true;
						console.log('Auth passed')
						if (fallbackListener) {
							aggregator.removeListener('data', fallbackListener);
							fallbackListenerAttached = false;
							console.info('Removed Fallback listener');
							wStream = 'false'
							console.info('Stopped/Removed write stream')
							fallback.flush(options.name+'_'+'failback.txt',function(stream) {
								stream.on('data', function(line) {
									write(line);
								});

								stream.on('end', function() {
									fallback.empty(options.name+'_'+'failback.txt',function(err) {
										if(err) {
											console.error('Failed to remove backup file');
										} else {
											console.info('Done flushing');
										}
									});
								});
							});
						}
						aggregator.on('data', plug);
					}
				}
			});
			stream.on('error', function(err) {
				console.log(err)
			})
		}).on('connect', function(con) {
			console.log('ON Connect')
			if(options.client){
				con.write(options.token+'\n');
			}else{
				con.write('HELLO\n');
			}

			write = function(line) {
				con.write(line + "\n");
				if(chain) {
					chain(line + "\n");
				}
			};

			console.info('conn');
			connected = true;

			plug = function(data) {
				protocol.encode(data, function(encoded) {
                    write(encoded);
                    if (options.debug) console.info('Sending => %s', encoded);
				});
			}
		}).on('reconnect', function(n, delay) {
			console.info('Trying to re-conn');
		}).on('disconnect', function(err) {
			console.log('ON DISConnect: '+err)
			authenticated = false;
			if(connected) {
				aggregator.removeListener('data', plug);
				console.info('Disconnection');
				if (fallbackListener && !fallbackListenerAttached) {
					console.info('Fallback Attached');
					aggregator.on('data', fallbackListener);
					fallbackListenerAttached = true;
				}
			}
			connected = false;
		}).on('error', function(err) {
			console.log(err)
		})
	}
};

