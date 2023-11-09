import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedTestingModule } from '@tmo/shared/testing';

import { BooksFeatureModule } from '../books-feature.module';
import { BookSearchComponent } from './book-search.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import { clearSearch, getAllBooks, getBooksLoaded, searchBooks } from '@tmo/books/data-access';
import { okReadsConstants } from '@tmo/shared/models';

describe('BookSearchComponent', () => {
  let component: BookSearchComponent;
  let fixture: ComponentFixture<BookSearchComponent>;
  let store: MockStore;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BooksFeatureModule, NoopAnimationsModule, SharedTestingModule],
      providers: [provideMockStore({initialState:{books:{entities:[]}}})]
    }).compileComponents();
    store = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookSearchComponent);
    component = fixture.componentInstance;
    store.overrideSelector(getAllBooks, []);
    fixture.detectChanges();
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('searchExample() should search books with example search term', () => {
    component.searchExample();
    expect(store.dispatch).toBeCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(
      searchBooks({ term: okReadsConstants.JAVASCRIPT })
    );
  });

  it('should search books with search term', () => {
    component.searchForm.controls.term.setValue(okReadsConstants.JAVASCRIPT);
    store.overrideSelector(getBooksLoaded, true);
    component.searchBooks();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(
      searchBooks({ term: okReadsConstants.JAVASCRIPT})
    );
  });
  
  it('should clear the search if books with the search term does not exists', () => {
    component.searchForm.controls.term.setValue('');
    component.searchBooks();
    expect(store.dispatch).toHaveBeenCalledWith(clearSearch());
  });
});
