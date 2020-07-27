Feature: variable expansion

Scenario: happy path
  Given variable P is "aaabbb"
  And variable Q results from expanding P with
    """
    {
      "aaa": "hello",
      "bbb": ", world!"
    }
    """
  Then variable Q has value "hello, world!"

Scenario: multiple expansion
  Given variable P is "!!👊💀"
  And variable Q results from expanding P with
    """
    {
      "!": "bang, ",
      "👊": "you are ",
      "💀": "dead!"
    }
    """
  Then variable Q has value "bang, bang, you are dead!"

Scenario: multiple expansion (order matters)
  Given variable P is "!, !, 💀"
  And variable Q results from expanding P with
    """
    {
      "💀": "dead!",
      "!": "pool"
    }
    """
  Then variable Q has value "pool, pool, deadpool"

Scenario: multiple expansion (order matters)
  And variable Q results from expanding deeply.nested.string with
    """
    {
      "hello": "goodbye"
    }
    """
  Then variable Q has value goodbye!
