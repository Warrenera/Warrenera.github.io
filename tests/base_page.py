"""Base page for utilities and setup not specific to GamePage parts.

Silenced Ruff checks
--------------------
- ANN204: (in-line) __init__() always returns None
"""

from selenium.webdriver import Firefox
from selenium.webdriver.common.by import ByType
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.expected_conditions import (
    element_to_be_clickable,
    presence_of_element_located,
    url_to_be,
    visibility_of_element_located,
)
from selenium.webdriver.support.wait import WebDriverWait


class BasePage:
    """Define page-agnostic utilities for page object models."""

    def __init__(self, driver: Firefox, timeout: int = 10):  # noqa: ANN204
        """Set the details for interacting with the page."""
        self.driver = driver
        self.timeout = timeout
        self._wait = WebDriverWait(self.driver, self.timeout)

    def click(self, locator: tuple[ByType, str]) -> None:
        """Click the specified UI button."""
        self._wait.until(element_to_be_clickable(locator)).click()

    def find(self, locator: tuple[ByType, str]) -> WebElement:
        """Search for the specified UI element and return if found."""
        return self._wait.until(presence_of_element_located(locator))

    def refresh(self) -> None:
        """Refresh the page."""
        self.driver.refresh()

    def verify_element(self, locator: str) -> bool:
        """Check if an element is present once the page fully loads."""
        return self._wait.until(visibility_of_element_located(locator))

    def verify_url(self, url: str) -> bool:
        """Check if a URL is correct once the page fully loads."""
        return self._wait.until(url_to_be(url + "/"))
