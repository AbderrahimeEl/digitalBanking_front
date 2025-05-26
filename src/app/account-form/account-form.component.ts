import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '../services/accounts.service';
import { CustomerService } from '../services/customer.service';
import { BankAccountDTO } from '../model/account.model';
import { CustomerDTO } from '../model/customer.model';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css']
})
export class AccountFormComponent implements OnInit {
  accountForm!: FormGroup;
  customers$!: Observable<CustomerDTO[]>;
  isEditMode: boolean = false;
  accountId: number | null = null;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private accountsService: AccountsService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      customerId: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      currency: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
      overDraft: [0, [Validators.required, Validators.min(0)]],
      interestRate: [0, [Validators.required, Validators.min(0)]]
    });

    // Load customers for dropdown
    this.customers$ = this.customerService.getCustomers();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.accountId = +id;
        this.loadAccount(this.accountId);
      }
    });
  }

  loadAccount(id: number): void {
    this.accountsService.getBankAccountById(id).subscribe({
      next: (account) => {
        this.accountForm.patchValue({
          customerId: account.customerId,
          balance: account.balance,
          currency: account.currency,
          status: account.status,
          overDraft: account.overDraft,
          interestRate: account.interestRate
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to load account: ' + err.message;
      }
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      return;
    }

    const formData = this.accountForm.value;
    const account: BankAccountDTO = {
      id: this.isEditMode ? this.accountId! : 0,
      customerId: formData.customerId,
      balance: formData.balance,
      currency: formData.currency,
      status: formData.status,
      overDraft: formData.overDraft,
      interestRate: formData.interestRate,
      createdAt: this.isEditMode ? null! : new Date(),
      updatedAt: new Date()
    };

    if (this.isEditMode) {
      this.accountsService.updateBankAccount(account).subscribe({
        next: () => {
          alert('Account updated successfully');
          this.router.navigate(['/accounts']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to update account: ' + err.message;
        }
      });
    } else {
      this.accountsService.createBankAccount(account).subscribe({
        next: () => {
          alert('Account created successfully');
          this.router.navigate(['/accounts']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to create account: ' + err.message;
        }
      });
    }
  }
}
