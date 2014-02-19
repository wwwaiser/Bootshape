$(function () {


    $('.scale').hover(function(e) {
        $(e.target).css({"webkitTransform": scale,
            "MozTransform": scale,
            "msTransform": scale,
            "OTransform": scale,
            "transform": scale
        });
    }, function (e) {
        $(e.target).css({"webkitTransform": scaleDef,
            "MozTransform": scaleDef,
            "msTransform": scaleDef,
            "OTransform": scaleDef,
            "transform": scaleDef
        });
    });
});
