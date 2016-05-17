(function () {
  var DOMAIN = 'https://databox2.com'
  var SIGNIN_LINK = 'https://databox2.com/sigin/'
  var ACCOUNT_ENDPOINT = 'api/accounts/new'

  var accURL = {}
  var queryVals = (function (a) {
    if (a === '') return {}
    var b = {}
    for (var i = 0; i < a.length; ++i) {
      var p = a[i].split('=', 2)
      if (p.length === 1) {
        b[p[0]] = ''
      } else {
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '))
      }
    }
    return b
  })(window.location.search.substr(1).split('&'))

  // External source?
  var _domain = queryVals['domain']
  var _accEndpoint = queryVals['acc']

  // Prepare domain
  var parser = document.createElement('a')
  parser.href = (_domain && _domain.length > 0) ? _domain : DOMAIN
  accURL.host = parser.host + '/' // => 'example.com'
  accURL.path = parser.pathname // => '/pathname/'
  accURL.schema = parser.protocol + '//'

  // Prepare account endpoint
  if (_accEndpoint && _accEndpoint.length > 0) {
    ACCOUNT_ENDPOINT = _accEndpoint
  }

  var userOK, nameOK, emailOK, passOK

  var myswiper = new window.Swiper('#swiper-onboarding', {
    pagination: '.swiper-pagination',
    paginationClickable: true,
    allowSwipeToPrev: true
  })

  window.Swiper('.learn-more-swiper-container', {
    pagination: '.swiper-pagination',
    paginationClickable: true,
    autoplay: 5000
  })

  // get elements
  var onboarding = document.getElementById('onboarding')
  var successbox = document.getElementById('successbox')
  var nextBtn = document.getElementById('control-btn-next')
  var skipBtn = document.getElementById('control-btn-skip')
  var form = document.getElementById('form')
  var fields = document.getElementById('fields')
  var gotitBtn = document.getElementById('gotit-btn')
  var signupBtn = document.getElementById('sign-up-btn')
  var accountBtn = document.getElementById('account-btn')
  var userField = document.getElementsByName('username')[0]
  var nameField = document.getElementsByName('name')[0]
  var emailField = document.getElementsByName('email')[0]
  var passField = document.getElementsByName('password')[0]
  // var onboardingControlPanel = document.getElementById('onboarding-control-panel')

  var validateUsername = function (e) {
    if (e.which === 9) {
      return
    }
    userOK = false

    var re = /^[a-zA-Z0-9-]*$/
    var dash = /-{2,}/g
    var username = document.getElementsByName('username')[0].value

    if (username.length === 0) {
      clearError('username-field-status')
    } else {
      if (username.indexOf('-') === 0 ||
       username.lastIndexOf('-') === username.length - 1 ||
       dash.test(username) ||
       !re.test(username)) {
        notValid('username-field-status',
          'Only letters, numbers and single dash characters are allowed for usernames'
          )
      } else {
        isValid('username-field-status')
        checkUsername(username)
      }
    }
    allOK()
  }

  var validateName = function (e) {
    if (e.which === 9) {
      return
    }
    nameOK = false

    var name = document.getElementsByName('name')[0].value
    if (name.length === 0) {
      clearError('name-field-status')
    } else {
      isValid('name-field-status')
      nameOK = true
    }
    allOK()
  }

  var validateEmail = function (e) {
    if (e.which === 9) {
      return
    }
    emailOK = false

    var email = document.getElementsByName('email')[0].value
    if (email.length === 0) {
      clearError('email-field-status')
    } else {
      var re = /^(([^<>()\[\]\.,;:\s@\']+(\.[^<>()\[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i
      if (!re.test(email)) {
        notValid('email-field-status')
      } else {
        isValid('email-field-status')
        emailOK = true
      }
    }
    allOK()
  }

  var validatePass = function (e) {
    if (e.which === 9) {
      return
    }
    passOK = false

    // check password strength
    var password = document.getElementsByName('password')[0]
    var strength = document.getElementById('strength')
    if (password.value.length === 0) {
      strength.innerHTML = ''
      clearError('password-field-status')
    } else if (password.value.length < 8) {
      notValid('password-field-status')
      strength.innerHTML = '(too short)'
      strength.style.color = '#F44336'
    } else {
      var strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{12,})/
      var mediumRegex = /^(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$/
      if (strongRegex.test(password.value)) {
        strength.innerHTML = '(strong)'
        strength.style.color = '#18E883'
      } else if (mediumRegex.test(password.value)) {
        strength.innerHTML = '(good)'
        strength.style.color = '#FFCF5C'
      } else {
        strength.innerHTML = '(weak)'
        strength.style.color = '#E0571E'
      }
      isValid('password-field-status')
      passOK = true
    }
    allOK()
  }

  var checkUsername = function (username) {
    if (username.length > 0) {
      var url = makeURI(username)
      var http = new window.XMLHttpRequest()
      http.open('HEAD', url)
      http.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          userOK = false
          if (this.status === 0) {
            // disconnected
            notValid('username-field-status',
              'Could not connect to server on ' + url
              )
          } else if (this.status === 404) {
            isValid('username-field-status')
            userOK = true
          } else {
            notValid('username-field-status',
              'Username taken! Try another one or <a href="' +
              SIGNIN_LINK + '">sign in</a>.'
              )
          }
          allOK()
        }
      }
      http.send()
    }
  }

  var createAccount = function () {
    var username = document.getElementsByName('username')[0].value
    var name = document.getElementsByName('name')[0].value
    var email = document.getElementsByName('email')[0].value
    if (username.length > 0) {
      fields.setAttribute('disabled', true)
      signupBtn.classList.add('disabled')
      var url = makeURI(username) + ACCOUNT_ENDPOINT
      var data = 'username=' + username + '&email=' + email + '&name=' + name
      var http = new window.XMLHttpRequest()
      http.open('POST', url)
      http.withCredentials = true
      http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      http.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status >= 200 && this.status < 300) {
            var webid = this.getResponseHeader('User')
            if (webid && webid.length > 0) {
              // all done
              form.style.display = 'none'
              successbox.style.display = 'flex'
              // see if we have to redirect
              var origin = queryVals['origin']
              if (origin) {
                accountBtn.innerHTML = 'Take me back to the app'
                accountBtn.addEventListener('click', function () {
                  window.location.replace(origin)
                }, false)
                // redirect back to app
                returnToApp(webid, origin)
              } else {
                accountBtn.innerHTML = 'Take me to my Solid dashboard'
                accountBtn.addEventListener('click', function () {
                  window.location.replace(makeURI(username))
                }, false)
              }
            }
          } else {
            console.log('Error creating account at', url)
            fields.setAttribute('disabled', false)
            signupBtn.classList.remove('disabled')
          }
        }
      }
      http.send(data)
    }
  }

  var allOK = function () {
    if (userOK && nameOK && emailOK && passOK) {
      signupBtn.classList.remove('disabled')
      return true
    } else {
      signupBtn.classList.add('disabled')
    }
    return false
  }

  var clearError = function (elemId) {
    document.getElementById(elemId).innerHTML = ''
    var errorBox = document.getElementById('errorbox')
    var errElem = document.getElementById(elemId + '-error')
    if (errElem) {
      errElem.parentNode.removeChild(errElem)
    }
    if (errorBox.style.display === 'block') {
      errorBox.style.display = 'none'
    }
  }

  var isValid = function (elemId) {
    clearError(elemId)
    document.getElementById(elemId).innerHTML = '<img src="assets/img/ok-status.svg" height="15" alt="">'
  }

  var notValid = function (elemId, msg) {
    var parent = document.getElementById(elemId)
    parent.innerHTML = '<img src="assets/img/not-ok-status.svg" height="15" alt="">'
    if (msg) {
      var errId = elemId + '-error'
      var errorBox = document.getElementById('errorbox')
      errorBox.style.display = 'block'
      var errElem = document.getElementById(errId)
      if (!errElem) {
        var li = document.createElement('li')
        li.id = errId
        li.innerHTML = msg
        errorBox.appendChild(li)
      }
    }
  }

  var makeURI = function (username) {
    if (username.length > 0) {
      return accURL.schema + username + '.' + accURL.host
    }
    return null
  }

  // redirect back to app
  var returnToApp = function (webid, origin) {
    if (!origin || origin.length === 0) {
      origin = '*'
    }
    // send to parent window
    if (window.opener) {
      window.opener.postMessage('User:' + webid, origin)
      window.close()
    } else {
      // send to parent iframe creator
      window.parent.postMessage('User:' + webid, origin)
    }
  }

  // throttle functions (useful for ajax requests)
  // function throttle (func, wait) {
  //   var timeout
  //   return function () {
  //     var context = this
  //     var args = arguments
  //     if (!timeout) {
  //       timeout = window.setTimeout(function () {
  //         timeout = null
  //         func.apply(context, args)
  //       }, wait)
  //     }
  //   }
  // }

  // add event listeners
  nextBtn.addEventListener('click', function () {
    myswiper.slideNext(false, 300)
  }, false)

  skipBtn.addEventListener('click', function () {
    onboarding.style.display = 'none'
  }, false)

  gotitBtn.addEventListener('click', function () {
    onboarding.style.display = 'none'
  }, false)

  signupBtn.addEventListener('click', function () {
    createAccount()
  }, false)

  form.addEventListener('keypress', function (e) {
    if (e.which === 13 && allOK()) {
      createAccount()
    }
  })

  userField.addEventListener('input', validateUsername, false)

  nameField.addEventListener('input', validateName, false)

  emailField.addEventListener('input', validateEmail, false)

  passField.addEventListener('input', validatePass, false)
})()
