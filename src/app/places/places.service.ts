import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService);
  private httpClient = inject(HttpClient);
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something went wrong fetching the available places. Please try again later.'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something went wrong fetching your available places. Please try again later.'
    ).pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    // const prevPlaces = this.userPlaces();
    // if (!prevPlaces.some((p) => p.id === place.id)) {
    //   this.userPlaces.set([...prevPlaces, place]);
    // }
    // return this.httpClient
    //   .put('http://localhost:3000/user-places', {
    //     placeId: place.id,
    //   })
    //   .pipe(
    //     catchError((error) => {
    //       this.userPlaces.set(prevPlaces);
    //       return throwError(() => new Error('Failed to store selected place.'));
    //     })
    //   );

    return this.httpClient
      .put<{ userPlaces: Place[] }>('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        map((val) => val.userPlaces),
        tap({
          next: (userPlaces) => this.userPlaces.set(userPlaces),
        }),
        catchError((error) => {
          this.errorService.showError('Failed to store selected place.');
          return throwError(() => new Error('Failed to store selected place.'));
        })
      );
  }

  removeUserPlace(place: Place) {
    return this.httpClient
      .delete<{ userPlaces: Place[] }>(
        `http://localhost:3000/user-places/${place.id}`
      )
      .pipe(
        map((val) => val.userPlaces),
        tap({
          next: (userPlaces) => this.userPlaces.set(userPlaces),
        }),
        catchError((error) => {
          this.errorService.showError('Failed to delete selected place.');
          return throwError(
            () => new Error('Failed to delete selected place.')
          );
        })
      );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((val) => val.places),
      catchError((error) => {
        console.log(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
