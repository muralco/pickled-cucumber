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
  .Hello world
  .....Hello world
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
  Bye Bye
  Bye Bye
  """

Scenario: Capture enabled and suppression disabled
  Given stdio output is captured
  When the suite is executed
  Then stdout contains
  """
  ..Hello world
  ......Hello world
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
         Bye Bye


         Std Out
         -------
         Hello world

     ✔ After

  2 scenarios (1 failed, 1 passed)
  6 steps (1 failed, 5 passed)
  """
  And stderr contains
  """
  Bye Bye
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
         Bye Bye


         Std Out
         -------
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

Scenario: Debug enabled and capture and supression enabled
  Given feature file is
  """
  Feature: test with debug
  Scenario: all ok
    When message Hello world is written to stdout
    And message Bye Bye is written to stderr
    Then no error
  """
  Given stdio output is captured
  And stdio output is suppressed
  And debug module is enabled
  When the suite is executed
  Then stdout contains
  """
  .Hello world
  ....

  1 scenario (1 passed)
  3 steps (3 passed)
  """
  And stderr contains
  """
  Bye Bye
  """
