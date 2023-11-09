import { initialState, reducer, State } from './books.reducer';
import * as BooksActions from './books.actions';
import { createBook } from '@tmo/shared/testing';
import { okReadsConstants } from '@tmo/shared/models';

describe('Books Reducer', () => {
  describe('valid Books actions', () => {
    it('loadBooksSuccess should return set the list of known Books', () => {
      const books = [createBook('A'), createBook('B'), createBook('C')];
      const action = BooksActions.searchBooksSuccess({ books });

      const result: State = reducer(initialState, action);

      expect(result.loaded).toBe(true);
      expect(result.ids.length).toBe(3);
    });

    it('should clear the search when clearSearch is triggered', () => {
      const action = BooksActions.clearSearch();
      const result: State = reducer(initialState, action);
      expect(result.ids.length).toBe(0);
    });
    
    it('should search for books when searchBooks is triggered', () => {
      const action = BooksActions.searchBooks({ term: okReadsConstants.JAVASCRIPT });
      const result: State = reducer(initialState, action);
      expect(result.searchTerm).toBe(okReadsConstants.JAVASCRIPT);
    });
  
  });

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
