Feature: not existance

Scenario: A exists
  Given A is { "a": 1 }
  When asserting that A does not exist in context
  Then the assertion fails with {"a":1} is not falsey

Scenario: B does not exist
  Given A is { "a": 1 }
  When asserting that B does not exist in context
  Then the assertion passes
