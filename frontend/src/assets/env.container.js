(function (window) {
    window['env'] = window['env'] || {};
  
    // Environment variables
    window['env']['backend_endpoint'] = '${BACKEND_URL}';
  })(this);