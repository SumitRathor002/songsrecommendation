from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    
    path('guest/random-songs/',RandomSongListAPIView.as_view() , name='random_songs_api'),
    path('song/<str:pk>/', SongAPIView.as_view(), name='song_info_api'),
    path('get-similar-songs/<str:pk>/',SimilarSongsAPIView.as_view(), name='similar_song_api'),
    path('u/recommended-songs/',  RecommendedSongsAPI.as_view(), name="recommended-songs-api"),


    path('u/like/', LikeSongAPIView.as_view(), name='like-song-api'),
    path('u/unlike/', UnlikeSongAPIView.as_view(), name='unlike-song-api'),
    path('u/favourites/', FavouritesListAPIView.as_view(), name='favourites-list'),
    
    path('u/listening-history/', HistoryListAPIView.as_view(), name='listening-history-list'),
    path('u/listening-history/add/', ListeningHistoryCreateAPIView.as_view() , name='listening-history-add'),
    
]
