(function () {

  var inputs = document.getElementsByTagName('input')



  for(var i in inputs) {
      (function () {

          var input = inputs[i]

          input.addEventListener('focus', function() {
              if(input.parentNode.className.indexOf('active') >= 0) {
                  input.parentNode.className = input.parentNode.className.replace(' active', '')
              } else {
                  input.parentNode.className += ' active';
              }

          }, false)

      }())
  }


})()
