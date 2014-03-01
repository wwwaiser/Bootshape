var showLeftPush = $('#showLeftPush'),
    menuLeft = $('#bootshape-menu-s1'),
    body = $(document.body);

showLeftPush.on('click', function() {
    $(this).toggleClass('active');
    body.toggleClass('bootshape-menu-push-toright');
    menuLeft.toggleClass('bootshape-menu-open');
});