import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RssFeedDisplayComponent } from './rss-feed-display.component';

describe('RssFeedDisplayComponent', () => {
  let component: RssFeedDisplayComponent;
  let fixture: ComponentFixture<RssFeedDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RssFeedDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RssFeedDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
