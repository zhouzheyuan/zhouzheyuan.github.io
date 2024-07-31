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
    resetAndPlayVideos(this, state.currentSlide);
  });

  // Initialize canplay listeners for each video
  initializeCanPlayListeners($(carousels[i]).find('.item').find('video'));
}

// Reset and play the videos in the current slide
function resetAndPlayVideos(carouselInstance, slide) {
  $(slide).find('video').each(function() {
    var videoElement = this;

    // Check if the video is ready to be played
    if (videoElement.readyState >= 4) { // 4 is the HAVE_ENOUGH_DATA state
      videoElement.currentTime = 0;
      videoElement.play().catch(function(error) {
        console.error('Error playing video:', error);
      });
    } else {
      // If not ready, we rely on the canplay event listener
    }
  });
}

// Initialize canplay listeners for all videos
function initializeCanPlayListeners(videos) {
  videos.each(function() {
    var videoElement = this;
    // Listen for the canplay event to ensure the video is ready before playing
    videoElement.addEventListener('canplay', function() {
      videoElement.currentTime = 0;
      videoElement.play().catch(function(error) {
        console.error('Error playing video:', error);
      });
    }, { once: true });
  });
}

});