Feature: compare JSON has keys X

Scenario: {} does not have keys []
  Given A is {}
  When asserting that A does not have keys []
  Then the assertion passes

Scenario: { "a": 1 } does not have keys ["b"]
  Given A is { "a": 1 }
  When asserting that A does not have keys ["b"]
  Then the assertion passes

Scenario: { "a": 1 } does not have keys ["b", "c"]
  Given A is { "a": 1 }
  When asserting that A does not have keys ["b", "c"]
  Then the assertion passes

Scenario: { "a": 1 } does not have keys ["a"]
  Given A is { "a": 1 }
  When asserting that A does not have keys ["a"]
  Then the assertion fails with {"a":1} has key ["a"]

Scenario: { "a": 1, "b": 2 } does not have keys ["a"]
  Given A is { "a": 1, "b": 2 }
  When asserting that A does not have keys ["a"]
  Then the assertion fails with {"a":1,"b":2} has key ["a"]

Scenario: { "a": 1, "b": 2 } does not have keys ["a", "b"]
  Given A is { "a": 1, "b": 2 }
  When asserting that A does not have keys ["a", "b"]
  Then the assertion fails with {"a":1,"b":2} has keys ["a","b"]
