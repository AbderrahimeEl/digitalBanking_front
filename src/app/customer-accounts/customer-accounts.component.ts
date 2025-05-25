import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CustomerDTO} from "../model/customer.model";
import {CustomerService} from "../services/customer.service";
import {AccountsService} from "../services/accounts.service";
import {BankAccountDTO} from "../model/account.model";
import {catchError, Observable, of, switchMap, throwError} from "rxjs";

@Component({
  selector: 'app-customer-accounts',
  templateUrl: './customer-accounts.component.html',
  styleUrls: ['./customer-accounts.component.css']
})
export class CustomerAccountsComponent implements OnInit {
  customerId! : string ;
  customer! : CustomerDTO;
  accounts$!: Observable<BankAccountDTO[]>;
  errorMessage!: string;

  constructor(
    private route : ActivatedRoute, 
    private router :Router, 
    private customerService: CustomerService,
    private accountsService: AccountsService
  ) {
    this.customer=this.router.getCurrentNavigation()?.extras.state as CustomerDTO;
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.params['id'];
    
    // If we don't have customer data from navigation state, fetch it
    if (!this.customer) {
      this.customerService.getCustomerById(parseInt(this.customerId, 10)).subscribe({
        next: (data) => {
          this.customer = data;
          this.loadCustomerAccounts();
        },
        error: (err) => {
          this.errorMessage = err.message;
        }
      });
    } else {
      this.loadCustomerAccounts();
    }
  }
  
  loadCustomerAccounts() {
    // Get all accounts then filter by customer ID
    this.accounts$ = this.accountsService.getBankAccounts().pipe(
      switchMap(accounts => {
        const customerAccounts = accounts.filter(account => account.customerId === parseInt(this.customerId, 10));
        return of(customerAccounts);
      }),
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(() => err);
      })
    );
  }

}
