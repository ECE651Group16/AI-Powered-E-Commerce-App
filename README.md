# AI-Powered E-Commerce App

This project is an AI-powered e-commerce application developed using the Django framework and MySQL as the database backend. It aims to provide an intuitive and efficient online shopping experience with the integration of advanced AI features.

## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed Python 3.x.
* You have installed MySQL.If not then use this command for MacOs:
```bash
brew install mysql-client
```
Use this command for Windows:
```bash
pip install mysqlclient
```
* You have a basic understanding of Python and Django.

## Setting Up Your Development Environment

Follow these steps to set up your development environment:

### Clone the repository

```bash
git clone https://github.com/ECE651Group16/AI-Powered-E-Commerce-App.git
cd AI-Powered-E-Commerce-App
```
### Create and Activate a Virtual Environment
For Unix and MacOS:
```bash
pipenv shell
```
### Install Django in a Virtual Environment
```bash
pipenv install django
pipenv install django-debug-toolbar
pipenv shell
```
### Configure MySQL
Start the MySQL service on your machine.
Create a new MySQL database for the project:
```sql
CREATE DATABASE storefront;
```
### Update Django Settings
Navigate to the settings file at AI-Powered-E-Commerce-App/settings.py.
Configure the DATABASES setting to reflect your MySQL setup:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'root',
        'USER': 'storefront',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```
# Run Database Migrations
```bash
python manage.py migrate
```
# Running the Project
To run the project:
```bash
python manage.py runserver
```
The project should now be running on http://127.0.0.1:8000/.
# Create admin user
```python
python manage.py createsuperuser
```
You can log in using page http://127.0.0.1:8000/admin/

# Remember to import dummy data using Seed.sql in mysqlworkbench

## Setting up more on pipenv
# Installing Restful API, nested routers, Filtering
```bash
pipenv install djangorestframework
pipenv install drf-nested-routers
pipenv install django-filter # added into the installed apps in setting.py
```

# Contributing to AI-Powered E-Commerce App
To contribute, follow these steps:

1. Fork this repository.
2. Create a branch: git checkout -b <branch_name>.
3. Make your changes and commit them: git commit -m '<commit_message>'.
4. Push to the original branch: git push origin AI-Powered-E-Commerce-App/<branch_name>.
5. Create the pull request.
Alternatively, see the GitHub documentation on creating a pull request.

#License
This project is licensed under the MIT License - see the LICENSE file for details.
