import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CustomerService} from "../services/customer.service";
import {catchError, map, Observable, throwError} from "rxjs";
import {CustomerDTO} from "../model/customer.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers! : Observable<Array<CustomerDTO>>;
  errorMessage!: string;
  searchFormGroup : FormGroup | undefined;
  constructor(private customerService : CustomerService, private fb : FormBuilder, private router : Router) { }

  ngOnInit(): void {
    this.searchFormGroup=this.fb.group({
      keyword : this.fb.control("")
    });
    this.handleGetAllCustomers();
  }

  handleGetAllCustomers() {
    this.customers = this.customerService.getCustomers().pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err);
      })
    );
  }
  handleSearchCustomers() {
    let kw = this.searchFormGroup?.value.keyword?.toLowerCase();
    if (kw) {
      // Get all customers and filter client-side
      this.customers = this.customerService.getCustomers().pipe(
        map(customers => customers.filter(c => 
          c.firstName.toLowerCase().includes(kw) || 
          c.lastName.toLowerCase().includes(kw) || 
          c.email.toLowerCase().includes(kw)
        )),
        catchError(err => {
          this.errorMessage = err.message;
          return throwError(err);
        })
      );
    } else {
      this.handleGetAllCustomers();
    }
  }

  handleDeleteCustomer(c: CustomerDTO) {
    let conf = confirm("Are you sure?");
    if(!conf) return;
    this.customerService.deleteCustomer(c.id).subscribe({
      next : (resp) => {
        this.customers = this.customers.pipe(
          map(data => {
            let index = data.indexOf(c);
            data.slice(index, 1)
            return data;
          })
        );
      },
      error : err => {
        console.log(err);
      }
    })
  }

  handleCustomerAccounts(customer: CustomerDTO) {
    this.router.navigateByUrl("/customer-accounts/"+customer.id, {state: customer});
  }
}
