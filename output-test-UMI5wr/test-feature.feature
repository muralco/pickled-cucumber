Feature: test the output module

Scenario: all ok
  When message Hello world is written to stdout
  And message Bye Bye is written to stderr
  Then no error

Scenario: error
  When message Hello world is written to stdout
  And message Bye Bye is written to stderr
  Then error