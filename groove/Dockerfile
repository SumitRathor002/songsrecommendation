FROM python:3.11-slim-bullseye

WORKDIR /app

COPY requirements.txt .


COPY . .

RUN apt-get update

RUN pip install -r requirements.txt

RUN python manage.py makemigrations 
RUN python manage.py migrate 


EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
