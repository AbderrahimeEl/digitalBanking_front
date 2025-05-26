import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountsService } from '../services/accounts.service';
import { BankAccountDTO } from '../model/account.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  transferForm!: FormGroup;
  accounts$!: Observable<BankAccountDTO[]>;
  errorMessage: string = '';
  successMessage: string = '';
  
  constructor(
    private fb: FormBuilder,
    private accountsService: AccountsService
  ) { }
  
  ngOnInit(): void {
    this.transferForm = this.fb.group({
      accountSource: ['', Validators.required],
      accountDestination: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(10)]],
      description: ['', Validators.required]
    });
    
    // Load all available accounts for dropdown selection
    this.accounts$ = this.accountsService.getBankAccounts();
  }
  
  handleTransfer() {
    if (this.transferForm.invalid) {
      return;
    }
    
    const sourceId = this.transferForm.value.accountSource;
    const destinationId = this.transferForm.value.accountDestination;
    const amount = this.transferForm.value.amount;
    const description = this.transferForm.value.description;
    
    // Validate that source and destination are different
    if (sourceId === destinationId) {
      this.errorMessage = 'Source and destination accounts cannot be the same';
      return;
    }
    
    this.errorMessage = '';
    this.successMessage = '';
    
    this.accountsService.transfer(sourceId, destinationId, amount, description).subscribe({
      next: () => {
        this.successMessage = 'Transfer completed successfully';
        this.transferForm.patchValue({
          amount: 0,
          description: ''
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error performing transfer: ' + (err.error?.message || err.message || 'Unknown error');
      }
    });
  }
  
  resetForm() {
    this.transferForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }
}