$(document).ready(function() {
  // Initialize the carousel
  var options = {
      slidesToScroll: 1,
      slidesToShow: 1,
      loop: true,
      infinite: true, 
      autoplay: false,
      autoplaySpeed: 3000,
  };

  // Initialize the carousel
  var carousel = bulmaCarousel.attach('.results-carousel', options);

  // Add listener to before:show event
  carousel.on('before:show', state => {
      console.log(state);
  });
});