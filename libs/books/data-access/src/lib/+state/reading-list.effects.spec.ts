import { TestBed } from '@angular/core/testing';
import { ReplaySubject, Subject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { SharedTestingModule, createBook, createReadingListItem } from '@tmo/shared/testing';
import { ReadingListEffects } from './reading-list.effects';
import * as ReadingListActions from './reading-list.actions';
import { Book, ReadingListItem, okReadsConstants } from '@tmo/shared/models';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs/operators';

describe('ReadingListEffects', () => {
  let actions: ReplaySubject<any>;
  let effects: ReadingListEffects;
  let httpMock: HttpTestingController;
  let unsubscribe$: Subject<void>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule, MatSnackBarModule],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions),
        provideMockStore()
      ]
    });

    effects = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);
    unsubscribe$ = new Subject<void>();
  });

  afterEach (()=>{
    unsubscribe$.next();
    unsubscribe$.complete();
  })

  describe('loadReadingList$', () => {
    it('should work', done => {
      actions = new ReplaySubject();
      actions.next(ReadingListActions.init());

      effects.loadReadingList$.pipe(takeUntil(unsubscribe$)).subscribe(action => {
        expect(action).toEqual(
          ReadingListActions.loadReadingListSuccess({ list: [] })
        );
        done();
      });

      httpMock.expectOne(`${okReadsConstants.READING_LIST_API}`).flush([]);
    });

    it('should fail to load reading list', (done) => {
      actions = new ReplaySubject();
      actions.next(ReadingListActions.init());
      const failureError = ReadingListActions.loadReadingListError(
        new ErrorEvent(okReadsConstants.ERROR)
      );
      effects.loadReadingList$.subscribe((action) => {
        expect(action.type).toEqual(failureError.type);
        done();
      });
      httpMock.expectOne(`${okReadsConstants.READING_LIST_API}`).error(new ErrorEvent(okReadsConstants.ERROR));
    });

    it('should add book to reading list', (done) => {
      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.addToReadingList({ book: createBook('A') , showSnackBar:true})
      );
      effects.addBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.confirmedAddToReadingList({
            book: createBook('A'),
            showSnackBar:true
          })
        );
        done();
      });
      httpMock.expectOne(`${okReadsConstants.READING_LIST_API}`).flush({ book: createBook('A') });
    });

    it('should remove book from reading list', (done) => {
      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.removeFromReadingList({
          item: createReadingListItem('A'),
          showSnackBar:true
        })
      );
      effects.removeBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.confirmedRemoveFromReadingList({
            item: createReadingListItem('A'),
            showSnackBar:true
          })
        );
        done();
      });
      httpMock
        .expectOne(`${okReadsConstants.READING_LIST_API}/A`)
        .flush({ item: createReadingListItem('A') });
    });

    it('should throw error when api fails when trying to add book to reading list', (done) => {
      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.addToReadingList({ book: createBook('A') , showSnackBar:true })
      );

      effects.addBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedAddToReadingList({ book: createBook('A') })
        );
        done();
      });
      httpMock
        .expectOne(`${okReadsConstants.READING_LIST_API}`)
        .flush(createBook('A'), { status: 400, statusText: okReadsConstants.BAD_REQUEST_TEXT });
    });

    it('should throw error when api fails when trying to remove book from reading list', (done) => {
      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.removeFromReadingList({
          item: createReadingListItem('A'),
          showSnackBar:true
        })
      );
      effects.removeBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedRemoveFromReadingList({
            item: createReadingListItem('A'),
          })
        );
        done();
      });
      httpMock
        .expectOne(`${okReadsConstants.READING_LIST_API}/A`)
        .flush(createReadingListItem('A'), {
          status: 400,
          statusText: okReadsConstants.READING_LIST_ERROR_TEXT,
        });
      });

      it('should undo addition of book to the reading list when showSnackbar action is dispatched and action type is ADD', (done) => {
        const book: Book = { ...createBook('A') };
        actions = new ReplaySubject();
        actions.next( 
          ReadingListActions.confirmedAddToReadingList({
            book: book,
            showSnackBar: true
          })
        );
  
        effects.undoAddBook$.pipe(takeUntil(unsubscribe$))
          .subscribe((action) => {
          expect(action).toEqual(
            ReadingListActions.showSnackBar({
              actionType: okReadsConstants.SNACKBAR_ADD,
              item: { bookId: book.id, ...book }
            })
          );
          done();
        });
      });

      it('should undo removal of book from the reading list when showSnackbar action is dispatched and action type is REMOVE', (done) => {
        const item: ReadingListItem = createReadingListItem('A');
        actions = new ReplaySubject();
        actions.next(
          ReadingListActions.confirmedRemoveFromReadingList({
            item: item,
            showSnackBar: true
          })
        );
  
        effects.undoRemoveBook$.pipe(takeUntil(unsubscribe$))
        .subscribe((action) => {
          expect(action).toEqual(
            ReadingListActions.showSnackBar({
              actionType: okReadsConstants.SNACKBAR_REMOVE,
              item: action.item
            })
          );
          done();
        });
      });
  });
});
