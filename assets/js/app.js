(function() {
    var DOMAIN = 'https://databox.me';
    var ACCOUNT_ENDPOINT = ',system/newAccount';
    var CERT_ENDPOINT = ',system/newCert';

    var accURL = {};
    var queryVals = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    // External source?
    var _domain = queryVals['domain'];
    var _accEndpoint = queryVals['acc'];
    var _crtEndpoint = queryVals['crt'];

    // Prepare domain
    var parser = document.createElement('a');
    parser.href = (_domain && _domain.length > 0)?_domain:DOMAIN;
    accURL.host = parser.host + '/'; // => "example.com"
    accURL.path = parser.pathname; // => "/pathname/"
    accURL.schema = parser.protocol + '//';

    // Prepare account endpoint
    if (_accEndpoint && _accEndpoint.length > 0) {
      ACCOUNT_ENDPOINT = _accEndpoint;
    }
    // Prepare cert endpoint
    if (_crtEndpoint && _crtEndpoint.length > 0) {
      CERT_ENDPOINT = _crtEndpoint;
    }

    var userOK, nameOK, emailOK, passOK;

    var myswiper = new Swiper('#swiper-onboarding', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        allowSwipeToPrev: false
    });

    var learnmoreswiper = new Swiper('.learn-more-swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        autoplay: 5000
        //allowSwipeToPrev: false
    });


    // get elements
    var onboarding = document.getElementById('onboarding');
    var successbox = document.getElementById('successbox');
    var nextBtn = document.getElementById('control-btn-next');
    var skipBtn = document.getElementById('control-btn-skip');
    var form = document.getElementById('form');
    var signupBtn = document.getElementById('sign-up-btn');
    var accountBtn = document.getElementById('account-btn');
    var userField = document.getElementsByName("username")[0];
    var nameField = document.getElementsByName("name")[0];
    var emailField = document.getElementsByName("email")[0];
    var passField = document.getElementsByName("password")[0];
    var onboardingControlPanel = document.getElementById('onboarding-control-panel');

    var validateUsername = function() {
      var username = document.getElementsByName("username")[0].value;
      // cleaup
      username = username.toLowerCase().replace(/\s+/g, '-');
      if (username.indexOf('-') === 0) {
        username = username.slice(1);
      }
      if (username.lastIndexOf('-') === username.length - 1) {
        username = username.slice(0, -1)
      }

      document.getElementsByName("username")[0].value = username;
      var re = /^[a-zA-Z0-9-_]*$/;
      if (username.length === 0 || !re.test(username)) {
        console.log("Bad username field!", username);
        notValid("username-field-status");
        userOK = false;
      } else {
        console.log("Username looks good!", username);
        isValid("username-field-status");
        checkUsername(username);
      }
      allOK();
    }

    var validateName = function() {
      var name = document.getElementsByName("name")[0].value;
      if (name.length === 0) {
          console.log("Bad name field!", name);
          notValid("name-field-status");
          nameOK = false;
      } else {
          console.log("Name field looks good!", name);
          isValid("name-field-status");
          nameOK = true;
      }
      allOK();
    }

    var validateEmail = function() {
      var email = document.getElementsByName("email")[0].value;
      var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (email.length === 0 || !re.test(email)) {
        console.log("Malformed email!", email);
        notValid("email-field-status");
        emailOK = false;
      } else {
        console.log("Good email!", email);
        isValid("email-field-status");
        emailOK = true;
      }
      allOK();
    }

    var validatePass = function() {
      var password = document.getElementsByName("password")[0].value;
      if (password.length < 8) {
          console.log("Password is too short!", password.length);
          notValid("password-field-status");
          passOK = false;
      } else {
          console.log("Password field looks good!", password.length);
          isValid("password-field-status");
          passOK = true;
      }
      allOK();
    }

    var checkUsername = function(username) {
      if (username.length > 0) {
        var url = makeURI(username);
        var http = new XMLHttpRequest();
        http.open('HEAD', url);
        http.onreadystatechange = function() {
          console.log(this.status)
            if (this.readyState == this.DONE) {
              if (this.status === 0) {
                // disconnected
                console.log("Could not connect to server on", url);
                userOK = false;
              } else if (this.status === 404) {
                console.log("Account available!", url)
                isValid("username-field-status");
                userOK = true;
              } else {
                console.log("Account is taken!", url)
                notValid("username-field-status");
                userOK = false;
              }
              allOK();
            }
        };
        http.send();
      }
    }

    var createAccount = function() {
      var username = document.getElementsByName("username")[0].value;
      var name = document.getElementsByName("name")[0].value;
      var email = document.getElementsByName("email")[0].value;
      if (username.length > 0) {
        var url = makeURI(username) + ACCOUNT_ENDPOINT;
        var data = "username="+username+"&email="+email+"&name="+name;
        var http = new XMLHttpRequest();
        http.open('POST', url);
        http.withCredentials = true;
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        http.onreadystatechange = function() {
          if (this.readyState == this.DONE) {
            if (this.status >= 200 && this.status < 300) {
              var webid = this.getResponseHeader("User");
              if (webid && webid.length > 0) {
                // document.getElementById("webid").value = webid;
                console.log('Your new WebID is', webid);
                // all done
                form.style.display = "none";
                successbox.style.display = "flex";

                // see if we have to redirect
                var origin = queryVals['origin'];
                if (origin) {
                  accountBtn.innerHTML = "Take me back to the app";
                  accountBtn.addEventListener('click', function() {
                      window.location.replace(origin);
                  }, false);

                  returnToApp(webid, origin);
                } else {
                  accountBtn.innerHTML = "Take me to my Solid dashboard";
                  accountBtn.addEventListener('click', function() {
                      window.location.replace(makeURI(username));
                  }, false);
                }
              }
            } else {
              console.log('Error creating account at', url);
            }
          }
        };
        http.send(data);
      }
    }

    var allOK = function() {
      if (userOK && nameOK && emailOK && passOK) {
        signupBtn.classList.remove("disabled");
      }
    }

    var isValid = function(elemId) {
      document.getElementById(elemId).
        innerHTML = '<img src="assets/img/ok-status.svg" height="15" alt="">';
    }

    var notValid = function(elemId) {
      document.getElementById(elemId).
        innerHTML = '<img src="assets/img/not-ok-status.svg" height="15" alt="">';
    }

    var makeURI = function(username) {
      if (username.length > 0) {
        return accURL.schema + username + '.' + accURL.host;
      }
      return null;
    }

    // redirect back to app
    var returnToApp = function(webid, origin) {
      if (!origin || origin.length === 0) {
        origin = '*';
      }
      // send to parent window
      if (window.opener) {
        window.opener.postMessage('User:'+webid, origin);
        window.close();
      } else {
        // send to parent iframe creator
        parent.postMessage('User:'+webid, origin);
      }
    };

    // throttle functions (useful for ajax requests)
    function throttle(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            if (!timeout) {
                timeout = window.setTimeout(function() {
                    timeout = null;
                    func.apply(context, args);
                }, wait);
            }
        }
    }

    // add event listeners
    nextBtn.addEventListener('click', function() {
        myswiper.slideNext(false, 300);
    }, false);

    skipBtn.addEventListener('click', function() {
        onboarding.style.display = 'none';
    }, false);

    signupBtn.addEventListener('click', function() {
        createAccount();
    }, false);

    userField.addEventListener('keyup', throttle(validateUsername, 500), false);

    nameField.addEventListener('keyup', validateName, false);

    emailField.addEventListener('keyup', validateEmail, false);

    passField.addEventListener('keyup', validatePass, false);
})();
