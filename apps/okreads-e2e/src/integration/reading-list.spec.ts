describe('When: I use the reading list feature', () => {
  beforeEach(() => {
    cy.startAt('/');
  });

  it('Then: I should see my reading list', () => {
    cy.get('[data-testing="toggle-reading-list"]').click();

    cy.get('[data-testing="reading-list-container"]').should(
      'contain.text',
      'My Reading List'
    );
  });
  it('Then: I should be able to mark the book as finished', () => {

    cy.get('input[type="search"]').type('python');

    cy.get('form').submit();

    cy.get('[data-testing="want-to-read-button"]').first().click();

    cy.get('[data-testing="toggle-reading-list"]').click();

    cy.wait(1000);

    cy.get('[data-testing="finishbutton"]').click();

    cy.wait(2000);

    cy.get('[data-testing="bookfinishedbutton"]').should('be.enabled');
  });
});
