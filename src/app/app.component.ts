import { Component } from '@angular/core';
import { PlayersService } from './services/players/players.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'SPL-2022-Dec';
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
  timer:any;
  constructor(private playerService: PlayersService) {
    this.getPlayers();
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

  async soldThePlayer(isSold: any,id: any) {
    clearInterval(this.timer);
    const response: any = await this.playerService.isPlayerSolde(id, {
      isSold,
      currentPrice:this.player.currentPrice
    });
    this.getPlayers();
    this.getNextPlayer();
  }

  async getPlayerCurrentBid() {
    if(this.player.id){
      const response: any = await this.playerService.getPlayer(this.player.id);
      this.player = response.data;
    }
  }
}
