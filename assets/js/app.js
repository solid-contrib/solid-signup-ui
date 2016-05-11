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
    var nextBtn = document.getElementById('control-btn-next');
    var skipBtn = document.getElementById('control-btn-skip');
    var signupBtn = document.getElementById('sign-up-btn');
    var onboardingControlPanel = document.getElementById('onboarding-control-panel');

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

    // detect end of onboarding
    /*swiper.on('ReachEnd', function () {
        onboardingControlPanel.style.display = 'none';
    });*/

})();
