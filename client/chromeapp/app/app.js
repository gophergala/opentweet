angular
	.module('openTweet', ['ionic', 'tweetPage']);

angular
	.module('backend', [])
	.factory('User', ['$q', function($q) {
		return {
			whoIFollow: function() {
				return $q.when(['axemclion@localhost:12315', 'jeff@localhost:12315']);
			},
			parse: function(data) {
				var username = data.split(/@/);
				var server = username[1].split(':');
				return {
					username: username[0],
					server: server[0],
					port: server[1] || 80
				}
			}
		}
	}])
	.factory('Tweets', ['$q', 'User', function($q, User) {
		return {
			get: function(user, from, to, callbacks) {
				var defer = $q.defer();
				var message = ['OT v1', user, from, to].join('\r\n') + '\r\n';
				var tcpClient = new TcpClient('localhost', 12315);
				tcpClient.connect(function() {
					var data = [];
					tcpClient.addResponseListener(function(response) {
						data.push(response);
					});
					tcpClient.addResponseErrorListener(function() {
						var len = data.map(function(d) {
							return d.byteLength;
						}).reduce(function(prev, curr) {
							return prev + curr;
						}, 0);

						var tmp = new Uint8Array(len),
							offset = 0;
						data.forEach(function(d) {
							tmp.set(new Uint8Array(d), offset);
							offset += d.byteLength;
						});
						tcpClient._arrayBufferToString(tmp.buffer, function(str) {
							var data = str.split('\r\n');
							var result = [];
							for (var i = 0; i < data.length - 1; i += 2) {
								result.push({
									user: user,
									timestamp: new Date(parseInt(data[i], 10)),
									tweet: data[i + 1]
								});
							}
							defer.resolve(result);
						});
					});
					tcpClient.sendMessage(message);
				});
				return defer.promise;
			}
		}
	}]);

angular
	.module('tweetPage', ['backend'])
	.controller('TweetListCtrl', ['Tweets', 'User', '$scope', function(tweets, user, $scope) {
		$scope.tweetsFromWhoIFollow = [];

		function update() {
			user.whoIFollow().then(function(people) {
				var userCount = people.length;
				angular.forEach(people, function(person) {
					return tweets.get(person, 0, 0).then(function(tweets) {
						console.log(tweets)
						Array.prototype.push.apply($scope.tweetsFromWhoIFollow, tweets);
					}).finally(function() {
						if (--userCount === 0) {
							$scope.$broadcast('scroll.refreshComplete');
						}
					})
				});
			});
		}

		$scope.doRefresh = update;
		update();
	}]);