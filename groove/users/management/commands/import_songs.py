from django.core.management.base import BaseCommand
from users.models import Song, Genre, Artist  
import csv
import ast
import os
from tqdm import tqdm

class Command(BaseCommand):
    """
    A class defining the handle method for importing data from CSV files into the PostgreSQL database.

    Attributes:
        genres_file_path (str): The file path of the genres CSV file.
        artists_file_path (str): The file path of the artists CSV file.
        songs_file_path (str): The file path of the songs CSV file.

    """
    help = 'Import songs data from CSV to PostgreSQL'

    def handle(self, *args, **options):
         
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        csv_files_dir = os.path.join(base_dir, 'sample_songs')
        genres_file_path = os.path.join(csv_files_dir, 'sample_genres.csv')
        artists_file_path = os.path.join(csv_files_dir, 'final_artists.csv')
        songs_file_path = os.path.join(csv_files_dir, 'final_tracks2.csv')

        self.import_genres(genres_file_path)
        self.import_artists(artists_file_path)
        self.import_songs(songs_file_path)

        self.stdout.write(self.style.SUCCESS('Successfully imported data from CSV to Database'))

    def import_genres(self, file_path):
        num_rows = sum(1 for _ in open(file_path, 'r', encoding='utf-8'))-1
        with open(file_path, 'r',encoding='utf-8') as file:
            reader = csv.reader(file)
            for row in tqdm(reader, total=num_rows, desc='Importing Genres to DB'):
                name = row[0]
                Genre.objects.get_or_create(name=name)

    def import_artists(self, file_path):
        num_rows = sum(1 for _ in open(file_path, 'r', encoding='utf-8'))-1
        with open(file_path, 'r',encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in tqdm(reader, total=num_rows, desc='Importing Artists to DB'):
                spotify_id = row['id']
                name = row['name']
                artist, _ = Artist.objects.get_or_create(spotify_id=spotify_id,name=name)
                genres_str = row.get('genres', '')
                genres_list = (genre for genre in ast.literal_eval(genres_str))
                for genre_name in genres_list:
                    genre, _ = Genre.objects.get_or_create(name=genre_name.strip())
                    artist.genres.add(genre)

    def import_songs(self, file_path):
        num_rows = sum(1 for _ in open(file_path, 'r', encoding='utf-8'))-1
        with open(file_path, 'r',encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in tqdm(reader, total=num_rows, desc='Importing Songs to DB'):
                spotify_id = row['id']
                name = row['name']
                duration = int(row['duration_ms'])
                release_year = int(row['release_year'])
                img_url_300 = row['img_url_300']
                preview_url = row['preview_url']
                song, _ = Song.objects.get_or_create(spotify_id=spotify_id,name=name,
                                           duration=duration, release_year=release_year)
                
                if img_url_300:
                    song.image_url_300 = img_url_300
                if preview_url:
                    song.preview_url = preview_url
                song.save()
                id_artists = row.get('id_artists', '')
                artist_list = (artist for artist in ast.literal_eval(id_artists))
                for id in artist_list:
                    artist = Artist.objects.get(spotify_id=id.strip())
                    song.artists.add(artist)

                # Extract genres from CSV and insert into the database
                genres_str = row.get('combined_genres', '')
                genres_list = (genre for genre in ast.literal_eval(genres_str))
                for genre_name in genres_list:
                    genre = Genre.objects.get(name=genre_name.strip())
                    song.genres.add(genre)

