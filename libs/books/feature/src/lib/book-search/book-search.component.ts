import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  addToReadingList,
  clearSearch,
  getAllBooks,
  ReadingListBook,
  searchBooks
} from '@tmo/books/data-access';
import { FormBuilder } from '@angular/forms';
import { Book, okReadsConstants } from '@tmo/shared/models';
import { Subject } from 'rxjs';

@Component({
  selector: 'tmo-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.scss'],
})
export class BookSearchComponent implements OnInit, OnDestroy {
  books: ReadingListBook[];
  booksConstants = okReadsConstants;
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  searchForm = this.formBuilder.group({
    term: '',
  });

  constructor(
    private readonly store: Store,
    private readonly formBuilder: FormBuilder
  ) {}

  get searchTerm(): string {
    return this.searchForm.value.term;
  }

  ngOnInit(): void {
    this.store.select(getAllBooks).subscribe((books) => {
      this.books = books;
    });
  }

  addBookToReadingList(book: Book) {
    this.store.dispatch(addToReadingList({ book, showSnackBar:true }));
  }

  searchExample() {
    this.searchForm.controls.term.setValue(this.booksConstants.JAVASCRIPT);
    this.searchBooks();
  }

  searchBooks() {
    const searchText = this.searchTerm;
    if (searchText) {
      this.store.dispatch(searchBooks({ term: searchText }));
    } else {
      this.store.dispatch(clearSearch());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.unsubscribe();
  }
}
