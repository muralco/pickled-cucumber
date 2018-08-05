Feature: compare JSON has keys X

Scenario: {} has keys []
  Given A is {}
  When asserting that A has keys []
  Then the assertion passes

Scenario: { "a": 1 } has keys ["a"]
  Given A is { "a": 1 }
  When asserting that A has keys ["a"]
  Then the assertion passes

Scenario: { "a": 1, "b": 2 } has keys ["a"]
  Given A is { "a": 1, "b": 2 }
  When asserting that A has keys ["a"]
  Then the assertion passes

Scenario: { "a": 1, "b": 2 } has keys ["a", "b"]
  Given A is { "a": 1, "b": 2 }
  When asserting that A has keys ["a", "b"]
  Then the assertion passes

Scenario: { "a": 1 } has keys ["b"]
  Given A is { "a": 1 }
  When asserting that A has keys ["b"]
  Then the assertion fails with {"a":1} does not have key ["b"]

Scenario: { "a": 1 } has keys ["b", "c"]
  Given A is { "a": 1 }
  When asserting that A has keys ["b", "c"]
  Then the assertion fails with {"a":1} does not have keys ["b","c"]
