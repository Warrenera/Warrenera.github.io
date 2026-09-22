# ruff: noqa: ANN201, S101
"""Test the UI for cAnnections using pytest and Selenium.

Silenced Ruff checks
--------------------
- ANN201: None of the test functions return anything. It'd only add
          visual clutter
- S101:   Assertions are necessary as this is a test framework
"""

import pytest

from tests.game_page import GamePage


# Tests
@pytest.mark.body
class TestPageBody:
    """Test the presense and structure of parts of the page body."""

    def test_title(self, page: GamePage):
        """Check the page title is as expected on page load."""
        assert page.title == "cAnnections: Connections, but about us"

    def test_details(self, page: GamePage):
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


@pytest.mark.squares
class TestSquares:
    """Test the population and behavior of the square buttons."""

    def test_squares_populate_on_load(self, page: GamePage, categories: list[dict]):
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

    @pytest.mark.shuffle
    def test_squares_change_on_refresh(self, page: GamePage):
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

    @pytest.mark.color
    def test_square_clicked_style(self, page: GamePage):
        """Check a square changes style when clicked.

        It should change back to its original style when clicked again.
        Square height and width are 23% when unselected and 22% when
        selected, thus the magic number math in the second set of
        assertions. Using pytest.approx() as minute browser rendering
        differences between environments caused this test to fail in CI.
        """
        square = page.find(page.get_dynamic_locator("square", 1))
        assert page.get_background_color(square) == "#7aadad"
        height = square.size["height"]
        width = square.size["width"]

        page.click(square)
        assert page.get_background_color(square) == "#f78f91"
        assert square.size["height"] == pytest.approx(height / 23 * 22)
        assert square.size["width"] == pytest.approx(width / 23 * 22)

        page.click(square)
        assert page.get_background_color(square) == "#7aadad"
        assert square.size["height"] == height
        assert square.size["width"] == width

    @pytest.mark.color
    def test_selected_square_limit(self, page: GamePage):
        """Check up to 4 squares may be selected at any given time.

        Unselecting a previously selected square frees up another square to
        be selected instead.
        """
        squares = []
        for i in range(1, page.CATEGORY_SIZE + 1):
            square = page.find(page.get_dynamic_locator("square", i))
            squares.append(square)
            page.click(square)
        for square in squares:
            assert page.get_background_color(square) == "#f78f91"

        # Selecting a fifth square does not work
        square = page.find(page.get_dynamic_locator("square", page.CATEGORY_SIZE + 1))
        page.click(square)
        assert page.get_background_color(square) == "#7aadad"

        # Selecting a fifth square after undoing one of the first 4 works
        page.click(squares[0])
        page.click(square)
        assert page.get_background_color(square) == "#f78f91"


@pytest.mark.shuffle
class TestShuffle:
    """Test the functionaliy of the Shuffle button."""

    def test_shuffle_logic(self, page: GamePage):
        """Check clicking the shuffle button randomizes the square text."""
        old_topics = (square.text for square in page.find_all(page.SQUARES))
        page.click(page.find(page.SHUFFLE))
        new_topics = (square.text for square in page.find_all(page.SQUARES))
        # Same topics and categories:
        assert set(old_topics) == set(new_topics)
        # But in a different order:
        assert old_topics != new_topics

    @pytest.mark.color
    @pytest.mark.deselect
    def test_deselect_clickability_on_shuffle(self, page: GamePage):
        """Check clicking the shuffle button deselects selected squares."""
        square = page.find(page.get_dynamic_locator("square", 1))
        page.click(square)
        assert page.get_background_color(square) == "#f78f91"

        deselect_button = page.find(page.DESELECT)
        assert deselect_button.is_enabled()

        page.click(page.find(page.SHUFFLE))
        assert not deselect_button.is_enabled()
        # Check all squares to ensure wherever the one that
        # was clicked went, it did not remain clicked
        for i in range(1, page.CATEGORY_SIZE**2 + 1):
            square = page.find(page.get_dynamic_locator("square", i))
            assert page.get_background_color(square) == "#7aadad"


@pytest.mark.deselect
class TestDeselect:
    """Test the functionality of the Deselect button."""

    def test_deselect_clickability(self, page: GamePage):
        """Check the Deselect button is clickable when selections are made.

        The Deselect button should only be clickable when selections are
        made. If selections are unmade, the Deselect button should become
        unclickable again.
        """
        deselect_button = page.find(page.DESELECT)
        assert not deselect_button.is_enabled()
        square = page.find(page.get_dynamic_locator("square", 1))
        page.click(square)
        assert deselect_button.is_enabled()
        page.click(square)
        assert not deselect_button.is_enabled()

    @pytest.mark.color
    @pytest.mark.deselect
    def test_deselect_logic(self, page: GamePage):
        """Check clicking the Deselect button deselects any selections.

        Checked for each number of possible selection counts, 1 through 4.
        Clicking the Deselect button also disables the button.
        """
        deselect_button = page.find(page.DESELECT)
        for i in range(1, page.CATEGORY_SIZE + 1):
            squares = []
            for j in range(1, i + 1):
                square = page.find(page.get_dynamic_locator("square", j))
                squares.append(square)
                page.click(square)
            page.click(deselect_button)
            assert not deselect_button.is_enabled()
            for square in squares:
                assert page.get_background_color(square) == "#7aadad"


@pytest.mark.submit
class TestSubmit:
    """Test the functionality of the Submit button in various cases."""

    def test_submit_clickability(self, page: GamePage):
        """Check the Submit button is clickable once 4 squares are selected.

        Before then it should not be clickable.
        """
        submit_button = page.find(page.SUBMIT)
        for i in range(1, page.CATEGORY_SIZE):
            page.click(page.find(page.get_dynamic_locator("square", i)))
            assert not submit_button.is_enabled()
        page.click(page.find(page.get_dynamic_locator("square", page.CATEGORY_SIZE)))
        assert submit_button.is_enabled()

    def test_submit_refresh_state(self, page: GamePage):
        """Check that button state is not kept between page refreshes.

        This is a longstanding, Firefox-specific bug for which the Submit
        button is explicitly set to disabled at the end of the game logic.
        See: https://bugzilla.mozilla.org/show_bug.cgi?id=685657.
        """
        for i in range(1, page.CATEGORY_SIZE + 1):
            page.click(page.find(page.get_dynamic_locator("square", i)))
        submit_button = page.find(page.SUBMIT)
        assert submit_button.is_enabled()
        page.refresh()
        submit_button = page.find(page.SUBMIT)
        assert not submit_button.is_enabled()

    @pytest.mark.color
    def test_submit_correct_category_colors(self, page: GamePage, categories_chosen: list[dict]):
        """Check that submitting all 4 topics of a category reveals it.

        The category will be revealed over the top row of squares. Each
        will be one of 4 randomly assigned category colors. No 2
        categories will be the same color.

        Explicitly requesting the chosen_categories fixture because it
        is needed to loop over every row instead of hard-codedly using
        the first row.

        Explicitly recreated the squares fixture logic because they need
        to be refetched after every submission as the position of the
        square texts changes.
        """
        used_colors = []
        for i in range(page.CATEGORY_SIZE):
            topics = categories_chosen[i]["topics"]
            squares = page.find_all(page.SQUARES)
            for square in [square for square in squares if square.text in topics]:
                page.click(square)

            page.click(page.find(page.SUBMIT))
            row = page.find(page.get_dynamic_locator("row", i + 1))
            color = page.get_background_color(row)

            assert color in page.CATEGORY_COLORS.values()
            assert color not in used_colors
            used_colors.append(color)

    @pytest.mark.usefixtures("select_first_category")
    def test_submit_correct_category_children(self, page: GamePage):
        """Check that submitting all 4 topics of a category reveals it.

        The category will be revealed over the top row of squares. Squares
        in that row will be hidden.
        """
        page.click(page.find(page.SUBMIT))
        row = page.find(page.get_dynamic_locator("row", 1))
        children = row.find_elements(*page.BUTTONS)
        for child in children:
            assert not child.is_displayed()

    @pytest.mark.usefixtures("select_first_category")
    def test_submit_correct_category_text(self, page: GamePage, categories_chosen: list[dict]):
        """Check that submitting all 4 topics of a category reveals it.

        The category will be revealed over the top row of squares. It will
        display the revealed category title and topics.
        """
        category = categories_chosen[0]  # First category chosen arbitrarily
        page.click(page.find(page.SUBMIT))
        row = page.find(page.get_dynamic_locator("row", 1))
        row_text = row.text.split("\n")
        assert row_text[0] == category["title"]
        assert row_text[1] == ", ".join(category["topics"])

    @pytest.mark.usefixtures("select_first_category")
    def test_submit_correct_category_remaining_topics(
        self,
        page: GamePage,
        categories_chosen: list[dict],
    ):
        """Check that submitting all 4 topics of a category reveals it.

        The category will be revealed over the top row of squares. The
        remaining squares will file down to the remaining 3 rows.
        """
        category = categories_chosen[0]  # First category chosen arbitrarily
        page.click(page.find(page.SUBMIT))
        remaining_topics = [
            topic for cat in categories_chosen if cat != category for topic in cat["topics"]
        ]
        remaining_squares = page.find_all(page.SQUARES)
        for topic in remaining_topics:
            assert any(square.text == topic for square in remaining_squares)

    # @pytest.mark.submit
    # def test_submit_last_correct_category(page: GamePage, categories: list[dict]):
    #     """."""
