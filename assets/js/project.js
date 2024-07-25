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

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach('.carousel', options);

  // Loop on each carousel initialized
  for (var i = 0; i < carousels.length; i++) {
    // Add listeners to events
    carousels[i].on('before:show', function(state) {
      // Pause all videos when the carousel is about to switch
      pauseVideos(state.currentSlide);
    });

    carousels[i].on('after:show', function(state) {
      // Play the videos in the current slide after the carousel has finished switching
      playVideos(state.currentSlide);
    });
  }

  function pauseVideos(slide) {
    $(slide).find('video').each(function() {
      this.pause();
    });
  }

  function playVideos(slide) {
    $(slide).find('video').each(function() {
      this.play();
    });
  }
});