import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { AccountsService } from './accounts.service';
import { environment } from '../../environments/environment';
import { CustomerDTO } from '../model/customer.model';
import { BankAccountDTO, AccountOperationDTO } from '../model/account.model';

describe('API Integration Tests', () => {
  const apiUrl = environment.backendHost + '/api';
  let httpMock: HttpTestingController;
  let customerService: CustomerService;
  let accountsService: AccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService, AccountsService]
    });

    httpMock = TestBed.inject(HttpTestingController);
    customerService = TestBed.inject(CustomerService);
    accountsService = TestBed.inject(AccountsService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('CustomerService', () => {
    it('should get all customers', () => {
      const mockCustomers: CustomerDTO[] = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', accountIds: [] }
      ];

      customerService.getCustomers().subscribe(customers => {
        expect(customers).toEqual(mockCustomers);
      });

      const req = httpMock.expectOne(`${apiUrl}/customers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomers);
    });

    it('should get customer by id', () => {
      const mockCustomer: CustomerDTO = 
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', accountIds: [] };

      customerService.getCustomer(1).subscribe(customer => {
        expect(customer).toEqual(mockCustomer);
      });

      const req = httpMock.expectOne(`${apiUrl}/customers/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomer);
    });

    it('should create a customer', () => {
      const newCustomer: CustomerDTO = 
        { id: 0, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', accountIds: [] };
      const savedCustomer: CustomerDTO = 
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', accountIds: [] };

      customerService.saveCustomer(newCustomer).subscribe(customer => {
        expect(customer).toEqual(savedCustomer);
      });

      const req = httpMock.expectOne(`${apiUrl}/customers`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCustomer);
      req.flush(savedCustomer);
    });

    it('should update a customer', () => {
      const customer: CustomerDTO = 
        { id: 1, firstName: 'John', lastName: 'Updated', email: 'john.updated@example.com', accountIds: [] };

      customerService.updateCustomer(customer).subscribe(updatedCustomer => {
        expect(updatedCustomer).toEqual(customer);
      });

      const req = httpMock.expectOne(`${apiUrl}/customers/${customer.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(customer);
      req.flush(customer);
    });

    it('should delete a customer', () => {
      customerService.deleteCustomer(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/customers/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('AccountsService', () => {
    it('should get all bank accounts', () => {
      const mockAccounts: BankAccountDTO[] = [
        { 
          id: 1, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString(), 
          balance: 5000, 
          status: 'ACTIVE', 
          currency: 'USD', 
          customerId: 1,
          overDraft: 1000,
          interestRate: 0.05
        }
      ];

      accountsService.getBankAccounts().subscribe(accounts => {
        expect(accounts).toEqual(mockAccounts);
      });

      const req = httpMock.expectOne(`${apiUrl}/accounts`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAccounts);
    });

    it('should create a bank account', () => {
      const newAccount: BankAccountDTO = { 
        id: 0, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        balance: 1000, 
        status: 'ACTIVE', 
        currency: 'EUR', 
        customerId: 1,
        overDraft: 500,
        interestRate: 0.03
      };
      
      const savedAccount: BankAccountDTO = {
        ...newAccount,
        id: 2
      };

      accountsService.createBankAccount(newAccount).subscribe(account => {
        expect(account).toEqual(savedAccount);
      });

      const req = httpMock.expectOne(`${apiUrl}/accounts`);
      expect(req.request.method).toBe('POST');
      req.flush(savedAccount);
    });

    it('should get all operations', () => {
      const mockOperations: AccountOperationDTO[] = [
        { 
          id: 1, 
          date: new Date().toISOString(), 
          amount: 500, 
          type: 'CREDIT', 
          bankAccountId: 1
        }
      ];

      accountsService.getAllOperations().subscribe(operations => {
        expect(operations).toEqual(mockOperations);
      });

      const req = httpMock.expectOne(`${apiUrl}/operations`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOperations);
    });

    it('should create an operation', () => {
      const newOperation: AccountOperationDTO = { 
        id: 0, 
        date: new Date(), 
        amount: 250, 
        type: 'DEBIT', 
        bankAccountId: 1
      };
      
      const savedOperation: AccountOperationDTO = {
        ...newOperation,
        id: 2
      };

      accountsService.createOperation(newOperation).subscribe(operation => {
        expect(operation).toEqual(savedOperation);
      });

      const req = httpMock.expectOne(`${apiUrl}/operations`);
      expect(req.request.method).toBe('POST');
      req.flush(savedOperation);
    });

    it('should handle transfer operations', (done) => {
      accountsService.transfer('1', '2', 100, 'Test transfer').subscribe(() => {
        done();
      });

      // First request should be a debit
      const debitReq = httpMock.expectOne(req => req.url === `${apiUrl}/operations` && req.method === 'POST');
      const debitOp = debitReq.request.body as AccountOperationDTO;
      expect(debitOp.type).toBe('DEBIT');
      expect(debitOp.bankAccountId).toBe(1);
      expect(debitOp.amount).toBe(100);
      debitReq.flush({ id: 5, ...debitOp });

      // Second request should be a credit
      const creditReq = httpMock.expectOne(req => req.url === `${apiUrl}/operations` && req.method === 'POST');
      const creditOp = creditReq.request.body as AccountOperationDTO;
      expect(creditOp.type).toBe('CREDIT');
      expect(creditOp.bankAccountId).toBe(2);
      expect(creditOp.amount).toBe(100);
      creditReq.flush({ id: 6, ...creditOp });
    });
  });
});
