/*\
title: missing/program.js
type: application/javascript
module-type: library

Missing test

\*/


var test = require('test');
try {
    require('bogus');
    test.print('FAIL require throws error when module missing', 'fail');
} catch (exception) {
    test.print('PASS require throws error when module missing', 'pass');
}
test.print('DONE', 'info');

