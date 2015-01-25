angular
	.module('openTweet', ['ionic', 'header', 'tweetPage', 'followPage', 'settingsPage']);

angular
	.module('backend', [])
	.factory('Settings', ['$q', function($q) {
		return {
			save: function(settings) {
				var dfd = $q.defer();
				chrome.storage.local.set({
					settings: settings
				}, dfd.resolve);
				return dfd.promise;
			},
			fetch: function() {
				var dfd = $q.defer();
				chrome.storage.local.get({
					settings: {
						server: '',
						username: '',
						password: ''
					}
				}, function(items) {
					dfd.resolve(items.settings);
				});
				return dfd.promise;
			}
		}
	}])
	.factory('User', ['$q', function($q) {
		function getWhoIFollow() {
			var dfd = $q.defer();
			chrome.storage.local.get({
				whoIFollow: []
			}, function(items) {
				dfd.resolve(items.whoIFollow);
			});
			return dfd.promise;
		}

		function setWhoIFollow(people) {
			var dfd = $q.defer();
			chrome.storage.local.set({
				whoIFollow: people
			}, function() {
				dfd.resolve();
			});
			return dfd.promise;
		}

		return {
			whoIFollow: getWhoIFollow,
			followPerson: function(user) {
				return getWhoIFollow().then(function(people) {
					people.push(user);
					return setWhoIFollow(people);
				});
			},
			unFollowPerson: function(user) {
				return getWhoIFollow().then(function(people) {
					if (people.indexOf(user) !== -1) {
						people.splice(people.indexOf(user), 1);
					}
					return setWhoIFollow(people);
				});
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
	}])
	.filter('fromNow', function() {
		return function(input) {
			return moment(input).fromNow();
		}
	}).filter('userName', ['User', function(user) {
		return function(input) {
			return user.parse(input).username;
		}
	}]);

angular
	.module('followPage', ['backend', 'ionic'])
	.controller('FollowCtrl', ['User', '$ionicPopup', '$scope',
		function(User, $ionicPopup, $scope) {
			$scope.follow = function(user) {
				User.followPerson(user).then(function() {
					$scope.whoIFollow.push(user);
				});
			};
			$scope.unfollow = function(user) {
				User.unFollowPerson(user).then(refreshWhoIFollow);
			};

			function refreshWhoIFollow() {
				User.whoIFollow().then(function(people) {
					$scope.whoIFollow = people;
				});
			}
			refreshWhoIFollow();
		}
	]);

angular
	.module('settingsPage', ['backend', 'ionic'])
	.controller('SettingsCtrl', ['Settings', '$ionicPopup', '$scope', function(Settings, $ionicPopup, $scope) {
		Settings.fetch().then(function(settings) {
			$scope.server = settings.server;
			$scope.username = settings.username;
			$scope.password = settings.password;
		});
		$scope.saveSettings = function(server, username, password) {
			Settings.save({
				username: username,
				password: password,
				server: server
			}).then(function() {
				$ionicPopup.alert({
					title: 'Settings saved successfully',
				});
			});
		}
	}]);

angular
	.module('header', [])
	.controller('HeaderCtrl', ['$scope', function() {

	}]);