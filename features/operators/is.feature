Feature: compare JSON is X

Scenario: 1 is 1
  Given A is 1
  When asserting that A is 1
  Then the assertion passes

Scenario: 1 is 2
  Given A is 1
  When asserting that A is 2
  Then the assertion fails with 1 is not 2
