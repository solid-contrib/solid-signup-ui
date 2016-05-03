(function() {

    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: false
    });

    var nextBtn = document.getElementById('next-button');
    nextBtn.addEventListener('click', function() {
        console.log('qwer');
        swiper.slideNext(false, 300);
    }, true);

})();
