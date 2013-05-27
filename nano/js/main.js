var urls = [
	'io13webrtc.appspot.com',
	'html5-bleeding-edge.appspot.com',
	'html5-offline.appspot.com/',
	'samdutton.com/accessibility/gdd_2011/template',
	'samdutton.com/istanbul',
	'samdutton.com/velocity2012',
	'io13mobileworkflow.appspot.com',
	'mobile-html.appspot.com',
	'webcomponentsshift.com'
];

function get(url){
	$.ajax({
	  url: 'http://' + url,
	  success: function (data){
// //	  	console.log(data);

// 		$slides = $(data).find('slide'); // Could be better written as $(data).find('body')
// 		console.log($slides);
// 		$slides.each(function() {
// 			console.log($(this));
// 		});
// //	    html = $(data);
// 	    // html.each(function() {
// 	    //   console.log($(this).html());
// 	    // });
	  }
	});
}

for (var i = 0; i != urls.length; ++i){
	get(urls[i]);
}

// function get(url){
// 	var xhr = new XMLHttpRequest();
// 	xhr.open("GET", trackPath + videoId + trackSuffix);
// 	xhr.onreadystatechange = function() {
// 	  if (xhr.readyState === 4 && xhr.status === 200) {
// 	  	var track = xhr.responseText;
// 	  	var lines = track.match(/^.*((\r\n|\n|\r)|$)/gm);
// 	  }
// 	}
// 	xhr.send();
// }


// 	var slides = document.querySelectorAll('slide');
// 	for (var j = 0; j != slides.length; ++j) {
// 		var slide = slides[i];
// 		var slideNum = slide.dataset['slideNum'];
// 		var article = slide.querySelector('article');
// 		var articleText = article.innerText;
// 		var aside = slide.querySelector('aside');
// 		var asideText = aside.innerText;
// 		var images = slide.querySelectorAll('img');
// 		var altText;
// 		for (var i = 0; i != images.length; ++i) {
// 			altText += images[i].alt + " ";
// 		}
// 		store(url, slideNum, articleText, asideText, altText);
// 	}

// // to popup slide: add with-notes to body class
