from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from .serializers import *



class RegisterAPI(APIView):
    """
    An API view for user registration.

    Attributes:
        permission_classes (list): The allowed permissions for the view.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User created successfully',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPI(APIView):
    """
    An API view for user login.

    Attributes:
        permission_classes (list): The allowed permissions for the view.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'username': user.username,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutAPI(APIView):
    """
    An API view for user logout.

    Attributes:
        permission_classes (list): The allowed permissions for the view.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SongPagination(PageNumberPagination):
    """
    A class for paginating song results.

    Attributes:
        page_size (int): The number of songs per page.
        page_size_query_param (str): The name of the page size query parameter.
        max_page_size (int): The maximum number of songs per page.
        get_paginated_response (function): A function for returning paginated results.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    #overriding this method to add total_pages to response
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages' : self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })


class RandomSongListAPIView(generics.ListAPIView):
    """
    An API view for displaying a random list of songs.

    Attributes:
        allowed_methods (list): The allowed HTTP methods.
        permission_classes (list): The allowed permissions for the view.
        queryset: The list of songs to display.
        serializer_class: The serializer class for the view.
        pagination_class: The pagination class for the view.
    """
    
    allowed_methods = ['GET']
    permission_classes = [AllowAny]

    queryset = Song.objects.all().order_by('?')
    serializer_class = SongListSerializer
    pagination_class = SongPagination


class SongAPIView(generics.RetrieveAPIView):
    """
    An API view for displaying song details.

    Attributes:
        allowed_methods (list): The allowed HTTP methods.
        permission_classes (list): The allowed permissions for the view.
        queryset: The list of songs to display.
        serializer_class: The serializer class for the view.
    """
    allowed_methods = ['GET']
    permission_classes = [AllowAny]
    queryset = Song.objects.all()
    serializer_class = SongSerializer

    def get(self, request, *args, **kwargs):
        song_instance = self.get_object()
        serializer = self.get_serializer(song_instance)
        data = serializer.data

        if request.user.is_authenticated:
            user = request.user
            try:
                favourite = Favourites.objects.get(user=user, song=song_instance)
                data['liked'] = True  # User has liked the song
            except Favourites.DoesNotExist:
                data['liked'] = False  # User has not liked the song

        return Response(data, status=status.HTTP_200_OK)


class SimilarSongsAPIView(APIView):
    """
    An API view for displaying similar songs.

    Attributes:
        permission_classes (list): The allowed permissions for the view.
        serializer_class: The serializer class for the view.
        per_page (int): The number of similar songs per page.
    """
    permission_classes = [AllowAny]
    serializer_class = SongListSerializer
    per_page = 10  # Number of similar songs per page

    def get_queryset(self):
        song_id = self.kwargs.get('pk')
        try:
            song = Song.objects.get(pk=song_id)
            page_number = self.request.query_params.get('page', 1)
            similar_songs, total_pages = song.find_similar_songs(page_number=page_number, per_page=self.per_page)
            return similar_songs, total_pages
        except Song.DoesNotExist:
            return Song.objects.none()

    def get(self, request, *args, **kwargs):
        queryset, total_pages = self.get_queryset()
        serialized_data = self.serializer_class(queryset, many=True)
        response = {
            "total_pages": total_pages,
            "data": serialized_data.data,
        }
        return Response(response, status=status.HTTP_200_OK)


class RecommendedSongsAPI(generics.ListAPIView):
    """
    An API view for displaying recommended songs.

    Attributes:
        permission_classes (list): The allowed permissions for the view.
        serializer_class: The serializer class for the view.
        per_page (int): The number of recommended songs per page.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SongListSerializer
    per_page = 10  # Number of similar songs per page
    serializer_class = SongListSerializer

    def get_queryset(self, request):
        user = request.user
        page_number = self.request.query_params.get('page', 1)
        similar_songs, total_pages = user.find_recommended_songs(page_number=page_number, per_page=self.per_page)
        return similar_songs, total_pages
    

    def get(self, request, *args, **kwargs):
        queryset, total_pages = self.get_queryset(request)
        serialized_data = self.serializer_class(queryset, many=True)
        response = {
            "total_pages": total_pages,
            "data": serialized_data.data,
        }
        return Response(response, status=status.HTTP_200_OK)


class FavouritesListAPIView(generics.ListAPIView):
    """
    An API view for displaying a user's favourite songs.

    Attributes:
        serializer_class: The serializer class for the view.
        pagination_class: The pagination class for the view.
        permission_classes: The allowed permissions for the view.
    """
    serializer_class = FavouriteListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SongPagination

    def get_queryset(self):
        user = self.request.user
        return Favourites.objects.filter(user=user).order_by('-timestamp')
    
    
class LikeSongAPIView(generics.CreateAPIView):
    """
    An API view for liking a song.

    Attributes:
        serializer_class: The serializer class for the view.
        permission_classes: The allowed permissions for the view.
    """
    serializer_class = FavouritesSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        request.data['user'] = request.user.id
        #response might be ok or fail ,if fail somethig was wrong with request body
        response = self.create(request, *args, **kwargs)
        if response.status_code == 201: 
            liked_song_spotify_id = request.data.get("song", None)
            if liked_song_spotify_id:
                request.user.update_vector(song_id = liked_song_spotify_id )  
        return response
    

class UnlikeSongAPIView(generics.DestroyAPIView):
    """
    An API view for unliking a song.

    Attributes:
        queryset: The list of favourites to delete.
        permission_classes: The allowed permissions for the view.
    """
    queryset = Favourites.objects.all()
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        print(request.data)
        song_id = request.data.get('song', None)
        if not song_id:
            print("no song id")
            return Response({"failure":"song (spotify_id) missing"}, status=status.HTTP_400_BAD_REQUEST)
        
        favourites = Favourites.objects.filter(user=request.user, song=song_id)
        if favourites.exists():
            request.user.undo_like_update(song_id=song_id)
        favourites.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HistoryListAPIView(generics.ListAPIView):
    """
    An API view for displaying a user's listening history.

    Attributes:
        serializer_class: The serializer class for the view.
        pagination_class: The pagination class for the view.
        permission_classes: The allowed permissions for the view.
    """
    serializer_class = ListeningHistoryListSerializer
    pagination_class = SongPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ListeningHistory.objects.filter(user=user).order_by('-timestamp')


class ListeningHistoryCreateAPIView(generics.CreateAPIView):
     """
    An API view for creating a listening history entry.

    Attributes:
        serializer_class: The serializer class for the view.
        permission_classes: The allowed permissions for the view.
    """
     serializer_class = ListeningHistorySerializer
     permission_classes = [IsAuthenticated]
    
     def perform_create(self, serializer):
         serializer.save(user=self.request.user)


