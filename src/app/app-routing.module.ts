import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomersComponent} from "./customers/customers.component";
import {AccountsComponent} from "./accounts/accounts.component";
import {NewCustomerComponent} from "./new-customer/new-customer.component";
import {CustomerAccountsComponent} from "./customer-accounts/customer-accounts.component";
import {OperationsComponent} from "./operations/operations.component";
import {AccountFormComponent} from "./account-form/account-form.component";
import {TransferComponent} from "./transfer/transfer.component";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {UnauthorizedComponent} from "./unauthorized/unauthorized.component";
import {AuthGuard} from "./guards/auth.guard";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full"},
  { path: "home", component: HomeComponent, canActivate: [AuthGuard] },
  
  // Auth routes
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "unauthorized", component: UnauthorizedComponent },
  
  // Protected routes - Admin only
  { path: "customers", component: CustomersComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_ADMIN'] } },
  { path: "new-customer", component: NewCustomerComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_ADMIN'] } },
  { path: "accounts", component: AccountsComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_ADMIN'] } },
  { path: "new-account", component: AccountFormComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_ADMIN'] } },
  { path: "edit-account/:id", component: AccountFormComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_ADMIN'] } },
  
  // Protected routes - Both Admin and Customer
  { path: "customer-accounts/:id", component: CustomerAccountsComponent, canActivate: [AuthGuard] },
  { path: "operations", component: OperationsComponent, canActivate: [AuthGuard] },
  { path: "transfer", component: TransferComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
