if (typeof window === 'undefined') {
  window = {
    location: { hostname: 'localhost' }
  };
}


require('coffee-script/register');
require('./connector_test');
require('./options_test');
require('./protocol_test');
require('./timer_test');
