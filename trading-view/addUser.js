module.exports.add = async function (username) {
	fetch("https://www.tradingview.com/pine_perm/add/", {
		"headers": {
			"accept": "application/json, text/javascript, */*; q=0.01",
			"accept-language": "en-US,en;q=0.9",
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
			"sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Linux\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-language": "en",
			"x-requested-with": "XMLHttpRequest",
			"cookie": "device_t=d0M4bEFnOjI.v49WVZUhwbnVkhYtLBQDUflLFWd-wP8JkVcHHtLmyGw; sessionid=glcf77g38jj4jfo0gdbje8wso958gau8; etg=undefined; cachec=undefined; _sp_ses.cf1a=*; _sp_id.cf1a=edac5cd3-8047-4d73-9089-5d0c7afc83d9.1657565962.3.1657570886.1657568658.184c80e6-0035-4b33-89d4-d36a0d13643a",
			"Referer": "https://www.tradingview.com/script/7DeN8MqF-CWG-ALGO-V-1-TrendSetter/",
			"Referrer-Policy": "origin-when-cross-origin"
		},
		"body": "pine_id=PUB%3B691c0e71e90045b6956561de465101cc&username_recip=" + username,
		"method": "POST"
		});
};
