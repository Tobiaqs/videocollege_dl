(function () {
	function download (payload) {
		fetch("/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload),
			credentials: "include"
		}).then((response) => {
			return response.json();
		}, (error) => {
			alert("An error occurred. See console for details.");
			console.log(error);
		}).then((json) => {
			if (!json || !json.d || !json.d.Presentation || !json.d.Presentation.Streams) {
				alert("Unusable data received. See console for a dump.");
				console.log(json);
				return;
			}
			let stream = json.d.Presentation.Streams.find((stream) => {
				return stream.VideoUrls.length > 0;
			});

			if (!stream) {
				alert("No video stream found.");
				return;
			}

			let a = document.createElement('A');
			a.download = json.d.Presentation.Title;
			a.href = stream.VideoUrls[0].Location;
			document.body.appendChild(a);
			a.click();
		});
	};

	if (location.pathname.indexOf("/Mediasite/Catalog/Full/") === 0 && !window._videocollege_dl_enabled) {
		window._videocollege_dl_enabled = true;
		
		document.body.addEventListener("click", (event) => {
			if (event.target.classList.contains("titleLink")) {
				event.preventDefault();

				let path = event.target.href.split('/').reverse()[0];
				let queryString = path.match(/\?catalog=([^&]+)/)[1];

				let payload = {
					getPlayerOptionsRequest: {
						ResourceId: path.split('?')[0],
						QueryString: queryString,
						UseScreenReader: false,
						UrlReferrer: location.href
					}
				};

				download(payload);
			}
		});
	} else if (location.pathname.indexOf("/Mediasite/Play/")) {
		let payload = {
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
