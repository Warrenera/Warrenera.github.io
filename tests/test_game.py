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
    """Check the page title is as expected on page load."""
    assert page.title == "cAnnections: Connections, but about us"


def test_details(page: GamePage):
    """Check the details header and body become visible when clicked.

    Also check they become invisible again when clicked a second time.
    """
    assert page.do_not_find(page.DETAILS_HEADER)
    assert page.do_not_find(page.DETAILS_PARAGRAPHS)
    page.toggle_details()
    assert page.find(page.DETAILS_HEADER).text == "Merry Christmas 🎄"
    assert page.find_all(page.DETAILS_PARAGRAPHS)
    page.toggle_details()
    assert page.do_not_find(page.DETAILS_HEADER)
    assert page.do_not_find(page.DETAILS_PARAGRAPHS)
