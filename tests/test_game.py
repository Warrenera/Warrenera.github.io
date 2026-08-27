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


def test_details(page: GamePage):
    assert page.do_not_find(page.DETAILS_HEADER)
    assert page.do_not_find(page.DETAILS_PARAGRAPHS)
    page.click(page.SUMMARY)
    h3 = page.find(page.DETAILS_HEADER)
    assert h3 == "Merry Christmas 🎄"
    assert page.find_all(page.DETAILS_PARAGRAPHS)
