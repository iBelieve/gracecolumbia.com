var app = new Vue({
  el: '#services',
  data: { upcomingEvents: [] },
  filters: {
    date: function(date) {
      // February 13th @ 7:00pm
      return moment(date).format('dddd, MMMM Do @ h:mma')
    }
  },
  delimiters: ['<%', '%>']
})

fetch('https://gracecolumbia-events.now.sh/')
  .then(response => response.json())
  .then(events => {
    $('#special-services').fadeIn()
    app.upcomingEvents = events.reverse()
  })

$(function() {
  // Smooth scroll anchor links
  $('a').on('click', function(e) {
    if (this.hash !== '') {
      e.preventDefault()
      var hash = this.hash
      $('html, body').animate(
        {
          scrollTop: $(hash).offset().top
        },
        500,
        function() {
          window.location.hash = hash
        }
      )
    }
  })
})
