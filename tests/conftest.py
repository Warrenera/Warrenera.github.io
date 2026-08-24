"""Provide fixtures for the test framework."""

import pytest  # pytest convention, see Ruff PT013
from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options

from tests.game_page import GamePage


@pytest.fixture
def driver() -> Firefox:
    """Instantiate the Firefox Web driver for the test.

    Gracefully close the driver after each test as well.
    """
    options = Options()
    options.add_argument("--headless")
    # options.add_argument("--window-size=1920,1080")
    webdriver = Firefox(options=options)
    yield webdriver
    webdriver.quit()


@pytest.fixture(autouse=True)
def page(driver: Firefox) -> GamePage:
    """Instantiate the Firefox webpage for the test."""
    driver.get("https://warrenera.github.io/")
    return GamePage(driver)
