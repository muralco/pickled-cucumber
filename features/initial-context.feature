Feature: initial context

Scenario: verify initial injection
  When incrementing the value of initialFive
  Then the value of initialFive is 6

Scenario: verify the value gets reset for a second test
  When incrementing the value of initialFive
  Then the value of initialFive is 6
