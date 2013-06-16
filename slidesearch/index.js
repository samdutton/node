var nano = require('nano')('http://localhost:5984');
var jsdom = require('jsdom');
var request = require('request');
var localCouchName = 'presentations';
var remoteCouchName = 'https://chrome.iriscouch.com:6984/presentations';
var presentations;
var presentationURLs;

nano.db.destroy(localCouchName, function() {
  nano.db.create(localCouchName, function() {
    presentations = nano.use(localCouchName);
    getPresentationURLs();
  });
});

function insertOrUpdateDoc(db, doc, key, isInsertAttempted) {
  db.insert(doc, function (error, body, header) {
    if (error) {
      if (error.error === 'conflict' && !isInsertAttempted) {
        return db.get(key, function(error, doc) {
          doc._rev = doc._rev;
          insertOrUpdateDoc(db, doc, key, true);
        });
      } else {
        console.log('>>> insertOrUpdateDoc() error:', error);
      }
    } else {
//      console.log('Inserted ', doc.url);
        nano.db.get(localCouchName, function(error, body) {
        if (error) {
          console.log('nano.db.get error:', error);
        } else {
          if (body.doc_count === presentationURLs.length) {
            // maybe add timeout to replicate regardless
            // in case of XHR problems getting presentations
            console.log('nano.db.get successful:', body.doc_count);

            nano.db.replicate(localCouchName, remoteCouchName, {create_target:true},
              function(error, body) {
                if (error) {
                console.log('>>> nano.db.replicate() error:', error);
                } else {
                  console.log('nano.db.replicate() success', body);
                }
            });
          }
        }
      });
    }
  });
}

function insertOrUpdatePresentation(presentation){
  insertOrUpdateDoc(presentations, presentation, presentation.url, false);
}

function handleURLs(error, window, url) {
  var presentation = {
    slides: [],
    url: url
  };
  var d =  window.document;
  var slides = [];
}

// spreadsheet listing URLs for presentations
var SPREADSHEET_URL = 'https://docs.google.com/spreadsheet/pub?key=0AtxlQg9XpugsdGVUTi1QbUdYbnNTd0tzUHlFZGRaUnc&single=true&gid=0&output=csv';

function getPresentationURLs(){
  request(
    {uri: SPREADSHEET_URL},
    function(error, response, body){
      if (error) {
        console.log('>>> Error getting presentations URLs', error)
      } else if (response.statusCode == 200) {
        presentationURLs = body.split('\n');
        for (var i = 0; i != presentationURLs.length; ++i) {
          requestPresentation(presentationURLs[i]);
        }
      }
    }
  );
}

function requestPresentation(url){
  request({uri: url}, function(error, response, body){
    if (error) {
      console.log('>>> Error getting presentation ' + url + ":", error);
      var index = array.indexOf(url);
      presentationURLs.splice(index, 1); // to maintain list of viable URLs
    } else if (response.statusCode == 200) {
      jsdom.env({
        html: body,
        // scripts: [
        //   'http://localhost:8888/node/request/js/lib/jquery-2.0.0.min.js'
        // ]
      }, function(error, window){handlePresentation(error, window, url)});
    }

  });
}

// each slide may have a heading, article, aside (speaker notes) or images
function addSlideData(presentation, slide, slideElement){
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
    for (var i = 0; i != images.length; ++i){
      var image = images[i];
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
}

function handlePresentation(error, window, url) {
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
    console.log('Could not find element name for slides for ', url);
    return;
  }

  for (var i = 0; i !== slideElements.length; ++i){
    var slide = {
      slideNumber: i + 1
    };
    addSlideData(presentation, slide, slideElements[i]);
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

//  console.log('Inserting presentation: ', presentation.url, presentation.slides.length);
  insertOrUpdatePresentation(presentation)

//  console.log(presentation.url + ',' + presentation.title + ',(' + presentation.slides.length +' slides)');

}


function getText(element){
  return element.textContent.trim().replace(/\s+/g, ' ');
}
