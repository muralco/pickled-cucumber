Feature: http

Scenario: query some API
  When GET https://jsonplaceholder.typicode.com/todos/1
  Then the response is 200 and the payload at id is 1
  And the response payload at completed is false
  And the response text contains "autem"
  And the response headers at content-type is "application/json; charset=utf-8"