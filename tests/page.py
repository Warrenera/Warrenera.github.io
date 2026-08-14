# ruff: noqa: CPY001
"""Page object model for https://warrenera.github.io."""

from selenium.common.exceptions import WebDriverException
from selenium.webdriver import Firefox
from selenium.webdriver.common.by import By


class Page:
    """Represent the cAnnections game page.

    Choosing not to use a base page class for things like a base URL or
    the locators as this is a just a single static webpage and that
    would be overkill.
    """

    url = "https://warrenera.github.io"

    # Locators
    DESELECT = "deselect"
    SHARE = "share"
    SHUFFLE = "shuffle"
    SUBMIT = "submit"
    SUMMARY = (By.TAG_NAME, "summary")

    def __init__(self, driver: Firefox):
        if driver.current_url != self.url:
            e = f"This is not cAnnections! Current page is {driver.current_url}"
            raise WebDriverException(e)
        self.driver = driver

    def toggle_details(self):
        """Toggle appearance of the header details drop-down menu."""
        self.driver.find_element(*self.SUMMARY).click()

    def select_square(self, square_id: str):
        """Toggle selection of a category choice button."""
        self.driver.find_element(value=f"square_{square_id}").click()

    def refresh(self):
        """Refresh the page, resetting the game with new categories."""
        self.driver.refresh()

    def shuffle(self):
        """Click the shuffle button, mixing up the category squares.

        Also deselect any currently selected squares.
        """
        self.driver.find_element(value=self.SHUFFLE).click()

    def deselect_all(self):
        """Click the 'Deselect All' button, unselecting all buttons."""
        self.driver.find_element(value=self.DESELECT).click()

    def submit(self):
        """Click the Submit button to see if the selections were right."""
        self.driver.find_element(value=self.SUBMIT).click()

    def share(self):
        """Click the Share button.

        This copies text to the clipboard if the navigator.share()
        object is unreachable, i.e., from the desktop.
        """
        self.driver.find_element(value=self.SHARE).click()
