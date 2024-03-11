import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import for using forms functionalities.
import { RouterModule, Router, ActivatedRoute, Params } from '@angular/router'; // Import for using routing functionalities and for type definitions.

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  public keyword: string = ''; // Holds the value of the search keyword.
  public location?: string;    // Holds the value of the search location, optional.

  // Injecting ActivatedRoute to access route parameters, and Router for programmatic navigation.
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Subscribe to query parameters changes.
    this.route.queryParams.subscribe((params: Params) => { // Explicitly declare params as Params to avoid TS7006 error.
      this.keyword = params['keyword'] || ''; // Default to empty string if not provided.
      this.location = params['location'] || ''; // Default to empty string if not provided.
    });
  }

  onSubmit(): void {
    // Constructing the query parameters object for navigation.
    const queryParams = { keyword: this.keyword, location: this.location };

    // Navigate to the /events route with the specified query parameters.
    this.router.navigate(['/events'], { queryParams }).then((success: boolean) => { // Explicitly declare success as boolean to avoid TS7006 error.
      // Log if navigation fails.
      if (!success) {
        console.log('Navigation to /events failed');
      }
    });
  }
}


