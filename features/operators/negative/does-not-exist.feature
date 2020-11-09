Feature: not existance

Scenario: A exists
  Given A is { "a": 1 }
  When asserting that A does not exist in context
  Then the assertion fails with {"a":1} is not falsey

Scenario: MANY_As exist (plural)
  Given MANY_As is [ "a", "a" ]
  When asserting that MANY_As do not exist in context
  Then the assertion fails with ["a","a"] is not falsey

Scenario: B does not exist
  Given A is { "a": 1 }
  When asserting that B does not exist in context
  Then the assertion passes

Scenario: MANY_Bs do no exist (plural)
  Given MANY_As is [ "a", "a" ]
  When asserting that MANY_Bs do not exist in context
  Then the assertion passes