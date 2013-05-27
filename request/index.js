var request = require('request'),
    jsdom = require('jsdom');

var urls = ['http://localhost:8888/io2013presentation/index.html'];
for (var i = 0; i != urls.length; ++i) {
  requestPresentation(urls[i]);
}

function requestPresentation(url){
  request({uri: url}, function(error, response, body){
    if (error && response.statusCode !== 200) {
      console.log('>>>>>>>>>>> Error', error)
    }

    jsdom.env({
      html: body,
      // scripts: [
      //   'http://localhost:8888/node/request/js/lib/jquery-2.0.0.min.js'
      // ]
    }, handleResponse);
  });
}

function handleResponse(err, window) {
  var slides = [];
  var slideElements = window.document.querySelectorAll('slide');
  for (var i = 0; i !== slideElements.length; ++i){
    var slide = {
      slideNumber: i + 1
    };
    var slideElement = slideElements[i];
    slide.text = getText(slideElement);

    var h2 = slideElement.querySelector('h2');
    if (h2){
      slide.h2 = getText(h2);
    }
    var article = slideElement.querySelector('article');
    if (article){
      slide.article = getText(article);
    }
    var aside = slideElement.querySelector('aside');
    if (aside){
      slide.aside = getText(aside);
    }
    slides.push(slide);
    var images = slideElement.querySelectorAll('img');
    if (images.length){
      slide.images = [];
      for (var j = 0; j != images.length; ++j){
        var image = images[j];
        var alt = image.alt || image.title;
        if (alt){
          slide.text += ' ' + image.alt;
          slide.images.push({alt: alt, src: image.src});
        }
      }
    }

  } // each slideElement
  for (var k = 0; k !== slides.length; ++k){
    var slide = slides[k];
    console.log(slide);
  }
}

function getText(element){
  return element.textContent.trim().replace(/\s+/g, ' ');
}
