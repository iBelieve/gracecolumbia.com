$(function() {
  // Smooth scroll anchor links
  $('a').on('click', function(e) {
    if (this.hash !== "") {
      e.preventDefault()
      var hash = this.hash
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 500, function() {
        window.location.hash = hash
      })
    }
  })
})
