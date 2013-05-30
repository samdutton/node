var urls = ['http://io13webrtc.appspot.com', 'http://photoschromeapp.appspot.com/', 'http://device-agnostic-development.appspot.com/', 'https://picturesque-app.appspot.com/slides', 'http://goo.gl/mGBFY', 'http://mobile-html.appspot.com', 'http://yt-adaptiveslides.appspot.com', 'http://bit.ly/robust-io13', 'http://goo.gl/mByC8', 'http://goo.gl/s3gej', 'http://www.chriscartland.com/static/io2013/template.html', 'http://goo.gl/UHCS8', 'https://dl.dropboxusercontent.com/u/39519/talks/devtools2013/index.html', 'http://feature-detection-io.appspot.com/', 'http://danheberden.com/presentations/bower/', 'http://jankfree.org/jank-busters-io-2013/template.html'];
// urls = ['http://io13webrtc.appspot.com'];
// for (var i = 0; i != urls.length; ++i) {
//   requestPresentation(urls[i]);
// }

// function requestPresentation(url){
//   request({uri: url}, function(error, response, body){
//     if (error) {
//       console.log('>>> Error', error)
//     } else if (response.statusCode == 200) {
//       jsdom.env({
//         html: body,
//         // scripts: [
//         //   'http://localhost:8888/node/request/js/lib/jquery-2.0.0.min.js'
//         // ]
//       }, function(error, window){handleResponse(error, window, url)});
//     }

//   });
// }

// function handleResponse(error, window, url) {
//   console.log(window.document.title);
//   var presentation = {
//     url: url
//   };

//   var slides = [];
//   var slideElements = window.document.querySelectorAll('slide');
//   for (var i = 0; i !== slideElements.length; ++i){
//     var slide = {
//       slideNumber: i + 1
//     };
//     var slideElement = slideElements[i];
//     slide.text = getText(slideElement);

//     var h2 = slideElement.querySelector('h2');
//     if (h2 && h2.textContent.trim() !== ''){
//       slide.h2 = getText(h2);
//     }
//     var article = slideElement.querySelector('article');
//     if (article && article.textContent.trim() !== ''){
//       slide.article = getText(article);
//     }
//     var aside = slideElement.querySelector('aside');
//     if (aside && aside.textContent.trim() !== ''){
//       slide.aside = getText(aside);
//     }
//     var images = slideElement.querySelectorAll('img');
//     if (images.length){
//       slide.images = [];
//       for (var j = 0; j != images.length; ++j){
//         var image = images[j];
//         var alt = image.alt || image.title;
//         if (alt && alt.trim() != ''){
//           slide.text += ' ' + image.alt;
//           slide.images.push({alt: alt, src: image.src});
//         }
//       }
//       if (slide.images.length === 0){
//         // remove empty image array caused when no images
//         // on the slide have alt attributes
//         delete slide.images;
// //        console.log(slide);
//       }
//     }
//     slides.push(slide);
//   } // each slideElement

//   presentation.slides = slides;

//   var h1 = window.document.querySelector('h1');
//   if (h1 && h1.textContent.trim() !== ''){
//     presentation.h1 = getText(h1);
//   }



//   // if (slides.length != 0)
//   //   console.log(presentation.url, presentation);

//   // for (var k = 0; k !== slides.length; ++k){
//   //   var slide = slides[k];
//   //   console.log(slide);
//   // }
// }

// function getText(element){
//   return element.textContent.trim().replace(/\s+/g, ' ');
// }



var phantom = require('phantom');
phantom.create(function(ph) {

  for (var i = 0; i != urls.length; ++i) {
    var url = urls[i];
    console.log(url);
    getPage(ph, url);
  }

});

function getPage(ph, url){
  ph.createPage(function(page) {
    console.log('>>>> createPage()', url);
    return page.open(url, function(status) {
      console.log('>>>> page.open()');
      console.log("opened? ", status);
      return page.evaluate((function() {
        return document.title;
      }), function(result) {
          console.log('Page title is ' + result);
            return ph.exit();
      });
    });
  });

}
