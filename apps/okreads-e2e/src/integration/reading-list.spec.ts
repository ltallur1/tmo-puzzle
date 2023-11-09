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

  it('Then: I should be able to add book to the reading list and undo it', () => {
    cy.get('input[type="search"]').type('java');

    cy.get('form').submit();

    cy.get('[data-testing="want-to-read-button"]').first().click();

    cy.wait(2000);

    cy.contains('Undo').click();

    cy.get('[data-testing="reading-list-item"]').should('have.length', 0);
  });
});
