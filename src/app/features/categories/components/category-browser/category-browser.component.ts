import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Category } from '../../../../core/models/category.model';
import { Product } from '../../../../core/models/product.model';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-category-browser',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Categories Section -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Browse Categories</h5>
            </div>
            <div class="card-body p-0">
              <!-- Loading State -->
              <div *ngIf="loading" class="p-4 text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <!-- Error State -->
              <div *ngIf="error" class="p-3 text-center text-danger">
                {{ error }}
                <button class="btn btn-link" (click)="loadCategories()">Try Again</button>
              </div>

              <!-- Content -->
              <div class="list-group list-group-flush" *ngIf="!loading && !error">
                <ng-container *ngIf="categories.length > 0">
                  <ng-container *ngTemplateOutlet="categoryTree; context: { $implicit: categories }">
                  </ng-container>
                </ng-container>
                <div *ngIf="categories.length === 0" class="p-3 text-center text-muted">
                  No categories found.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div class="col-md-9">
          <div class="card">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Products{{ selectedCategory ? ' in ' + selectedCategoryName : '' }}</h5>
            </div>
            <div class="card-body">
              <!-- Products Loading State -->
              <div *ngIf="loadingProducts" class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading products...</span>
                </div>
              </div>

              <!-- Products Error State -->
              <div *ngIf="productsError" class="alert alert-danger">
                {{ productsError }}
              </div>

              <!-- Products Grid -->
              <div class="products-grid">
                <div class="loading-overlay" *ngIf="loadingProducts">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading products...</span>
                  </div>
                </div>
                <div class="row row-cols-1 row-cols-md-3 g-4" [class.loading]="loadingProducts">
                  <div class="col" *ngFor="let product of products">
                    <div class="card h-100">
                      <img [src]="product.imageUrl || 'assets/placeholder.jpg'" 
                           class="card-img-top" 
                           [alt]="product.productName">
                      <div class="card-body">
                        <h5 class="card-title">{{product.productName}}</h5>
                        <p class="card-text">{{product.description | slice:0:100}}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                          <span class="text-primary fw-bold">{{product.price | currency}}</span>
                          <button class="btn btn-primary btn-sm"
                                  [routerLink]="['/products', product.productId]">
                            View Details
                          </button>
                        </div>
                        <small class="text-muted mt-2 d-block">
                          {{product.stock}} items in stock
                        </small>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="products.length === 0 && !loadingProducts" class="col-12 text-center">
                    <p class="text-muted">No products found in this category.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #categoryTree let-categories>
      <ng-container *ngFor="let category of categories">
        <a href="javascript:void(0)" 
           (click)="loadProductsByCategory(category)"
           class="list-group-item list-group-item-action"
           [class.active]="category.categoryId === selectedCategory"
           [class.has-children]="category.subCategories?.length">
          <div class="d-flex justify-content-between align-items-center">
            <span>{{ category.categoryName }}</span>
            <span *ngIf="category.subCategories?.length" 
                  class="badge bg-secondary rounded-pill">
              {{ category.subCategories.length }}
            </span>
          </div>
        </a>
        <div class="ms-3" *ngIf="category.subCategories?.length">
          <ng-container *ngTemplateOutlet="categoryTree; context: { $implicit: category.subCategories }">
          </ng-container>
        </div>
      </ng-container>
    </ng-template>
  `,
  styles: [`
    .list-group-item {
      border-radius: 0;
      border-left: none;
      border-right: none;
      transition: all 0.2s ease;
    }

    .list-group-item:first-child {
      border-top: none;
    }

    .list-group-item:hover {
      background-color: #f8f9fa;
      color: #0d6efd;
    }

    .list-group-item.active {
      background-color: #e9ecef;
      color: #0d6efd;
      border-color: rgba(0,0,0,.125);
    }

    .has-children {
      font-weight: 500;
    }

    .card-img-top {
      height: 200px;
      object-fit: cover;
    }

    .badge {
      transition: background-color 0.2s ease;
    }

    .list-group-item:hover .badge {
      background-color: #0d6efd !important;
    }

    /* Prevent layout shift */
    .card {
      min-height: 400px;
    }

    .card-body {
      min-height: 300px;
    }

    .products-grid {
      min-height: 500px;
      position: relative;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    /* Smooth transitions */
    .row-cols-1 {
      transition: opacity 0.3s ease;
    }

    .row-cols-1.loading {
      opacity: 0.6;
    }
  `]
})
export class CategoryBrowserComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  loading: boolean = false;
  loadingProducts: boolean = false;
  error: string | null = null;
  productsError: string | null = null;
  selectedCategory: number | null = null;
  selectedCategoryName: string = '';

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded in browser:', categories);
        this.categories = categories || [];
        this.loading = false;
        
        // Load products for the first category by default
        if (this.categories.length > 0) {
          this.loadProductsByCategory(this.categories[0]);
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories. Please try again.';
        this.categories = [];
        this.loading = false;
      }
    });
  }

  loadProductsByCategory(category: Category): void {
    this.selectedCategory = category.categoryId;
    this.selectedCategoryName = category.categoryName;
    this.loadingProducts = true;
    this.productsError = null;
    this.products = [];

    this.productService.getProducts(1, 12, category.categoryId).subscribe({
      next: (response) => {
        console.log('Products loaded:', response);
        this.products = response.items;
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.productsError = 'Failed to load products. Please try again.';
        this.loadingProducts = false;
      }
    });
  }
}
