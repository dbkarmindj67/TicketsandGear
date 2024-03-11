import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailsComponent } from './details/details.component';
import { EventsComponent } from './events/events.component';
import { PopularEventsComponent } from './popular-events/popular-events.component';


const routes: Routes = [
  { path: '', component: PopularEventsComponent },
  { path: 'search', component: PopularEventsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'popular-events', component: PopularEventsComponent },
  { path: 'details/:id', component: DetailsComponent },
  { path: '**', redirectTo: '/events', pathMatch: 'full' } // this is a wildcard route
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
