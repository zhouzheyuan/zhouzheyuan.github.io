$(document).ready(function() {
  // Initialize the carousel
  var options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: false, // Set to false if you want to control the play manually
    autoplaySpeed: 3000,
  };

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach('.carousel', options);

  // Loop on each carousel initialized
  for (var i = 0; i < carousels.length; i++) {
    // Add listener to after:show event
    carousels[i].on('after:show', function(state) {
      // Reset and play the videos in the current slide after the carousel has finished switching
      resetAndPlayVideos(state.currentSlide);
    });
  }

  // Ensure all videos are paused and set to the beginning
  function resetAllVideos() {
    $('.sync-video').each(function() {
      this.currentTime = 0;
      this.pause();
    });
  }

  // Reset and play the videos in the current slide
  function resetAndPlayVideos(slide) {
    $(slide).find('.sync-video').each(function() {
      this.currentTime = 0; // Reset video to start
      this.play(); // Play the video
    });
  }

  // Call resetAllVideos to ensure all videos are paused and at the beginning
  resetAllVideos();
});