import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountsService } from '../services/accounts.service';
import { AccountOperationDTO } from '../model/account.model';
import { catchError, map, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  operations!: Observable<AccountOperationDTO[]>;
  errorMessage!: string;
  operationFormGroup!: FormGroup;
  editMode: boolean = false;
  currentOperation: AccountOperationDTO | null = null;

  constructor(private fb: FormBuilder, private accountsService: AccountsService) { }

  ngOnInit(): void {
    this.operationFormGroup = this.fb.group({
      accountId: this.fb.control('', [Validators.required]),
      amount: this.fb.control(0, [Validators.required, Validators.min(1)]),
      description: this.fb.control(''),
      operationType: this.fb.control('CREDIT', [Validators.required])
    });
    this.handleGetAllOperations();
  }
  handleGetAllOperations() {
    this.operations = this.accountsService.getAllOperations().pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err);
      })
    );
  }

  handleGetOperationsByAccountId() {
    const accountId = this.operationFormGroup.value.accountId;
    if (accountId) {
      // Get all operations and filter on client side since API doesn't support filtering
      this.operations = this.accountsService.getAllOperations().pipe(
        map(operations => operations.filter(op => op.bankAccountId === parseInt(accountId, 10))),
        catchError(err => {
          this.errorMessage = err.message;
          return throwError(err);
        })
      );
    } else {
      this.handleGetAllOperations();
    }
  }
  handleSubmitOperation() {
    const accountId = this.operationFormGroup.value.accountId;
    const amount = this.operationFormGroup.value.amount;
    const description = this.operationFormGroup.value.description;
    const operationType = this.operationFormGroup.value.operationType;

    if (this.editMode && this.currentOperation) {
      // Update existing operation
      const updatedOperation: AccountOperationDTO = {
        id: this.currentOperation.id,
        date: this.currentOperation.date,
        amount: amount,
        type: operationType,
        bankAccountId: parseInt(accountId, 10)
      };

      this.accountsService.updateOperation(updatedOperation).subscribe({
        next: (data) => {
          alert('Operation updated successfully');
          this.resetForm();
          this.handleGetOperationsByAccountId();
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = err.message;
        }
      });
    } else {
      // Create new operation
      if (operationType === 'CREDIT') {
        this.accountsService.creditAccount(accountId, amount, description).subscribe({
          next: (data) => {
            alert('Success Credit');
            this.resetForm();
            this.handleGetOperationsByAccountId();
          },
          error: (err) => {
            console.log(err);
            this.errorMessage = err.message;
          }
        });
      } else if (operationType === 'DEBIT') {
        this.accountsService.debitAccount(accountId, amount, description).subscribe({
          next: (data) => {
            alert('Success Debit');
            this.resetForm();
            this.handleGetOperationsByAccountId();
          },
          error: (err) => {
            console.log(err);
            this.errorMessage = err.message;
          }
        });
      }
    }
  }

  handleEditOperation(operation: AccountOperationDTO) {
    this.editMode = true;
    this.currentOperation = operation;
    
    this.operationFormGroup.patchValue({
      accountId: operation.bankAccountId,
      amount: operation.amount,
      operationType: operation.type,
      description: ''  // API doesn't store description
    });
  }

  handleDeleteOperation(operationId: number) {
    if (confirm('Are you sure you want to delete this operation?')) {
      this.accountsService.deleteOperation(operationId).subscribe({
        next: () => {
          alert('Operation deleted successfully');
          this.handleGetAllOperations();
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = err.message;
        }
      });
    }
  }

  resetForm() {
    this.operationFormGroup.patchValue({ 
      amount: 0, 
      description: '' 
    });
    this.editMode = false;
    this.currentOperation = null;
  }

  cancelEdit() {
    this.resetForm();
  }
}
