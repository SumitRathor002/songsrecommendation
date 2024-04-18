from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework.exceptions import NotFound
from .models import *

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    A serializer for user registration.

    Attributes:
        password (field): The password field for the serializer.
    """

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'id']
        read_only_fields = ['id']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """
    A serializer for user login.

    Attributes:
        email (field): The email field for the serializer.
        password (field): The password field for the serializer.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if user and user.is_active:
                data['user'] = user
            else:
                raise serializers.ValidationError("Incorrect email or password")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'")
        return data


class GenreSerializer(serializers.ModelSerializer):
    """
    A serializer for the Genre model.

    Attributes:
        model (Model): The Genre model.
        fields (list): The fields for the serializer.
    """
    class Meta:
        model = Genre
        fields = ['id', 'name']


class ArtistSerializer(serializers.ModelSerializer):
    """
    A serializer for the Artist model.

    Attributes:
        model (Model): The Artist model.
        fields (list): The fields for the serializer.
    """

    class Meta:
        model = Artist
        fields = ['spotify_id', 'name']


class SongSerializer(serializers.ModelSerializer):
    """
    A serializer for the Song model.

    Attributes:
        artists (field): The artists field for the serializer.
        genres (field): The genres field for the serializer.
    """
    artists = ArtistSerializer(many= True)
    genres = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = '__all__'

    def get_genres(self, obj):
        return list(obj.genres.values_list('name', flat=True))


class SongListSerializer(serializers.ModelSerializer):
    """
    A serializer for listing songs.

    Attributes:
        artists (field): The artists field for the serializer.
    """
    artists = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = ['spotify_id', 'name', 'duration', 'artists', 'image_url_300']

    def get_artists(self, obj):
        return list(obj.artists.values_list('name', flat=True))


class ListeningHistorySerializer(serializers.ModelSerializer):
    """
    A serializer for the ListeningHistory model.

    Attributes:
        user (field): The user field for the serializer.
        song (field): The song field for the serializer.
    """
    class Meta:
        model = ListeningHistory
        fields = ['id', 'user', 'song', 'timestamp']
        read_only_fields = ['user']
        
    def create(self, validated_data):
        user = validated_data['user']
        song = validated_data['song']

        # Try to find an existing ListeningHistory object with the same user and song
        history_instance = ListeningHistory.objects.filter(user=user, song=song).first()

        # If an existing object is found, update its timestamp and save it
        if history_instance:
            history_instance.timestamp = timezone.now()
            history_instance.save()
            return history_instance
        # If no existing object is found, create a new one
        else:
            history_instance = ListeningHistory.objects.create(**validated_data)
            return history_instance


class ListeningHistoryListSerializer(serializers.ModelSerializer):
    """
    A serializer for listing listening history.

    Attributes:
        song (field): The song field for the serializer.
    """
    song = SongListSerializer()

    class Meta:
        model = ListeningHistory
        fields = ['id', 'user', 'song', 'timestamp']
        
    
class FavouritesSerializer(serializers.ModelSerializer):
    """
    A serializer for the Favourites model.

    Attributes:
        song (field): The song field for the serializer.
        user (field): The user field for the serializer.
    """
    class Meta:
        model = Favourites
        fields = ['id', 'user', 'song', 'timestamp']


class FavouriteListSerializer(serializers.ModelSerializer):
    """
    A serializer for listing favourites.

    Attributes:
        song (field): The song field for the serializer.
    """
    song = SongListSerializer()

    class Meta:
        model = Favourites
        fields = ['song', 'timestamp']  

