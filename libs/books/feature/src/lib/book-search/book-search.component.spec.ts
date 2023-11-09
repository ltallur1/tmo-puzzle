import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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

  it('searchExample() should search books with example search term', fakeAsync(() => {
    component.searchExample();
    fixture.detectChanges();
    tick(500);
    expect(store.dispatch).toHaveBeenCalledWith(
      searchBooks({ term: okReadsConstants.JAVASCRIPT })
    );
  }));

  it('should search books with search term', fakeAsync(() => {
    component.searchForm.controls.term.setValue(okReadsConstants.JAVASCRIPT);
    tick(500);
    store.overrideSelector(getBooksLoaded, true);
    store.refreshState();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(
      searchBooks({ term: okReadsConstants.JAVASCRIPT})
    );
  }));
  
  it('should clear the search if books with the search term does not exists', fakeAsync(() => {
    component.searchForm.controls.term.setValue('');
    tick(500);
    expect(store.dispatch).toHaveBeenCalledWith(clearSearch());
  }));
});
