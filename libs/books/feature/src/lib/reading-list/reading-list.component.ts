import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { getReadingList, removeFromReadingList } from '@tmo/books/data-access';
import { ReadingListItem, okReadsConstants } from '@tmo/shared/models';

@Component({
  selector: 'tmo-reading-list',
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.scss']
})
export class ReadingListComponent {
  readingList$ = this.store.select(getReadingList);
  readingListConstants = okReadsConstants;

  constructor(private readonly store: Store) {}

  removeFromReadingList(item : ReadingListItem) {
    this.store.dispatch(removeFromReadingList({ item }));
  }
}
