# ruff: noqa: ANN201, S101
"""Test the UI for cAnnections using pytest and Selenium.

Silenced Ruff checks
--------------------
- ANN201: None of the test functions return anything. It'd only add
          visual clutter
- S101:   Assertions are necessary as this is a test framework
"""

from selenium.webdriver.support.color import Color

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


def test_squares_populated_on_load(page: GamePage, categories: list[dict]):
    """Check the squares are filled with 4 categories on page load.

    Category selection should be random.
    """
    square_topics = [square.text for square in page.find_all(page.SQUARES)]
    categories_chosen = []
    for category in categories:
        if set(category["topics"]).issubset(square_topics):
            categories_chosen.append(category)
        if len(categories_chosen) == page.CATEGORY_SIZE:
            break
    assert len(categories_chosen) == page.CATEGORY_SIZE
    assert categories_chosen != categories[:4]


def test_squares_change_on_refresh(page: GamePage):
    """Check the squares are filled with 4 new categories on page load."""
    old_topics = [square.text for square in page.find_all(page.SQUARES)]
    page.refresh()
    new_topics = [square.text for square in page.find_all(page.SQUARES)]
    try:
        assert set(old_topics) != set(new_topics)
    # Try again on the off chance the same categories were chosen twice
    # After 1 retry I think it's safe to assume the randomness is broken
    except AssertionError:
        page.refresh()
        assert set(old_topics) != set(new_topics)


def test_square_clicked_style(page: GamePage):
    """Check a square changes style when clicked.

    It should change back to its original style when clicked again.
    Square height and width are 23% when unselected and 22% when
    selected, thus the magic number math in the second set of
    assertions.
    """
    square = page.find(page.get_square_locator(1))
    rgb = square.value_of_css_property("background-color")
    assert Color.from_string(rgb).hex == "#7aadad"
    height = square.size["height"]
    width = square.size["width"]

    page.click(square)
    rgb = square.value_of_css_property("background-color")
    assert Color.from_string(rgb).hex == "#f78f91"
    assert square.size["height"] == height / 23 * 22
    assert square.size["width"] == width / 23 * 22

    page.click(square)
    rgb = square.value_of_css_property("background-color")
    assert Color.from_string(rgb).hex == "#7aadad"
    assert square.size["height"] == height
    assert square.size["width"] == width


def test_deselect_clickability(page: GamePage):
    """Check the Deselect button is clickable when selections are made.

    The Deselect button should only be clickable when selections are
    made. If selections are unmade, the Deselect button should become
    unclickable again.
    """
    deselect_button = page.find(page.DESELECT)
    assert not deselect_button.is_enabled()
    square = page.find(page.get_square_locator(1))
    page.click(square)
    assert deselect_button.is_enabled()
    page.click(square)
    assert not deselect_button.is_enabled()


def test_deselect_logic(page: GamePage):
    """Check clicking the Deselect button deselects any selections."""
    deselect_button = page.find(page.DESELECT)
    squares = []
    for i in range(1, 5):
        square = page.find(page.get_square_locator(i))
        squares.append(square)
        page.click(square)
    page.click(deselect_button)
    for square in squares:
        rgb = square.value_of_css_property("background-color")
        assert Color.from_string(rgb).hex == "#7aadad"
