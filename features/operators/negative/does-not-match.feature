Feature: compare JSON matches X

Scenario: "abc" does not match "a"
  Given A is "abc"
  When asserting that A does not match "a"
  Then the assertion fails with "abc" matches "/a/"

Scenario: "abc" does not match "/A/i"
  Given A is "abc"
  When asserting that A does not match /A/i
  Then the assertion fails with "abc" matches "/A/i"

Scenario: "abc" does not matches "X"
  Given A is "abc"
  When asserting that A does not match "X"
  Then the assertion passes
