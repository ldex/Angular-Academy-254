import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable, EMPTY, combineLatest, Subscription } from 'rxjs';
import { tap, catchError, startWith, count, flatMap, debounceTime, filter, map } from 'rxjs/operators';

import { Product } from '../product.interface';
import { ProductService } from '../product.service';
import { FavouriteService } from '../favourite.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  title: string = 'Products';
  selectedProduct: Product;
  products$: Observable<Product[]>;
  productsNumber$: Observable<number>;
  mostExpensiveProduct$: Observable<Product>;
  productsTotalNumber$: Observable<number>;
  isLastPage$: Observable<boolean>;
  errorMessage;

  // Pagination
  productsToLoad = this.productService.productsToLoad;
  pageSize = this.productsToLoad / 2;
  start = 0;
  end = this.pageSize;
  currentPage = 1;

  loadMore(): void {
    let skip = this.end;
    let take = this.productsToLoad;

    this.productService.initProducts(skip, take);
  }

  previousPage() {
    this.start -= this.pageSize;
    this.end -= this.pageSize;
    this.currentPage--;
    this.selectedProduct = null;
  }

  nextPage() {
    this.start += this.pageSize;
    this.end += this.pageSize;
    this.currentPage++;
    this.selectedProduct = null;
  }

  onSelect(product: Product) {
    this.selectedProduct = product;
    this.router.navigateByUrl('/products/' + product.id);
  }

  get favourites(): number {
    return this.favouriteService.getFavouritesNb();
  }

  constructor(
    private productService: ProductService,
    private favouriteService: FavouriteService,
    private router: Router) {
  }

  ngOnInit(): void {
    // Self url navigation will refresh the page ('Refresh List' button)
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.products$ = this
                      .productService
                      .products$
                      .pipe(
                        filter(products => products.length > 0)
                      );

    this.productsNumber$ = this
                              .products$
                              .pipe(
                                map(products => products.length),
                                startWith(0)
                              );

    this.mostExpensiveProduct$ = this
                                  .productService
                                  .mostExpensiveProduct$;

    this.productsTotalNumber$ = this
                                    .productService
                                    .productsTotalNumber$;


    this.isLastPage$ = combineLatest([this.productsNumber$, this.productsTotalNumber$])
      .pipe(
        map(([productsNumber, productsTotalNumber]) =>
          productsNumber >= productsTotalNumber
        )
      );
  }

  refresh() {
    this.productService.initProducts();
    this.router.navigateByUrl('/products'); // Self route navigation
  }
}
