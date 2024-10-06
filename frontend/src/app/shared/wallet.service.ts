import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private walletBalance: number = 0;
  private walletUpdatesSource = new BehaviorSubject<number>(this.walletBalance);
  walletUpdates = this.walletUpdatesSource.asObservable();

  getBalance(): number {
    return this.walletBalance;
  }

  topUp(amount: number): void {
    if (amount > 0) {
      this.walletBalance += amount;
      this.notifyWalletUpdate();
    }
  }

  withdraw(amount: number): void {
    if (amount > 0 && amount <= this.walletBalance) {
      this.walletBalance -= amount;
      this.notifyWalletUpdate();
    }
  }

  makePurchase(amount: number): boolean {
    if (amount > 0 && amount <= this.walletBalance) {
      this.walletBalance -= amount;
      this.notifyWalletUpdate();
      return true; // Purchase successful
    } else {
      return false; // Insufficient funds
    }
  }

  deductAmount(amount: number): void {
    if (amount > 0 && amount <= this.walletBalance) {
      this.walletBalance -= amount;
      this.notifyWalletUpdate();
    }
  }

  private notifyWalletUpdate(): void {
    this.walletUpdatesSource.next(this.walletBalance);
  }
}
