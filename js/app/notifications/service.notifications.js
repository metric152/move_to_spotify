(function(){
    MoveToSpotify.service( NOTIFICATION_SERVICE , Service);
    
    Service.$inject = [];
    
    function Service(){
        var t = new toastr({
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
          });
        
        // Show a success message
        this.success = function(message){
            t.success(message);
        }
        
        // Show an error message
        this.error = function(message){
            t.error(message);
        }
    }
})();

