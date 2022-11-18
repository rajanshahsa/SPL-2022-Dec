import { Component, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { AuthenticationService } from './services/auth.service';
import { LOCAL_STORAGE_KEYS } from './services/constants';
import { FormService } from './services/form.service';
import { LocalStorageService } from './services/local-storage.service';
import { PlayersService } from './services/players/players.service';
import { RegexEnum } from './services/regex-enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'SPL-2022-Dec';
  isLoggedin = false;
  isAdmin = false;
  ownPlayer: any;
  teamName: any;
  player: any = {
    id: '',
    name: '',
    basePrice: '',
    currentPrice: '',
    battingStyle: '',
    bowlingStyle: '',
    isSold: '',
    wantToBeCaptain: '',
    skills: '',
    battingRating: '',
    bowlingRating: '',
    soldTo: '',
  };
  players: any;
  timer: any;
  public loginForm: FormGroup;
  public messageList: any = {
    email: '',
    password: '',
    domainURL: '',
  };

  constructor(
    private playerService: PlayersService,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private router: Router,
    private formService: FormService,
    private authService: AuthenticationService,
    private localStorageService: LocalStorageService,
    private apiservice: ApiService
  ) {
    this.getLggedInUser();
    this.getPlayers();
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

  async getLggedInUser() {
    const teamId = await this.localStorageService.getDataFromIndexedDB(
      LOCAL_STORAGE_KEYS.TEAMID
    );
    const name = await this.localStorageService.getDataFromIndexedDB(
      LOCAL_STORAGE_KEYS.TEAMNAME
    );
    if (teamId) {
      const player: any = await this.playerService.getOwnPlayer(teamId);
      this.teamName = name;
      this.ownPlayer = player.data;
      this.isLoggedin = true;
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.getOwnPlayer(teamId);
      }, 1000);
    }
  }
  async getPlayers() {
    const response: any = await this.playerService.getPlayers();
    this.players = response.data;
    console.log(this.players);
  }

  async getNextPlayer() {
    const tmpPlayer = this.players.sort(() => 0.5 - Math.random())[0];
    const response: any = await this.playerService.getPlayer(tmpPlayer.id);
    if (response.data.isSold || this.player.id == response.data.id) {
      this.getNextPlayer();
    }
    this.player = response.data;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.getPlayerCurrentBid();
    }, 1000);
    this.getPlayers();
    console.log(this.player);
  }

  async soldThePlayer(isSold: any, id: any) {
    clearInterval(this.timer);
    const response: any = await this.playerService.isPlayerSolde(id, {
      isSold,
      currentPrice: this.player.currentPrice,
    });
    this.getPlayers();
    this.getNextPlayer();
  }

  async getPlayerCurrentBid() {
    if (this.player.id) {
      const response: any = await this.playerService.getPlayer(this.player.id);
      this.player = response.data;
    }
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
    if (this.loginForm.valid) {
      let obj = this.loginForm.getRawValue();
      const response: any = await this.authService.login(obj);
      if (response) {
        await this.localStorageService.setDataInIndexedDB(
          LOCAL_STORAGE_KEYS.ID,
          response.data.id
        );
        await this.localStorageService.setDataInIndexedDB(
          LOCAL_STORAGE_KEYS.EMAILID,
          obj.email
        );
        await this.localStorageService.setDataInIndexedDB(
          LOCAL_STORAGE_KEYS.TEAMID,
          response.data.teamId
        );
        await this.localStorageService.setDataInIndexedDB(
          LOCAL_STORAGE_KEYS.Password,
          obj.password
        );
        await this.localStorageService.setDataInIndexedDB(
          LOCAL_STORAGE_KEYS.Password,
          obj.password
        );
        await this.localStorageService.setDataInIndexedDB(
          LOCAL_STORAGE_KEYS.TEAMNAME,
          response.data.name
        );
        if (response.data.teamId) {
          this.getOwnPlayer(response.data.teamId);
          this.teamName = response.data.name;
        } else {
          this.isAdmin = true;
        }

        this.isLoggedin = true;
      }
    }
  }

  async getOwnPlayer(teamId: any) {
    const player: any = await this.playerService.getOwnPlayer(teamId);
    this.ownPlayer = player.data;
  }

  async signOut() {
    await this.localStorageService.clearDataFromIndexedDB();
    this.isLoggedin = false;
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'login-page');
  }
}
