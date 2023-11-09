import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, filter, map, switchMap } from 'rxjs/operators';
import { okReadsConstants, ReadingListItem } from '@tmo/shared/models';
import * as ReadingListActions from './reading-list.actions';
import {MatSnackBar} from '@angular/material/snack-bar';

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
      concatMap(({ book , showSnackBar }) =>
        this.http.post(`${okReadsConstants.READING_LIST_API}`, book).pipe(
          map(() => ReadingListActions.confirmedAddToReadingList({ book , showSnackBar })),
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
      concatMap(({ item , showSnackBar }) =>
        this.http.delete(`${okReadsConstants.READING_LIST_API}/${item.bookId}`).pipe(
          map(() =>
            ReadingListActions.confirmedRemoveFromReadingList({ item , showSnackBar})
          ),
          catchError(() =>
            of(ReadingListActions.failedRemoveFromReadingList({ item }))
          )
        )
      )
    )
  );

  undoAddBook$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ReadingListActions.confirmedAddToReadingList),
    filter((action) => action.showSnackBar),
    map((action) =>
      ReadingListActions.showSnackBar({
        actionType: okReadsConstants.SNACKBAR_ADD,
        item: { bookId: action.book.id, ...action.book },
      })
    )
  )
);

undoRemoveBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.confirmedRemoveFromReadingList),
      filter((action) => action.showSnackBar),
      map((action) =>
        ReadingListActions.showSnackBar({
          actionType: okReadsConstants.SNACKBAR_REMOVE,
          item: action.item,
        })
      )
    )
  );

  openSnackBar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.showSnackBar),
      switchMap((action) => {
        const title = action.item.title;
        const { actionType, item } = action;
        return this.snackBar
          .open(
            actionType === okReadsConstants.SNACKBAR_ADD
              ? `${title} ${okReadsConstants.SNACKBAR_ADDED_TEXT}`
              : `${title} ${okReadsConstants.SNACKBAR_REMOVED_TEXT}`,
            okReadsConstants.UNDO,
            {
              duration: 3000,
            }
          )
          .onAction()
          .pipe(
            map(() =>
              actionType === okReadsConstants.SNACKBAR_ADD
                ? ReadingListActions.removeFromReadingList({
                    item,
                    showSnackBar: false,
                  })
                : ReadingListActions.addToReadingList({
                    book: { id: item.bookId, ...item },
                    showSnackBar: false,
                  })
            )
          );
      })
    )
  )

  ngrxOnInitEffects() {
    return ReadingListActions.init();
  }

  constructor(private actions$: Actions, private http: HttpClient, private snackBar: MatSnackBar) {}
}
