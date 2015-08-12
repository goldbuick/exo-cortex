(function() {

  require({
    urlArgs: "b=" + ((new Date()).getTime()),
    paths: {
      jquery: 'vendor/jquery/jquery'
    }
  }, ['app/example-view'], function(ExampleView) {
    var view = new ExampleView();
    view.render('body');
  });

}).call(this);
