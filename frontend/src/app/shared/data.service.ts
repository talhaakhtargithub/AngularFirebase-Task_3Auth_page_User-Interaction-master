import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Product } from "../model/product";
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Subject for real-time product updates
  productUpdates = new Subject<void>();

  private cartItems: Product[] = [];
  private cartSubject = new BehaviorSubject<Product[]>([]);

  constructor(private afs: AngularFirestore, private fireStorage: AngularFireStorage) { }

  getAllProducts() {
    return this.afs.collection('/Products').snapshotChanges();
  }

  addProduct(product: Product) {
    product.id = this.afs.createId();
    this.afs.collection('/Products').add(product).then(() => {
      // Notify subscribers about the new product
      this.productUpdates.next();
    });
  }

  deleteProduct(product: Product) {
    this.afs.doc('/Products/' + product.id).delete().then(() => {
      // Notify subscribers about the product deletion
      this.productUpdates.next();
    });
  }

  updateProduct(product: Product) {
    this.afs.doc('/Products/' + product.id).update(product).then(() => {
      // Notify subscribers about the product update
      this.productUpdates.next();
    });
  }

  getCartProducts(): Observable<Product[]> {
    // Return an observable of the current cart items
    return this.cartSubject.asObservable();
  }

  addToCart(product: Product): void {
    // Implement your logic to add the product to the cart
    // For example, you can store the cart items in an array or service.
    this.cartItems.push(product);

    // Notify subscribers about the updated cart
    this.cartSubject.next([...this.cartItems]);

    // You may also want to update the user's data in the database,
    // for instance, to reflect the changes in the user's shopping cart.
  }
}
