/*global Atomic:true, console:true */

// page.js file

// Button with Debug Tracer wiring
Atomic.load('components/button', 'wirings/debugtracer')
.then(Atomic.expand(function(Button, debugtracer) {
  // build the button and add echo wiring
  var button = new Button(document.getElementById('my-button'));
  button.wireIn(debugtracer());

  button.load()
  .then(function() {
    console.log('The Button with Debug Tracer wiring has loaded');
  }, Atomic.thrower);
}), Atomic.thrower);

// Carousel with Buttons
// do not enable: scoping issue problems
// Atomic.load('components/button', 'components/carousel')
// .then(Atomic.expand(function(Button, Carousel) {
//   var next = new Button(document.getElementById('carousel-next'));
//   var prev = new Button(document.getElementById('carousel-prev'));
//   var carousel = new Carousel(document.getElementById('carousel'));

//   carousel.nodes.Items = document.getElementById('carousel').getElementsByTagName('li');

//   next.on(next.events.USE, function() { alert('hey'); });

//   carousel.load()
//   .then(next.load())
//   .then(prev.load())
//   .then(function() {
//     carousel.bind(next, next.events.USE, 'next');
//     carousel.bind(prev, prev.events.USE, 'previous');
//     console.log('The Carousel with Buttons has been loaded');
//   }, Atomic.thrower);
// }), Atomic.thrower);