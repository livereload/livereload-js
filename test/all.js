if (typeof window === 'undefined') {
  window = {
    location: { hostname: 'localhost' }
  };
}

require('./connector_test');
require('./options_test');
require('./protocol_test');
require('./timer_test');
