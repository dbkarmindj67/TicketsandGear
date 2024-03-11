import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for common Angular directives.
import { RouterModule } from '@angular/router'; // Import RouterModule for using router directives like <router-outlet>.
import { Title } from '@angular/platform-browser'; // Service to manipulate the document title.
import { environment } from './../environments/environment';
import { EventService } from './events/event.service'; // Adjust the path as necessary
import { CommonService } from './common-service.service'; // Adjust the path as necessary

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'user-location-angular'; // A property for setting the document title.
  city: string = ''; // Default value for city, used maybe in template or logic.
  keyword: string = ''; // Default value for keyword, used maybe in search logic.
  popularEvents: any[] = []; // Default array for storing events, possibly fetched from a service.

  constructor(
    private titleService: Title, // Inject Title service for changing the browser title.
    private eventService: EventService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.titleService.setTitle('TicketsandGear.com'); // Set the document title on component initialization.
    // You can also call methods from your services here to initialize component data.
    console.log('AppComponent initialized');
  }
}

