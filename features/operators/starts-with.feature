Feature: compare JSON starts with X

Scenario: "abc" starts with "a"
  Given A is "abc"
  When asserting that A starts with "a"
  Then the assertion passes

Scenario: "abc" starts with "X"
  Given A is "abc"
  When asserting that A starts with "X"
  Then the assertion fails with "abc" does not start with "X"
