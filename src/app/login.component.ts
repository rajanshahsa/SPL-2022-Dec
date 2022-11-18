import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from './services/form.service';
import { AuthenticationService } from './services/auth.service';
import { LocalStorageService } from './services/local-storage.service';
import { ApiService } from './services/api.service';
import { RegexEnum } from './services/regex-enum';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public messageList: any = {
    email: '',
    password: '',
    domainURL: '',
  };

  constructor(
    private renderer: Renderer2,
    private fb: FormBuilder,
    private router: Router,
    private formService: FormService,
    private authService: AuthenticationService,
    private localStorageService: LocalStorageService,
    private apiservice: ApiService
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(RegexEnum.email),
        ]),
      ],
      password: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    this.renderer.addClass(document.body, 'login-page');
    await this.initializeMessages();
  }

  initializeLoginForm() {
    this.loginForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(RegexEnum.email),
        ]),
      ],
      password: ['', [Validators.required]],
    });
  }

  initializeMessages() {
    this.messageList.email = {
      pattern: 'Invalid email id',
      required: 'Email id is required',
    };

    this.messageList.password = {
      required: 'Password is required',
    };
  }

  async login() {
    this.formService.markFormGroupTouched(this.loginForm);
    this.apiservice.URL = '';
    if (this.loginForm.valid) {
      let obj = this.loginForm.getRawValue();
      let newURL;
      // if (window.location.href.includes('-stage')) {
      this.localStorageService.storeItem('URL', this.apiservice.URL);
      const response: any = await this.authService.login(obj);
      if (response) {
        this.router.navigate(['/home']);
      }
    }
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'login-page');
  }
}
