Feature: on tear down

Scenario: in this test we just increment a global a couple of times
  When incrementing the value of the global initialTen
  And incrementing the value of the global initialTen
  And incrementing the value of the global initialTen
  And incrementing the value of the global initialTen
  Then the value of the global initialTen is 14

Scenario: now we can check that the global was reset to the original value
  Then the value of the global initialTen is 10
