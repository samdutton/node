var request = require('request'),
    jsdom = require('jsdom');

function handleURLs(error, window, url) {
  var presentation = {
    slides: [],
    url: url
  };
  var d =  window.document;
  var slides = [];
}

var spreadsheetURL = 'https://docs.google.com/spreadsheet/pub?key=0AtxlQg9XpugsdGVUTi1QbUdYbnNTd0tzUHlFZGRaUnc&single=true&gid=0&output=csv';

request(
  {uri: spreadsheetURL},
  function(error, response, body){
    if (error) {
      console.log('>>> Error', error)
    } else if (response.statusCode == 200) {
      var urls = body.split('\n');
      console.log(urls);
      for (var i = 0; i != urls.length; ++i) {
        requestPresentation(urls[i]);
      }
    }
  }
);


// var urls = ['http://io13webrtc.appspot.com', 'http://photoschromeapp.appspot.com', 'http://device-agnostic-development.appspot.com', 'https://picturesque-app.appspot.com/slides', 'http://mobile-html.appspot.com', 'http://yt-adaptiveslides.appspot.com', 'http://bit.ly/robust-io13', 'http://www.chriscartland.com/static/io2013/template.html', 'https://dl.dropboxusercontent.com/u/39519/talks/devtools2013/index.html', 'http://feature-detection-io.appspot.com', 'http://danheberden.com/presentations/bower', 'http://jankfree.org/jank-busters-io-2013/template.html', 'https://mkw.st/p/gdd11-berlin-a11y', 'http://samdutton.com/velocity2012'];
// urls = ['http://io13webrtc.appspot.com'];
// for (var i = 0; i != urls.length; ++i) {
//   requestPresentation(urls[i]);
// }

function requestPresentation(url){
  request({uri: url}, function(error, response, body){
    if (error) {
      console.log('>>> Error', error)
    } else if (response.statusCode == 200) {
      jsdom.env({
        html: body,
        // scripts: [
        //   'http://localhost:8888/node/request/js/lib/jquery-2.0.0.min.js'
        // ]
      }, function(error, window){handleResponse(error, window, url)});
    }

  });
}

function handleResponse(error, window, url) {
  var presentation = {
    slides: [],
    url: url
  };
  // cope with different document formats
  var d =  window.document;
  var slideElements;
  if (d.querySelectorAll('slide').length > 0){
    slideElements = d.querySelectorAll('slide');
  } else if (d.querySelectorAll('article').length > 0){
    slideElements = d.querySelectorAll('article');
  } else if (d.querySelectorAll('section').length > 0){
    slideElements = d.querySelectorAll('section');
  } else {
    console.log('Could not find element name for slides');
    return;
  }

  for (var i = 0; i !== slideElements.length; ++i){
    var slide = {
      slideNumber: i + 1
    };
    var slideElement = slideElements[i];
    slide.text = getText(slideElement);

    var h1 = slideElement.querySelector('h1');
    if (h1 && h1.textContent.trim() !== ''){
      slide.heading = getText(h1);
    }
    var h2 = slideElement.querySelector('h2');
    if (h2 && h2.textContent.trim() !== ''){
      slide.heading = getText(h2);
    }
    var article = slideElement.querySelector('article');
    if (article && article.textContent.trim() !== ''){
      slide.article = getText(article);
    }
    var aside = slideElement.querySelector('aside');
    if (aside && aside.textContent.trim() !== ''){
      slide.aside = getText(aside);
    }

    var images = slideElement.querySelectorAll('img');
    if (images.length){
      slide.images = [];
      for (var j = 0; j != images.length; ++j){
        var image = images[j];
        var alt = image.alt || image.title;
        if (alt && alt.trim() != ''){
          slide.text += ' ' + image.alt;
          slide.images.push({alt: alt, src: image.src});
        }
      }
      if (slide.images.length === 0){
        // remove empty image array caused when no images on the slide have alt attributes
        delete slide.images;
      }
    }
    presentation.slides.push(slide);
  } // each slideElement

  // newer presentations have title inserted dynamically with JavaScript
  var h1 = d.querySelector('h1');
  if (window.document.title){
    presentation.title = window.document.title;
  } else if (h1 && h1.textContent.trim() !== ''){
    presentation.title = getText(h1);
  } else { // last resort
    presentation.title = url.split('\/\/')[1];
  }

    console.log(presentation.title, presentation.slides.length);

}
function getText(element){
  return element.textContent.trim().replace(/\s+/g, ' ');
}
