Feature: Compare approximates

Scenario: Default approximation passes
  Given N is 11.999
  When asserting that N approximates 12
  Then the assertion passes

Scenario: Custom error margin doesn't pass
  Given N is 11.999
  When asserting that N approximates 12 +- 0.0001
  Then the assertion fails with 11.999 is not approximately "12 +- 0.0001"

Scenario: Custom error margin doesn't pass (different writing)
  Given N is 11.999
  When asserting that N approximates 12-+0.0001
  Then the assertion fails with 11.999 is not approximately "12 +- 0.0001"

Scenario: Custom error margin doesn't pass (cute writing)
  Given N is 11.999
  When asserting that N approximates 12±0.0001
  Then the assertion fails with 11.999 is not approximately "12 +- 0.0001"

Scenario: Actual is not a number
  Given N is "hola maquinola"
  When asserting that N approximates 12-+0.001
  Then the assertion fails with "hola maquinola" is not a number and can't approximate "12-+0.001"

Scenario: Expected is not a number with or without error margin
  Given N is 11.99
  When asserting that N approximates pistola
  Then the assertion fails with 11.99 . 'pistola' is not a valid approximation specification. Please use any of the following: <number> or <number> +- <positive-number> "pistola"

Scenario: Negative vs negative number
  Given N is -5.001
  When asserting that N approximates -5
  Then the assertion passes

Scenario: Negative vs positive number
  Given N is -5.001
  When asserting that N approximates 5
  Then the assertion fails with -5.001 is not approximately "5 +- 0.001"

Scenario: Positive vs negative number
  Given N is 5.001
  When asserting that N approximates -5
  Then the assertion fails with 5.001 is not approximately "-5 +- 0.001"

Scenario: Big number
  Given N is 1234567.9999
  When asserting that N approximates 1234568 +- 0.0001
  Then the assertion passes

Scenario: Small number
  Given N is 0.12345679999
  When asserting that N approximates 0.1234568 +- 0.00000000001
  Then the assertion passes  

Scenario: Integer pass
  Given N is 15
  When asserting that N approximates 20 +- 5
  Then the assertion passes  

Scenario: Integer pass bis
  Given N is 25
  When asserting that N approximates 20 +- 5
  Then the assertion passes  

Scenario: Integer fail
  Given N is 27
  When asserting that N approximates 20 +- 5
  Then the assertion fails with 27 is not approximately "20 +- 5"

Scenario: Right in the "middle"
  Given N is 20
  When asserting that N approximates 20 +- 5
  Then the assertion passes

Scenario: Explanation epsilon example
  Given N is 1234567.9999
  When asserting that N approximates 1234568 +- 0.0001
  Then the assertion passes

Scenario: Lot's of digits highest precision
  Given N is 3.141592653589793115997963468544185161590576171875
  When asserting that N approximates 3.141592653589793115997963468544185161590576171875 +- 0.0000000004
  Then the assertion passes