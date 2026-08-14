# ruff: noqa: CPY001
"""Page object model for https://warrenera.github.io."""

from selenium.common.exceptions import WebDriverException
from selenium.webdriver import Firefox


class Page:
    """."""

    url = "https://warrenera.github.io"

    def __init__(self, driver: Firefox):
        if driver.current_url != self.url:
            e = f"This is not cAnnections! Current page is {driver.current_url}"
            raise WebDriverException(e)
        self.driver = driver

    def view_details(self):
        pass

    def select_square(self):
        pass

    def deselect_square(self):
        """Unsure if I need this?"""

    def refresh(self):
        pass

    def shuffle(self):
        pass

    def deselect_all(self):
        pass

    def submit(self):
        pass

    def share(self):
        pass
