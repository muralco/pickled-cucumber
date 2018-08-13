Feature: http

Scenario: query github
  When GET https://api.github.com/users/muralco
  Then the response is 200 and the payload at login is "muralco"
  And the response payload at name is "MURAL"
  And the response text contains "MURAL"
  And the response headers at content-type is "application/json; charset=utf-8"