# ruff: noqa: ANN201, S101
"""Test the UI for cAnnections using pytest and Selenium.

Silenced Ruff checks
--------------------
- ANN201: None of the test functions return anything. It'd only add
          visual clutter
- S101:   Assertions are necessary as this is a test framework
"""

from tests.game_page import GamePage


def test_title(page: GamePage):
    assert page.title == "cAnnections: Connections, but about us"
