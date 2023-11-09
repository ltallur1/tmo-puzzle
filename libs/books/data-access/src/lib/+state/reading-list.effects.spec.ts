import { TestBed } from '@angular/core/testing';
import { ReplaySubject, Subject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { SharedTestingModule, createBook, createReadingListItem } from '@tmo/shared/testing';
import { ReadingListEffects } from './reading-list.effects';
import * as ReadingListActions from './reading-list.actions';
import { okReadsConstants } from '@tmo/shared/models';
import { takeUntil } from 'rxjs/operators';

describe('ReadingListEffects', () => {
  let actions: ReplaySubject<any>;
  let effects: ReadingListEffects;
  let httpMock: HttpTestingController;
  let unsubscribe$: Subject<void>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions),
        provideMockStore()
      ]
    });

    afterEach (()=>{
      unsubscribe$.next();
      unsubscribe$.complete();
    })  

    effects = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);
    unsubscribe$ = new Subject<void>();
  });

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
      effects.loadReadingList$.pipe(takeUntil(unsubscribe$)).subscribe((action) => {
        expect(action.type).toEqual(failureError.type);
        done();
      });
      httpMock.expectOne(`${okReadsConstants.READING_LIST_API}`).error(new ErrorEvent(okReadsConstants.ERROR));
    });

    it('should add book to reading list', (done) => {
      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.addToReadingList({ book: createBook('A') })
      );
      effects.addBook$.pipe(takeUntil(unsubscribe$)).subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.confirmedAddToReadingList({
            book: createBook('A'),
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
        })
      );
      effects.removeBook$.pipe(takeUntil(unsubscribe$)).subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.confirmedRemoveFromReadingList({
            item: createReadingListItem('A'),
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
        ReadingListActions.addToReadingList({ book: createBook('A') })
      );

      effects.addBook$.pipe(takeUntil(unsubscribe$)).subscribe((action) => {
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
        })
      );
      effects.removeBook$.pipe(takeUntil(unsubscribe$)).subscribe((action) => {
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

      it('should mark book as read', (done) => {
        actions = new ReplaySubject();
        const item = createReadingListItem('A');
        const book = createBook('A');
        actions.next(ReadingListActions.markBookAsRead({ book: item }));
        effects.markBookAsRead$.pipe(takeUntil(unsubscribe$)).subscribe(() => {
          expect(item.bookId).toEqual(
            ReadingListActions.confirmedMarkBookAsRead({ book:item }).book.bookId
          );
          done();
        });
        httpMock.expectOne(`${okReadsConstants.READING_LIST_API}/A/${okReadsConstants.FINISHED}`).flush([]);
      });

      it('should invoke failedMarkAsRead when failed to mark book as read', (done) => {
        actions = new ReplaySubject();
        const item = createReadingListItem('A');
        actions.next(ReadingListActions.markBookAsRead({ book: item }));
        effects.markBookAsRead$.pipe(takeUntil(unsubscribe$)).subscribe((action) => {
          expect(action).toEqual(
            ReadingListActions.failedMarkBookAsRead({ error: 'Http failure response for /api/reading-list/A/finished: 0 ' })
          );
          done();
        });
        httpMock
          .expectOne(`${okReadsConstants.READING_LIST_API}/A/${okReadsConstants.FINISHED}`).error(new ErrorEvent(okReadsConstants.ERROR))
        });
  });
});
