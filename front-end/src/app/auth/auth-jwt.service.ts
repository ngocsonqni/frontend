import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {JwtResponse} from './jwt-response';
import {AuthLoginInfo} from './login-info';
import {Observable} from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  , 'Access-Control-Allow-Origin': 'http://localhost:4200', 'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
};
@Injectable({
  providedIn: 'root'
})
export class AuthJwtService {
  isLoggedIn = false;

  loginUrl = 'http://localhost:8080/';
  registerUrl = 'http://localhost:8080/account/create';
  constructor(private http: HttpClient) {
  }

  attemptAuth(userInfo: AuthLoginInfo): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(this.loginUrl, userInfo, httpOptions);
  }
  // registerAuth(accountInfo: AuthAccountInfo): Observable<JwtResponse> {
  //   return this.http.post<JwtResponse>(this.registerUrl, accountInfo, httpOptions);
  // }
  logout(): void {
    this.isLoggedIn = false;
  }
}
