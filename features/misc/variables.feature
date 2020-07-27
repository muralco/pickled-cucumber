Feature: variable assertion

Scenario: happy path - is
  Given variable P is a
  Then the variable P is "a"

Scenario: happy path - contains
  Given variable P is abc
  Then the variable P contains "b"

Scenario: happy path - matches
  Given variable P is abc
  Then the variable P matches [a-z]

Scenario: happy path - starts with
  Given variable P is abc
  Then the variable P starts with "ab"
