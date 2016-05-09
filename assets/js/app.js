(function() {

    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        //allowSwipeToPrev: false
    });

    var signupswiper = new Swiper('.signup-swiper-container', {
        allowSwipeToPrev: false,
        allowSwipeToNext: false
    });

    // get elements
    var onboarding = document.getElementById('onboarding');
    var nextBtn = document.getElementById('control-btn-next');
    var skipBtn = document.getElementById('control-btn-skip');
    var signupBtn = document.getElementById('sign-up-btn');
    var onboardingControlPanel = document.getElementById('onboarding-control-panel');

    // add event listeners
    nextBtn.addEventListener('click', function() {
        swiper.slideNext(false, 300);
    }, false);

    skipBtn.addEventListener('click', function() {
        onboarding.style.display = 'none';
    }, false);

    signupBtn.addEventListener('click', function() {
        onboarding.style.display = 'none';
    }, false);

    // detect end of onboarding
    swiper.on('ReachEnd', function () {
        //onboardingControlPanel.innerHTML = '<p class="onboarding-done"><button id="control-btn-done" class="control-btn" type="button" name="done">got it</button></p>';
        /*var doneBtn = document.getElementById('control-btn-done')
        doneBtn.addEventListener('click', function() {
            onboarding.style.display = 'none';
        }, false);
        doneBtn.style.display = 'block';*/
        onboardingControlPanel.style.display = 'none';
    });

})();
