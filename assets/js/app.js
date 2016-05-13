(function () {
  var DOMAIN = 'https://databox2.com'
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
    var username = document.getElementsByName('username')[0].value
    // cleaup
    username = username.toLowerCase().replace(/\s+/g, '-')
    if (username.indexOf('-') === 0) {
      username = username.slice(1)
    }
    if (username.lastIndexOf('-') === username.length - 1) {
      username = username.slice(0, -1)
    }

    document.getElementsByName('username')[0].value = username
    var re = /^[a-z0-9-]*$/
    if (username.length === 0 || !re.test(username)) {
      notValid('username-field-status',
        'Only letters, numbers and dash characters are allowed for usernames'
        )
      userOK = false
    } else {
      isValid('username-field-status')
      checkUsername(username)
    }
    allOK()
  }

  var validateName = function (e) {
    if (e.which === 9) {
      return
    }
    var name = document.getElementsByName('name')[0].value
    if (name.length === 0) {
      notValid('name-field-status', 'Your name cannot be empty')
      nameOK = false
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
    var email = document.getElementsByName('email')[0].value
    var re = /^(([^<>()\[\]\.,;:\s@\']+(\.[^<>()\[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i
    if (email.length === 0 || !re.test(email)) {
      notValid('email-field-status', 'Please provide a valid email address')
      emailOK = false
    } else {
      isValid('email-field-status')
      emailOK = true
    }
    allOK()
  }

  var validatePass = function (e) {
    if (e.which === 9) {
      return
    }
    var password = document.getElementsByName('password')[0].value
    if (password.length < 8) {
      notValid('password-field-status', 'Minimum password length is 8 characters')
      passOK = false
    } else {
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
              'Username taken! Please choose another one'
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
    }
    return false
  }

  var isValid = function (elemId) {
    document.getElementById(elemId).innerHTML = '<img src="assets/img/ok-status.svg" height="15" alt="">'
    var errorBox = document.getElementById('errorbox')
    var errElem = document.getElementById(elemId + '-error')
    if (errElem) {
      errElem.parentNode.removeChild(errElem)
      // errElem.parentNode.innerHTML = ''
    }
    // console.log('Inner L', errorBox.innerHTML.length, '"' + errorBox.innerHTML + '"')
    if (errorBox.style.display === 'block') {
      if (errorBox.childNodes.length === 1 && errorBox.childNodes[0].nodeType === 3) {
        errorBox.style.display = 'none'
      }
    }
  }

  var notValid = function (elemId, msg) {
    var parent = document.getElementById(elemId)
    parent.innerHTML = '<img src="assets/img/not-ok-status.svg" height="15" alt="">'
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
  function throttle (func, wait) {
    var timeout
    return function () {
      var context = this
      var args = arguments
      if (!timeout) {
        timeout = window.setTimeout(function () {
          timeout = null
          func.apply(context, args)
        }, wait)
      }
    }
  }

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

  userField.addEventListener('keyup', throttle(validateUsername, 500), false)

  nameField.addEventListener('keyup', validateName, false)

  emailField.addEventListener('keyup', validateEmail, false)

  passField.addEventListener('keyup', validatePass, false)
})()
