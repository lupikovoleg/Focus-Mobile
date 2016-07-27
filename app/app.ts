import {Component, ViewChild, Input, Output, EventEmitter, enableProdMode} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav, Toast, Events} from 'ionic-angular';
import {StatusBar, Network} from 'ionic-native';
import {HelloIonicPage} from './pages/hello-ionic/hello-ionic';
import {ListPage} from './pages/list/list';
import {StartScreen} from './pages/start-screen/start-screen';
import {AuthService} from './services/auth-service';
import {SyncEvent} from 'ts-events';

/* Pages */
import {TasksScreen} from './pages/tasks/tasks';
import {GoalsScreen} from './pages/goals/goals';
import {RoutinesScreen} from './pages/routines/routines';
import {NewsScreen} from './pages/news/news';
import {SettingsScreen} from './pages/settings/settings';

let userEvent = new SyncEvent();

enableProdMode();

@Component({
  templateUrl: 'build/app.html',
  providers: [AuthService]
})
class MyApp {
  @ViewChild(Nav) nav: Nav;
  @Output() updateUser = new EventEmitter();
  // make HelloIonicPage the root (or first) page
  //rootPage: any = (!AuthService.isAuthorized()) ? StartScreen : HelloIonicPage;
  rootPage: any = StartScreen;
  pages: Object;
  user: any;

  constructor(
    private platform: Platform,
    private menu: MenuController,
    private AuthService: AuthService,
    public events: Events
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = {
      tasks: TasksScreen,
      goals: GoalsScreen,
      routines: RoutinesScreen,
      news: NewsScreen,
      settings: SettingsScreen
    };

    this.user = [];

    this.events.subscribe('user:login', (data) => {
      // userEventData is an array of parameters, so grab our first and only arg
      this.user = data[0].user[0];
    });

    this.AuthService.isAuthorized().then(data => {
        if(data) {
          this.nav.setRoot(TasksScreen);
          this.AuthService.getUser().then(data => {
            this.user = JSON.parse(data);
            console.log(this.user);
          });
        } else {
        this.menu.enable(false);
      }
    });

    this.AuthService.updateUserInfo.subscribe(user => this.user = user);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      let disconnectSubscription = Network.onDisconnect().subscribe(() => {
        let toast = Toast.create({
          message: 'Отсутсвует интернет-подключение',
          position: 'top'
        });

        toast.onDismiss(() => {
          console.log('Dismissed toast');
        });

        this.nav.present(toast);

        let connectSubscription = Network.onConnect().subscribe(() => {
          toast.dismiss();
        });
      });
    });
  }

  getUser() {
    this.AuthService.getUser().then(data => {
      this.user = JSON.parse(data);
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    console.log(page);
    this.nav.setRoot(this.pages[page]);
  }
}
ionicBootstrap(MyApp, [], {
  backButtonText: 'Назад'
  /*iconMode: 'ios',
  modalEnter: 'modal-slide-in',
  modalLeave: 'modal-slide-out',
  tabbarPlacement: 'bottom',
  pageTransition: 'ios',*/
});
