import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first } from 'rxjs/operators';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error: string = '';
  availableCustomers: any[] = [];
  showCustomerSelector = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['ROLE_CUSTOMER', Validators.required],
      customerId: [null]
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
    });

    // Load customers for the dropdown when registering as a customer
    this.customerService.getCustomers().subscribe(
      customers => this.availableCustomers = customers,
      error => console.error('Error loading customers:', error)
    );

    // Watch for role changes to show/hide customer selector
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.showCustomerSelector = role === 'ROLE_CUSTOMER';
      
      const customerIdControl = this.registerForm.get('customerId');
      if (this.showCustomerSelector) {
        customerIdControl?.setValidators(Validators.required);
      } else {
        customerIdControl?.clearValidators();
        customerIdControl?.setValue(null);
      }
      customerIdControl?.updateValueAndValidity();
    });
  }

  // Custom validator to check if passwords match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Prepare the request based on the role
    const request = {
      username: this.f['username'].value,
      password: this.f['password'].value,
      role: this.f['role'].value,
      customerId: this.f['role'].value === 'ROLE_CUSTOMER' ? this.f['customerId'].value : null
    };

    this.authService.register(request)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: error => {
          this.error = error.error?.message || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
  }
}
