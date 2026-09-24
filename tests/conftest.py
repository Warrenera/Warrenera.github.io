"""Provide fixtures for the test framework."""

from os import environ

import pytest  # pytest convention, see Ruff PT013
import requests
from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.remote.webelement import WebElement

from tests.game_page import GamePage


@pytest.fixture
def driver() -> Firefox:
    """Instantiate the Firefox Web driver for the test.

    Gracefully close the driver after each test as well.
    """
    options = Options()
    options.add_argument("-headless")
    options.add_argument("-height=1080")
    options.add_argument("-width=1920")
    webdriver = Firefox(options=options)
    yield webdriver
    webdriver.quit()


@pytest.fixture
def page(driver: Firefox) -> GamePage:
    """Instantiate the Firefox webpage for the test."""
    url = environ.get("BASE_URL", "https://warrenera.github.io/")
    driver.get(url)
    return GamePage(driver)


@pytest.fixture
def initial_squares(page: GamePage) -> list[WebElement]:
    """Find all the squares on the game board.

    Called the initial squares because if a category is revealed in a
    row then the squares need to be refound as the remaining topics will
    have been moved down.
    """
    return page.find_all(page.SQUARES)


@pytest.fixture
def categories() -> list[dict]:
    """Get the categories JSON file from the site to have handy."""
    return requests.get(timeout=10, url="https://warrenera.github.io/topics.json").json()


@pytest.fixture
def categories_chosen(initial_squares: list[WebElement], categories: list[dict]) -> list[dict]:
    """Return categories that match text present in the game squares.

    All four topics for a category must match for it to count.
    """
    square_texts = [square.text for square in initial_squares]
    return [
        category
        for category in categories
        if all(topic in square_texts for topic in category["topics"])
    ]
