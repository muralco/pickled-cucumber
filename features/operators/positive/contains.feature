Feature: compare JSON contains X

Scenario: "a1c" contains 1
  Given A is "a1c"
  When asserting that A contains 1
  Then the assertion passes

Scenario: "abc" contains 1
  Given A is "abc"
  When asserting that A contains 1
  Then the assertion fails with "abc" does not contain "1"
