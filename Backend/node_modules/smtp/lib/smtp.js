/* License: See the COPYING file in this distribution.
 *
 * Copyright (c) 2010 Terry Riegel <riegel@clearimageonline.com>
 * Copyright (c) 2010 Aria Stewart <aredridel@nbtsc.org>
 */

var net = require('net');
var events = require('events')
var sys = require('sys');
var linebuffer = require('linebuffer');

var left = function (str, n) {
	if (n <= 0) {return "";}
	if (n > String(str).length) {return this;}
	return String(str).substring(0,n);
}

function MessageStream() {
	events.EventEmitter.call(this)
	this.hasErred = false
	this.started = false
}
sys.inherits(MessageStream, events.EventEmitter)

exports.MessageStream = MessageStream

MessageStream.prototype.pause = function() { this.emit('pause') }
MessageStream.prototype.resume = function() { this.emit('resume') }

MessageStream.prototype.accept = function() { 
	this.smtpCode = 250
	this.smtpMessage = 'Message Accepted'
	this.emit('accept', this.smtpCode, this.smtpMessage)
}
MessageStream.prototype.reject = function(m) { 
	this.smtpCode = 551
	this.smtpMessage = m ? m : 'Message Rejected'
	this.emit('reject')
}
MessageStream.prototype.abort = function() {
	this.smtpCode = 421
	this.smtpMessage = 'Something went wrong'
	this.hasErred = true
}
MessageStream.prototype.start = function() {
	this.emit('start')
	this.started = true
}

var debug;
var debugLevel = parseInt(process.env.NODE_DEBUG, 16);
if (debugLevel & 0x4) {
	debug = function (x) { sys.error('SMTP: ' + x); };
} else {
	debug = function () { };
}

function Server(clientListener) {
	net.Server.call(this);
	this.allowPipelining = true
	this.hostname = 'hostname.unconfigured'
	this.addListener('connection', connectionListener);
	if(clientListener) this.addListener('connection', clientListener);
}
sys.inherits(Server, net.Server);

exports.Server = Server;

exports.createServer = function(clientListener) {
	return new Server(clientListener);
}

function connectionListener(socket) {
	var In = new linebuffer.LineBuffer()
	var Out = socket
	var self = this

	sys.pump(socket, In, function() {
		In.end()
	})

	debug("new smtp connection");

	socket.setTimeout(2*60*1000); // 2 minute timeout
	socket.addListener('timeout', function () {
		socket.destroy();
	});

	In.setEncoding('utf8');
	Out.out = function(a){
		try {
			Out.write(a+'\r\n')
		} catch(e) {
			Out.emit('error', e)
		}
		console.info('>'+a.replace("\n", ">\n"));
	}
	socket.on('connect', function () {
		Out.out('220 ' + self.hostname + ' ESMTP node.js');
		socket.state = 'welcome';
		resetSMTPState(socket)
	});
	In.on('data', function (line) {
		if (socket.state == 'data') {
			var message = socket.currentMessage
			if(line.match(/^\./)) {
				message.emit('end')
				socket.state = 'welcome'
				var f = function() { acceptOrReject(socket, message, In) }
				if(message.smtpCode === undefined) {
					In.pause()
					console.log('waiting for accept or reject')
					message.on('accept', f)
					message.on('reject', f)
					message.on('error', f)
				} else {
					f()
				}
			} else {
				message.emit('data', line)
			}
		} else {
			var m
			line = line.trimRight()
			if(m = line.match(/^(HELO|EHLO)\s+(.*)/i)) {
				var helodata = {name: m[2], valid: true, extended: m[1].toUpperCase() == 'EHLO' }
				socket.emit(m[1], helodata)
				if(helodata.valid) {
					socket.helo = helodata
					if(helodata.extended) {
						Out.out('250-' + self.hostname)
						if(socket.maxSize) Out.out("250-SIZE " + socket.maxsize)
						if(socket.allowPipelining) Out.out("250-PIPELINING")
						if(socket.authMethods) Out.out("250-AUTH "+socket.authMethods.join(' '))
						Out.out('250 HELP')
					} else {
						Out.out('250 ' + self.hostname)
					}
				} else {
					Out.out('550 Bad argument to HELO')
				}
			} else if(m = line.match(/^MAIL FROM:\s*(.*)\s*/i)) {
				if(socket.sender) Out.out("503 We already got one, you see.")
				var sender = {address: m[1], valid: true}
				socket.emit('MAIL FROM', sender)
				if(sender.valid) {
					socket.sender = sender
					Out.out("250 MAIL FROM looks good enough for me.")
				} else {
					Out.out("550 Go Away, you silly English Knnnniiight")
				}
			} else if(m = line.match(/^RCPT TO:\s*(.*)\s*/i)) {
				var recip = {address: m[1], valid: true}
				socket.emit('RCPT TO', recip)
				if(recip.valid) {
					socket.recipients.push(recip)
					Out.out("250 RCPT TO ...I hope that's right. I didn't check.)")
				} else {
					Out.out("550 We found a witch! May we burn her?")
				}
			} else if(line.match(/^DATA\b/i)) {
				socket.state = 'data';
				try {
					var message = new MessageStream()
					socket.currentMessage = message
					message.recipients = socket.recipients
					message.sender = socket.sender
					message.connection = socket
					In.pause()
					message.on('pause', function() {
						In.pause()
					})
					message.on('resume', function() {
						In.resume()
					})
					message.on('error', function(e) {
						message.error = e
						if(!message.started) {
							Out.out((e.smtpCode ? e.smtpCode : '451') + (e.smtpMessage ? ' ' + e.smtpMessage : ' Well, that could have gone better.'));
							socket.state =
'welcome'
						}
					})
					socket.emit('DATA', socket.currentMessage)
					message.on('start', function() {
						Out.out('354 Enter mail, end with "." on a line by itself');
						In.resume()
					})
					if(message.hasErred) {	
						acceptOrReject(socket, message, In)
						socket.state = 'welcome'
					}
				} catch(e) {
					Out.out('451 Internal Error')
					socket.state = 'welcome'
				}
			} else if(line.match(/^NOOP\b/i)) {
				Out.out('250 OK');
			} else if(line.match(/^QUIT\b/i)) {
				socket.emit('QUIT')
				Out.out('221 Go away, you silly English pig-dog types');
				In.destroy()
				socket.destroy()
			} else if(line.match(/^RSET\b/i)) {
				socket.emit('RSET')
				resetSMTPState(socket)
				Out.out('250 Reset OK');
			} else if(line.match(/^HELP\b/i)) {
				Out.out('214-Commands supported\r\n214 HELO MAIL RCPT DATA\r\n214 NOOP QUIT RSET HELP');
			} else if(line.match(/^EXPN\b/i)) {
				socket.emit('EXPN')
				Out.out('550 EXPN not available');
			} else if(line.match(/^(EHLO|SEND|SAML|SOML|TURN)\b/i)) {
				Out.out('502 Unsupported here');
			} else if(line.match(/^VRFY\b/i)) {
				Out.out('252 VRFY not available');
			} else {
				Out.out('500 Unrecognized command');
			}
		}
	});
	In.on('end', function () {
		console.info(' Unexpected End, Terminating connection.');
		socket.destroy();
	});
}

function resetSMTPState(socket) {
	socket.recipients = []
	socket.sender = null
	socket.currentMessage = null
	socket.heloname = null
}

function acceptOrReject(socket, message, stream) {
	if(message.smtpCode >= 200 && message.smtpCode < 300) {
		console.info("Accept!")
		socket.out(message.smtpCode + " " + message.smtpMessage)
	} else if(message.smtpCode >= 500 && message.smtpCode < 600) {
		console.info("Reject!")
		socket.out(message.smtpCode + " " + message.smtpMessage)
	} else {
		console.info("Error!")
		socket.out("451 Something went wrong")
	}
	if(stream.paused) stream.resume()
}
