Feature: compare JSON contains X

Scenario: "a1c" does not contain b
  Given A is "a1c"
  When asserting that A does not contain "b"
  Then the assertion passes

Scenario: "abc" does not contain b
  Given A is "abc"
  When asserting that A does not contain "b"
  Then the assertion fails with "abc" contains "b"
