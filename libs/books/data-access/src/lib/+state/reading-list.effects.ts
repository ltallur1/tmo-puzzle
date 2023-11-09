import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map } from 'rxjs/operators';
import { okReadsConstants, ReadingListItem } from '@tmo/shared/models';
import * as ReadingListActions from './reading-list.actions';

@Injectable()
export class ReadingListEffects implements OnInitEffects {
  loadReadingList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.init),
      exhaustMap(() =>
        this.http.get<ReadingListItem[]>(`${okReadsConstants.READING_LIST_API}`).pipe(
          map((data) =>
            ReadingListActions.loadReadingListSuccess({ list: data })
          ),
          catchError((error) =>
            of(ReadingListActions.loadReadingListError({ error }))
          )
        )
      )
    )
  );

  addBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.addToReadingList),
      concatMap(({ book }) =>
        this.http.post(`${okReadsConstants.READING_LIST_API}`, book).pipe(
          map(() => ReadingListActions.confirmedAddToReadingList({ book })),
          catchError(() =>
            of(ReadingListActions.failedAddToReadingList({ book }))
          )
        )
      )
    )
  );

  removeBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.removeFromReadingList),
      concatMap(({ item }) =>
        this.http.delete(`${okReadsConstants.READING_LIST_API}/${item.bookId}`).pipe(
          map(() =>
            ReadingListActions.confirmedRemoveFromReadingList({ item })
          ),
          catchError(() =>
            of(ReadingListActions.failedRemoveFromReadingList({ item }))
          )
        )
      )
    )
  );

  markBookAsRead$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ReadingListActions.markBookAsRead),
    concatMap(({ book }) => {
      const finishedBook = {
        ...book,
        finishedDate: new Date().toISOString(),
        finished:true
      };
      return this.http
        .put(`${okReadsConstants.READING_LIST_API}/${finishedBook.bookId}/${okReadsConstants.FINISHED}`, finishedBook)
        .pipe(
          map(() =>
            ReadingListActions.confirmedMarkBookAsRead({ book: finishedBook })
          ),
          catchError((error) =>{
           return of(
             ReadingListActions.failedMarkBookAsRead({ error: error.message })
           );
          })
        );
    })
  )
);

  ngrxOnInitEffects() {
    return ReadingListActions.init();
  }

  constructor(private actions$: Actions, private http: HttpClient) {}
}
