export interface BankAccountDTO {
  id: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  balance: number;
  status: 'ACTIVE' | 'INACTIVE';
  currency: string;
  customerId: number;
  overDraft: number;
  interestRate: number;
}

export interface AccountOperationDTO {
  id: number;
  date: string | Date;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  bankAccountId: number;
}

export interface AccountDetails {
  accountId: string;
  balance: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  accountOperationDTOS: AccountOperationDTO[];
}
