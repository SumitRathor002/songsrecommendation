from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from .managers import CustomUserManager
from .recommendation import Recommendation
from typing import List, Tuple
from django.core.paginator import Paginator
from django.utils import timezone
import numpy as np

def default_vector():
    return [0.0] * 50

class CustomUser(AbstractUser):
    """
    A custom user model that uses email as the username.

    Attributes:
        id (uuid.UUID): The user's unique identifier.
        email (str): The user's email address.
        username (str, optional): The user's username.
        vector (list, optional): The user's feature vector.
        
    """

    # Disable the default username field
    username = None

    id = models.UUIDField(primary_key = True,default = uuid.uuid4, editable = False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=False, blank=True, null=True)
    vector = models.JSONField(default=default_vector)
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def get_vector(self) -> np.array:
        """
        Gets the user's feature vector as a numpy array.

        :return: The user's feature vector as a numpy array.
        """

        return np.array(self.vector)
    
    def update_vector(self, song_id) -> None:
        """
        Updates a user's feature vector with a new song.

        :param song_id: The ID of the new song.
        """
        user_vector_np = self.get_vector()
        updated_vector = Recommendation.update_user_vector(song_id=song_id, user_vector=user_vector_np) 
        self.vector = updated_vector.tolist()
        self.save()

    def undo_like_update(self, song_id):
        """
        Undoes an update to a user's feature vector for a given song.

        :param song_id: The ID of the song to be removed.
        """
        user_vector_np = self.get_vector()
        undo_vector = Recommendation.undo_update(song_id=song_id, user_vector=user_vector_np) 
        self.vector = undo_vector.tolist()
        self.save()
    

    def find_recommended_songs(self, page_number: int = 1, per_page: int = 10) -> Tuple[List['Song'], int]:
        """
        Finds recommended songs for a user, paginated.

        :param page_number: The page number to fetch.
        :param per_page: The number of items per page.
        :return: A tuple containing a list of recommended songs and the total number of pages.
        """
        user_vector_np = self.get_vector()  
        recommendation = Recommendation(feature_vector=user_vector_np)
        recommended_song_ids_in_order = recommendation.similar_song_ids()

        # Paginate the similar song IDs
        paginator = Paginator(recommended_song_ids_in_order, per_page)
        recommended_song_ids_page = paginator.get_page(page_number)
        # Fetch the songs based on the paginated IDs
        recommended_songs = Song.objects.filter(spotify_id__in = recommended_song_ids_page)

        return recommended_songs, paginator.num_pages

    def __str__(self):
        return self.email


class Genre(models.Model):
    """
    A model representing a genre.

    Attributes:
        name (str): The name of the genre.
    """

    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Artist(models.Model):
    """
    A model representing an artist.

    Attributes:
        spotify_id (str): The Spotify ID of the artist.
        name (str): The name of the artist.
        genres (Genre, optional): The genres associated with the artist.
    """
    spotify_id = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255)
    genres = models.ManyToManyField('Genre', blank=True)


    def __str__(self):
        return self.spotify_id + " " + self.name


class Song(models.Model):
    """
    A model representing a song.

    Attributes:
        spotify_id (str): The Spotify ID of the song.
        name (str): The name of the song.
        duration (int): The duration of the song in seconds.
        artists (Artist, optional): The artists associated with the song.
        genres (Genre, optional): The genres associated with the song.
        release_year (int): The release year of the song.
        image_url_300 (str, optional): The 300x300 image URL of the song.
        preview_url (str, optional): The preview URL of the song.
    """
    spotify_id = models.CharField(max_length=255, primary_key=True)
    name = models.TextField(blank=True)
    duration = models.IntegerField()
    artists = models.ManyToManyField('Artist', blank=True)
    genres = models.ManyToManyField('Genre', blank=True)
    release_year = models.IntegerField()
    image_url_300 = models.URLField(blank=True, null=True)
    preview_url = models.URLField(blank=True, null=True)

    def find_similar_songs(self, page_number: int = 1, per_page: int = 10) -> List['Song']:
        """
        Finds songs similar to the current song, paginated.

        :param page_number: The page number to fetch.
        :param per_page: The number of items per page.
        :return: A tuple containing a list of similar songs and the total number of pages.
        """
        recommendation = Recommendation(song_id=self.spotify_id)
        similar_song_ids_in_order = recommendation.similar_song_ids()

        # Paginate the similar song IDs
        paginator = Paginator(similar_song_ids_in_order, per_page)
        similar_song_ids_page = paginator.get_page(page_number)

        # Fetch the songs based on the paginated IDs
        similar_songs = Song.objects.filter(spotify_id__in = similar_song_ids_page)

        return similar_songs, paginator.num_pages
        

    def __str__(self):
        return self.spotify_id + " " + self.name


class ListeningHistory(models.Model):
    """
    A model representing a user's listening history.

    Attributes:
        user (CustomUser): The user associated with the listening history.
        song (Song): The song associated with the listening history.
        timestamp (datetime): The timestamp of the listening history.
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    song = models.ForeignKey('Song', on_delete=models.CASCADE)
    timestamp  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.user.username}-{self.song.spotify_id}-{self.timestamp}'

    class Meta:
        # Define a unique together constraint for user and song
        unique_together = ('user', 'song')


class Favourites(models.Model):
    """
    A model representing a user's favourite songs.

    Attributes:
        user (CustomUser): The user associated with the favourite songs.
        song (Song): The song associated with the favourite songs.
        timestamp (datetime): The timestamp of the favourite songs.
    """
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    song = models.ForeignKey('Song', on_delete=models.CASCADE)
    timestamp  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.user.username}-{self.song.spotify_id}-{self.timestamp}'
    
    class Meta:
        unique_together = ('user', 'song')
