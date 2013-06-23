var jsdom = require('jsdom');
var request = require('request');
var localCouchName = 'presentations';
var localHost = 'http://localhost:5984';
var remoteHost = 'https://chrome.iriscouch.com';
var dbName = 'presentations';
var remoteCouchURL = 'https://chrome.iriscouch.com/presentations';
var localCouchDB;
var presentationURLs;
var isReplicated = false;

var nano = require('nano')(localHost);

nano.db.destroy(localCouchName, function() {
  nano.db.create(localCouchName, function() {
    localCouchDB = nano.use(localCouchName);
    getPresentationURLs();
  });
});

function replicate(){
  nano = require('nano')(remoteHost);
  nano.db.destroy(dbName, function() {
    nano.db.create(dbName, function() {
      nano = require('nano')(localHost);
      nano.db.replicate(dbName, remoteCouchURL, {create_target:true},
        function(error, body) {
          if (error) {
            console.log('>>> nano.db.replicate() error:', error);
          } else {
            nano.db.get(localCouchName, function(error, body) {
              if (error) {
                console.log('nano.db.get error:', error);
              } else {
                console.log('Created remote database, doc_count:', body.doc_count);
              }
            });
          }
      });
    });
  });
}


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
        // console.log('Inserted ', doc.url);
        nano.db.get(localCouchName, function(error, body) {
        if (error) {
          console.log('nano.db.get error:', error);
        } else {
          if (body.doc_count === presentationURLs.length && !isReplicated) {
            // maybe add timeout to replicate regardless
            // in case of XHR problems getting presentations
            isReplicated = true; //
            console.log('Created local database, doc_count:', body.doc_count);
            replicate();
          }
        }
      });
    }
  });
}

function insertOrUpdatePresentation(presentation){
  insertOrUpdateDoc(localCouchDB, presentation, presentation.url, false);
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
      var index = presentationURLs.indexOf(url);
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

  var h1 = slideElement.querySelector('h1');
  if (h1 && h1.textContent.trim() !== ''){
    slide.heading = getText(h1);
  }
  var h2 = slideElement.querySelector('h2');
  if (h2 && h2.textContent.trim() !== ''){
    // if both h1 and h2, join them
    slide.heading = h1 ? slide.heading + ' · ' + getText(h2) : getText(h2);
  }
  slide.text += slide.heading;

  var article = slideElement.querySelector('article');
  if (article && article.textContent.trim() !== ''){
    slide.article = getText(article);
  }
  slide.text += slide.article;

  var aside = slideElement.querySelector('aside');
  if (aside && aside.textContent.trim() !== ''){
    slide.aside = getText(aside);
  }
  slide.text += slide.aside;

  var images = slideElement.querySelectorAll('img');
  if (images.length){
    slide.images = [];
    for (var i = 0; i != images.length; ++i){
      var image = images[i];
      var alt = image.alt || image.title;
      if (alt && alt.trim() != ''){
        slide.text += image.alt;
        slide.images.push({alt: alt, src: image.src});
      }
    }
    if (slide.images.length === 0){
      // remove empty image array caused when no images on the slide have alt attributes
      delete slide.images;
    }
  }

  // combine and lowercase text to enable faster search
  slide.text = slide.text.toLowerCase();
  presentation.text += slide.text;
  presentation.slides.push(slide);
}

function handlePresentation(error, window, url) {
  var presentation = {
    slides: [],
    text: '', // combined slide text: duplication of data, but enable faster search
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
      slideNumber: i + 1,
      text: ''
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
