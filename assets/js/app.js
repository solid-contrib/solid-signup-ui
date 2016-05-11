(function() {

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
    var signupBtn = document.getElementById('sign-up-btn');
    var userField = document.getElementsByName("username")[0];
    var nameField = document.getElementsByName("name")[0];
    var emailField = document.getElementsByName("email")[0];
    var passField = document.getElementsByName("password")[0];
    var onboardingControlPanel = document.getElementById('onboarding-control-panel');

    // detect end of onboarding
    /*swiper.on('ReachEnd', function () {
        onboardingControlPanel.style.display = 'none';
    });*/

    var validateUsername = function() {
      var username = document.getElementsByName("username")[0].value;
      // cleaup
      username = username.toLowerCase().replace(/\s+/g, '-');
      if (username.indexOf('-') === 0) {
        console.log("Username contains illegal chars!", username);
      } else {
        var re = /^[a-zA-Z0-9-_]*$/;
        if (username.length === 0) {
          console.log("Empty username field!", username);
          // resetAvailability();
        } else if (re.test(username)) {
          console.log("Username looks good!", username);
        } else {
          console.log("Username contains illegal chars!", username);
        }
      }
    }

    var validateName = function() {
      var name = document.getElementsByName("name")[0].value;
      if (name.length === 0) {
          console.log("Empty name field!", name);
      } else {
          console.log("Name field looks good!", name);
      }
    }

    var validateEmail = function() {
      var email = document.getElementsByName("email")[0].value;
      var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (email.length === 0) {
        console.log("Empty email field!", email);
      } else if (!re.test(email)) {
        console.log("Malformed email!", email);
      } else {
        console.log("Good email!", email);
      }
    }

    var validatePass = function() {
      var password = document.getElementsByName("password")[0].value;
      if (password.length < 8) {
          console.log("Password is too short!", password.length);
      } else {
          console.log("Password field looks good!", password.length);
      }
    }

    var checkUsername = function() {
      var account = document.getElementsByName("username")[0].value;
      if (account.indexOf('-') === 0) {
        account = account.slice(1);
      }
      if (account.lastIndexOf('-') === account.length - 1) {
        account = account.slice(0, -1)
      }
      document.getElementById("user").value = account;
      document.getElementById("username").innerHTML = account;
      if (account.length > 0) {
        var url = makeURI(account);
        var http = new XMLHttpRequest();
        http.open('HEAD', url);
        http.onreadystatechange = function() {
          console.log(this.status)
            if (this.readyState == this.DONE) {
              if (this.status === 0) {
                // disconnected
                document.getElementById("status").innerHTML = "<strong>could not connect to server</strong>";
              } else if (this.status === 404) {
                isAvailable(url);
              } else {
                isTaken(url);
              }
            }
        };
        http.send();
      }
    }

    var createAccount = function() {
      var account = document.getElementsByName("username")[0].value;
      var email = document.getElementsByName("email")[0].value;
      if (account.length > 0) {
        var url = makeURI(account) + ACCOUNT_ENDPOINT;
        var data = "username="+account+"&email="+email;
        var http = new XMLHttpRequest();
        http.open('POST', url);
        http.withCredentials = true;
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        http.onreadystatechange = function() {
          if (this.readyState == this.DONE) {
            if (this.status === 200) {
              var webid = this.getResponseHeader("User");
              if (webid && webid.length > 0) {
                document.getElementById("webid").value = webid;
              }
              setStep(2);
            } else {
              console.log('Error creating account at '+url);
              setStep(1);
              isAvailable(url);
            }
          }
        };
        http.send(data);
      }
    }

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
        onboarding.style.display = 'none';
    }, false);

    userField.addEventListener('keyup', throttle(validateUsername, 500), false);

    nameField.addEventListener('keyup', validateName, false);

    emailField.addEventListener('keyup', throttle(validateEmail, 500), false);

    passField.addEventListener('keyup', throttle(validatePass, 500), false);
})();
