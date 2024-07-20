import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  private placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.placesService.loadAvailablePlaces().subscribe({
      next: (places) => {
        this.places.set(places);
      },
      complete: () => {
        this.isFetching.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
      },
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onSelectPlace(selectedPlace: Place) {
    const subscription = this.placesService
      .addPlaceToUserPlaces(selectedPlace)
      .subscribe({
        next: (value) => console.log(value),
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}