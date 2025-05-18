import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CustomerDTO} from "../model/customer.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http:HttpClient) { }

  public getCustomers():Observable<Array<CustomerDTO>>{
    return this.http.get<Array<CustomerDTO>>(`${this.apiUrl}/customers`);
  }

  public getCustomerById(id: number):Observable<CustomerDTO>{
    return this.http.get<CustomerDTO>(`${this.apiUrl}/customers/${id}`);
  }

  public saveCustomer(customer: CustomerDTO):Observable<CustomerDTO>{
    return this.http.post<CustomerDTO>(`${this.apiUrl}/customers`, customer);
  }

  public updateCustomer(customer: CustomerDTO):Observable<CustomerDTO>{
    return this.http.put<CustomerDTO>(`${this.apiUrl}/customers/${customer.id}`, customer);
  }

  public deleteCustomer(id: number){
    return this.http.delete(`${this.apiUrl}/customers/${id}`);
  }

  // Keep this method for backward compatibility
  public searchCustomers(keyword : string):Observable<Array<CustomerDTO>>{
    return this.http.get<Array<CustomerDTO>>(environment.backendHost+"/customers/search?keyword="+keyword);
  }
}
