Feature: compare JSON matches X

Scenario: "abc" matches "a"
  Given A is "abc"
  When asserting that A matches "a"
  Then the assertion passes

Scenario: "abc" matches /A/i
  Given A is "abc"
  When asserting that A matches /A/i
  Then the assertion passes

Scenario: "abc" matches "X"
  Given A is "abc"
  When asserting that A matches "X"
  Then the assertion fails with "abc" does not match "/X/"

Scenario: "0" matches ^\d+$
  Given A is 0
  When asserting that A matches ^\d+$
  Then the assertion passes
