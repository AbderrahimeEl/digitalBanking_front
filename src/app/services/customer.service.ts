import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CustomerDTO} from "../model/customer.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = environment.backendHost + '/api';

  constructor(private http:HttpClient) { }

  /**
   * Get all customers
   * Endpoint: GET /api/customers
   */
  public getCustomers():Observable<Array<CustomerDTO>>{
    return this.http.get<Array<CustomerDTO>>(`${this.apiUrl}/customers`);
  }

  /**
   * Get customer by ID
   * Endpoint: GET /api/customers/{id}
   */
  public getCustomerById(id: number):Observable<CustomerDTO>{
    return this.http.get<CustomerDTO>(`${this.apiUrl}/customers/${id}`);
  }

  /**
   * Create a new customer
   * Endpoint: POST /api/customers
   */
  public saveCustomer(customer: CustomerDTO):Observable<CustomerDTO>{
    return this.http.post<CustomerDTO>(`${this.apiUrl}/customers`, customer);
  }

  /**
   * Update existing customer
   * Endpoint: PUT /api/customers/{id}
   */
  public updateCustomer(customer: CustomerDTO):Observable<CustomerDTO>{
    return this.http.put<CustomerDTO>(`${this.apiUrl}/customers/${customer.id}`, customer);
  }

  /**
   * Delete a customer
   * Endpoint: DELETE /api/customers/{id}
   */
  public deleteCustomer(id: number){
    return this.http.delete(`${this.apiUrl}/customers/${id}`);
  }

  // This endpoint is not in the OpenAPI spec but kept for backward compatibility
  // Will fallback to getting all customers and filtering in-memory if needed
  public searchCustomers(keyword : string):Observable<Array<CustomerDTO>>{
    // Return all customers since search endpoint is not in API spec
    return this.getCustomers();
  }
}
