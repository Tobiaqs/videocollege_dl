"use strict";

(function () {
	function download(payload, callback) {
		fetch("/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload),
			credentials: "include"
		}).then(function (response) {
			return response.json();
		}, function (error) {
			alert("An error occurred. See console for details.");
			console.log(error);
		}).then(function (json) {
			if (!json || !json.d || !json.d.Presentation || !json.d.Presentation.Streams) {
				alert("Unusable data received. See console for a dump.");
				console.log(json);
				return;
			}
			var stream = json.d.Presentation.Streams.find(function (stream) {
				return stream.VideoUrls.length > 0;
			});

			if (!stream) {
				alert("No video stream found.");
				return;
			}

			if (callback) {
				callback(stream.VideoUrls[0].Location, json.d.Presentation.Title);
			} else {
				var a = document.createElement('A');
				a.download = json.d.Presentation.Title;
				a.href = stream.VideoUrls[0].Location;
				document.body.appendChild(a);
				a.click();
			}
		});
	};

	if (location.pathname.indexOf("/Mediasite/Catalog/Full/") === 0 && !window._videocollege_dl_enabled) {
		window._videocollege_dl_enabled = true;

		var cache = {};

		setInterval(function () {
			var title = document.getElementById("SearchResultsTitle");

			if (title.children.length === 0) {
				var a = document.createElement('A');
				a.addEventListener("click", function () {
					var elements = document.getElementsByClassName("navPanel");
					var descriptors = [];

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var element = _step.value;

							var launchLink = [].find.call(element.children, function (child) {
								return child.id === "Launch";
							});

							var path = launchLink.href.split('/').reverse()[0];

							if (cache[path]) {
								descriptors.push(cache[path]);
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					if (descriptors.length !== elements.length) {
						alert("Not all download links fetched for this page. Try again in a few seconds.");
						return;
					}

					var script = '#!/bin/bash\n';

					descriptors.forEach(function (descriptor) {
						var ext = descriptor.url.match(/\.(.{3})\?/)[1];
						script += 'wget -O "' + descriptor.title + '.' + ext + '" "' + descriptor.url + '"\n';
					});

					var a = document.createElement('a');
					var objectURL = URL.createObjectURL(new Blob([script], { type: "text/plain" }));
					a.href = objectURL;
					a.download = "lectures.sh";

					// Append anchor to body.
					document.body.appendChild(a);
					a.click();

					URL.revokeObjectURL(objectURL);

					// Remove anchor from body
					document.body.removeChild(a);
				});
				a.innerHTML = " (wget script)";
				title.appendChild(a);
			}

			var elements = document.getElementsByClassName("navPanel");
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				var _loop = function _loop() {
					var element = _step2.value;

					var hasDownloadLink = [].some.call(element, function (child) {
						return child.id === "Download";
					});
					if (!hasDownloadLink && !element.getAttribute("data-fetched")) {
						var _createDownloadLink = function _createDownloadLink(url, title) {
							if (!cache[path]) {
								cache[path] = {
									url: url,
									title: title
								};
							}

							var a = document.createElement("A");
							a.href = url;
							a.innerHTML = "Download";
							a.download = title;
							a.target = "_blank";
							a.id = "Download";
							element.appendChild(a);
						};

						element.setAttribute("data-fetched", "yes");

						var launchLink = [].find.call(element.children, function (child) {
							return child.id === "Launch";
						});

						var path = launchLink.href.split('/').reverse()[0];
						var queryString = path.match(/\?catalog=([^&]+)/)[1];

						if (cache[path]) {
							_createDownloadLink(cache[path].url, cache[path].title);
							return "continue";
						}

						var payload = {
							getPlayerOptionsRequest: {
								ResourceId: path.split('?')[0],
								QueryString: queryString,
								UseScreenReader: false,
								UrlReferrer: location.href
							}
						};

						download(payload, _createDownloadLink);

						;
					}
				};

				for (var _iterator2 = elements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _ret = _loop();

					if (_ret === "continue") continue;
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}, 1000);
	} else if (location.pathname.indexOf("/Mediasite/Play/")) {
		var payload = {
			getPlayerOptionsRequest: {
				ResourceId: location.pathname.split('/').reverse()[0],
				QueryString: location.search,
				UseScreenReader: false,
				UrlReferrer: document.referrer
			}
		};

		download(payload);
	}
})();