import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {AccountDetails, AccountOperationDTO, BankAccountDTO} from "../model/account.model";

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http : HttpClient) { }

  // Bank Account endpoints
  public getBankAccounts(): Observable<BankAccountDTO[]> {
    return this.http.get<BankAccountDTO[]>(`${this.apiUrl}/accounts`);
  }

  public getBankAccountById(id: number): Observable<BankAccountDTO> {
    return this.http.get<BankAccountDTO>(`${this.apiUrl}/accounts/${id}`);
  }

  public createBankAccount(bankAccount: BankAccountDTO): Observable<BankAccountDTO> {
    return this.http.post<BankAccountDTO>(`${this.apiUrl}/accounts`, bankAccount);
  }

  public updateBankAccount(bankAccount: BankAccountDTO): Observable<BankAccountDTO> {
    return this.http.put<BankAccountDTO>(`${this.apiUrl}/accounts/${bankAccount.id}`, bankAccount);
  }

  public deleteBankAccount(id: number) {
    return this.http.delete(`${this.apiUrl}/accounts/${id}`);
  }

  // Account Operations endpoints
  public getAllOperations(): Observable<AccountOperationDTO[]> {
    return this.http.get<AccountOperationDTO[]>(`${this.apiUrl}/operations`);
  }

  public getOperationById(id: number): Observable<AccountOperationDTO> {
    return this.http.get<AccountOperationDTO>(`${this.apiUrl}/operations/${id}`);
  }

  public getOperationsByAccountId(accountId: number): Observable<AccountOperationDTO[]> {
    return this.http.get<AccountOperationDTO[]>(`${this.apiUrl}/operations?accountId=${accountId}`);
  }

  public createOperation(operation: AccountOperationDTO): Observable<AccountOperationDTO> {
    return this.http.post<AccountOperationDTO>(`${this.apiUrl}/operations`, operation);
  }

  public updateOperation(operation: AccountOperationDTO): Observable<AccountOperationDTO> {
    return this.http.put<AccountOperationDTO>(`${this.apiUrl}/operations/${operation.id}`, operation);
  }

  public deleteOperation(id: number) {
    return this.http.delete(`${this.apiUrl}/operations/${id}`);
  }

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

  // Keep these methods for backward compatibility
  public getAccount(accountId : string, page : number, size : number):Observable<AccountDetails>{
    return this.http.get<AccountDetails>(environment.backendHost+"/accounts/"+accountId+"/pageOperations?page="+page+"&size="+size);
  }

  public debit(accountId : string, amount : number, description:string){
    let data={accountId : accountId, amount : amount, description : description}
    return this.http.post(environment.backendHost+"/accounts/debit",data);
  }

  public credit(accountId : string, amount : number, description:string){
    let data={accountId : accountId, amount : amount, description : description}
    return this.http.post(environment.backendHost+"/accounts/credit",data);
  }

  public transfer(accountSource: string, accountDestination: string, amount : number, description:string){
    let data={accountSource, accountDestination, amount, description }
    return this.http.post(environment.backendHost+"/accounts/transfer",data);
  }
}
