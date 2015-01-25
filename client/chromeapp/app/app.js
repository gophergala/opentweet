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
				var server = username[1].split('')
				return {
					username: username[0],
					server: server[0],
					port: server[1] || 80
				}
			}
		}
	}])
	.factory('Tweets', ['$q', function($q) {
		return {
			get: function(user, from, to) {
				var deferred = $q.defer();

				var message = ['OT v1', user, from, to].join('\r\n') + '\r\n';
				var tcpClient = new TcpClient('localhost', 12315);
				tcpClient.connect(function() {
					tcpClient.addResponseListener(function(data) {
						deferred.resolve(data.split(/\n/));
					});
					tcpClient.addResponseErrorListener(function() {
						tcpClient.disconnect();
					});
					tcpClient.sendMessage(message);
				});
				return deferred.promise;
			}
		}
	}]);

angular
	.module('tweetPage', ['backend'])
	.controller('TweetListCtrl', ['Tweets', 'User', '$scope', function(tweets, user, $scope) {
		$scope.tweetsFromWhoIFollow = [];

		function update() {
			user.whoIFollow().then(function(people) {
				angular.forEach(people, function(person) {
					return tweets.get(person, 0, 0).then(function(tweets) {
						console.log(tweets);
						Array.prototype.push.apply($scope.tweetsFromWhoIFollow, tweets);
					});
				});
			});
		}

		$scope.doRefresh = update;
		update();
	}]);