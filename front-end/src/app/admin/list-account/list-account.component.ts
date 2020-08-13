import {Component, OnInit} from '@angular/core';
import * as $ from 'jquery';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../../services/admin.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Account} from '../../models/account';
import {Employees} from '../../models/employees';
import {Role} from '../../models/role';
import {CustomerService} from '../../services/customer.service';
import {Customer} from '../../models/customer';
import {ToastrService} from 'ngx-toastr';
import {EmployeeService} from '../../services/employee.service';
import {Employee} from '../../models/employee';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Tempjwtemp} from '../../models/tempjwtemp';
import {TokenStorageService} from '../../auth/token-storage.service';

function comparePassword(c: AbstractControl) {
  const v = c.value;
  return (v.accountPassword === v.confirmPassword) ? null : {
    passwordnotmatch: true
  };
}

@Component({
  selector: 'app-list-account',
  templateUrl: './list-account.component.html',
  styleUrls: ['./list-account.component.scss']
})
export class ListAccountComponent implements OnInit {

  constructor(private adminService: AdminService,
              private route: Router,
              private formBuilder: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private customerService: CustomerService,
              private toastrService: ToastrService,
              private employeeService: EmployeeService,
              private loginAccount: TokenStorageService) {
  }

  accountList: Account[] = [];
  accountlist: Account[] = [];
  roleList: Role[];
  accountForm: FormGroup;
  accountForm2 = new Array<FormGroup>();
  editAccountForm: FormGroup;
  deleteAccountForm: FormGroup;
  deleteListAccountForm: FormGroup;
  infoAccountById: Employees = new Employees();
  infoAccountById2: Customer = new Customer();
  AccountById: Account = new Account();
  editResuilt: Account;
  size = 6;
  pageClicked = 0;
  pages = [];
  nameRole = '';
  userName = '';
  totalPages = 1;
  promiseAccount: any;
  private sumVal = 0;
  employeeList: Employee[];
  deleteChose = [];
  token: any;
  decode = new JwtHelperService();
  tempJwt = new Tempjwtemp();
  accountName = '';

  ngOnInit(): void {
    this.tempJwt = this.decode.decodeToken(this.loginAccount.getToken());
    this.accountName = this.tempJwt.sub;
    this.employeeService.findAll().subscribe(next => {
      this.employeeList = next;
    });
    this.adminService.findAllRole().subscribe(next => {
      this.roleList = next;
    }, error => {
      console.log(error);
    });
    this.adminService.findAll().subscribe(next => {
      this.accountlist = next;
    }, error => {
      console.log(error);
    });
    this.getAll();
    this.accountForm = this.formBuilder.group({
      accountId: [''],
      accountName: ['', [Validators.required]],
      accountPassword: [''],
      pwGroup: this.formBuilder.group({
        accountPassword: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
      }, {validator: comparePassword}),
      deleteFlag: [''],
      role: ['', [Validators.required]]
    });
    this.editAccountForm = this.formBuilder.group({
      accountId: ['', [Validators.required]],
      accountName: ['', [Validators.pattern('^[a-zA-Z0-9\\,\\.\\-\\_\\@]{1,100}$'), this.existAccountName.bind(this)]],
      accountPassword: ['', [Validators.pattern('^[a-zA-Z0-9]{1,100}$')]],
      deleteFlag: ['', [Validators.required]],
      role: ['', [Validators.required]],
      reason: ['']
    });
    this.deleteAccountForm = this.formBuilder.group({
      accountId: ['', [Validators.required]],
      accountName: ['', [Validators.required]],
      accountPassword: ['', [Validators.required]],
      deleteFlag: ['', [Validators.required]],
      role: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.maxLength(255)]]
    });
    this.deleteListAccountForm = this.formBuilder.group({
      reason: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  addMore() {
    this.accountForm2.push(this.formBuilder.group({
      accountId: [''],
      accountName: ['', [Validators.required]],
      accountPassword: [''],
      pwGroup: this.formBuilder.group({
        accountPassword: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
      }, {validator: comparePassword}),
      deleteFlag: [''],
      role: ['', [Validators.required]],
    }));
  }

  existAccountName(c: AbstractControl) {
    const v = c.value;
    for (const acc of this.accountlist) {
      if (acc.accountName === v && v !== this.AccountById.accountName) {
        return {nameAccountExist: true};
      }
    }
    return null;
  }

  getListAccount() {
    this.adminService.findAll().subscribe(next => {
      this.accountlist = next;
    }, error => {
      console.log(error);
    });
  }

  existAccountName2() {
    this.getListAccount();
    const accountName = this.accountForm.get('accountName').value;
    for (const acc of this.accountlist) {
      if (acc.accountName === accountName && accountName !== this.AccountById.accountName) {
        return false;
      }
    }
    return true;
  }

  existAccountName3(index) {
    this.getListAccount();
    const accountName = this.accountForm2[index].get('accountName').value;
    for (const acc of this.accountlist) {
      if (acc.accountName === accountName && accountName !== this.AccountById.accountName) {
        return false;
      }
    }
    return true;
  }

  getAll(): void {
    this.getAllSubmit(0);
  }

  getAllSubmit(page) {
    this.adminService.getAllCourse(page, this.size, this.userName, this.nameRole).subscribe(
      data => {
        this.pageClicked = page;
        this.accountList = data.content;
        this.totalPages = data.totalPages;
        this.pages = Array.apply(null, {length: this.totalPages}).map(Number.call, Number);
      }, error => console.log(error)
    );
  }

  onPrevious() {
    if (this.pageClicked > 0) {
      this.pageClicked--;
      switch (this.sumVal) {
        case 0:
          this.nameRole = '';
          this.getAllSubmit(this.pageClicked);
          break;
        case 1:
          this.nameRole = 'ROLE_ADMIN';
          this.getAllSubmit(this.pageClicked);
          break;
        case 2:
          this.nameRole = 'ROLE_PARTNER';
          this.getAllSubmit(this.pageClicked);
          break;
        case 3:
          this.nameRole = 'ROLE_WAREHOUSE';
          this.getAllSubmit(this.pageClicked);
          break;
        case 4:
          this.nameRole = 'ROLE_MEMBER';
          this.getAllSubmit(this.pageClicked);
          break;
      }
    }
  }

  onNext() {
    if (this.pageClicked < this.totalPages - 1) {
      this.pageClicked++;
      switch (this.sumVal) {
        case 0:
          this.nameRole = '';
          this.getAllSubmit(this.pageClicked);
          break;
        case 1:
          this.nameRole = 'ROLE_ADMIN';
          this.getAllSubmit(this.pageClicked);
          break;
        case 2:
          this.nameRole = 'ROLE_PARTNER';
          this.getAllSubmit(this.pageClicked);
          break;
        case 3:
          this.nameRole = 'ROLE_WAREHOUSE';
          this.getAllSubmit(this.pageClicked);
          break;
        case 4:
          this.nameRole = 'ROLE_MEMBER';
          this.getAllSubmit(this.pageClicked);
          break;
      }
    }
  }

  onFirst() {
    this.pageClicked = 0;
    switch (this.sumVal) {
      case 0:
        this.nameRole = '';
        this.getAllSubmit(this.pageClicked);
        break;
      case 1:
        this.nameRole = 'ROLE_ADMIN';
        this.getAllSubmit(this.pageClicked);
        break;
      case 2:
        this.nameRole = 'ROLE_PARTNER';
        this.getAllSubmit(this.pageClicked);
        break;
      case 3:
        this.nameRole = 'ROLE_WAREHOUSE';
        this.getAllSubmit(this.pageClicked);
        break;
      case 4:
        this.nameRole = 'ROLE_MEMBER';
        this.getAllSubmit(this.pageClicked);
        break;
    }
  }

  onLast() {
    this.pageClicked = this.totalPages - 1;
    switch (this.sumVal) {
      case 0:
        this.nameRole = '';
        this.getAllSubmit(this.pageClicked);
        break;
      case 1:
        this.nameRole = 'ROLE_ADMIN';
        this.getAllSubmit(this.pageClicked);
        break;
      case 2:
        this.nameRole = 'ROLE_PARTNER';
        this.getAllSubmit(this.pageClicked);
        break;
      case 3:
        this.nameRole = 'ROLE_WAREHOUSE';
        this.getAllSubmit(this.pageClicked);
        break;
      case 4:
        this.nameRole = 'ROLE_MEMBER';
        this.getAllSubmit(this.pageClicked);
        break;
    }
  }

  info(id) {
    this.infoAccountById.position = null;
    this.adminService.findByInfoId(id).subscribe(next => {
      this.infoAccountById = next;
    });
    if (this.infoAccountById.position === null) {
      this.adminService.findByInfoUserId(id).subscribe(next => {
        if (next.imageUrl === '' || next.imageUrl === null || next.imageUrl === undefined) {
          next.imageUrl = '../../../assets/photo/avatadefault.png';
        }
        this.infoAccountById2 = next;
      });
    } else {
    }
    $('#infor').show();
    $('.close').click(function() {
      $('#infor').hide();
    });
  }

  edit(id) {
    this.infoAccountById = new Employees();
    this.adminService.findByInfoId(id).subscribe(next => {
      this.infoAccountById = next;
    });
    this.customerService.getCustomerById(id).subscribe(next => {
      this.infoAccountById2 = next;
    }, error => {
      console.log(error);
    });
    this.adminService.findAllRole().subscribe(next => {
      this.roleList = next;
    }, error => {
      console.log(error);
    });
    this.adminService.findAccountById(id).subscribe(next => {
      this.AccountById = next;
    }, error => {
      this.toastrService.error('', 'tài khoản đã bị xóa');
      this.ngOnInit();
      $('.destroy').click();
    });
    this.adminService.findAccountById(id).subscribe(next => {
      this.editAccountForm.patchValue({
        accountId: next.accountId,
        accountName: next.accountName,
        accountPassword: '',
        deleteFlag: next.deleteFlag,
        role: next.role.roleId,
        reason: '',
      });
    }, error => {
      console.log(error);
    });
    $('#edit').show();
    $('.close').click(function() {
      $('#edit').hide();
    });
    $('.destroy').click(function() {
      $('#edit').hide();
    });
  }

  delete(id) {
    this.adminService.findAccountById(id).subscribe(next => {
      this.deleteAccountForm.patchValue({
        accountId: next.accountId,
        accountName: next.accountName,
        accountPassword: next.accountPassword,
        deleteFlag: next.deleteFlag,
        role: next.role.roleId,
        reason: '',
      });
      this.AccountById = next;
    }, error => {
      console.log(error);
    });
    $('#delete').show();
    $('.close').click(function() {
      $('#delete').hide();
    });
    $('.destroy').click(function() {
      $('#delete').hide();
    });
  }

  create() {
    if (this.existAccountName2()) {
      this.accountForm.patchValue({
        accountPassword: this.accountForm.get('pwGroup.accountPassword').value
      });
      this.adminService.findRoleById(this.accountForm.get('role').value).subscribe(
        next => {
          this.promiseAccount = new Promise(resolve => resolve(next));
          this.promiseAccount.then((value) => {
              this.accountForm.value.role = value;
              if (this.accountForm.valid) {
                this.adminService.create(this.accountForm.value).subscribe(
                  () => {
                    this.getAll();
                    this.accountForm.reset();
                    $('#close').click();
                    this.showCreated();
                  },
                  error => console.log(error)
                );
              }
            }
          );
        }
      );
    } else {
      this.toastrService.error('Tên tài khoản đã tồn tại', '', {
        positionClass: 'toast-top-center'
      });
    }
  }

  create2() {
    for (let i = 0; i < this.accountForm2.length; i++) {
      if (this.existAccountName3(i)) {
        this.accountForm2[i].patchValue({
          accountPassword: this.accountForm2[i].get('pwGroup.accountPassword').value
        });
        this.adminService.findRoleById(this.accountForm2[i].get('role').value).subscribe(
          next => {
            this.promiseAccount = new Promise(resolve => resolve(next));
            this.promiseAccount.then((value) => {
                this.accountForm2[i].value.role = value;
                if (this.accountForm2[i].valid) {
                  this.adminService.create(this.accountForm2[i].value).subscribe(
                    () => {
                      this.getAll();
                      this.accountForm2[i].reset();
                      this.showCreated();
                      this.accountForm2.splice(i, 1);
                    },
                    error => console.log(error)
                  );
                }
              }
            );
          }
        );
      } else {
        this.toastrService.error('Tên tài khoản đã tồn tại', '', {
          positionClass: 'toast-top-center'
        });
      }
    }
  }

  showCreated() {
    this.toastrService.success('Bạn đã thêm mới thành công', 'Thông báo');
  }

  deleted(accountId) {
    this.adminService.findAccountById(accountId).subscribe(next => {
      if (next.accountName !== this.accountName) {
        next.reason = this.deleteAccountForm.value.reason;
        this.adminService.delete(next).subscribe(next2 => {
          this.toastrService.success('Xóa tài khoản thành công');
          this.ngOnInit();
          $('.destroyDelete').click();
        }, error => {
          this.toastrService.error('', 'Xóa tài khoản thất bại');
        });
      } else {
        this.toastrService.error('', 'Xóa tài khoản thất bại');
        $('.destroyDelete').click();
      }
    });
  }

  edited() {
    this.editResuilt = new Account();
    this.editResuilt.accountId = this.editAccountForm.value.accountId;
    this.editResuilt.accountName = this.editAccountForm.value.accountName !== '' ? this.editAccountForm.value.accountName : this.AccountById.accountName;
    this.editResuilt.accountPassword = this.editAccountForm.value.accountPassword !== '' ? this.editAccountForm.value.accountPassword : this.AccountById.accountPassword;
    this.editResuilt.deleteFlag = this.editAccountForm.value.deleteFlag;
    this.adminService.findAccountById(this.editResuilt.accountId).subscribe(next => {
      if (next !== null) {
        this.adminService.findRoleById(this.editAccountForm.value.role).subscribe(next2 => {
          this.editResuilt.role = next2;
          this.adminService.edit(this.editResuilt).subscribe(next3 => {
            this.toastrService.success('Chỉnh sửa thông tin thành công');
            this.ngOnInit();
            $('.destroy').click();
          }, error => {
            this.toastrService.error('', 'Chỉnh sửa thông tin thất bại');
          });
        });
      }
    }, error => {
      this.toastrService.error('', 'tài khoản đã bị xóa. Không thể chỉnh sửa');
      this.ngOnInit();
      $('.destroy').click();
    });
  }

  filterTypeRole(val: number) {
    this.sumVal = val;
    switch (val) {
      case 0:
        this.nameRole = '';
        this.getAllSubmit(0);
        break;
      case 1:
        this.nameRole = 'ROLE_ADMIN';
        this.getAllSubmit(0);
        break;
      case 2:
        this.nameRole = 'ROLE_PARTNER';
        this.getAllSubmit(0);
        break;
      case 3:
        this.nameRole = 'ROLE_WAREHOUSE';
        this.getAllSubmit(0);
        break;
      case 4:
        this.nameRole = 'ROLE_MEMBER';
        this.getAllSubmit(0);
        break;
    }
  }

  checkInvalidForm2() {
    let check = false;
    for (let i = 0; i < this.accountForm2.length; i++) {
      if (this.accountForm2[i].invalid) {
        check = true;
      }
    }
    return check;
  }

  checkChose() {
    for (let i = 0; i < this.accountList.length; i++) {
      let flag = true;
      if ($('#' + this.accountList[i].accountId.toString()).is(':checked')) {
        for (let j = 0; j < this.deleteChose.length; j++) {
          if (this.deleteChose[j] === this.accountList[i].accountId) {
            flag = false;
            break;
          }
        }
        if (flag) {
          this.deleteChose.push(this.accountList[i].accountId);
        }
      } else {
        for (let z = 0; z < this.deleteChose.length; z++) {
          if (this.deleteChose[z] === this.accountList[i].accountId) {
            this.deleteChose.splice(z, 1);
          }
        }
      }
    }
  }

  tickForCheckBox(id: number): boolean {
    for (let i = 0; i < this.deleteChose.length; i++) {
      if (
        this.deleteChose[i] === id) {
        return true;
      }
    }
    return false;
  }

  deleteListAccount() {
    const reason = this.deleteListAccountForm.value.reason;
    for (let i = 0; i < this.deleteChose.length; i++) {
      this.adminService.findAccountById(this.deleteChose[i]).subscribe(
        next => {
          if (next.accountName !== this.accountName) {
            next.reason = reason;
            this.adminService.delete(next).subscribe(next2 => {
            }, error => {
              this.toastrService.error('', 'Xóa tài khoản ' + next.accountId + ' thất bại');
              this.ngOnInit();
              $('.destroyDelete').click();
            });
          } else {
            this.toastrService.error('', 'Xóa tài khoản ' + next.accountId + ' thất bại');
            $('.destroyDelete').click();
          }
        });
    }
    this.toastrService.success('Xóa tài khoản thành công');
    this.ngOnInit();
    $('.destroyDelete').click();
    this.deleteChose = [];
  }
}
