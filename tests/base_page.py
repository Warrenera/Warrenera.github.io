"""Base page for utilities and setup not specific to GamePage parts.

Silenced Ruff checks
--------------------
- ANN204: (in-line) __init__() always returns None
"""

from selenium.webdriver import Firefox
from selenium.webdriver.common.by import ByType
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.color import Color
from selenium.webdriver.support.expected_conditions import (
    element_to_be_clickable,
    invisibility_of_element_located,
    url_to_be,
    visibility_of_all_elements_located,
    visibility_of_element_located,
)
from selenium.webdriver.support.wait import WebDriverWait


class BasePage:
    """Define page-agnostic utilities for page object models."""

    def __init__(self, driver: Firefox, timeout: int = 10):  # noqa: ANN204
        """Set the details for interacting with the page."""
        self.driver = driver
        self.timeout = timeout
        self._wait = self.create_wait(timeout)

    def create_wait(self, timeout: int | None = None) -> WebDriverWait:
        """Make a wait timer for waiting on expected conditions.

        For most uses the default self._wait will suffice; however, if a
        different timeout length is desired a new wait WebDriverWait
        needs to be created. `timeout` is the number of seconds to wait.
        """
        return WebDriverWait(self.driver, timeout or self.timeout)

    def get_background_color(self, element: WebElement, wait: WebDriverWait | None = None) -> str:
        """Get an element's background-color CSS property hex code."""
        waiter = wait or self._wait
        return waiter.until(
            lambda _: Color.from_string(element.value_of_css_property("background-color")).hex,
            message=f"Unable to get the background-color of element {element}",
        )

    def click(
        self,
        locator: tuple[ByType, str] | WebElement,
        wait: WebDriverWait | None = None,
    ) -> None:
        """Click the specified UI button."""
        waiter = wait or self._wait
        waiter.until(
            element_to_be_clickable(locator),
            message=f"Unable to click the element with locator {locator}",
        ).click()

    def do_not_find(self, locator: tuple[ByType, str], wait: WebDriverWait | None = None) -> bool:
        """Verify element expected to be invisible is invisible."""
        waiter = wait or self._wait
        return waiter.until(
            invisibility_of_element_located(locator),
            message=f"Didn't expect to find element with locator {locator}, but found it anyway",
        )

    def find(self, locator: tuple[ByType, str], wait: WebDriverWait | None = None) -> WebElement:
        """Search for the specified UI element and return if found."""
        waiter = wait or self._wait
        return waiter.until(
            message=f"element with locator {locator} not found!",
            method=visibility_of_element_located(locator),
        )

    def find_all(
        self,
        locator: tuple[ByType, str],
        wait: WebDriverWait | None = None,
    ) -> list[WebElement]:
        """Search for all UI elements and return if found."""
        waiter = wait or self._wait
        return waiter.until(
            visibility_of_all_elements_located(locator),
            message=f"Unable to get all elements with locator {locator}",
        )

    def refresh(self) -> None:
        """Refresh the page."""
        self.driver.refresh()

    def verify_url(self) -> bool:
        """Validate if a URL is correct once the page fully loads.

        Checks for trailing slashes in the driver's current URL and
        makes sure the class variable matches before validating.
        """
        if self.driver.current_url.endswith("/"):
            url = f"{self.url}/" if not self.url.endswith("/") else self.url
        else:
            url = self.url.rstrip("/") if self.url.endswith("/") else self.url

        return self._wait.until(
            message=(
                f"ERROR: expected current driver URL to be {url}, "
                "but was {self.driver.current_url} instead"
            ),
            method=url_to_be(url),
        )
