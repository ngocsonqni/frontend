import {Component, OnInit} from '@angular/core';
// import * as $ from 'jquery';
import {AccountService} from '../services/account.service';
import {TokenStorageService} from '../auth/token-storage.service';
import {CustomerService} from '../services/customer.service';
import {OrderService} from '../services/order.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  userDisplayName = '';
  idUser: number;

  constructor(private accountService: AccountService,
              private tokenStorage: TokenStorageService,
              private customerService: CustomerService,
              private orderService: OrderService
  ) {
  }

  ngOnInit(): void {
    this.userDisplayName = sessionStorage.getItem('loggedUser');
    this.customerService.getCustomerByAccountName(this.userDisplayName).subscribe(next => {
      this.idUser = next.id;
      this.orderService.chanceIdUser(this.idUser);
      console.log(this.idUser);
    });
  }

  // tslint:disable-next-line:typedef
  signOut() {
    this.tokenStorage.signOut();
    window.location.reload();
  }

}
