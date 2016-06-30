(function(){
  'use strict';

var app = angular.module('uploaddemo');
     
app.directive("uploader", function ($timeout, $sce, $http) {
        //<uploader control-id="uploader id" app-key="wistia api pwd"></uploader>
        return {
            restrict: 'E',
            templateUrl: "includes/uploader.html",
            replace: true,
            link: link,
            scope: {
                controlId: "@controlId",
                appKey:"@appKey"
            }
        };

        function link(scope, element, attrs) {
        scope.movieId = '';
        scope.progress = 0;
        scope.status = 'idle';
        scope.url = '';

        scope.getStatus = function() {
            $http({
                method: 'GET',
                url: 'https://api.wistia.com/v1/medias/' + scope.movieId + '.json?api_password=' + scope.appKey
                })
                .then(function (response) {
                    scope.status = response.data.status || '';

                    if (scope.status == 'ready')
                        scope.url = $sce.trustAsResourceUrl('http://fast.wistia.net/embed/iframe/' + scope.movieId);
                    else if (scope.status != 'failed') {
                        $timeout(function(){
                        scope.getStatus();
                        }, 3000);
                    }
                });
            };


        $timeout(function(){
            $('#uploader' + scope.controlId).fileupload({
            dataType: 'json',
            formData: {
                api_password: scope.appKey
            },
            add: function (e, data) {
                scope.movieId   = '';
                scope.progress = 0;
                scope.status   = 'uploading';
                scope.url      = '';

                data.submit();
            },
            done: function (e, data) {
                if (data.result.hashed_id != '') {
                scope.movieId = data.result.hashed_id;
                scope.getStatus();
                }
            },
            progress: function (e, data) {
                if (data.total > 0) {
                scope.$apply(function(){
                    scope.progress = parseInt(data.loaded / data.total * 100, 10);
                });
                }
            }
            });
        });
        };
});
})();