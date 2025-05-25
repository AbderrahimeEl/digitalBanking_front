import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {AccountDetails, AccountOperationDTO, BankAccountDTO} from "../model/account.model";

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private apiUrl = environment.backendHost + '/api';

  constructor(private http : HttpClient) { }

  // Bank Account endpoints
  /**
   * Get all bank accounts
   * Endpoint: GET /api/accounts
   */
  public getBankAccounts(): Observable<BankAccountDTO[]> {
    return this.http.get<BankAccountDTO[]>(`${this.apiUrl}/accounts`);
  }

  /**
   * Get bank account by ID
   * Endpoint: GET /api/accounts/{id}
   */
  public getBankAccountById(id: number): Observable<BankAccountDTO> {
    return this.http.get<BankAccountDTO>(`${this.apiUrl}/accounts/${id}`);
  }

  /**
   * Create a new bank account
   * Endpoint: POST /api/accounts
   */
  public createBankAccount(bankAccount: BankAccountDTO): Observable<BankAccountDTO> {
    return this.http.post<BankAccountDTO>(`${this.apiUrl}/accounts`, bankAccount);
  }

  /**
   * Update existing bank account
   * Endpoint: PUT /api/accounts/{id}
   */
  public updateBankAccount(bankAccount: BankAccountDTO): Observable<BankAccountDTO> {
    return this.http.put<BankAccountDTO>(`${this.apiUrl}/accounts/${bankAccount.id}`, bankAccount);
  }

  /**
   * Delete a bank account
   * Endpoint: DELETE /api/accounts/{id}
   */
  public deleteBankAccount(id: number) {
    return this.http.delete(`${this.apiUrl}/accounts/${id}`);
  }
  // Account Operations endpoints
  /**
   * Get all operations
   * Endpoint: GET /api/operations
   */
  public getAllOperations(): Observable<AccountOperationDTO[]> {
    return this.http.get<AccountOperationDTO[]>(`${this.apiUrl}/operations`);
  }

  /**
   * Get operation by ID
   * Endpoint: GET /api/operations/{id}
   */
  public getOperationById(id: number): Observable<AccountOperationDTO> {
    return this.http.get<AccountOperationDTO>(`${this.apiUrl}/operations/${id}`);
  }

  /**
   * Get operations by account ID
   * Note: This is not in OpenAPI spec, so we'll get all and filter client-side
   */
  public getOperationsByAccountId(accountId: number): Observable<AccountOperationDTO[]> {
    // Get all operations and filter by accountId in the component
    return this.getAllOperations();
  }

  /**
   * Create a new operation
   * Endpoint: POST /api/operations
   */
  public createOperation(operation: AccountOperationDTO): Observable<AccountOperationDTO> {
    return this.http.post<AccountOperationDTO>(`${this.apiUrl}/operations`, operation);
  }

  /**
   * Update existing operation
   * Endpoint: PUT /api/operations/{id}
   */
  public updateOperation(operation: AccountOperationDTO): Observable<AccountOperationDTO> {
    return this.http.put<AccountOperationDTO>(`${this.apiUrl}/operations/${operation.id}`, operation);
  }

  /**
   * Delete an operation
   * Endpoint: DELETE /api/operations/{id}
   */
  public deleteOperation(id: number) {
    return this.http.delete(`${this.apiUrl}/operations/${id}`);
  }

  /**
   * Create a DEBIT operation for an account
   * Uses POST /api/operations
   */
  public debitAccount(accountId: number, amount: number, description?: string): Observable<AccountOperationDTO> {
    const operation: AccountOperationDTO = {
      id: 0, // Will be assigned by the server
      date: new Date(),
      amount: amount,
      type: 'DEBIT',
      bankAccountId: accountId
    };
    return this.createOperation(operation);
  }

  /**
   * Create a CREDIT operation for an account
   * Uses POST /api/operations
   */
  public creditAccount(accountId: number, amount: number, description?: string): Observable<AccountOperationDTO> {
    const operation: AccountOperationDTO = {
      id: 0, // Will be assigned by the server
      date: new Date(),
      amount: amount,
      type: 'CREDIT',
      bankAccountId: accountId
    };
    return this.createOperation(operation);
  }
  /**
   * Legacy methods adapted to match the new API
   */
  
  /**
   * Get account details with pagination (adapted to use new API)
   * This simulates the old behavior by using standard endpoints
   */
  public getAccount(accountId: string, page: number, size: number): Observable<AccountDetails> {
    // Convert string accountId to number
    const id = parseInt(accountId, 10);
    
    // First get the bank account
    return new Observable<AccountDetails>(observer => {
      this.getBankAccountById(id).subscribe({
        next: (account) => {
          // Then get all operations for the account
          this.getAllOperations().subscribe({
            next: (operations) => {
              // Filter operations for this account
              const accountOperations = operations.filter(op => op.bankAccountId === id);
              
              // Create AccountDetails with pagination
              const startIndex = page * size;
              const endIndex = Math.min(startIndex + size, accountOperations.length);
              const pageOperations = accountOperations.slice(startIndex, endIndex);
              
              const accountDetails: AccountDetails = {
                accountId: accountId,
                balance: account.balance,
                currentPage: page,
                totalPages: Math.ceil(accountOperations.length / size),
                pageSize: size,
                accountOperationDTOS: pageOperations
              };
              
              observer.next(accountDetails);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Create a DEBIT operation (legacy method)
   * Uses the new createOperation endpoint
   */
  public debit(accountId: string, amount: number, description: string) {
    return this.debitAccount(parseInt(accountId, 10), amount, description);
  }

  /**
   * Create a CREDIT operation (legacy method)
   * Uses the new createOperation endpoint
   */
  public credit(accountId: string, amount: number, description: string) {
    return this.creditAccount(parseInt(accountId, 10), amount, description);
  }

  /**
   * Create a transfer between accounts
   * Implemented using two operations: DEBIT from source and CREDIT to destination
   */
  public transfer(accountSource: string, accountDestination: string, amount: number, description: string) {
    const sourceId = parseInt(accountSource, 10);
    const destId = parseInt(accountDestination, 10);
    
    // First debit the source account
    return new Observable(observer => {
      this.debitAccount(sourceId, amount, `Transfer to ${accountDestination}: ${description}`).subscribe({
        next: () => {
          // Then credit the destination account
          this.creditAccount(destId, amount, `Transfer from ${accountSource}: ${description}`).subscribe({
            next: (data) => {
              observer.next(data);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
