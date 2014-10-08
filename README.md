SimpleRestServer
================

Written in node.js

How-to:
=======

First log in using PUT/POST /login/%username% and sending {"password" : "qwerty"} (test,123 or usr1,qqq in this case)

DELETE /login/%username% to log out

GET /%vtablename% - contents of %tablename%

GET /%vtablename%/%key% - search for value with the key == %key%

PUT/POST /%vtablename% with {"key" : %key%, "value" : %value} - put %value% in the table with the key == %key%

PUT/POST /%vtablename%/%key% with {"value" : %value} - put %value% in the table with the key == %key%

DELETE /%vtablename%/%key% - delete value with the key == %key% from the table
