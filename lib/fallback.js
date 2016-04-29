'use strict';

var fs = require('fs');
var byline = require('byline');
var p = require('path')

module.exports = function(path, cb) {
	if (!fs.existsSync(path) || !fs.statSync(path).isDirectory() ){
		var err = new Error('Fallback directory doesnt exist!');
		console.error(err);
		process.exit(1);
	}

	return {
		listener: function(fileName, cb) {
			cb(fs.createWriteStream(path+'/'+fileName));
		},
		upload: function(id,cb) {
			var files = fs.readdirSync(path);
            files.forEach(function(file) {
            	if(file.indexOf(id+'_') > -1){
					var prefix = 'false';
		            if ( file.indexOf('_upload') === -1 && files.indexOf(file+'_upload') == -1){
		            	fs.renameSync(path + '/' + file, path + '/' + file+'_upload');
		            	var prefix = '_upload';
				    }else if ( file.indexOf('_upload') === -1 && files.indexOf(file+'_upload') > -1){
				    	fs.unlinkSync(path + '/' + file, path + '/' + file);
				    }else{
				    	var fileName = path + '/' + file;
				    	var prefix = '';
				    }
			        if (prefix != 'false'){
			        	cb(file+prefix, byline(fs.createReadStream(path+'/'+file+prefix)));
			        }
			    }
		    })
		},
		flush: function(fileName,cb) {
			fs.exists(path+'/'+fileName, function(exist) {
				if(exist) {
					cb(byline(fs.createReadStream(path+'/'+fileName)));
				}
			})
		},
		empty: function(fileName,cb) {
			fs.exists(path, function(exist) {
				if(exist) {
					fs.unlink(path+'/'+fileName, function(err) {
						if(err) {
							console.log(err);
							if(cb){
								cb(err);
							}
						}
						if(cb) {
							cb(null);
						}
					});
				}
			})
		}
	}

}
