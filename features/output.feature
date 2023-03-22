Feature: capture and suppress output

Background:
  Given step definition
  """
  const fn: SetupFn = ({ Given, Then }) => {
    Given('message (.*) is written to stdout', (msg) => console.log(msg));
    Given('message (.*) is written to stderr', (msg) => console.error(msg));
    Then('no error', () => {});
    Then('error', () => {throw new Error('Error')});
  }
  """
  And feature file is
  """
  Feature: test the output module

  Scenario: all ok
    When message Hello world is written to stdout
    And message Bye Bye is written to stderr
    Then no error

  Scenario: error
    When message Hello world is written to stdout
    And message Bye Bye is written to stderr
    Then error
  """

Scenario: Capture and suppression disabled
  When the suite is executed
  Then stdout contains
  """
  logged-on-initial-context-stdout
  .Hello world
  ....logged-on-initial-context-stdout
  .Hello world
  ..F.

  Failures:

  1) Scenario: error
     ✔ Before
     ✔ When message Hello world is written to stdout
     ✔ And message Bye Bye is written to stderr
     ✖ Then error
         Error: Error
     ✔ After

  2 scenarios (1 failed, 1 passed)
  6 steps (1 failed, 5 passed)
  """
  And stderr contains
  """
  logged-on-initial-context-stderr
  Bye Bye
  logged-on-initial-context-stderr
  Bye Bye
  """

Scenario: Capture enabled and suppression disabled
  Given stdio output is captured
  When the suite is executed
  Then stdout contains
  """
  .logged-on-initial-context-stdout
  .Hello world
  .....logged-on-initial-context-stdout
  .Hello world
  ..F.

  Failures:

  1) Scenario: error
     ✔ Before
     ✔ Before
     ✔ When message Hello world is written to stdout
     ✔ And message Bye Bye is written to stderr
     ✖ Then error
         Error: Error

         Captured Output
         ===============
         Std Err
         -------
         logged-on-initial-context-stderr
         Bye Bye


         Std Out
         -------
         logged-on-initial-context-stdout
         Hello world

     ✔ After

  2 scenarios (1 failed, 1 passed)
  6 steps (1 failed, 5 passed)
  """
  And stderr contains
  """
  logged-on-initial-context-stderr
  Bye Bye
  logged-on-initial-context-stderr
  Bye Bye
  """

Scenario: Capture enabled and suppression enabled
  Given stdio output is captured
  And stdio output is suppressed
  When the suite is executed
  Then stdout contains
  """
  ..........F.

  Failures:

  1) Scenario: error
     ✔ Before
     ✔ Before
     ✔ When message Hello world is written to stdout
     ✔ And message Bye Bye is written to stderr
     ✖ Then error
         Error: Error

         Captured Output
         ===============
         Std Err
         -------
         logged-on-initial-context-stderr
         Bye Bye


         Std Out
         -------
         logged-on-initial-context-stdout
         Hello world

     ✔ After

  2 scenarios (1 failed, 1 passed)
  6 steps (1 failed, 5 passed)
  """
  And stderr contains
  """
  """

Scenario: Capture disabled and suppression enabled
  Given stdio output is suppressed
  When the suite is executed
  Then stdout contains
  """
  ..........F.

  Failures:

  1) Scenario: error
     ✔ Before
     ✔ Before
     ✔ When message Hello world is written to stdout
     ✔ And message Bye Bye is written to stderr
     ✖ Then error
         Error: Error
     ✔ After

  2 scenarios (1 failed, 1 passed)
  6 steps (1 failed, 5 passed)
  """
  And stderr contains
  """
  """
