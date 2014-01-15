(function () {

var ORIG = {image: 'init.jpg', color: ''};
var FLASHES = [
	{image: 'aaa.gif', color: '#54eff6'},
	{image: 'omg.jpg', color: '#89ba9d'},
];
var FLASH_COLORS = ['aaa.gif', 'omg.jpg'];
var FLASH_TIMEOUT;
var $audio = document.getElementsByTagName('audio')[0];
var $button = document.getElementsByTagName('button')[0];
var $ctr = document.getElementById('ctr');
var CTR = parseInt($ctr.textContent.replace(/,/g, ''), 10);
var SOCK, RETRIES;

function preload() {
	for (var i = 0; i < FLASHES.length; i++)
		(new Image).src = FLASHES[i].image;
}
preload();

$button.onclick = function (e) {
	var req = new XMLHttpRequest()
	req.open('POST', 'wub', true);
	req.send();

	$ctr.textContent = commas(++CTR);

	$audio.currentTime = 0;
	setTimeout(function () { $audio.play(); }, 100);

	bg(FLASHES[CTR % FLASHES.length]);
	if (FLASH_TIMEOUT)
		clearTimeout(FLASH_TIMEOUT);
	FLASH_TIMEOUT = setTimeout(function () {
		FLASH_TIMEOUT = 0;
		bg(ORIG);
	}, 2500);

	$button.blur();
	return false;
};

function bg(info) {
	document.body.style.backgroundColor = info.color;
	document.body.style.backgroundImage = "url('" + info.image + "')";
}

function commas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function connect() {
	var url = location.href + 'shaberu';
	SOCK = new SockJS(url);
	SOCK.onopen = function () {
		var me = SOCK;
		setTimeout(function () {
			if (me === SOCK)
				RETRIES = 0;
		}, 9000);
	};

	SOCK.onmessage = function (e) {
		var n = parseInt(e.data, 10);
		if (!isNaN(n)) {
			if (n >= CTR) {
				CTR = n;
				$ctr.textContent = commas(n);
			}
		}
		else if (e.data == 'reload')
			location.reload();
		else
			console.error(e.data);
	};

	SOCK.onclose = function () {
		if (RETRIES++ < 5)
			setTimeout(connect, 3000);
	};
}
connect();

}());
