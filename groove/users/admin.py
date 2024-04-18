from django.contrib import admin
from users.models import *


admin.site.register(CustomUser)
admin.site.register(Genre)
admin.site.register(Artist)
admin.site.register(Song)
admin.site.register(Favourites)
admin.site.register(ListeningHistory)