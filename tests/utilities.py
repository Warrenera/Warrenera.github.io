"""Provide helper functions for manipulating parts of the game.

These do not fit in the POM file or base page file as they do not
directly correspond to user-interactable parts of the game page, but
actions needed to set up a test.
"""

from collections.abc import Callable

from selenium.webdriver.remote.webelement import WebElement


def get_categories_chosen(categories: list[dict], square_texts: list[str]) -> list[dict]:
    """Return categories that match text present in the game squares.

    All four topics for a category must match for it to count.
    """
    return [
        category
        for category in categories
        if all(topic in square_texts for topic in category["topics"])
    ]


def select_category(click: Callable, topics: list, squares: list[WebElement]) -> None:
    """Click the squares corresponding to the topics in a category."""
    for square in [square for square in squares if square.text in topics]:
        click(square)
