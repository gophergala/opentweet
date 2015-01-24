document.getElementById('getTweets').addEventListener('click', function() {
	var output = document.getElementById('output');
	getTweets('localhost:12315', 'Name', 0, 0, function(data) {
		output.innerHTML += data;
	});
});


function getTweets(remote, name, from, to, callback) {
	var server = remote.split(':');
	var GET_TWEETS = ['OT v1', name, from, to].join('\r\n') + '\r\n';

	var tcpClient = new TcpClient('localhost', 12315);
	tcpClient.connect(function() {
		tcpClient.addResponseListener(callback);
		tcpClient.addResponseErrorListener(function() {
			console.log('Closing connection now');
			tcpClient.disconnect();
		});
		tcpClient.sendMessage(GET_TWEETS);
	});
};